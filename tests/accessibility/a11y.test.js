/**
 * Accessibility Tests
 */

describe('Accessibility', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('form has proper ARIA attributes', () => {
    const schema = {
      formId: 'a11y-test',
      version: '1.0',
      title: 'Accessibility Test',
      pages: [
        {
          id: 'page1',
          fields: [
            {
              id: 'name',
              type: 'text',
              label: 'Name',
              required: true,
            },
          ],
        },
      ],
    };

    const form = new FormRuntime({ schema, container });
    form.render();

    const formElement = container.querySelector('form');
    expect(formElement.getAttribute('aria-label')).toBe('Accessibility Test');
  });

  test('required fields have ARIA required', () => {
    const schema = {
      formId: 'a11y-test',
      version: '1.0',
      title: 'Test',
      pages: [
        {
          id: 'page1',
          fields: [
            {
              id: 'requiredField',
              type: 'text',
              label: 'Required',
              required: true,
            },
          ],
        },
      ],
    };

    const form = new FormRuntime({ schema, container });
    form.render();

    const input = container.querySelector('#requiredField');
    expect(input.getAttribute('aria-required')).toBe('true');
    expect(input.hasAttribute('required')).toBe(true);
  });

  test('error messages have ARIA attributes', () => {
    const schema = {
      formId: 'a11y-test',
      version: '1.0',
      title: 'Test',
      pages: [
        {
          id: 'page1',
          fields: [
            {
              id: 'requiredField',
              type: 'text',
              label: 'Required',
              required: true,
            },
          ],
        },
      ],
    };

    const form = new FormRuntime({ schema, container });
    form.render();

    form.validate();

    const errorElement = container.querySelector('#error-requiredField');
    expect(errorElement).toBeTruthy();
    expect(errorElement.getAttribute('role')).toBe('alert');
    expect(errorElement.getAttribute('aria-live')).toBe('polite');
  });

  test('help text is associated with fields', () => {
    const schema = {
      formId: 'a11y-test',
      version: '1.0',
      title: 'Test',
      pages: [
        {
          id: 'page1',
          fields: [
            {
              id: 'fieldWithHelp',
              type: 'text',
              label: 'Field',
              helpText: 'This is help text',
            },
          ],
        },
      ],
    };

    const form = new FormRuntime({ schema, container });
    form.render();

    const input = container.querySelector('#fieldWithHelp');
    const helpText = container.querySelector('#help-fieldWithHelp');

    expect(helpText).toBeTruthy();
    expect(input.getAttribute('aria-describedby')).toBe('help-fieldWithHelp');
  });

  test('radio groups use fieldset and legend', () => {
    const schema = {
      formId: 'a11y-test',
      version: '1.0',
      title: 'Test',
      pages: [
        {
          id: 'page1',
          fields: [
            {
              id: 'radioGroup',
              type: 'radio',
              label: 'Options',
              options: [
                { value: '1', label: 'Option 1' },
                { value: '2', label: 'Option 2' },
              ],
            },
          ],
        },
      ],
    };

    const form = new FormRuntime({ schema, container });
    form.render();

    const fieldset = container.querySelector('fieldset');
    const legend = container.querySelector('legend');

    expect(fieldset).toBeTruthy();
    expect(legend).toBeTruthy();
    expect(legend.textContent).toContain('Options');
  });
});








