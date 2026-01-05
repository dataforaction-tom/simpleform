/**
 * Airtable Connector
 * Submits form data to Airtable
 * Requires API key authentication
 */

class AirtableConnector extends FormConnector {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.apiKey;
    this.baseId = config.baseId;
    this.tableName = config.tableName;
    this.fieldMapping = config.fieldMapping || null;
  }

  async authenticate() {
    if (!this.apiKey) {
      throw new Error('Airtable API key is required');
    }
    return Promise.resolve();
  }

  async submit(formData) {
    try {
      await this.authenticate();

      if (!this.baseId || !this.tableName) {
        return {
          success: false,
          message: 'Airtable base ID and table name are required',
        };
      }

      // Prepare record data
      const fields = this.prepareFields(formData);

      // Create record
      const response = await fetch(`https://api.airtable.com/v0/${this.baseId}/${this.tableName}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: fields,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create Airtable record');
      }

      const result = await response.json();
      return {
        success: true,
        message: 'Record created in Airtable successfully',
        id: result.id,
      };
    } catch (error) {
      return {
        success: false,
        message: `Airtable error: ${error.message}`,
      };
    }
  }

  prepareFields(formData) {
    const fields = {};

    Object.keys(formData).forEach((fieldName) => {
      const airtableField = this.fieldMapping?.[fieldName] || fieldName;
      let value = formData[fieldName];

      // Handle file attachments
      if (value instanceof File) {
        // Airtable requires file URLs, so this would need to be uploaded first
        // For now, we'll store the filename
        value = value.name;
      } else if (Array.isArray(value)) {
        // Handle arrays (e.g., multiple select, linked records)
        value = value.map((item) => {
          if (typeof item === 'object' && item.id) {
            return item.id; // Linked record
          }
          return item;
        });
      } else if (typeof value === 'object' && value !== null) {
        // Stringify complex objects
        value = JSON.stringify(value);
      }

      fields[airtableField] = value;
    });

    return fields;
  }

  async uploadAttachment(file) {
    // Airtable attachment upload requires a two-step process:
    // 1. Upload file to a temporary URL
    // 2. Reference that URL in the record
    // This is a simplified version - full implementation would handle the upload
    throw new Error('File attachment upload not fully implemented. Please upload files separately.');
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AirtableConnector;
} else if (typeof window !== 'undefined') {
  window.AirtableConnector = AirtableConnector;
}








