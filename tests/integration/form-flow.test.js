/**
 * Integration Tests - Complete Form Flows
 */

describe('Form Integration Tests', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('complete form submission flow', async () => {
    const onSubmit = jest.fn().mockResolvedValue({ success: true, message: 'Success' });

    const schema = {
      formId: 'integration-test',
      version: '1.0',
      title: 'Integration Test Form',
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
            {
              id: 'email',
              type: 'email',
              label: 'Email',
              required: true,
            },
          ],
        },
      ],
    };

    const form = new FormRuntime({
      schema,
      container,
      onSubmit,
    });

    form.render();

    // Fill out form
    const nameInput = container.querySelector('#name');
    const emailInput = container.querySelector('#email');

    nameInput.value = 'John Doe';
    emailInput.value = 'john@example.com';

    // Trigger input events
    nameInput.dispatchEvent(new Event('input'));
    emailInput.dispatchEvent(new Event('input'));

    // Validate
    const isValid = form.validate();
    expect(isValid).toBe(true);

    // Get data
    const data = form.getData();
    expect(data.name).toBe('John Doe');
    expect(data.email).toBe('john@example.com');

    // Submit
    const formElement = container.querySelector('form');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    formElement.dispatchEvent(submitEvent);

    // Wait for async
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'John Doe',
        email: 'john@example.com',
      })
    );

    form.destroy();
  });

  test('multi-page form navigation', () => {
    const schema = {
      formId: 'multi-page-test',
      version: '1.0',
      title: 'Multi-page Test',
      settings: {
        multiPage: true,
        progressBar: true,
      },
      pages: [
        {
          id: 'page1',
          title: 'Page 1',
          fields: [
            {
              id: 'field1',
              type: 'text',
              label: 'Field 1',
            },
          ],
        },
        {
          id: 'page2',
          title: 'Page 2',
          fields: [
            {
              id: 'field2',
              type: 'text',
              label: 'Field 2',
            },
          ],
        },
      ],
    };

    const form = new FormRuntime({
      schema,
      container,
    });

    form.render();

    // Check progress bar exists
    expect(container.querySelector('.form-progress')).toBeTruthy();

    // Navigate to page 2
    form.goToPage('page2');

    // Check page 2 is visible
    const page2 = container.querySelector('#page-page2');
    expect(page2).toBeTruthy();

    form.destroy();
  });
});






