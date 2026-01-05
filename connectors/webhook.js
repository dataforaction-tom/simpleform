/**
 * Webhook Connector
 * POSTs form data to a custom endpoint
 */

class WebhookConnector extends FormConnector {
  constructor(config = {}) {
    super(config);
    this.url = config.url;
    this.headers = config.headers || { 'Content-Type': 'application/json' };
    this.method = config.method || 'POST';
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000; // milliseconds
    this.timeout = config.timeout || 30000; // 30 seconds
  }

  async submit(formData) {
    if (!this.url) {
      return {
        success: false,
        message: 'Webhook URL is required',
      };
    }

    let lastError;
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const response = await this.makeRequest(formData);
        return {
          success: true,
          message: 'Data submitted successfully',
          id: response.id || response.data?.id,
        };
      } catch (error) {
        lastError = error;
        if (attempt < this.retryAttempts - 1) {
          // Wait before retrying with exponential backoff
          const delay = this.retryDelay * Math.pow(2, attempt);
          await this.sleep(delay);
        }
      }
    }

    return {
      success: false,
      message: `Failed after ${this.retryAttempts} attempts: ${lastError.message}`,
    };
  }

  async makeRequest(formData) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.url, {
        method: this.method,
        headers: this.headers,
        body: JSON.stringify(formData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return { success: true };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebhookConnector;
} else if (typeof window !== 'undefined') {
  window.WebhookConnector = WebhookConnector;
}








