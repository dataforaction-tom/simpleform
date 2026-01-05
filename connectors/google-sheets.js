/**
 * Google Sheets Connector
 * Submits form data to Google Sheets via API
 * Requires OAuth 2.0 authentication
 */

class GoogleSheetsConnector extends FormConnector {
  constructor(config = {}) {
    super(config);
    this.spreadsheetId = config.spreadsheetId;
    this.sheetName = config.sheetName || 'Sheet1';
    this.credentials = config.credentials; // OAuth token
    this.fieldMapping = config.fieldMapping || null;
    this.createSheet = config.createSheet || false;
  }

  async authenticate() {
    if (!this.credentials || !this.credentials.access_token) {
      throw new Error('Google Sheets authentication required. Please provide OAuth credentials.');
    }
    // Token refresh logic would go here if needed
    return Promise.resolve();
  }

  async submit(formData) {
    try {
      await this.authenticate();

      // Ensure sheet exists
      if (this.createSheet) {
        await this.ensureSheetExists();
      }

      // Get sheet ID
      const sheetId = await this.getSheetId();

      // Prepare row data
      const rowData = this.prepareRowData(formData);

      // Append row
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${this.sheetName}!A:Z:append?valueInputOption=RAW`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.credentials.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [rowData],
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to append to sheet');
      }

      const result = await response.json();
      return {
        success: true,
        message: 'Data added to Google Sheet successfully',
        id: result.updates?.updatedRange,
      };
    } catch (error) {
      return {
        success: false,
        message: `Google Sheets error: ${error.message}`,
      };
    }
  }

  async ensureSheetExists() {
    // Check if sheet exists, create if not
    try {
      await this.getSheetId();
    } catch (error) {
      // Sheet doesn't exist, create it
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.credentials.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                addSheet: {
                  properties: {
                    title: this.sheetName,
                  },
                },
              },
            ],
          }),
        }
      );
    }
  }

  async getSheetId() {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}`,
      {
        headers: {
          Authorization: `Bearer ${this.credentials.access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get spreadsheet info');
    }

    const data = await response.json();
    const sheet = data.sheets?.find((s) => s.properties.title === this.sheetName);
    if (!sheet) {
      throw new Error(`Sheet "${this.sheetName}" not found`);
    }
    return sheet.properties.sheetId;
  }

  prepareRowData(formData) {
    // Get headers if first row, or use field mapping
    const headers = this.fieldMapping
      ? Object.keys(this.fieldMapping)
      : Object.keys(formData);

    return headers.map((header) => {
      const fieldName = this.fieldMapping ? this.fieldMapping[header] : header;
      const value = formData[fieldName];
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return String(value);
    });
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GoogleSheetsConnector;
} else if (typeof window !== 'undefined') {
  window.GoogleSheetsConnector = GoogleSheetsConnector;
}








