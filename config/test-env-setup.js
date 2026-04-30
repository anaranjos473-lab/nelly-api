// Forzar databaseURL para tests de soporte/mock
process.env.FIREBASE_DATABASE_URL = 'https://mock.firebaseio.test';
// Carga automática de credenciales para entorno de test
if (process.env.NODE_ENV === 'test' && !process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const fs = require('fs');
    const path = require('path');
    const credPath = path.resolve(__dirname, '../nelly-admin.json');
    if (fs.existsSync(credPath)) {
      process.env.FIREBASE_SERVICE_ACCOUNT = fs.readFileSync(credPath, 'utf8');
    }
  } catch (e) {
    // Ignorar si no existe
  }
}
