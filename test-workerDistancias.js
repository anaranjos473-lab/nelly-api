// test-workerDistancias.js
// Prueba mínima para workerDistancias.js
import { Worker } from 'worker_threads';

const origen = { lat: 16.753, lng: -93.115 };
const conductores = {
  juan: { lat: 16.754, lng: -93.116, estado: 'DISPONIBLE' },
  pedro: { lat: 16.800, lng: -93.200, estado: 'OCUPADO' },
  maria: { lat: 16.755, lng: -93.117, estado: 'DISPONIBLE' }
};

const worker = new Worker('./src/agentes/workerDistancias.js', {
  workerData: { origen, conductores }
});

worker.on('message', (mejor) => {
  console.log('Mejor conductor:', mejor);
  process.exit(0);
});

worker.on('error', (err) => {
  console.error('Error en worker:', err);
  process.exit(1);
});

worker.on('exit', (code) => {
  if (code !== 0) console.error('Worker salió con código', code);
});
