# Deployment Guide

This guide provides detailed instructions for deploying forms in various hosting environments.

## Table of Contents

1. [One-Click Deployment (Recommended)](#one-click-deployment-recommended)
2. [GitHub Pages](#github-pages)
3. [Netlify](#netlify)
4. [Vercel](#vercel)
5. [Traditional Web Hosting](#traditional-web-hosting)
6. [Self-Hosted Server](#self-hosted-server)
7. [Setting Up Custom Domains](#setting-up-custom-domains)

---

## One-Click Deployment (Recommended)

The easiest way to deploy the form builder with full connector support is using Vercel. This provides:
- ✅ Secure API endpoints for connectors (no exposed API keys)
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Free tier with generous limits
- ✅ One-command deployment

### Quick Start

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```
   Follow the prompts to link your project.

3. **Set Environment Variables**
   - Go to your project on [vercel.com](https://vercel.com)
   - Navigate to Settings → Environment Variables
   - Add the required variables for your connectors:
     - `AIRTABLE_API_KEY` (for Airtable connector)
     - `NOTION_API_KEY` (for Notion connector)
     - `GOOGLE_SHEETS_ACCESS_TOKEN` (for Google Sheets connector)
     - `SENDGRID_API_KEY` (for SendGrid email)
     - `MAILGUN_API_KEY` and `MAILGUN_DOMAIN` (for Mailgun email)

4. **Configure Connectors in Builder**
   - Open your deployed builder
   - Go to Connectors tab
   - Select a connector type
   - Enter your API endpoint (auto-filled if deployed on Vercel)
   - Enter connector-specific config (Base ID, Table Name, etc.)
   - Save

5. **Build and Share Forms**
   - Create your form in the builder
   - Configure connectors with API endpoints
   - Click "Share Form" → "Save & Get URL" to get a shareable link
   - Or click "Download HTML" to export standalone HTML file
   - Shareable URLs work immediately: `https://your-app.vercel.app/form/[id]`

### What Gets Deployed

- **Builder Interface**: Full form builder at `/builder`
- **API Endpoints**: Serverless functions at `/api/connectors/*` and `/api/forms/*`
- **Form Viewer**: Form display page at `/form/[id]`
- **Form Runtime**: Client-side form engine
- **Connectors**: Client-side CSV export, server-side API for others
- **Form Storage**: Forms saved via API are stored in `data/forms.json` (or Vercel KV for production)

### Connector Support

| Connector | Works on GitHub Pages? | Requires Vercel API? |
|-----------|----------------------|---------------------|
| CSV Export | ✅ Yes | ❌ No (client-side) |
| Webhook | ✅ Yes | ❌ No (direct to your endpoint) |
| Airtable | ❌ No | ✅ Yes |
| Google Sheets | ❌ No | ✅ Yes |
| Notion | ❌ No | ✅ Yes |
| Email | ❌ No | ✅ Yes |

**Note**: Forms with CSV export or webhook connectors can be deployed anywhere. Forms using Airtable, Google Sheets, Notion, or Email connectors require the Vercel API endpoints.

For detailed setup instructions, see [Vercel Deployment](#vercel) below.

---

## GitHub Pages

### Method 1: Using Standalone HTML

1. **Build your form in the builder**
   - Create and configure your form
   - Click "Share Form" → "Download HTML"
   - Save as `form.html` (or any name you prefer)

2. **Create a GitHub repository**
   ```bash
   git init
   git add form.html
   git commit -m "Add form"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-forms.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to repository Settings
   - Click "Pages" in left sidebar
   - Under "Source", select branch (usually `main`)
   - Select folder: `/ (root)`
   - Click "Save"

4. **Access your form**
   - URL: `https://yourusername.github.io/your-forms/form.html`
   - Takes 1-2 minutes to become available

### Method 2: Using the Full Builder

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy dist folder**
   ```bash
   cd dist
   git init
   git add .
   git commit -m "Deploy form builder"
   git branch -M gh-pages
   git remote add origin https://github.com/yourusername/your-forms.git
   git push -u origin gh-pages
   ```

3. **Enable GitHub Pages**
   - Settings → Pages
   - Source: `gh-pages` branch
   - Access at: `https://yourusername.github.io/your-forms/builder/index.html`

**Note:** For custom domains, add `CNAME` file in repository root.

---

## Netlify

### Drag and Drop (Easiest)

1. **Export your form**
   - Build form in builder
   - Click "Share Form" → "Download HTML"
   - Save `form.html`

2. **Deploy**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Drag `form.html` (or entire folder) to deploy area
   - Get instant URL: `https://random-name.netlify.app/form.html`

### Git Integration (Recommended)

1. **Connect repository**
   - Push form to GitHub/GitLab/Bitbucket
   - In Netlify: "Add new site" → "Import an existing project"
   - Connect your repository

2. **Configure build**
   - Build command: `npm run build` (if using full builder)
   - Publish directory: `dist` (or root if standalone HTML)
   - Deploy!

3. **Auto-deploy**
   - Every push to main branch auto-deploys
   - Preview deployments for pull requests

### Environment Variables

For connectors requiring API keys:

1. Site settings → Environment variables
2. Add variables:
   - `GOOGLE_SHEETS_CLIENT_ID`
   - `AIRTABLE_API_KEY`
   - etc.
3. Access in serverless functions (if using Netlify Functions)

### Custom Domain

1. Site settings → Domain management
2. Add custom domain
3. Follow DNS configuration instructions
4. SSL certificate auto-provisioned

---

## Vercel

### One-Command Deployment

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm i -g vercel
   ```

2. **Deploy from project root**
   ```bash
   vercel
   ```

3. **Follow the prompts**
   - Link to existing project or create new
   - Confirm settings (auto-detected from `vercel.json`)
   - Deploy!

4. **Set Environment Variables**
   After deployment, configure your API keys:
   
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project
   - Go to **Settings** → **Environment Variables**
   - Add variables for connectors you plan to use:
     
     **Airtable:**
     - `AIRTABLE_API_KEY` - Your Airtable API key
     
     **Google Sheets:**
     - `GOOGLE_SHEETS_ACCESS_TOKEN` - OAuth access token (or use service account)
     - `GOOGLE_SERVICE_ACCOUNT_KEY` - Alternative: Service account JSON key
     
     **Notion:**
     - `NOTION_API_KEY` - Your Notion integration token
     
     **Email (SendGrid):**
     - `SENDGRID_API_KEY` - Your SendGrid API key
     
     **Email (Mailgun):**
     - `MAILGUN_API_KEY` - Your Mailgun API key
     - `MAILGUN_DOMAIN` - Your Mailgun domain

5. **Redeploy** (to apply environment variables)
   ```bash
   vercel --prod
   ```

### Git Integration (Recommended)

1. **Push to GitHub/GitLab/Bitbucket**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Vercel auto-detects settings from `vercel.json`
   - Add environment variables in project settings
   - Deploy!

3. **Automatic Deployments**
   - Every push to `main` triggers production deployment
   - Pull requests get preview deployments
   - Zero configuration needed!

### Project Structure

Vercel automatically detects:
- **API Functions**: Files in `api/` directory become serverless functions
- **Static Files**: Built files in `dist/` directory
- **Build Command**: `npm run build` (from `package.json`)
- **Output Directory**: `dist` (from `vercel.json`)

### API Endpoints

After deployment, your connector API endpoints will be available at:
- `https://your-app.vercel.app/api/connectors/airtable`
- `https://your-app.vercel.app/api/connectors/google-sheets`
- `https://your-app.vercel.app/api/connectors/notion`
- `https://your-app.vercel.app/api/connectors/email`

Use these URLs when configuring connectors in the builder.

### Testing Locally

Test API functions before deploying:

```bash
vercel dev
```

This starts a local server with API functions available at `http://localhost:3000/api/connectors/*`

### Custom Domain

1. **Add domain in Vercel dashboard**
   - Project Settings → Domains
   - Add your domain

2. **Configure DNS**
   - Vercel provides DNS records
   - Add to your DNS provider
   - SSL certificate auto-provisioned

---

## Traditional Web Hosting

### FTP/SFTP Upload

1. **Export form**
   - Build form in builder
   - Export standalone HTML

2. **Connect to server**
   - Use FTP client (FileZilla, WinSCP, etc.)
   - Enter server details:
     - Host: `ftp.yourdomain.com`
     - Username: Your FTP username
     - Password: Your FTP password
     - Port: 21 (FTP) or 22 (SFTP)

3. **Upload files**
   - Navigate to public directory (usually `public_html`, `www`, or `htdocs`)
   - Upload `form.html`
   - Set permissions: 644 (readable by web server)

4. **Access form**
   - URL: `https://yourdomain.com/form.html`

### cPanel File Manager

1. **Login to cPanel**
2. **Open File Manager**
3. **Navigate to public_html**
4. **Upload form.html**
5. **Set permissions** (if needed)
6. **Access via:** `https://yourdomain.com/form.html`

### Apache Configuration

If using Apache, ensure `.htaccess` allows HTML files:

```apache
# .htaccess
DirectoryIndex form.html index.html
```

---

## Self-Hosted Server

### Node.js/Express

1. **Create server file**
   ```javascript
   // server.js
   const express = require('express');
   const path = require('path');
   const app = express();

   // Serve static files
   app.use(express.static('dist'));

   // API endpoint for webhook
   app.post('/api/webhook', express.json(), (req, res) => {
     const formData = req.body;
     // Process form data
     console.log('Form submitted:', formData);
     res.json({ success: true, message: 'Thank you!' });
   });

   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

2. **Install dependencies**
   ```bash
   npm install express
   ```

3. **Deploy**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js
   pm2 save
   pm2 startup
   ```

4. **Reverse proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### PHP Server

1. **Create webhook endpoint**
   ```php
   <?php
   // webhook.php
   header('Content-Type: application/json');
   header('Access-Control-Allow-Origin: *');
   header('Access-Control-Allow-Methods: POST');
   header('Access-Control-Allow-Headers: Content-Type');

   if ($_SERVER['REQUEST_METHOD'] === 'POST') {
       $formData = json_decode(file_get_contents('php://input'), true);
       
       // Process form data
       // Save to database, send email, etc.
       
       echo json_encode(['success' => true, 'message' => 'Thank you!']);
   }
   ?>
   ```

2. **Upload files**
   - Upload `form.html` and `webhook.php` to server
   - Update form connector to use: `https://yourdomain.com/webhook.php`

### Python/Flask

```python
# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/webhook', methods=['POST'])
def webhook():
    form_data = request.json
    # Process form data
    return jsonify({'success': True, 'message': 'Thank you!'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

---

## Setting Up Custom Domains

### GitHub Pages

1. **Add CNAME file**
   - Create `CNAME` file in repository root
   - Add your domain: `yourdomain.com`

2. **Configure DNS**
   - Add CNAME record:
     - Name: `@` or `www`
     - Value: `yourusername.github.io`
   - Or A records:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`

3. **Wait for propagation** (up to 48 hours)

### Netlify

1. **Add domain**
   - Site settings → Domain management
   - Add custom domain

2. **Configure DNS**
   - Netlify provides DNS records
   - Add to your DNS provider:
     - A record: `@` → Netlify IP
     - CNAME: `www` → Netlify domain

3. **SSL auto-provisioned**

### Vercel

1. **Add domain**
   - Project settings → Domains
   - Add your domain

2. **Configure DNS**
   - Vercel provides DNS records
   - Add to DNS provider

3. **SSL auto-provisioned**

---

## Form Storage

Forms saved via "Save & Get URL" need persistent storage. The default implementation uses an in-memory store that works immediately but doesn't persist across deployments.

### Option 1: In-Memory Store (Default - Development Only)
- Forms stored in memory
- ✅ Works immediately, no setup required
- ⚠️ **Forms are lost on function restart or redeployment**
- ⚠️ **Not suitable for production**
- Use only for testing/development

### Option 2: Redis via Vercel Marketplace (Recommended for Production)
> **Note:** Vercel KV has been sunset. Use Marketplace Storage (Redis) instead, which provides automatic account provisioning and unified billing.

- Use Redis from Vercel Marketplace (e.g., Upstash Redis, Redis Cloud) for persistent storage
- ✅ Forms survive deployments and function restarts
- ✅ Fast and reliable
- ✅ Automatic account provisioning and unified billing
- ✅ Free tier available on most providers
- **Setup:**
  1. Link your project (if not already): `vercel link`
  2. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
  3. Select your project
  4. Go to the [Vercel Marketplace](https://vercel.com/integrations)
  5. Search for "Redis" (e.g., Upstash Redis, Redis Cloud)
  6. Click "Add Integration" and follow the setup wizard
  7. Pull environment variables: `vercel env pull .env.local`
  8. Install package: `npm install redis`
  9. Environment variable `REDIS_URL` is automatically added by the integration
  10. Redeploy: `vercel --prod`
  
  The API endpoints automatically detect and use Redis when `REDIS_URL` is configured!

### Option 3: External Database
- Use your own database (PostgreSQL, MongoDB, etc.)
- Most flexible option
- Requires custom API implementation
- Modify `api/forms.js` and `api/forms/[id].js` to use your database

## Environment Variables

Store sensitive data securely:

### Netlify
- Site settings → Environment variables
- Add key-value pairs
- Access in serverless functions

### Vercel
- Project settings → Environment variables
- Add for Production, Preview, Development

### Traditional Hosting
- Use `.env` file (never commit to git!)
- Or hosting panel environment variables

### Example .env
```bash
GOOGLE_SHEETS_CLIENT_ID=your-client-id
GOOGLE_SHEETS_CLIENT_SECRET=your-secret
AIRTABLE_API_KEY=your-api-key
SENDGRID_API_KEY=your-api-key
```

---

## Security Checklist

- [ ] Use HTTPS (SSL certificate)
- [ ] Never expose API keys in client code
- [ ] Use environment variables for secrets
- [ ] Validate data on server side
- [ ] Sanitize inputs before storage
- [ ] Set proper CORS headers
- [ ] Rate limit API endpoints
- [ ] Use secure authentication for OAuth
- [ ] Regular security updates
- [ ] Backup form data regularly

---

## Performance Optimization

- **Minify assets:** Use production build
- **Enable compression:** Gzip/Brotli
- **Use CDN:** For static assets
- **Cache headers:** Set appropriate cache policies
- **Optimize images:** Compress file uploads
- **Lazy load:** For large forms
- **Monitor:** Use analytics to track performance

---

## Troubleshooting Deployment

### Form Not Loading

- Check file permissions (644 for files, 755 for directories)
- Verify file paths are correct
- Check server error logs
- Ensure MIME types are correct

### CORS Errors

- Add CORS headers to server
- Check allowed origins
- Verify preflight requests

### 404 Errors

- Check file exists on server
- Verify URL path
- Check server configuration (index files)

### SSL Certificate Issues

- Verify domain ownership
- Check DNS propagation
- Wait for certificate provisioning (can take hours)

---

For more help, see [USER_GUIDE.md](USER_GUIDE.md) or open an issue on GitHub.




