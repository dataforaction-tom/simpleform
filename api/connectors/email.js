/**
 * Email Connector API Endpoint
 * Serverless function to send emails via SendGrid or Mailgun
 * API keys stored securely in environment variables
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
    const { formData, provider, to, from, subject, template } = req.body;

    if (!formData) {
      return res.status(400).json({ success: false, message: 'Form data is required' });
    }

    if (!to || !from || !subject) {
      return res.status(400).json({ success: false, message: 'To, from, and subject are required' });
    }

    // Prepare email body
    let htmlBody = '';
    let textBody = '';

    if (template) {
      // Use custom template
      htmlBody = template;
      Object.keys(formData).forEach((key) => {
        const value = formatValue(formData[key]);
        htmlBody = htmlBody.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
      textBody = htmlToText(htmlBody);
    } else {
      // Default template
      htmlBody = '<h2>Form Submission</h2><table style="border-collapse: collapse; width: 100%;">';
      textBody = 'Form Submission\n\n';
      Object.keys(formData).forEach((key) => {
        const value = formatValue(formData[key]);
        htmlBody += `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>${key}:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${value}</td></tr>`;
        textBody += `${key}: ${value}\n`;
      });
      htmlBody += '</table>';
    }

    if (provider === 'sendgrid') {
      return await sendViaSendGrid(req, res, { to, from, subject, htmlBody, textBody });
    } else if (provider === 'mailgun') {
      return await sendViaMailgun(req, res, { to, from, subject, htmlBody, textBody });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported email provider. Use "sendgrid" or "mailgun"',
      });
    }
  } catch (error) {
    console.error('Email connector error:', error);
    return res.status(500).json({
      success: false,
      message: `Email error: ${error.message}`,
    });
  }
}

async function sendViaSendGrid(req, res, { to, from, subject, htmlBody, textBody }) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, message: 'SendGrid API key not configured' });
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
        },
      ],
      from: { email: from },
      subject: subject,
      content: [
        {
          type: 'text/html',
          value: htmlBody,
        },
        {
          type: 'text/plain',
          value: textBody,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => 'Unknown error');
    return res.status(response.status).json({
      success: false,
      message: `SendGrid error: ${error}`,
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Email sent via SendGrid successfully',
  });
}

async function sendViaMailgun(req, res, { to, from, subject, htmlBody, textBody }) {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;

  if (!apiKey || !domain) {
    return res.status(500).json({
      success: false,
      message: 'Mailgun API key and domain not configured',
    });
  }

  const formData = new URLSearchParams();
  formData.append('from', from);
  formData.append('to', to);
  formData.append('subject', subject);
  formData.append('html', htmlBody);
  formData.append('text', textBody);

  const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    return res.status(response.status).json({
      success: false,
      message: `Mailgun error: ${error.message || 'Unknown error'}`,
    });
  }

  const result = await response.json();
  return res.status(200).json({
    success: true,
    message: 'Email sent via Mailgun successfully',
    id: result.id,
  });
}

function formatValue(value) {
  if (value === null || value === undefined) {
    return '';
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

function htmlToText(html) {
  // Simple HTML to text conversion
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

