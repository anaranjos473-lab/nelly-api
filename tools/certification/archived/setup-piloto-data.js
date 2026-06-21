/**
 * ARCHIVED CERTIFICATION SCRIPT
 * Usado durante PILOTO_CAMPO_001.
 * No ejecutar en producción rutinaria.
 *
 * Setup para PILOTO_CAMPO_001: Crear data mínima para reproducir flujo completo
 * 1. Conductor de prueba activado
 * 2. Pedido disponible
 * 3. Reproducir aceptación + finalización
 */

import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializar Firebase Admin
const serviceAccountPath = join(__dirname, 'nelly-admin.json');
const serviceAccount = JSON.parse(require('fs').readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://nelly-delivery-default-rtdb.firebaseio.com'
});

const db = admin.database();

async function setupPilotoData() {
  console.log('🚀 Preparando datos para PILOTO_CAMPO_001\n');

  try {
    // 1. Crear conductor de prueba
    const conductorId = 'CONDUCTOR_PILOTO_001';
    const conductorData = {
      nombre: 'Piloto Test',
      nivel: 'BRONCE',
      estado: 'DISPONIBLE',
      fcm_token: 'test-fcm-token-piloto-001',
      disponible: true,
      ubicacion: {
        lat: 16.7516,
        lng: -93.1156,
        timestamp: Date.now()
      },
      finanzas: {
        deuda_actual: 0,
        saldo_ganancias: 0,
        limite_deuda: 500
      },
      estatus: {
        bloqueado_por_deuda: false,
        nivel: 'BRONCE'
      }
    };

    await db.ref(`repartidores/${conductorId}`).set(conductorData);
    console.log(`✅ Conductor creado: ${conductorId}`);

    // 2. Crear conductor activo para visibilidad en mapa
    await db.ref(`conductores_activos/${conductorId}`).set({
      lat: 16.7516,
      lng: -93.1156,
      estado: 'DISPONIBLE',
      fcm_token: 'test-fcm-token-piloto-001',
      timestamp: Date.now()
    });
    console.log(`✅ Conductor activo registrado`);

    // 3. Crear pedido para reparto
    const pedidoId = `PEDIDO_PILOTO_${Date.now()}`;
    const pedidoData = {
      id: pedidoId,
      id_pedido: pedidoId,
      cliente_nombre: 'Cliente Piloto',
      cliente_telefonico: '+52123456789',
      direccion_entrega: 'Calle Test 123, Tuxtla Gutiérrez',
      estado: 'LISTO',
      estado_pedido: 'LISTO',
      monto_total: 250,
      comision_nelly: 45,
      timestamp_creacion: Date.now(),
      _source: 'panel-cocina'
    };

    await db.ref(`pedidos_para_reparto/${pedidoId}`).set(pedidoData);
    console.log(`✅ Pedido creado: ${pedidoId}`);

    // 4. Registrar en pedidos principal
    await db.ref(`pedidos/${pedidoId}`).set({
      ...pedidoData,
      creado_en: Date.now()
    });
    console.log(`✅ Pedido registrado en RTDB principal`);

    console.log('\n📋 DATOS LISTOS PARA PILOTO');
    console.log(`Conductor ID: ${conductorId}`);
    console.log(`Pedido ID: ${pedidoId}`);
    console.log(`Estado esperado en panel: LISTO (EN COCINA)`);
    console.log(`\nProximos pasos:`);
    console.log(`1. Abre panel cocina en navegador`);
    console.log(`2. Verifica que pedido aparezca en EN COCINA`);
    console.log(`3. Presiona "Finalizar"`);
    console.log(`4. Captura Network tab para complete-order\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupPilotoData();
