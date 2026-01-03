/**
 * CSV Export Connector
 * Downloads form responses as CSV file
 */

class CSVExportConnector extends FormConnector {
  constructor(config = {}) {
    super(config);
    this.filename = config.filename || 'form-responses.csv';
    this.fieldMapping = config.fieldMapping || null; // Optional field name mapping
    this.dateFormat = config.dateFormat || 'ISO'; // ISO, US, EU
    this.handleRepeatable = config.handleRepeatable || 'flatten'; // flatten or separate
  }

  async submit(formData) {
    try {
      const csv = this.convertToCSV(formData);
      this.downloadCSV(csv, this.filename);
      return {
        success: true,
        message: 'CSV file downloaded successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Error generating CSV: ${error.message}`,
      };
    }
  }

  convertToCSV(formData) {
    const rows = [];
    const headers = [];
    const dataRows = [];

    // Handle repeatable sections
    const processedData = this.processRepeatableSections(formData);

    // Collect all field names
    const allFields = new Set();
    Object.keys(processedData).forEach((key) => {
      if (Array.isArray(processedData[key])) {
        // For arrays, use indexed field names
        processedData[key].forEach((item, index) => {
          if (typeof item === 'object') {
            Object.keys(item).forEach((field) => {
              allFields.add(`${key}[${index}].${field}`);
            });
          } else {
            allFields.add(`${key}[${index}]`);
          }
        });
      } else {
        allFields.add(key);
      }
    });

    // Build headers
    Array.from(allFields).forEach((field) => {
      const header = this.fieldMapping?.[field] || field;
      headers.push(this.escapeCSV(header));
    });
    rows.push(headers.join(','));

    // Build data row
    const dataRow = [];
    Array.from(allFields).forEach((field) => {
      const value = this.getNestedValue(processedData, field);
      dataRow.push(this.escapeCSV(this.formatValue(value)));
    });
    rows.push(dataRow.join(','));

    // If separate rows for repeatable sections
    if (this.handleRepeatable === 'separate' && processedData) {
      // Find repeatable sections
      Object.keys(processedData).forEach((key) => {
        if (Array.isArray(processedData[key]) && processedData[key].length > 0) {
          processedData[key].forEach((item) => {
            if (typeof item === 'object') {
              const row = [];
              Array.from(allFields).forEach((field) => {
                if (field.startsWith(`${key}[`)) {
                  const fieldName = field.replace(`${key}[0].`, '').replace(`${key}[0]`, '');
                  row.push(this.escapeCSV(this.formatValue(item[fieldName])));
                } else {
                  row.push(this.escapeCSV(this.formatValue(processedData[field])));
                }
              });
              rows.push(row.join(','));
            }
          });
        }
      });
    }

    return rows.join('\n');
  }

  processRepeatableSections(formData) {
    const processed = { ...formData };
    Object.keys(processed).forEach((key) => {
      if (Array.isArray(processed[key]) && this.handleRepeatable === 'flatten') {
        // Flatten arrays into comma-separated values
        processed[key] = processed[key]
          .map((item) => {
            if (typeof item === 'object') {
              return Object.values(item).join('; ');
            }
            return item;
          })
          .join(' | ');
      }
    });
    return processed;
  }

  getNestedValue(obj, path) {
    const keys = path.split(/[\[\]\.]/).filter((k) => k);
    let value = obj;
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        return '';
      }
    }
    return value || '';
  }

  formatValue(value) {
    if (value === null || value === undefined) {
      return '';
    }
    if (value instanceof Date) {
      return this.formatDate(value);
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  formatDate(date) {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';

    switch (this.dateFormat) {
      case 'US':
        return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
      case 'EU':
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
      case 'ISO':
      default:
        return d.toISOString().split('T')[0];
    }
  }

  escapeCSV(value) {
    if (value === null || value === undefined) {
      return '';
    }
    const stringValue = String(value);
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CSVExportConnector;
} else if (typeof window !== 'undefined') {
  window.CSVExportConnector = CSVExportConnector;
}






