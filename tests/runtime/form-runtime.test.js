/**
 * FormRuntime Tests
 */

describe('FormRuntime', () => {
  let container;
  let form;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (form) {
      form.destroy();
    }
    container.remove();
  });

  test('creates form instance', () => {
    const schema = {
      formId: 'test-form',
      version: '1.0',
      title: 'Test Form',
      pages: [
        {
          id: 'page1',
          fields: [],
        },
      ],
    };

    form = new FormRuntime({
      schema,
      container,
    });

    expect(form).toBeDefined();
    expect(form.schema).toEqual(schema);
  });

  test('throws error without schema', () => {
    expect(() => {
      new FormRuntime({
        container,
      });
    }).toThrow('schema is required');
  });

  test('throws error without container', () => {
    const schema = { formId: 'test', version: '1.0', title: 'Test', pages: [] };
    expect(() => {
      new FormRuntime({ schema });
    }).toThrow('container is required');
  });

  test('renders form', () => {
    const schema = {
      formId: 'test',
      version: '1.0',
      title: 'Test',
      pages: [
        {
          id: 'page1',
          fields: [
            {
              id: 'name',
              type: 'text',
              label: 'Name',
            },
          ],
        },
      ],
    };

    form = new FormRuntime({ schema, container });
    form.render();

    expect(container.querySelector('#name')).toBeTruthy();
    expect(container.querySelector('form')).toBeTruthy();
  });

  test('renders text input field', () => {
    const schema = {
      formId: 'test',
      version: '1.0',
      title: 'Test',
      pages: [
        {
          id: 'page1',
          fields: [
            {
              id: 'textField',
              type: 'text',
              label: 'Text Field',
            },
          ],
        },
      ],
    };

    form = new FormRuntime({ schema, container });
    form.render();

    const input = container.querySelector('#textField');
    expect(input).toBeTruthy();
    expect(input.type).toBe('text');
  });

  test('renders email field', () => {
    const schema = {
      formId: 'test',
      version: '1.0',
      title: 'Test',
      pages: [
        {
          id: 'page1',
          fields: [
            {
              id: 'email',
              type: 'email',
              label: 'Email',
            },
          ],
        },
      ],
    };

    form = new FormRuntime({ schema, container });
    form.render();

    const input = container.querySelector('#email');
    expect(input).toBeTruthy();
    expect(input.type).toBe('email');
  });

  test('validates required field', () => {
    const schema = {
      formId: 'test',
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

    form = new FormRuntime({ schema, container });
    form.render();

    const isValid = form.validate();
    expect(isValid).toBe(false);
  });

  test('gets form data', () => {
    const schema = {
      formId: 'test',
      version: '1.0',
      title: 'Test',
      pages: [
        {
          id: 'page1',
          fields: [
            {
              id: 'name',
              type: 'text',
              label: 'Name',
            },
          ],
        },
      ],
    };

    form = new FormRuntime({ schema, container });
    form.render();

    const input = container.querySelector('#name');
    input.value = 'John Doe';

    const data = form.getData();
    expect(data.name).toBe('John Doe');
  });

  test('sets form data', () => {
    const schema = {
      formId: 'test',
      version: '1.0',
      title: 'Test',
      pages: [
        {
          id: 'page1',
          fields: [
            {
              id: 'name',
              type: 'text',
              label: 'Name',
            },
          ],
        },
      ],
    };

    form = new FormRuntime({ schema, container });
    form.render();

    form.setData({ name: 'Jane Doe' });

    const input = container.querySelector('#name');
    expect(input.value).toBe('Jane Doe');
  });

  test('resets form', () => {
    const schema = {
      formId: 'test',
      version: '1.0',
      title: 'Test',
      pages: [
        {
          id: 'page1',
          fields: [
            {
              id: 'name',
              type: 'text',
              label: 'Name',
            },
          ],
        },
      ],
    };

    form = new FormRuntime({ schema, container });
    form.render();

    form.setData({ name: 'John' });
    form.reset();

    const input = container.querySelector('#name');
    expect(input.value).toBe('');
  });

  test('handles form submission', async () => {
    const onSubmit = jest.fn().mockResolvedValue({ success: true, message: 'Success' });

    const schema = {
      formId: 'test',
      version: '1.0',
      title: 'Test',
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

    form = new FormRuntime({ schema, container, onSubmit });
    form.render();

    const input = container.querySelector('#name');
    input.value = 'John Doe';

    const formElement = container.querySelector('form');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    formElement.dispatchEvent(submitEvent);

    // Wait for async submission
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(onSubmit).toHaveBeenCalled();
  });
});








