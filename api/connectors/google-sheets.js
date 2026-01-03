/**
 * Google Sheets Connector API Endpoint
 * Serverless function to proxy Google Sheets API requests
 * OAuth credentials stored securely in environment variables
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
    const { formData, spreadsheetId, sheetName, fieldMapping, createSheet } = req.body;

    if (!formData) {
      return res.status(400).json({ success: false, message: 'Form data is required' });
    }

    if (!spreadsheetId) {
      return res.status(400).json({ success: false, message: 'Spreadsheet ID is required' });
    }

    // For Google Sheets, we need OAuth token
    // In production, this would be obtained via OAuth flow
    // For now, we'll use a service account or stored token
    const accessToken = process.env.GOOGLE_SHEETS_ACCESS_TOKEN;
    
    // Alternative: Use service account credentials
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    
    if (!accessToken && !serviceAccountKey) {
      return res.status(500).json({
        success: false,
        message: 'Google Sheets authentication not configured. Please set GOOGLE_SHEETS_ACCESS_TOKEN or GOOGLE_SERVICE_ACCOUNT_KEY environment variable.',
      });
    }

    const targetSheetName = sheetName || 'Sheet1';

    // If createSheet is true, ensure sheet exists
    if (createSheet && accessToken) {
      try {
        await ensureSheetExists(spreadsheetId, targetSheetName, accessToken);
      } catch (error) {
        console.warn('Could not ensure sheet exists:', error.message);
      }
    }

    // Prepare row data
    const headers = fieldMapping ? Object.keys(fieldMapping) : Object.keys(formData);
    const rowData = headers.map((header) => {
      const fieldName = fieldMapping ? fieldMapping[header] : header;
      const value = formData[fieldName];
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object' && !Array.isArray(value)) {
        return JSON.stringify(value);
      }
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);
    });

    // Append row to sheet
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(targetSheetName)}!A:Z:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowData],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      return res.status(response.status).json({
        success: false,
        message: error.error?.message || `Google Sheets API error: ${response.statusText}`,
      });
    }

    const result = await response.json();
    return res.status(200).json({
      success: true,
      message: 'Data added to Google Sheet successfully',
      id: result.updates?.updatedRange,
    });
  } catch (error) {
    console.error('Google Sheets connector error:', error);
    return res.status(500).json({
      success: false,
      message: `Google Sheets error: ${error.message}`,
    });
  }
}

async function ensureSheetExists(spreadsheetId, sheetName, accessToken) {
  // Check if sheet exists
  const spreadsheetResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!spreadsheetResponse.ok) {
    throw new Error('Failed to get spreadsheet info');
  }

  const spreadsheetData = await spreadsheetResponse.json();
  const sheetExists = spreadsheetData.sheets?.some((s) => s.properties.title === sheetName);

  if (!sheetExists) {
    // Create sheet
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          },
        ],
      }),
    });
  }
}

