/**
 * CSV Export Connector Tests
 */

describe('CSVExportConnector', () => {
  let connector;

  beforeEach(() => {
    connector = new CSVExportConnector({
      filename: 'test.csv',
    });
  });

  test('creates connector instance', () => {
    expect(connector).toBeDefined();
    expect(connector.filename).toBe('test.csv');
  });

  test('converts form data to CSV', () => {
    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
    };

    const csv = connector.convertToCSV(formData);
    expect(csv).toContain('name');
    expect(csv).toContain('email');
    expect(csv).toContain('John Doe');
  });

  test('handles special characters in CSV', () => {
    const formData = {
      name: 'John "Johnny" Doe',
      message: 'Hello, world!',
    };

    const csv = connector.convertToCSV(formData);
    expect(csv).toContain('"John ""Johnny"" Doe"');
  });

  test('submits and downloads CSV', async () => {
    const formData = {
      name: 'Test',
      email: 'test@example.com',
    };

    // Mock download
    const originalCreateElement = document.createElement;
    document.createElement = jest.fn((tag) => {
      if (tag === 'a') {
        return {
          setAttribute: jest.fn(),
          click: jest.fn(),
          style: {},
        };
      }
      return originalCreateElement.call(document, tag);
    });

    const result = await connector.submit(formData);
    expect(result.success).toBe(true);

    document.createElement = originalCreateElement;
  });
});






