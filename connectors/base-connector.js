/**
 * Base Form Connector
 * Abstract class that all connectors extend
 */

class FormConnector {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Authenticate if needed (OAuth, API keys, etc.)
   * @returns {Promise<void>}
   */
  async authenticate() {
    // Override in subclasses if authentication is needed
    return Promise.resolve();
  }

  /**
   * Submit form data
   * @param {Object} formData - The form data to submit
   * @returns {Promise<{success: boolean, message: string, id?: string}>}
   */
  async submit(formData) {
    throw new Error('submit() must be implemented by connector subclass');
  }

  /**
   * Validate form data before submission
   * @param {Object} formData - The form data to validate
   * @returns {Promise<{valid: boolean, errors?: Array}>}
   */
  async validate(formData) {
    // Default validation: check if data is not empty
    const hasData = Object.keys(formData).length > 0;
    return {
      valid: hasData,
      errors: hasData ? [] : [{ field: 'general', message: 'No data to submit' }],
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormConnector;
} else if (typeof window !== 'undefined') {
  window.FormConnector = FormConnector;
}








