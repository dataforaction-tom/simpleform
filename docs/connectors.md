# Connector Guides

Connectors handle form submission by sending data to various backends. Each connector is a separate module that can be included as needed.

## CSV Export

Download form responses as a CSV file.

```javascript
import { CSVExportConnector } from './connectors/csv-export.js';

const connector = new CSVExportConnector({
  filename: 'responses.csv',
  fieldMapping: {
    'firstName': 'First Name',
    'email': 'Email Address'
  },
  dateFormat: 'ISO', // ISO, US, or EU
  handleRepeatable: 'flatten' // flatten or separate
});

const form = new FormRuntime({
  schema: mySchema,
  onSubmit: (data) => connector.submit(data)
});
```

## Webhook Connector

POST form data to a custom endpoint.

```javascript
import { WebhookConnector } from './connectors/webhook.js';

const connector = new WebhookConnector({
  url: 'https://api.example.com/webhook',
  headers: {
    'Authorization': 'Bearer token',
    'Content-Type': 'application/json'
  },
  retryAttempts: 3,
  retryDelay: 1000,
  timeout: 30000
});

const form = new FormRuntime({
  schema: mySchema,
  onSubmit: (data) => connector.submit(data)
});
```

## Google Sheets

Submit form data to Google Sheets. Requires OAuth 2.0 authentication.

### Setup

1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create OAuth 2.0 credentials
4. Implement OAuth flow (client-side or server-side)

### Usage

```javascript
import { GoogleSheetsConnector } from './connectors/google-sheets.js';

const connector = new GoogleSheetsConnector({
  spreadsheetId: 'your-spreadsheet-id',
  sheetName: 'Responses',
  credentials: {
    access_token: 'oauth-token'
  },
  fieldMapping: {
    'firstName': 'First Name',
    'email': 'Email'
  },
  createSheet: true
});

// Authenticate first
await connector.authenticate();

const form = new FormRuntime({
  schema: mySchema,
  onSubmit: (data) => connector.submit(data)
});
```

## Airtable

Submit form data to Airtable. Requires API key.

### Setup

1. Get your Airtable API key from account settings
2. Get your base ID from the Airtable API documentation
3. Note your table name

### Usage

```javascript
import { AirtableConnector } from './connectors/airtable.js';

const connector = new AirtableConnector({
  apiKey: 'your-api-key',
  baseId: 'your-base-id',
  tableName: 'Table 1',
  fieldMapping: {
    'firstName': 'First Name',
    'email': 'Email'
  }
});

await connector.authenticate();

const form = new FormRuntime({
  schema: mySchema,
  onSubmit: (data) => connector.submit(data)
});
```

## Notion

Submit form data to a Notion database. Requires OAuth 2.0.

### Setup

1. Create a Notion integration
2. Get OAuth credentials
3. Share your database with the integration
4. Implement OAuth flow

### Usage

```javascript
import { NotionConnector } from './connectors/notion.js';

const connector = new NotionConnector({
  databaseId: 'your-database-id',
  credentials: {
    access_token: 'oauth-token'
  },
  propertyMapping: {
    'firstName': 'Name',
    'email': 'Email'
  }
});

await connector.authenticate();

const form = new FormRuntime({
  schema: mySchema,
  onSubmit: (data) => connector.submit(data)
});
```

## Email

Send form submissions via email. Supports SMTP, SendGrid, and Mailgun.

### SendGrid

```javascript
import { EmailConnector } from './connectors/email.js';

const connector = new EmailConnector({
  provider: 'sendgrid',
  apiKey: 'your-sendgrid-api-key',
  to: 'recipient@example.com',
  from: 'sender@example.com',
  subject: 'Form Submission',
  template: '<h2>New Submission</h2><p>{{message}}</p>'
});

const form = new FormRuntime({
  schema: mySchema,
  onSubmit: (data) => connector.submit(data)
});
```

### Mailgun

```javascript
const connector = new EmailConnector({
  provider: 'mailgun',
  apiKey: 'your-mailgun-api-key',
  smtpConfig: {
    domain: 'your-domain.com'
  },
  to: 'recipient@example.com',
  from: 'sender@example.com',
  subject: 'Form Submission'
});
```

### SMTP

SMTP requires server-side implementation for security. The connector will return formatted data for server processing.

## Creating Custom Connectors

Extend the base `FormConnector` class:

```javascript
import { FormConnector } from './connectors/base-connector.js';

class MyCustomConnector extends FormConnector {
  constructor(config) {
    super(config);
    this.apiUrl = config.apiUrl;
  }

  async authenticate() {
    // Handle authentication if needed
  }

  async submit(formData) {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    
    return {
      success: true,
      message: 'Submitted successfully',
      id: response.id
    };
  }

  async validate(formData) {
    // Optional pre-submission validation
    return { valid: true, errors: [] };
  }
}
```

## Troubleshooting

### Authentication Errors

- Verify credentials are correct
- Check token expiration
- Ensure OAuth scopes are correct

### Network Errors

- Check CORS settings
- Verify endpoint URLs
- Review browser console for errors

### Data Format Errors

- Verify field mapping matches backend expectations
- Check data types (strings, numbers, dates)
- Review connector logs for details








