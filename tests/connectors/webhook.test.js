/**
 * Webhook Connector Tests
 */

describe('WebhookConnector', () => {
  let connector;

  beforeEach(() => {
    global.fetch = jest.fn();
    connector = new WebhookConnector({
      url: 'https://api.example.com/webhook',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('creates connector instance', () => {
    expect(connector).toBeDefined();
    expect(connector.url).toBe('https://api.example.com/webhook');
  });

  test('submits data successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const formData = { name: 'Test' };
    const result = await connector.submit(formData);

    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/webhook',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(formData),
      })
    );
  });

  test('handles submission errors', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const formData = { name: 'Test' };
    const result = await connector.submit(formData);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Failed');
  });

  test('retries on failure', async () => {
    global.fetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    connector.retryAttempts = 2;
    const formData = { name: 'Test' };
    const result = await connector.submit(formData);

    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});






