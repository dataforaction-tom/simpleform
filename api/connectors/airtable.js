/**
 * Airtable Connector API Endpoint
 * Serverless function to proxy Airtable API requests
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
    const { formData, baseId, tableName, fieldMapping } = req.body;

    if (!formData) {
      return res.status(400).json({ success: false, message: 'Form data is required' });
    }

    if (!baseId || !tableName) {
      return res.status(400).json({ success: false, message: 'Base ID and table name are required' });
    }

    const apiKey = process.env.AIRTABLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Airtable API key not configured' });
    }

    // Prepare fields
    const fields = {};
    Object.keys(formData).forEach((fieldName) => {
      const airtableField = fieldMapping?.[fieldName] || fieldName;
      let value = formData[fieldName];

      // Handle arrays
      if (Array.isArray(value)) {
        value = value.map((item) => {
          if (typeof item === 'object' && item.id) {
            return item.id; // Linked record
          }
          return item;
        });
      } else if (typeof value === 'object' && value !== null && !(value instanceof File)) {
        // Stringify complex objects (skip File objects)
        value = JSON.stringify(value);
      }

      fields[airtableField] = value;
    });

    // Create record in Airtable
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      return res.status(response.status).json({
        success: false,
        message: error.error?.message || `Airtable API error: ${response.statusText}`,
      });
    }

    const result = await response.json();
    return res.status(200).json({
      success: true,
      message: 'Record created in Airtable successfully',
      id: result.id,
    });
  } catch (error) {
    console.error('Airtable connector error:', error);
    return res.status(500).json({
      success: false,
      message: `Airtable error: ${error.message}`,
    });
  }
}

