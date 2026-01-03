# Creating Custom Connectors

This guide explains how to create your own connector for submitting form data to custom backends.

## Base Connector Class

All connectors extend the `FormConnector` base class:

```javascript
class FormConnector {
  constructor(config = {}) {
    this.config = config;
  }

  async authenticate() {
    // Override if authentication is needed
  }

  async submit(formData) {
    // Must be implemented
    throw new Error('submit() must be implemented');
  }

  async validate(formData) {
    // Optional pre-submission validation
    return { valid: true, errors: [] };
  }
}
```

## Example: Simple API Connector

```javascript
import { FormConnector } from './connectors/base-connector.js';

class MyAPIConnector extends FormConnector {
  constructor(config = {}) {
    super(config);
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
  }

  async submit(formData) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        message: 'Data submitted successfully',
        id: result.id
      };
    } catch (error) {
      return {
        success: false,
        message: `Error: ${error.message}`
      };
    }
  }
}
```

## Example: With Authentication

```javascript
class OAuthConnector extends FormConnector {
  constructor(config = {}) {
    super(config);
    this.token = null;
    this.tokenExpiry = null;
  }

  async authenticate() {
    if (this.token && this.tokenExpiry > Date.now()) {
      return; // Token still valid
    }

    // Get new token
    const response = await fetch('https://api.example.com/oauth/token', {
      method: 'POST',
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret
      })
    });

    const data = await response.json();
    this.token = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
  }

  async submit(formData) {
    await this.authenticate();

    const response = await fetch('https://api.example.com/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    // ... handle response
  }
}
```

## Example: With Validation

```javascript
class ValidatedConnector extends FormConnector {
  async validate(formData) {
    const errors = [];

    if (!formData.email) {
      errors.push({ field: 'email', message: 'Email is required' });
    }

    if (!formData.email?.includes('@')) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  async submit(formData) {
    // Validation is called automatically before submit
    // But you can also call it manually
    const validation = await this.validate(formData);
    if (!validation.valid) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      };
    }

    // Proceed with submission
    // ...
  }
}
```

## Using Your Connector

```javascript
import { MyAPIConnector } from './my-connector.js';

const connector = new MyAPIConnector({
  apiUrl: 'https://api.example.com/submit',
  apiKey: 'your-api-key'
});

const form = new FormRuntime({
  schema: mySchema,
  container: '#form',
  onSubmit: (data) => connector.submit(data)
});
```

## Best Practices

1. **Error Handling**: Always return consistent error format
2. **Authentication**: Handle token refresh automatically
3. **Validation**: Validate data before submission
4. **Retry Logic**: Implement retry for network errors
5. **Security**: Never expose secrets in client-side code

## Testing

```javascript
// Test your connector
const connector = new MyAPIConnector({...});

// Test validation
const validation = await connector.validate(testData);
console.assert(validation.valid === true);

// Test submission
const result = await connector.submit(testData);
console.assert(result.success === true);
```

## Sharing Your Connector

1. Create a GitHub repository
2. Document usage
3. Add examples
4. Submit to the community






