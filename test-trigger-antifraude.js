// test-trigger-antifraude.js
// Simula el trigger de Firestore para probar la lógica antifraude localmente

// Ajusta la ruta según dónde esté tu función antifraude
const { handler } = require('./functions/index');

// Simula un cambio de estado a 'ENTREGADO' en un pedido
(async () => {
  // Simula el snapshot de Firestore (antes y después)
  const before = { data: () => ({ estado: 'EN_REPARTO' }) };
  const after = { data: () => ({ estado: 'ENTREGADO', /* otros campos necesarios */ }) };
  const change = { before, after };
  const context = { params: { pedidoId: 'TEST123' } };

  try {
    await handler(change, context);
    console.log('Función antifraude ejecutada correctamente. Revisa logs para detalles.');
  } catch (err) {
    console.error('Error al ejecutar la función antifraude:', err);
  }
})();
