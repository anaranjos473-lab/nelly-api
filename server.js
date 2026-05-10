
import app from './app.js';


import { iniciarAgenteDespacho, limpiarAgenteDespacho } from './src/agentes/agenteDespacho.js';
import { iniciarAgenteFinanciero } from './src/agentes/agenteTarifaDinamica.js';
import { iniciarAgenteAntifraude } from './src/agentes/agenteAntifraude.js';

// Inicializar agentes inteligentes al arrancar el backend

iniciarAgenteDespacho();
iniciarAgenteFinanciero();
iniciarAgenteAntifraude();

// Limpieza de listeners al cerrar el proceso
process.on('SIGINT', () => {
  limpiarAgenteDespacho();
  process.exit(0);
});
process.on('SIGTERM', () => {
  limpiarAgenteDespacho();
  process.exit(0);
});

// Definir el puerto usando variable de entorno o 10000 por defecto
const PORT = process.env.PORT || 10000;

if (process.env.NODE_ENV !== 'test') {
  // 🟢 El '0.0.0.0' es vital para Render
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Nelly-API escuchando en el puerto ${PORT}`);
  });
}
