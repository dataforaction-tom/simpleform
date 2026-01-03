/**
 * Notion Connector API Endpoint
 * Serverless function to proxy Notion API requests
 * API key stored securely in environment variables
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { formData, databaseId, propertyMapping } = req.body;

    if (!formData) {
      return res.status(400).json({ success: false, message: 'Form data is required' });
    }

    if (!databaseId) {
      return res.status(400).json({ success: false, message: 'Database ID is required' });
    }

    const apiKey = process.env.NOTION_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Notion API key not configured' });
    }

    // Prepare properties for Notion
    const properties = {};
    Object.keys(formData).forEach((fieldName) => {
      const notionProperty = propertyMapping?.[fieldName] || fieldName;
      const value = formData[fieldName];

      if (value === null || value === undefined) {
        return;
      }

      // Map to Notion property types
      // This is simplified - full implementation would detect property types from database schema
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
      } else if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
        const dateValue = value instanceof Date ? value : new Date(value);
        properties[notionProperty] = {
          date: {
            start: dateValue.toISOString(),
          },
        };
      } else if (Array.isArray(value)) {
        properties[notionProperty] = {
          multi_select: value.map((item) => ({ name: String(item) })),
        };
      } else if (typeof value === 'object') {
        // For complex objects, convert to string
        properties[notionProperty] = {
          rich_text: [
            {
              text: {
                content: JSON.stringify(value),
              },
            },
          ],
        };
      }
    });

    // Create page in Notion database
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: {
          database_id: databaseId,
        },
        properties: properties,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      return res.status(response.status).json({
        success: false,
        message: error.message || `Notion API error: ${response.statusText}`,
      });
    }

    const result = await response.json();
    return res.status(200).json({
      success: true,
      message: 'Page created in Notion successfully',
      id: result.id,
    });
  } catch (error) {
    console.error('Notion connector error:', error);
    return res.status(500).json({
      success: false,
      message: `Notion error: ${error.message}`,
    });
  }
}

