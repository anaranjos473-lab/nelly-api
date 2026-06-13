import { getAdmin } from './config/firebase-admin-esm.js';
import { getFirebaseConfig } from './config/firebase-config.js';

const admin = await getAdmin();
const db = admin.database();
const driverUid = 'driver_test_001';
const pedidoId = 'AUTO_1776641400683';
const localBase = process.env.LOCAL_BASE || 'http://localhost:3001';
const firebaseConfig = getFirebaseConfig();
const apiKey = process.env.FIREBASE_API_KEY || firebaseConfig.apiKey || 'AIzaSyAhHZvA2T-1xkIrCBpljgWPzDmynucT9_E';

if (!apiKey) {
  throw new Error('FIREBASE_API_KEY is required for custom token exchange');
}

async function queryNode(path) {
  const snap = await db.ref(path).once('value');
  return snap.val();
}

const driverData = {
  estatus: { nivel: 'BRONCE', bloqueado_por_deuda: false },
  perfil: { bloqueado_por_deuda: false },
  billetera: {
    capital_disponible: 500,
    capital_reservado: 0,
    reservas_capital: {}
  },
  finanzas: {
    capital_disponible: 500,
    capital_reservado: 0
  }
};

await db.ref(`repartidores/${driverUid}`).set(driverData);
console.log('Created driver:', driverUid);

const beforeDriver = await queryNode(`repartidores/${driverUid}`);
const beforePedidoParaReparto = await queryNode(`pedidos_para_reparto/${pedidoId}`);
const beforePedidosEnCamino = await queryNode(`pedidos_en_camino/${pedidoId}`);
const beforePedidos = await queryNode(`pedidos/${pedidoId}`);
console.log('BEFORE DRIVER', JSON.stringify(beforeDriver, null, 2));
console.log('BEFORE pedidos_para_reparto', JSON.stringify(beforePedidoParaReparto, null, 2));
console.log('BEFORE pedidos_en_camino', JSON.stringify(beforePedidosEnCamino, null, 2));
console.log('BEFORE pedidos', JSON.stringify(beforePedidos, null, 2));

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

const acceptResp = await fetch(`${localBase}/api/delivery/accept-order`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${idToken}`
  },
  body: JSON.stringify({ pedidoId })
});
const acceptBody = await acceptResp.text();
console.log('ACCEPT STATUS', acceptResp.status);
console.log('ACCEPT BODY', acceptBody);

const afterDriver = await queryNode(`repartidores/${driverUid}`);
const afterPedidoParaReparto = await queryNode(`pedidos_para_reparto/${pedidoId}`);
const afterPedidosEnCamino = await queryNode(`pedidos_en_camino/${pedidoId}`);
const afterPedidos = await queryNode(`pedidos/${pedidoId}`);
const afterPedidoActivo = await queryNode(`repartidores/${driverUid}/pedido_activo`);
console.log('AFTER DRIVER', JSON.stringify(afterDriver, null, 2));
console.log('AFTER pedidos_para_reparto', JSON.stringify(afterPedidoParaReparto, null, 2));
console.log('AFTER pedidos_en_camino', JSON.stringify(afterPedidosEnCamino, null, 2));
console.log('AFTER pedidos', JSON.stringify(afterPedidos, null, 2));
console.log('AFTER pedido_activo', JSON.stringify(afterPedidoActivo, null, 2));
await admin.app().delete();
process.exit(0);
