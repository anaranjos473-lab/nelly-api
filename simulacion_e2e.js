import { getAdmin } from './config/firebase-admin.js';
import { iniciarAgenteDespacho, limpiarAgenteDespacho } from './src/agentes/agenteDespacho.js';
import { iniciarAgenteAntifraude } from './src/agentes/agenteAntifraude.js';
import { iniciarAgenteSoporte, limpiarAgenteSoporte } from './src/agentes/agenteSoporte.js';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runE2E() {
  // Iniciar agentes
  await iniciarAgenteDespacho();
  await iniciarAgenteAntifraude();
  await iniciarAgenteSoporte();

  const admin = await getAdmin();
  const db = admin.database();
  
  const report = [];
  const logEvent = (msg) => {
    console.log(msg);
    report.push({ time: new Date().toISOString(), event: msg });
  };
  
  logEvent('--- INICIANDO E2E RTDB ---');

  const conductorId = 'cond_e2e_test_' + Date.now();
  const pedidoId = 'pedido_e2e_test_' + Date.now();

  try {
    logEvent(`1. Registrando conductor de prueba: ${conductorId}`);
    await db.ref(`conductores_activos/${conductorId}`).set({
      estado: 'DISPONIBLE',
      lat: 16.75, // Tuxtla aprox
      lng: -93.11,
      nombre: 'Conductor E2E'
    });
    
    logEvent(`2. Cliente crea pedido en RTDB (estado: PENDIENTE)`);
    await db.ref(`pedidos/${pedidoId}`).set({
      estado: 'PENDIENTE', // Some code says 'pendiente', let's use 'pendiente'
      latTienda: 16.751,
      lngTienda: -93.112,
      latCliente: 16.755,
      lngCliente: -93.115,
      conductorId: '',
      timestampCreacion: Date.now()
    });
    
    await wait(2000);
    
    logEvent(`3. Cocina recibe pedido y marca 'listo' (cambia estado a 'pendiente')`);
    await db.ref(`pedidos/${pedidoId}`).update({ estado: 'pendiente' });

    await wait(4000); // Dar tiempo al worker del Agente de Despacho
    
    logEvent(`4. Verificando si Agente de Despacho asignó conductor`);
    const pedidoSnap = await db.ref(`pedidos/${pedidoId}`).once('value');
    const pedidoActual = pedidoSnap.val();
    
    if (pedidoActual.conductorId && pedidoActual.estado === 'en_curso') {
      logEvent(`✅ Agente Despacho funcionó. Conductor asignado: ${pedidoActual.conductorId}, Estado: en_curso`);
    } else {
      logEvent(`❌ Agente Despacho no asignó. Estado actual: ${pedidoActual.estado}, Conductor: ${pedidoActual.conductorId}`);
    }

    logEvent(`5. Simulando tracking de conductor`);
    await db.ref(`conductores_activos/${conductorId}`).update({
      lat: 16.753,
      lng: -93.113
    });
    
    await wait(2000);
    
    logEvent(`6. Conductor marca 'entregado'`);
    // Simulando que el conductor llegó al cliente
    await db.ref(`conductores_activos/${conductorId}`).update({
      lat: 16.7551,
      lng: -93.1151
    });

    await db.ref(`pedidos/${pedidoId}`).update({
      estado: 'entregado',
      conductorId: conductorId,
      timestampEntrega: Date.now()
    });
    
    await wait(3000); // Dar tiempo al agente antifraude
    
    logEvent(`7. Verificando Agente Antifraude`);
    const conductorPostSnap = await db.ref(`conductores_activos/${conductorId}`).once('value');
    const conductorPost = conductorPostSnap.val();
    if (conductorPost.estado === 'EN_REVISION') {
      logEvent(`🚨 Antifraude bloqueó al conductor (estado EN_REVISION). (FRAUDE DETECTADO)`);
    } else {
      logEvent(`✅ Antifraude validó la entrega exitosamente. (Estado: ${conductorPost.estado})`);
    }

    logEvent('--- FIN E2E RTDB ---');

    // Cleanup
    await db.ref(`pedidos/${pedidoId}`).remove();
    await db.ref(`conductores_activos/${conductorId}`).remove();
    
    console.log(JSON.stringify(report, null, 2));

  } catch(e) {
    console.error('Error durante E2E:', e);
  }
  process.exit(0);
}

runE2E();