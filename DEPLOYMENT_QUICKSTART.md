# Quick Start Deployment Guide

Get your form builder deployed in under 5 minutes!

## Prerequisites

- Node.js installed
- A Vercel account (free) - [Sign up](https://vercel.com/signup)
- API keys for connectors you want to use (optional)

## Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

## Step 2: Deploy

From your project directory:

```bash
vercel
```

Follow the prompts:
- Login to Vercel (opens browser)
- Link to existing project or create new
- Confirm settings (auto-detected)

**Done!** Your builder is now live at `https://your-project.vercel.app`

## Step 3: Configure Connectors (Optional)

If you want to use Airtable, Google Sheets, Notion, or Email connectors:

1. **Get API keys:**
   - Airtable: [Account Settings → API](https://airtable.com/account)
   - Notion: [Create Integration](https://www.notion.so/my-integrations)
   - SendGrid: [API Keys](https://app.sendgrid.com/settings/api_keys)
   - Mailgun: [API Keys](https://app.mailgun.com/app/account/security/api_keys)

2. **Add to Vercel:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project
   - Settings → Environment Variables
   - Add each key:
     - `AIRTABLE_API_KEY` = `your-key-here`
     - `NOTION_API_KEY` = `your-key-here`
     - `SENDGRID_API_KEY` = `your-key-here`
     - etc.

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

## Step 4: Use the Builder

1. Open your deployed builder: `https://your-project.vercel.app/builder`
2. Create a form
3. Configure connectors:
   - Go to "Connectors" tab
   - Select connector type
   - API endpoint is auto-filled (or enter manually)
   - Enter connector config (Base ID, Table Name, etc.)
   - Save

## Step 5: Share Your Form

**Option 1: Shareable URL (Recommended)**
1. Click "Share Form" button
2. Click "Save & Get URL"
3. Copy the generated URL (automatically copied to clipboard)
4. Share the URL: `https://your-project.vercel.app/form/[id]`
5. QR code is generated for easy mobile access

**Option 2: Download HTML**
1. Click "Share Form" button
2. Click "Download HTML"
3. Deploy the HTML file anywhere (GitHub Pages, Netlify, etc.)


## Troubleshooting

### "API endpoint not configured" error

- Make sure you've set environment variables in Vercel
- Redeploy after adding environment variables: `vercel --prod`
- Check that the API endpoint URL in connector config matches your Vercel URL

### Connector not working

- Verify API key is correct in Vercel environment variables
- Check browser console for error messages
- Test API endpoint directly: `curl -X POST https://your-app.vercel.app/api/connectors/airtable -H "Content-Type: application/json" -d '{"formData":{},"baseId":"test","tableName":"test"}'`

### Build fails

- Make sure you're in the project root directory
- Run `npm install` first
- Check that `vercel.json` exists

## Next Steps

- Read [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions
- See [USER_GUIDE.md](USER_GUIDE.md) for using the builder
- Check [docs/connectors.md](docs/connectors.md) for connector setup

## Need Help?

- Check the [full deployment guide](DEPLOYMENT.md)
- Open an issue on GitHub
- Review Vercel [documentation](https://vercel.com/docs)

