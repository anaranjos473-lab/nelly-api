
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

// Definir solo el puerto 3001 para local y despliegue
const PORT = 3001;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de Nelly corriendo en el puerto ${PORT}`);
  });
}
