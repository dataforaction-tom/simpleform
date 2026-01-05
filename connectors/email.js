/**
 * Email Connector
 * Sends form data via email (SMTP, SendGrid, or Mailgun)
 * Note: This is a client-side connector interface
 * Actual email sending should be done server-side for security
 */

class EmailConnector extends FormConnector {
  constructor(config = {}) {
    super(config);
    this.provider = config.provider || 'smtp'; // smtp, sendgrid, mailgun
    this.to = config.to;
    this.from = config.from;
    this.subject = config.subject || 'Form Submission';
    this.template = config.template || null;
    this.apiKey = config.apiKey; // For SendGrid/Mailgun
    this.smtpConfig = config.smtpConfig; // For SMTP
  }

  async submit(formData) {
    // Note: Email sending from client-side is not secure
    // This connector should be used with a server-side proxy
    // For now, we'll format the data and return it for server-side processing

    try {
      const emailData = this.prepareEmailData(formData);

      if (this.provider === 'sendgrid') {
        return await this.sendViaSendGrid(emailData);
      } else if (this.provider === 'mailgun') {
        return await this.sendViaMailgun(emailData);
      } else {
        // SMTP - would need server-side implementation
        return {
          success: false,
          message: 'SMTP email sending requires server-side implementation',
          data: emailData, // Return formatted data for server processing
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Email error: ${error.message}`,
      };
    }
  }

  prepareEmailData(formData) {
    let body = '';

    if (this.template) {
      // Use custom template
      body = this.template;
      Object.keys(formData).forEach((key) => {
        const value = this.formatValue(formData[key]);
        body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
    } else {
      // Default template
      body = '<h2>Form Submission</h2><table>';
      Object.keys(formData).forEach((key) => {
        const value = this.formatValue(formData[key]);
        body += `<tr><td><strong>${key}:</strong></td><td>${value}</td></tr>`;
      });
      body += '</table>';
    }

    return {
      to: this.to,
      from: this.from,
      subject: this.subject,
      html: body,
      text: this.htmlToText(body),
    };
  }

  formatValue(value) {
    if (value === null || value === undefined) {
      return '';
    }
    if (value instanceof File) {
      return value.name;
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }

  htmlToText(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  async sendViaSendGrid(emailData) {
    if (!this.apiKey) {
      throw new Error('SendGrid API key is required');
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: emailData.to }],
          },
        ],
        from: { email: emailData.from },
        subject: emailData.subject,
        content: [
          {
            type: 'text/html',
            value: emailData.html,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SendGrid error: ${error}`);
    }

    return {
      success: true,
      message: 'Email sent via SendGrid successfully',
    };
  }

  async sendViaMailgun(emailData) {
    if (!this.apiKey || !this.smtpConfig?.domain) {
      throw new Error('Mailgun API key and domain are required');
    }

    const formData = new FormData();
    formData.append('from', emailData.from);
    formData.append('to', emailData.to);
    formData.append('subject', emailData.subject);
    formData.append('html', emailData.html);
    formData.append('text', emailData.text);

    const response = await fetch(`https://api.mailgun.net/v3/${this.smtpConfig.domain}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`api:${this.apiKey}`)}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Mailgun error: ${error.message || 'Unknown error'}`);
    }

    return {
      success: true,
      message: 'Email sent via Mailgun successfully',
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EmailConnector;
} else if (typeof window !== 'undefined') {
  window.EmailConnector = EmailConnector;
}








