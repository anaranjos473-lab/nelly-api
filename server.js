import app from './app.js';

const PORT = process.env.PORT || 10000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('-------------------------------------------');
    console.log(`📡 Servidor Activo: http://0.0.0.0:${PORT}`);
    console.log('-------------------------------------------');
  });
}require('./app');
