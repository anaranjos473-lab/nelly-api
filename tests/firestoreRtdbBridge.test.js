import { normalizeFirestoreValue } from '../src/services/firestoreRtdbBridgeService.js';

describe('Firestore RTDB bridge serialization', () => {
  it('convierte Timestamp-like objects a milisegundos y preserva arrays/objetos', () => {
    const mockTimestamp = {
      toMillis: () => 1686000000000
    };

    const payload = {
      fecha: mockTimestamp,
      ubicacion: {
        lat: 16.75,
        lng: -93.12,
        historial: [mockTimestamp, { nested: mockTimestamp }]
      },
      nombre: 'Pedido test'
    };

    const normalized = normalizeFirestoreValue(payload);

    expect(normalized).toEqual({
      fecha: 1686000000000,
      ubicacion: {
        lat: 16.75,
        lng: -93.12,
        historial: [1686000000000, { nested: 1686000000000 }]
      },
      nombre: 'Pedido test'
    });
  });
});
