// scripts/generarResumenSemanal.js
// Script de auditoría: Generador de resumen semanal estratégico Nelly
require('dotenv').config();
const admin = require('firebase-admin');
const axios = require('axios');

// Inicialización Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_ADMIN_JSON
    ? JSON.parse(Buffer.from(process.env.FIREBASE_ADMIN_JSON, 'base64').toString('utf8'))
    : require('../nelly-admin.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}
const db = admin.database();

const LIMITE_DIAS = 7;
const COMISION_PCT = 0.18;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

async function obtenerPedidosUltimos7Dias() {
  const ref = db.ref('pedidos');
  const ahora = Date.now();
  const limite = ahora - LIMITE_DIAS * 24 * 60 * 60 * 1000;
  const snapshot = await ref.once('value');
  const pedidos = [];
  snapshot.forEach(child => {
    const pedido = child.val();
    const fecha = pedido.fecha_finalizado || pedido.fecha_creacion || pedido.creado || 0;
    if (pedido.estado === 'entregado' && fecha >= limite) {
      pedidos.push({ ...pedido, fecha });
    }
  });
  return pedidos;
}

function procesarRankingRepartidores(pedidos) {
  const ranking = {};
  pedidos.forEach(p => {
    const rep = p.repartidorUid || p.driverUid || 'SIN_UID';
    if (!ranking[rep]) ranking[rep] = { uid: rep, pedidos: 0, monto: 0 };
    ranking[rep].pedidos++;
    ranking[rep].monto += Number(p.monto || p.total || 0);
  });
  return Object.values(ranking).sort((a, b) => b.monto - a.monto);
}

async function calcularDeudaTotalEnSistema() {
  const ref = db.ref('repartidores');
  const snapshot = await ref.once('value');
  let total = 0;
  snapshot.forEach(child => {
    const deuda = Number(child.val().deuda || 0);
    total += deuda;
  });
  return total;
}

async function enviarReporteAAlberto(reporte) {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn('No hay webhook configurado. Reporte solo en consola.');
    console.log(JSON.stringify(reporte, null, 2));
    return;
  }
  const content = `\n**Resumen Semanal Nelly**\n\n` +
    `Periodo: ${reporte.periodo}\n` +
    `Ingresos brutos: $${reporte.ingresos_brutos.toFixed(2)}\n` +
    `Comisiones Nelly (18%): $${reporte.comisiones_nelly.toFixed(2)}\n` +
    `Top repartidores:\n` +
    reporte.top_performers.map((r, i) => `${i + 1}. ${r.uid} · $${r.monto.toFixed(2)} · ${r.pedidos} pedidos`).join('\n') +
    `\nDeuda total en sistema: $${reporte.estado_deuda_calle.toFixed(2)}`;
  await axios.post(DISCORD_WEBHOOK_URL, { content });
  console.log('✅ Reporte semanal enviado a canal privado.');
}

async function generarResumenSemanal() {
  const pedidosSemana = await obtenerPedidosUltimos7Dias();
  const totalVentas = pedidosSemana.reduce((acc, p) => acc + Number(p.monto || p.total || 0), 0);
  const comisionTotal = totalVentas * COMISION_PCT;
  const ranking = procesarRankingRepartidores(pedidosSemana);
  const reporte = {
    periodo: 'Semana Actual',
    ingresos_brutos: totalVentas,
    comisiones_nelly: comisionTotal,
    top_performers: ranking.slice(0, 3),
    estado_deuda_calle: await calcularDeudaTotalEnSistema()
  };
  await enviarReporteAAlberto(reporte);
}

generarResumenSemanal().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
