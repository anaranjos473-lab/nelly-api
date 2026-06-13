import fetch from 'node-fetch';
import { getAdmin } from './config/firebase-admin-esm.js';
import { readFileSync } from 'fs';

const admin = await getAdmin();
const driverUid = 'driver_123';
const pedidoId = 'AUTO_1776641400683';
const apiKey = 'AIzaSyAhHZvA2T-1xkIrCBpljgWPzDmynucT9_E';
const localBase = 'http://localhost:3001';

async function queryNode(path) {
  const snap = await admin.database().ref(path).once('value');
  return snap.val();
}

const customToken = await admin.auth().createCustomToken(driverUid, { driver: true });
const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;
const authResp = await fetch(authUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: customToken, returnSecureToken: true })
});
const authJson = await authResp.json();
console.log('authRespStatus=' + authResp.status);
console.log(JSON.stringify(authJson, null, 2));
const idToken = authJson.idToken;
if (!idToken) {
  throw new Error('No idToken obtained');
}

const antes = {
  pedidos_para_reparto: await queryNode(`pedidos_para_reparto/${pedidoId}`),
  pedidos_en_camino: await queryNode(`pedidos_en_camino/${pedidoId}`),
  pedidos: await queryNode(`pedidos/${pedidoId}`)
};
console.log('BEFORE=' + JSON.stringify(antes, null, 2));

const resp = await fetch(`${localBase}/api/delivery/accept-order`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${idToken}`
  },
  body: JSON.stringify({ pedidoId })
});
const body = await resp.text();
console.log('acceptStatus=' + resp.status);
console.log('acceptBody=' + body);

const despues = {
  pedidos_para_reparto: await queryNode(`pedidos_para_reparto/${pedidoId}`),
  pedidos_en_camino: await queryNode(`pedidos_en_camino/${pedidoId}`),
  pedidos: await queryNode(`pedidos/${pedidoId}`),
  repartidor_activo: await queryNode(`repartidores/${driverUid}/pedido_activo`)
};
console.log('AFTER=' + JSON.stringify(despues, null, 2));
