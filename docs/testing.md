# Testing Guide

This guide covers testing strategies for Form Builder Open Source.

## Test Structure

```
tests/
├── runtime/          # FormRuntime tests
├── builder/          # Builder tests
├── connectors/       # Connector tests
├── accessibility/    # A11y tests
└── integration/      # End-to-end tests
```

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Accessibility audit
npm run audit:a11y
```

## Writing Tests

### Runtime Tests

```javascript
// tests/runtime/form-runtime.test.js
import { FormRuntime } from '../../runtime/form-runtime.js';

describe('FormRuntime', () => {
  let container;
  let form;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (form) form.destroy();
    container.remove();
  });

  test('renders form', () => {
    const schema = {
      formId: 'test',
      version: '1.0',
      title: 'Test',
      pages: [{
        id: 'page1',
        fields: [{
          id: 'name',
          type: 'text',
          label: 'Name'
        }]
      }]
    };

    form = new FormRuntime({
      schema,
      container
    });
    form.render();

    expect(container.querySelector('#name')).toBeTruthy();
  });

  test('validates required fields', () => {
    // Test implementation
  });
});
```

### Connector Tests

```javascript
// tests/connectors/webhook.test.js
import { WebhookConnector } from '../../connectors/webhook.js';

describe('WebhookConnector', () => {
  test('submits data successfully', async () => {
    const connector = new WebhookConnector({
      url: 'https://api.example.com/webhook'
    });

    const result = await connector.submit({
      name: 'Test'
    });

    expect(result.success).toBe(true);
  });
});
```

## Test Coverage

Target: >80% coverage

```bash
npm run test:coverage
```

Coverage includes:
- All field types
- Validation rules
- Conditional logic
- Multi-page navigation
- Repeatable sections
- Calculated fields

## Accessibility Testing

### Automated

```bash
npm run audit:a11y
```

Uses axe-core to check:
- ARIA attributes
- Keyboard navigation
- Color contrast
- Semantic HTML

### Manual

Test with:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- Keyboard-only navigation
- High contrast mode
- Browser zoom 200%

## Integration Tests

Test complete form flows:

```javascript
describe('Form Submission Flow', () => {
  test('complete form submission', async () => {
    // Render form
    // Fill out fields
    // Submit form
    // Verify submission
  });
});
```

## Mocking

Mock external dependencies:

```javascript
// Mock fetch for connector tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true })
  })
);
```

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Clean Up**: Remove DOM elements after tests
3. **Test Edge Cases**: Empty forms, invalid data, etc.
4. **Test Accessibility**: Include a11y in all tests
5. **Mock External APIs**: Don't make real network calls

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Nightly builds








