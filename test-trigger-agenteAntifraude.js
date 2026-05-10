// test-trigger-agenteAntifraude.js
// Simula el trigger de Firestore usando la lógica local del agente antifraude


import { auditarEntrega } from './src/agentes/agenteAntifraude.js';

// Simula datos de un pedido entregado y la última posición GPS del conductor
const pedido = {
  estado: 'ENTREGADO',
  conductorId: 'CONDUCTOR_TEST',
  latCliente: 16.752,
  lngCliente: -93.125,
  // Puedes agregar latTienda/lngTienda si quieres simular entrega en tienda
};

const datosConductor = {
  lat: 16.760, // Suficientemente lejos para simular fraude
  lng: -93.130
};

const pedidoId = 'PEDIDO_TEST';

(async () => {
  try {
    // No pasamos db ni rtdb para evitar escrituras reales
    const resultado = await auditarEntrega({ pedido, datosConductor, pedidoId });
    console.log('Resultado auditoría:', resultado);
  } catch (err) {
    console.error('Error al ejecutar auditarEntrega:', err);
  }
})();
