/**
 * Notion Connector
 * Submits form data to Notion database
 * Requires OAuth 2.0 authentication
 */

class NotionConnector extends FormConnector {
  constructor(config = {}) {
    super(config);
    this.databaseId = config.databaseId;
    this.credentials = config.credentials; // OAuth token
    this.propertyMapping = config.propertyMapping || null;
  }

  async authenticate() {
    if (!this.credentials || !this.credentials.access_token) {
      throw new Error('Notion authentication required. Please provide OAuth credentials.');
    }
    return Promise.resolve();
  }

  async submit(formData) {
    try {
      await this.authenticate();

      if (!this.databaseId) {
        return {
          success: false,
          message: 'Notion database ID is required',
        };
      }

      // Prepare properties
      const properties = this.prepareProperties(formData);

      // Create page
      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.credentials.access_token}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          parent: {
            database_id: this.databaseId,
          },
          properties: properties,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create Notion page');
      }

      const result = await response.json();
      return {
        success: true,
        message: 'Page created in Notion successfully',
        id: result.id,
      };
    } catch (error) {
      return {
        success: false,
        message: `Notion error: ${error.message}`,
      };
    }
  }

  prepareProperties(formData) {
    const properties = {};

    Object.keys(formData).forEach((fieldName) => {
      const notionProperty = this.propertyMapping?.[fieldName] || fieldName;
      const value = formData[fieldName];

      // Map to Notion property types
      // This is simplified - full implementation would detect property types
      if (value === null || value === undefined) {
        return;
      }

      if (typeof value === 'string') {
        properties[notionProperty] = {
          title: [
            {
              text: {
                content: value,
              },
            },
          ],
        };
      } else if (typeof value === 'number') {
        properties[notionProperty] = {
          number: value,
        };
      } else if (typeof value === 'boolean') {
        properties[notionProperty] = {
          checkbox: value,
        };
      } else if (value instanceof Date) {
        properties[notionProperty] = {
          date: {
            start: value.toISOString(),
          },
        };
      } else if (Array.isArray(value)) {
        properties[notionProperty] = {
          multi_select: value.map((item) => ({ name: String(item) })),
        };
      } else if (value instanceof File) {
        // File attachments require upload first
        properties[notionProperty] = {
          files: [
            {
              name: value.name,
              // In production, file would be uploaded and URL provided
            },
          ],
        };
      }
    });

    return properties;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotionConnector;
} else if (typeof window !== 'undefined') {
  window.NotionConnector = NotionConnector;
}






