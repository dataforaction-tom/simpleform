# FormRuntime API Reference

Complete API documentation for the FormRuntime class.

## Constructor

```javascript
const form = new FormRuntime({
  schema: FormSchema,        // Required: Form schema object
  container: string|Element, // Required: CSS selector or DOM element
  theme: string,             // Optional: 'default' or 'dark'
  onSubmit: Function,        // Optional: Submission handler
  onValidationError: Function // Optional: Validation error handler
});
```

### Parameters

- **schema** (required): Form schema JSON object
- **container** (required): CSS selector string or DOM element
- **theme** (optional): Theme name, defaults to 'default'
- **onSubmit** (optional): Async function that receives form data and returns `{success, message, id?}`
- **onValidationError** (optional): Function that receives array of validation errors

## Methods

### render()

Renders the form in the container.

```javascript
form.render();
```

### validate()

Validates all form fields and returns boolean.

```javascript
const isValid = form.validate();
```

Returns: `boolean`

### getData()

Gets current form data.

```javascript
const data = form.getData();
```

Returns: `Object` - Form data with field IDs as keys

### setData(data)

Populates form with data.

```javascript
form.setData({
  firstName: 'John',
  email: 'john@example.com'
});
```

Parameters:
- **data**: Object with field IDs as keys

### reset()

Resets form to initial state.

```javascript
form.reset();
```

### goToPage(pageId)

Navigates to a specific page (multi-page forms).

```javascript
form.goToPage('page2');
```

Parameters:
- **pageId**: String - ID of the page to navigate to

### destroy()

Cleans up form instance and removes from DOM.

```javascript
form.destroy();
```

## Event Handlers

### onSubmit

Called when form is submitted and passes validation.

```javascript
const form = new FormRuntime({
  schema: mySchema,
  container: '#form',
  onSubmit: async (formData) => {
    // Submit to your backend
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    
    return {
      success: true,
      message: 'Thank you!'
    };
  }
});
```

**Parameters:**
- `formData`: Object - Form data

**Returns:** Promise resolving to `{success: boolean, message: string, id?: string}`

### onValidationError

Called when validation fails.

```javascript
const form = new FormRuntime({
  schema: mySchema,
  container: '#form',
  onValidationError: (errors) => {
    console.log('Validation errors:', errors);
    // errors: [{fieldId: string, message: string}]
  }
});
```

**Parameters:**
- `errors`: Array of `{fieldId: string, message: string}`

## Form Data Structure

Form data is returned as an object with field IDs as keys:

```javascript
{
  firstName: 'John',
  email: 'john@example.com',
  age: 30,
  interests: ['sports', 'music'],
  householdMembers: [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 28 }
  ]
}
```

## Examples

### Basic Form

```javascript
const form = new FormRuntime({
  schema: {
    formId: 'my-form',
    version: '1.0',
    title: 'My Form',
    pages: [{
      id: 'page1',
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Name',
          required: true
        }
      ]
    }]
  },
  container: '#form-container',
  onSubmit: async (data) => {
    console.log('Submitted:', data);
    return { success: true, message: 'Thank you!' };
  }
});

form.render();
```

### With Connector

```javascript
import { WebhookConnector } from './connectors/webhook.js';

const connector = new WebhookConnector({
  url: 'https://api.example.com/webhook'
});

const form = new FormRuntime({
  schema: mySchema,
  container: '#form',
  onSubmit: (data) => connector.submit(data)
});

form.render();
```

### Multi-page Navigation

```javascript
// Navigate programmatically
form.goToPage('page2');

// Get current page
const currentPage = form.currentPageIndex;
```

### Dynamic Updates

```javascript
// Update field value
form.setData({ email: 'new@example.com' });

// Get current data
const currentData = form.getData();

// Re-render
form.render();
```

## Error Handling

```javascript
const form = new FormRuntime({
  schema: mySchema,
  container: '#form',
  onSubmit: async (data) => {
    try {
      const result = await submitToBackend(data);
      return { success: true, message: 'Success!' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  onValidationError: (errors) => {
    // Handle validation errors
    errors.forEach(error => {
      console.error(`${error.fieldId}: ${error.message}`);
    });
  }
});
```

## Lifecycle

1. **Construction**: Create instance with schema
2. **Render**: Call `render()` to display form
3. **Interaction**: User fills out form
4. **Validation**: Automatic on blur, manual with `validate()`
5. **Submission**: User submits, `onSubmit` called
6. **Cleanup**: Call `destroy()` when done








