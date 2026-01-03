# Form Builder Open Source - User Guide

Welcome to Form Builder Open Source! This guide will help you get started with creating, deploying, and sharing forms.

## Table of Contents

1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Building Forms](#building-forms)
4. [Configuring Connectors](#configuring-connectors)
5. [Sharing Forms](#sharing-forms)
6. [Hosting Options](#hosting-options)
7. [Deployment Guide](#deployment-guide)
8. [Troubleshooting](#troubleshooting)

---

## Installation

### Prerequisites

- Node.js 18+ (for development and building)
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A web server (for hosting forms)

### Quick Start

1. **Clone or download the repository**
   ```bash
   git clone https://github.com/yourusername/form-builder-os.git
   cd form-builder-os
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open the builder**
   - Navigate to `http://localhost:3000/builder/index.html` in your browser
   - You should see the Form Builder interface

### Building for Production

To create production-ready files:

```bash
npm run build
```

This creates a `dist/` directory with:
- `dist/builder/` - Builder interface
- `dist/runtime/` - Form runtime engine
- `dist/connectors/` - Connector plugins
- `dist/schema/` - JSON schema

---

## Getting Started

### Your First Form

1. **Open the Builder**
   - Start the dev server: `npm run dev`
   - Go to `http://localhost:3000/builder/index.html`

2. **Choose a Template** (optional)
   - Click a template button in the sidebar (Contact Form, Survey, etc.)
   - Or start from scratch

3. **Add Fields**
   - Drag fields from the sidebar onto the canvas
   - Or click the canvas to add a text field
   - Click on any field to configure it

4. **Configure Fields**
   - Click a field to open the configuration panel
   - Set label, placeholder, validation rules
   - Add conditional logic (show/hide based on other fields)

5. **Preview Your Form**
   - Click the "Preview" tab to see how it looks
   - Test the form functionality

6. **Export Your Form**
   - Click "Export JSON" to save the form schema
   - Or use "Share Form" for deployment options

---

## Building Forms

### Field Types

The builder supports these field types:

- **Text** - Single-line text input
- **Textarea** - Multi-line text input
- **Email** - Email address with validation
- **Number** - Numeric input
- **Phone** - Telephone number
- **URL** - Web address
- **Date** - Date picker
- **Select** - Dropdown menu
- **Radio** - Radio button group
- **Checkboxes** - Multiple selection
- **File Upload** - File attachment
- **Header** - Section heading (H1-H6)
- **Paragraph** - Read-only text

### Field Configuration

For each field, you can configure:

- **Basic Settings**
  - Field ID (unique identifier)
  - Label (displayed text)
  - Placeholder (hint text)
  - Required (make field mandatory)

- **Validation Rules**
  - Pattern matching (regex)
  - Min/max length
  - Min/max values (for numbers)
  - Custom error messages

- **Conditional Logic**
  - Show/hide fields based on other field values
  - Multiple conditions with AND/OR logic
  - Operators: equals, not equals, contains, greater than, less than

### Multi-Page Forms

1. Enable "Multi-page form" in Form Settings
2. Add pages by editing the JSON directly (or use the JSON Editor tab)
3. Progress bar will show automatically

### Repeatable Sections

1. Click "+ Add Section" in the sidebar
2. Configure the section:
   - Section title
   - Min/max instances
   - Button text
3. Drag fields into the section
4. Users can add/remove instances when filling the form

### Styling

Customize your form's appearance:

1. Go to Form Settings panel
2. Use the Styling section:
   - Select theme (default or dark)
   - Pick colors (primary, text, background, border)
   - Choose font family
   - Adjust border radius
3. Changes preview in real-time

---

## Configuring Connectors

Connectors handle form submissions. Configure them in the "Connectors" tab.

### How Connectors Work

**Client-Side Connectors** (work everywhere):
- **CSV Export**: Downloads form data as CSV file
- **Webhook**: Sends data to your custom API endpoint

**Server-Side Connectors** (require Vercel API):
- **Airtable**: Stores responses in Airtable
- **Google Sheets**: Stores responses in Google Sheets
- **Notion**: Creates pages in Notion database
- **Email**: Sends form submissions via email

Server-side connectors use secure API endpoints that protect your API keys. You'll need to:
1. Deploy to Vercel (see [Deployment Guide](DEPLOYMENT.md))
2. Set environment variables in Vercel dashboard
3. Configure the API endpoint in the builder

### CSV Export

**Use case:** Download responses as CSV file

**Configuration:**
- Filename (e.g., `responses.csv`)
- Date format (ISO, US, or EU)

**No API endpoint needed** - Works entirely client-side, can be deployed anywhere.

### Webhook

**Use case:** Send data to your own API endpoint

**Configuration:**
- Webhook URL (e.g., `https://api.example.com/webhook`)
- HTTP Method (POST or PUT)
- Retry attempts (default: 3)

**No API endpoint needed** - Connects directly to your endpoint.

**Example endpoint:**
```javascript
// Your server endpoint
app.post('/webhook', (req, res) => {
  const formData = req.body;
  // Process formData
  res.json({ success: true });
});
```

### Airtable

**Use case:** Store responses in Airtable

**Configuration:**
- **API Endpoint**: `https://your-app.vercel.app/api/connectors/airtable` (auto-filled if deployed on Vercel)
- Base ID (from Airtable)
- Table name

**Setup Steps:**

1. **Get Airtable API Key:**
   - Go to [Airtable Account Settings](https://airtable.com/account)
   - Scroll to "API" section
   - Copy your API key

2. **Set Environment Variable in Vercel:**
   - Go to your Vercel project dashboard
   - Settings → Environment Variables
   - Add: `AIRTABLE_API_KEY` = `your-api-key-here`
   - Redeploy: `vercel --prod`

3. **Configure in Builder:**
   - Go to Connectors tab
   - Select "Airtable"
   - API endpoint is auto-filled (or enter manually)
   - Enter Base ID and Table Name
   - Save

### Google Sheets

**Use case:** Store responses in Google Sheets

**Configuration:**
- **API Endpoint**: `https://your-app.vercel.app/api/connectors/google-sheets` (auto-filled if deployed on Vercel)
- Spreadsheet ID (from Google Sheets URL)
- Sheet name (default: "Sheet1")
- Create sheet if missing (checkbox)

**Setup Steps:**

1. **Get Google Sheets Access:**
   - Create a Google Cloud Project
   - Enable Google Sheets API
   - Create OAuth 2.0 credentials or Service Account
   - Get access token

2. **Set Environment Variable in Vercel:**
   - Add: `GOOGLE_SHEETS_ACCESS_TOKEN` = `your-access-token`
   - Or: `GOOGLE_SERVICE_ACCOUNT_KEY` = `your-service-account-json`
   - Redeploy: `vercel --prod`

3. **Configure in Builder:**
   - Select "Google Sheets"
   - Enter API endpoint, Spreadsheet ID, and Sheet name
   - Save

### Notion

**Use case:** Create pages in Notion database

**Configuration:**
- **API Endpoint**: `https://your-app.vercel.app/api/connectors/notion` (auto-filled if deployed on Vercel)
- Database ID (from Notion)

**Setup Steps:**

1. **Create Notion Integration:**
   - Go to [Notion Integrations](https://www.notion.so/my-integrations)
   - Click "New integration"
   - Copy the "Internal Integration Token"

2. **Share Database with Integration:**
   - Open your Notion database
   - Click "..." menu → "Connections"
   - Add your integration

3. **Set Environment Variable in Vercel:**
   - Add: `NOTION_API_KEY` = `your-integration-token`
   - Redeploy: `vercel --prod`

4. **Configure in Builder:**
   - Select "Notion"
   - Enter API endpoint and Database ID
   - Save

### Email

**Use case:** Send form submissions via email

**Configuration:**
- **API Endpoint**: `https://your-app.vercel.app/api/connectors/email` (auto-filled if deployed on Vercel)
- Provider (SendGrid or Mailgun)
- To (recipient email)
- From (sender email)
- Subject line

**Setup Steps:**

**For SendGrid:**
1. Get API key from [SendGrid Dashboard](https://app.sendgrid.com/settings/api_keys)
2. Set in Vercel: `SENDGRID_API_KEY` = `your-api-key`
3. Redeploy: `vercel --prod`

**For Mailgun:**
1. Get API key and domain from [Mailgun Dashboard](https://app.mailgun.com/app/account/security/api_keys)
2. Set in Vercel:
   - `MAILGUN_API_KEY` = `your-api-key`
   - `MAILGUN_DOMAIN` = `your-domain`
3. Redeploy: `vercel --prod`

**Configure in Builder:**
- Select "Email"
- Choose provider (SendGrid or Mailgun)
- Enter API endpoint, recipient, sender, and subject
- Save

### Important Notes

- **API keys are never stored in forms** - They're securely stored in Vercel environment variables
- **CSV and Webhook work everywhere** - No Vercel deployment needed
- **Other connectors require Vercel** - API endpoints must be deployed to Vercel
- **API endpoints are auto-detected** - If you're using the builder on Vercel, endpoints are auto-filled
- **Test locally** - Use `vercel dev` to test API functions before deploying

---

## Sharing Forms

The builder provides three ways to share your forms:

### 1. Shareable URL (Recommended for Vercel)

**Best for:** Quick sharing, works on same Vercel deployment

**Steps:**
1. Click "Share Form" button
2. Click "Save & Get URL" button
3. Form is saved and a shareable URL is generated
4. Copy the URL and share it with users

**Features:**
- ✅ Works immediately on Vercel deployments
- ✅ No file downloads needed
- ✅ URL is automatically copied to clipboard
- ✅ QR code generated for easy mobile access
- ✅ Iframe embed code automatically updated

**Example URL:**
```
https://your-app.vercel.app/form/abc123def456
```

**Requirements:**
- Must be deployed to Vercel
- Forms are stored on the server
- URLs persist across deployments (with proper storage setup)

**How it works:**
- Form schema is saved via API endpoint
- Each form gets a unique ID
- Forms are accessible at `/form/[id]` URLs
- All connector configurations are preserved

### 2. Standalone HTML Export

**Best for:** Self-contained forms, offline use, deployment to other platforms

**Steps:**
1. Click "Share Form" button
2. Click "Download HTML" in the modal
3. A complete HTML file is downloaded
4. Upload to any web server or open locally

**What's included:**
- Complete form schema
- Form runtime engine
- Connector code (CSV/webhook) or API endpoint calls
- All CSS and styling

**Deployment:**
- Upload the HTML file to any web server
- No additional setup required
- Works offline (except for connectors that need API access)
- Can be deployed to GitHub Pages, Netlify, etc.

### 3. Iframe Embed Code

**Best for:** Embedding forms in existing websites

**Steps:**
1. Click "Share Form"
2. Copy the iframe code from the modal
3. Paste into your website's HTML

**Example:**
```html
<iframe src="https://your-app.vercel.app/form/abc123" width="100%" height="600" frameborder="0"></iframe>
```

**Requirements:**
- Form must be saved and accessible via URL
- Works best with "Shareable URL" option above

---

## Hosting Options

To share forms via URL or iframe, you need to host them. Here are several options:

### Option 1: Static Hosting (Recommended for Beginners)

#### GitHub Pages

1. **Create a repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-forms.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Select source branch (usually `main`)
   - Select folder (`/` or `/docs`)
   - Save

3. **Deploy your form**
   - Export standalone HTML from builder
   - Upload to repository
   - Commit and push
   - Form available at: `https://yourusername.github.io/your-forms/form.html`

#### Netlify

1. **Drag and drop**
   - Go to [netlify.com](https://netlify.com)
   - Drag your `dist/` folder or standalone HTML file
   - Get instant URL

2. **Git integration**
   - Connect GitHub repository
   - Auto-deploy on push
   - Custom domain support

#### Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd dist
   vercel
   ```

3. **Follow prompts** - Get URL instantly

### Option 2: Traditional Web Hosting

Upload files via FTP/SFTP:

1. **Export standalone HTML** from builder
2. **Connect to your server** via FTP client (FileZilla, etc.)
3. **Upload HTML file** to public directory
4. **Access via:** `https://yourdomain.com/form.html`

### Option 3: Self-Hosted Server

For advanced users who need server-side connector handling:

#### Node.js Example

```javascript
// server.js
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('dist'));

// Webhook endpoint
app.post('/api/webhook', (req, res) => {
  const formData = req.body;
  // Process form data
  console.log('Form submitted:', formData);
  res.json({ success: true });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

#### PHP Example

```php
<?php
// webhook.php
header('Content-Type: application/json');

$formData = json_decode(file_get_contents('php://input'), true);

// Process form data
// Save to database, send email, etc.

echo json_encode(['success' => true]);
?>
```

---

## Deployment Guide

### Step-by-Step: Deploying a Form with Connector

#### Example: Webhook Connector

1. **Build your form in the builder**
   - Add fields
   - Configure connector (Webhook tab)
   - Set webhook URL: `https://yourdomain.com/api/webhook`

2. **Export standalone HTML**
   - Click "Share Form" → "Download HTML"
   - Save `form.html`

3. **Set up your server endpoint**
   ```javascript
   // Node.js/Express example
   app.post('/api/webhook', express.json(), (req, res) => {
     const formData = req.body;
     // Save to database
     // Send email notification
     // etc.
     res.json({ success: true, message: 'Thank you!' });
   });
   ```

4. **Deploy form HTML**
   - Upload `form.html` to your web server
   - Ensure CORS is configured if needed

5. **Test the form**
   - Open form URL
   - Submit test data
   - Verify webhook receives data

#### Example: Google Sheets Connector

1. **Configure Google Sheets connector**
   - Get Spreadsheet ID from Google Sheets URL
   - Set sheet name
   - Enable "Create sheet if missing"

2. **Set up OAuth (Server-side)**
   ```javascript
   // OAuth flow must be handled server-side
   // Client-side OAuth is not secure
   
   // Option 1: Proxy through your server
   app.post('/api/sheets', async (req, res) => {
     const formData = req.body;
     // Use server-side OAuth token
     // Submit to Google Sheets API
   });
   
   // Option 2: Use service account (recommended)
   // Configure service account in Google Cloud
   // Use service account credentials server-side
   ```

3. **Modify standalone HTML**
   - Change connector to use your server endpoint
   - Or use server-side connector

4. **Deploy and test**

### Environment Variables

For production, store sensitive data in environment variables:

```bash
# .env file
GOOGLE_SHEETS_CLIENT_ID=your-client-id
GOOGLE_SHEETS_CLIENT_SECRET=your-secret
AIRTABLE_API_KEY=your-api-key
SENDGRID_API_KEY=your-api-key
```

**Never commit API keys to version control!**

---

## Troubleshooting

### Buttons Not Working

**Issue:** Buttons in builder don't respond

**Solutions:**
1. Check browser console for errors (F12)
2. Ensure JavaScript is enabled
3. Clear browser cache and reload
4. Verify all files are loaded (check Network tab)

### Template Not Loading

**Issue:** Template button doesn't load form

**Solutions:**
1. Check browser console for 404 errors
2. Verify template files exist in `builder/examples/`
3. Try refreshing the page
4. Check file paths in Network tab

### Form Not Rendering

**Issue:** Preview shows error or blank

**Solutions:**
1. Check JSON schema is valid (JSON Editor tab)
2. Verify FormRuntime is loaded (check console)
3. Check for JavaScript errors
4. Ensure all required fields in schema are present

### Connector Not Working

**Issue:** Form submits but connector fails

**Solutions:**
1. **CSV Export:** Check browser allows downloads
2. **Webhook:** 
   - Verify URL is correct
   - Check CORS settings
   - Test endpoint with Postman/curl
3. **Google Sheets/Airtable/Notion:**
   - Verify credentials are configured
   - Check API permissions
   - Review server logs
4. **Email:**
   - Verify API keys are set
   - Check email provider status
   - Review spam folder

### Styling Not Applied

**Issue:** Custom colors/styles don't show

**Solutions:**
1. Check CSS variables are set correctly
2. Verify theme is selected
3. Clear browser cache
4. Check for CSS conflicts

### Drag and Drop Not Working

**Issue:** Can't drag fields to canvas

**Solutions:**
1. Ensure you're in GUI Builder tab
2. Try clicking canvas to add field instead
3. Check browser supports HTML5 drag and drop
4. Disable browser extensions that might interfere

### Form Not Accessible via URL

**Issue:** Can't access shared form URL

**Solutions:**
1. Verify file is uploaded to server
2. Check file permissions (should be readable)
3. Verify URL path is correct
4. Check server configuration (index files, etc.)
5. For GitHub Pages: Wait a few minutes for deployment

---

## Best Practices

### Form Design

- **Keep it simple:** Don't overwhelm users with too many fields
- **Use conditional logic:** Show only relevant fields
- **Clear labels:** Make it obvious what each field is for
- **Validation:** Provide helpful error messages
- **Mobile-friendly:** Test on mobile devices

### Security

- **Never expose API keys** in client-side code
- **Use server-side proxies** for OAuth flows
- **Validate data** on the server, not just client
- **Use HTTPS** for all production forms
- **Sanitize inputs** before storing

### Performance

- **Minimize fields:** Only ask for what you need
- **Optimize images:** Compress file uploads
- **Test load times:** Aim for <2 second load
- **Use CDN:** For static assets if possible

### Accessibility

- **Use labels:** Every field should have a label
- **Keyboard navigation:** Test with Tab key
- **Screen readers:** Test with NVDA/VoiceOver
- **Color contrast:** Ensure 4.5:1 ratio minimum
- **Error messages:** Clear and descriptive

---

## Quick Reference

### Common Tasks

**Create a contact form:**
1. Open builder → Click "Contact Form" template
2. Customize fields
3. Configure email connector
4. Export standalone HTML
5. Upload to web server

**Embed form in website:**
1. Build form in builder
2. Deploy form HTML to web server
3. Copy iframe code from "Share Form"
4. Paste into your website HTML

**Store responses in Google Sheets:**
1. Create Google Cloud project
2. Enable Sheets API, create OAuth credentials
3. Configure Google Sheets connector in builder
4. Set up server-side OAuth proxy
5. Deploy form

**Share form via URL:**
1. Export standalone HTML
2. Upload to GitHub Pages / Netlify / Vercel
3. Get public URL
4. Share URL or generate QR code

## Getting Help

- **Documentation:** See `docs/` folder for detailed guides
- **Issues:** Report bugs on GitHub Issues
- **Examples:** Check `builder/examples/` for form templates
- **Schema Reference:** See `docs/form-schema.md`
- **User Guide:** You're reading it! This is the main guide for end users.

---

## License

MIT License - See LICENSE file for details

---

**Happy Form Building! 🎉**

