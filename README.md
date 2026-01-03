# Form Builder Open Source

A self-hostable, lightweight form runtime with a basic builder. Bring-your-own-backend architecture with pluggable connectors.

## Features

- **Zero Dependencies Runtime**: Core form engine is vanilla JavaScript (~15KB minified)
- **Form Builder**: JSON editor and GUI builder for creating forms
- **Progressive Enhancement**: Works without JavaScript, enhanced with JS
- **Accessibility**: WCAG 2.1 AA compliant with full keyboard navigation
- **Privacy Focused**: No tracking, no external calls, all data stays with user
- **Pluggable Connectors**: CSV, Google Sheets, Airtable, Notion, Webhook, Email

## Quick Start

### One-Click Deployment (Recommended)

Deploy to Vercel in one command:

```bash
npm i -g vercel
vercel
```

That's it! Your builder is live. See [DEPLOYMENT_QUICKSTART.md](DEPLOYMENT_QUICKSTART.md) for details.

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open builder**
   Visit `http://localhost:3000/builder/index.html`

### Build

```bash
npm run build
```

Outputs to `dist/` directory:
- `dist/builder/` - Builder interface
- `dist/runtime/` - Form runtime
- `dist/connectors/` - Connector plugins
- `dist/schema/` - JSON schema

### Testing

```bash
npm test
npm run test:coverage
npm run audit:a11y
```

## Usage

### Using the Runtime

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="runtime/form-runtime.css">
</head>
<body>
  <div id="form-container"></div>
  <script src="runtime/form-runtime.js"></script>
  <script>
    const form = new FormRuntime({
      schema: formSchemaJSON,
      container: '#form-container',
      theme: 'default',
      onSubmit: async (data) => {
        // Handle submission
        return { success: true, message: 'Thank you!' };
      }
    });
    form.render();
  </script>
</body>
</html>
```

### Using Connectors

```javascript
import { CSVExportConnector } from './connectors/csv-export.js';

const connector = new CSVExportConnector({
  filename: 'responses.csv'
});

const form = new FormRuntime({
  schema: mySchema,
  onSubmit: (data) => connector.submit(data)
});
```

## Deployment

### Quick Deploy to Vercel

```bash
npm i -g vercel
vercel
```

**Environment Variables** (for connectors):
- `AIRTABLE_API_KEY` - For Airtable connector
- `NOTION_API_KEY` - For Notion connector
- `GOOGLE_SHEETS_ACCESS_TOKEN` - For Google Sheets connector
- `SENDGRID_API_KEY` - For SendGrid email
- `MAILGUN_API_KEY` + `MAILGUN_DOMAIN` - For Mailgun email

Set these in Vercel dashboard → Settings → Environment Variables

### Other Deployment Options

- **GitHub Pages**: For static forms (CSV export works, other connectors need Vercel API)
- **Netlify**: Drag & drop or Git integration
- **Self-hosted**: Deploy anywhere that supports Node.js/static files

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Documentation

- **[Quick Start Deployment](DEPLOYMENT_QUICKSTART.md)** - Deploy in 5 minutes
- **[User Guide](USER_GUIDE.md)** - Complete guide for end users (installation, deployment, sharing)
- **[Deployment Guide](DEPLOYMENT.md)** - Detailed deployment instructions for all hosting options
- [Getting Started](docs/getting-started.md) - Quick start for developers
- [Form Schema Reference](docs/form-schema.md) - Complete schema documentation
- [Connector Guides](docs/connectors.md) - Connector setup and configuration
- [Theming Guide](docs/theming.md) - Customizing form appearance
- [Accessibility Guide](docs/accessibility.md) - Accessibility best practices

## License

MIT



