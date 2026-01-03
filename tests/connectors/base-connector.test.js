/**
 * Base Connector Tests
 */

describe('FormConnector', () => {
  test('creates connector instance', () => {
    const connector = new FormConnector({ apiKey: 'test' });
    expect(connector).toBeDefined();
    expect(connector.config.apiKey).toBe('test');
  });

  test('validate returns default result', async () => {
    const connector = new FormConnector();
    const result = await connector.validate({});
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });

  test('validate returns valid for non-empty data', async () => {
    const connector = new FormConnector();
    const result = await connector.validate({ name: 'Test' });
    expect(result.valid).toBe(true);
  });

  test('submit throws error if not implemented', async () => {
    const connector = new FormConnector();
    await expect(connector.submit({})).rejects.toThrow('submit() must be implemented by connector subclass');
  });
});

