/**
 * ARCHIVED CERTIFICATION SCRIPT
 * Usado durante PILOTO_CAMPO_001.
 * No ejecutar en producción rutinaria.
 *
 * Test completo: Crear token de admin Firebase y llamar complete-order
 */

import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializar Firebase Admin
const serviceAccountPath = join(__dirname, 'nelly-admin.json');
const fs = await import('fs');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://nelly-delivery-default-rtdb.firebaseio.com'
});

const BASE_URL = 'https://nelly-api-8lh1.onrender.com';
const testPedidoId = 'AUTO_1776641400683';

async function createAdminToken() {
  try {
    const adminUID = 'admin-console-uid';
    const customClaims = { admin: true, role: 'admin' };
    
    const token = await admin.auth().createCustomToken(adminUID, customClaims);
    console.log('✅ Token de admin creado');
    return token;
  } catch (error) {
    console.error('❌ Error creando token:', error.message);
    throw error;
  }
}

async function testCompleteOrder(token, pedidoId) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}/api/delivery/complete-order`);
    
    const data = JSON.stringify({ pedidoId });
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${token}`
      }
    };
    
    console.log(`\n🧪 POST ${BASE_URL}/api/delivery/complete-order`);
    console.log(`📝 Body: ${data}`);
    console.log(`🔑 Token (primeros 50 chars): ${token.substring(0, 50)}...`);
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`\n📊 Status: ${res.statusCode} ${res.statusMessage}`);
        console.log(`Response: ${responseData}`);
        
        resolve({
          status: res.statusCode,
          body: responseData
        });
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ Error en request: ${error.message}`);
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('🚀 TEST: complete-order endpoint con token admin\n');
  
  try {
    const token = await createAdminToken();
    const result = await testCompleteOrder(token, testPedidoId);
    
    console.log('\n' + '='.repeat(60));
    if (result.status === 200) {
      console.log('✅ ÉXITO: Endpoint respondió 200 OK');
      console.log('✨ El fix de complete-order ESTÁ FUNCIONANDO');
    } else if (result.status === 401) {
      console.log('❌ ERROR 401: Token inválido');
      console.log('Posible causa: El token no fue reconocido como admin');
    } else if (result.status === 403) {
      console.log('❌ ERROR 403: No autorizado');
      console.log('Posible causa: El usuario no tiene permisos de admin');
    } else if (result.status === 404) {
      console.log('❌ ERROR 404: Endpoint no encontrado');
      console.log('Posible causa: El código nuevo no se desplegó');
    } else if (result.status === 500) {
      console.log('❌ ERROR 500: Error interno del servidor');
      console.log('Posible causa: Error lógico en el cierre financiero');
    }
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

run().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
