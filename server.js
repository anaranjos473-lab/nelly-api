import app from './app.js';
import { iniciarAgenteDespacho, limpiarAgenteDespacho } from './src/agentes/agenteDespacho.js';
import { iniciarAgenteFinanciero } from './src/agentes/agenteTarifaDinamica.js';
import { iniciarAgenteAntifraude } from './src/agentes/agenteAntifraude.js';
import { iniciarAgenteSoporte, limpiarAgenteSoporte } from './src/agentes/agenteSoporte.js';

async function iniciarAgentes() {
  iniciarAgenteDespacho();
  iniciarAgenteFinanciero();
  iniciarAgenteAntifraude();
  await iniciarAgenteSoporte();
  console.log('✅ Runtime principal operando sin Firestore bridge');
}

// Limpieza de listeners al cerrar el proceso
process.on('SIGINT', () => {
  limpiarAgenteDespacho();
  limpiarAgenteSoporte();
  process.exit(0);
});
process.on('SIGTERM', () => {
  limpiarAgenteDespacho();
  limpiarAgenteSoporte();
  process.exit(0);
});

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  await iniciarAgentes();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de Nelly corriendo en el puerto ${PORT}`);
  });
}
