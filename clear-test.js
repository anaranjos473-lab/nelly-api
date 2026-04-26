// clear-test.js
const admin = require('firebase-admin');
const serviceAccount = require('./nelly-admin.json');
require('dotenv').config();

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

const db = admin.database();
db.ref('pedidos_activos/TEST-123').remove()
    .then(() => {
        console.log('✅ Nodo de prueba TEST-123 eliminado correctamente.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Error al eliminar:', err.message);
        process.exit(1);
    });
