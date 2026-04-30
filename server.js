import app from './app.js';

// Definimos el puerto dinámico de Render o el 3000 para local
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de Nelly corriendo en el puerto ${PORT}`);
  });
}
