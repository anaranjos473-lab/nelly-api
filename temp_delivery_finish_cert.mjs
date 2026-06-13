import { getAdmin } from './config/firebase-admin-esm.js';
import { getFirebaseConfig } from './config/firebase-config.js';

const admin = await getAdmin();
const db = admin.database();
const driverUid = 'driver_test_001';
const pedidoId = 'AUTO_1776641400683';
const localBase = process.env.LOCAL_BASE || 'http://localhost:3001';
const firebaseConfig = getFirebaseConfig();
const apiKey = process.env.FIREBASE_API_KEY || firebaseConfig.apiKey || 'AIzaSyAhHZvA2T-1xkIrCBpljgWPzDmynucT9_E';
const ubicacionPrueba = { lat: 16.7528, lng: -93.1167 };

async function queryNode(path) {
  const snap = await db.ref(path).once('value');
  return snap.val();
}

async function postJson(path, idToken, body) {
  const response = await fetch(`${localBase}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  return { status: response.status, text };
}

try {
  const beforeDriver = await queryNode(`repartidores/${driverUid}`);
  const beforePedidoEnCamino = await queryNode(`pedidos_en_camino/${pedidoId}`);
  const beforePedido = await queryNode(`pedidos/${pedidoId}`);

  console.log('BEFORE DRIVER', JSON.stringify(beforeDriver, null, 2));
  console.log('BEFORE pedidos_en_camino', JSON.stringify(beforePedidoEnCamino, null, 2));
  console.log('BEFORE pedidos', JSON.stringify(beforePedido, null, 2));

  if (!beforePedidoEnCamino) {
    throw new Error(`Pedido ${pedidoId} no existe en pedidos_en_camino; ejecuta accept-order primero`);
  }

  const customToken = await admin.auth().createCustomToken(driverUid, { driver: true });
  const authResp = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true })
    }
  );
  const authJson = await authResp.json();
  if (!authJson.idToken) {
    console.error('Failed auth exchange', JSON.stringify(authJson, null, 2));
    throw new Error('No idToken obtained');
  }
  const idToken = authJson.idToken;
  console.log('Obtained idToken for', driverUid);

  const locationResult = await postJson('/api/delivery/update-location', idToken, {
    ...ubicacionPrueba,
    pedidoId
  });
  console.log('UPDATE LOCATION STATUS', locationResult.status);
  console.log('UPDATE LOCATION BODY', locationResult.text);

  const afterLocationDriver = await queryNode(`repartidores/${driverUid}`);
  const afterLocationPedidoEnCamino = await queryNode(`pedidos_en_camino/${pedidoId}`);
  const afterLocationActivos = await queryNode(`conductores_activos/${driverUid}`);
  console.log('AFTER LOCATION DRIVER', JSON.stringify(afterLocationDriver, null, 2));
  console.log('AFTER LOCATION pedidos_en_camino', JSON.stringify(afterLocationPedidoEnCamino, null, 2));
  console.log('AFTER LOCATION conductores_activos', JSON.stringify(afterLocationActivos, null, 2));

  const completeResult = await postJson('/api/delivery/complete-order', idToken, { pedidoId });
  console.log('COMPLETE STATUS', completeResult.status);
  console.log('COMPLETE BODY', completeResult.text);

  const afterCompleteDriver = await queryNode(`repartidores/${driverUid}`);
  const afterCompletePedidoEnCamino = await queryNode(`pedidos_en_camino/${pedidoId}`);
  const afterCompletePedido = await queryNode(`pedidos/${pedidoId}`);
  const afterPedidoActivo = await queryNode(`repartidores/${driverUid}/pedido_activo`);
  console.log('AFTER COMPLETE DRIVER', JSON.stringify(afterCompleteDriver, null, 2));
  console.log('AFTER COMPLETE pedidos_en_camino', JSON.stringify(afterCompletePedidoEnCamino, null, 2));
  console.log('AFTER COMPLETE pedidos', JSON.stringify(afterCompletePedido, null, 2));
  console.log('AFTER COMPLETE pedido_activo', JSON.stringify(afterPedidoActivo, null, 2));
} finally {
  await admin.app().delete();
}
