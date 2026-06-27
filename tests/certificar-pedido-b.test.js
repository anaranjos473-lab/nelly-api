import { jest } from '@jest/globals';

const mockFetch = jest.fn();

jest.unstable_mockModule('node-fetch', () => ({
  default: mockFetch
}));

const { exchangeCustomToken } = await import('../scripts/certificar-pedido-b.js');

describe('certificar-pedido-b auth helper', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    delete process.env.FIREBASE_API_KEY;
    delete process.env.FIREBASE_WEB_API_KEY;
  });

  it('intercambia un custom token por un id token cuando hay API key disponible', async () => {
    process.env.FIREBASE_API_KEY = 'test-api-key';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ idToken: 'id-token-123' })
    });

    const token = await exchangeCustomToken('custom-token-123');

    expect(token).toBe('id-token-123');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=test-api-key',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('devuelve el custom token sin intercambio si no hay API key', async () => {
    const token = await exchangeCustomToken('custom-token-456');

    expect(token).toBe('custom-token-456');
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
