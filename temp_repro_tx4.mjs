import { getAdmin } from './config/firebase-admin-esm.js';
import { evaluarElegibilidadPedido } from './src/services/smartDispatchService.js';

const admin = await getAdmin();
const db = admin.database();
const uid = 'driver_test_001';
const pedidoId = 'AUTO_1776641400683';
const pedido = {
  cliente: { nombre: 'Validacion Final Entorno' },
  cliente_nombre: 'Validacion Final Entorno',
  descripcion: 'Tacos de Cochinita y Refresco',
  estado: 'LISTO',
  fase_panel: 'Despacho',
  fecha_creacion: '2026-04-19T23:30:01.202Z',
  fuente_origen: 'rtdb',
  hora_cocina: '2026-04-20T00:21:36.681Z',
  id: 'AUTO_1776641400683',
  id_pedido: 'AUTO_1776641400683',
  logistica: { estado: 'disponible', tiempo_estimado: '25 min' },
  monto: 250,
  pedido_id: 'AUTO_1776641400683',
  timestamp: 1776641401202
};

function firstFiniteNumber(...values) {
  for (const value of values) {
    if (value === undefined || value === null || value === '') continue;
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function roundMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round((n + Number.EPSILON) * 100) / 100 : 0;
}

function getReservaCapital(driver = {}, pedidoId) {
  return driver.finanzas?.reservas_capital?.[pedidoId]
    || driver.billetera?.reservas_capital?.[pedidoId]
    || null;
}

function aplicarReservaCapital(actual, pedidoId, monto, timestamp) {
  const billetera = actual.billetera || {};
  const finanzas = actual.finanzas || {};
  const reservas = { ...(finanzas.reservas_capital || {}) };
  const reservaActual = reservas[pedidoId];

  if (reservaActual?.estado === 'activa') {
    return actual;
  }

  const reservadoActual = firstFiniteNumber(
    billetera.capital_reservado,
    finanzas.capital_reservado,
    actual.capital_reservado
  ) || 0;
  const billeteraTotal = firstFiniteNumber(
    actual.billetera_guerra,
    billetera.billetera_guerra,
    finanzas.billetera_guerra,
    actual.perfil?.billetera_guerra
  );
  const capitalDisponibleActual = firstFiniteNumber(
    billetera.capital_disponible,
    billetera.efectivo_disponible,
    finanzas.capital_disponible,
    finanzas.efectivo_disponible
  );
  const nuevoReservado = roundMoney(reservadoActual + monto);
  const nuevoDisponible = billeteraTotal !== null
    ? Math.max(0, roundMoney(billeteraTotal - nuevoReservado))
    : (capitalDisponibleActual === null ? undefined : Math.max(0, roundMoney(capitalDisponibleActual - monto)));

  reservas[pedidoId] = {
    monto,
    estado: 'activa',
    creado_en: timestamp,
    actualizado_en: timestamp
  };

  return {
    ...actual,
    capital_reservado: nuevoReservado,
    billetera: {
      ...billetera,
      capital_reservado: nuevoReservado,
      ...(nuevoDisponible === undefined ? {} : { capital_disponible: nuevoDisponible }),
      reservas_capital: {
        ...(billetera.reservas_capital || {}),
        [pedidoId]: reservas[pedidoId]
      }
    },
    finanzas: {
      ...finanzas,
      capital_reservado: nuevoReservado,
      ...(nuevoDisponible === undefined ? {} : { capital_disponible: nuevoDisponible }),
      reservas_capital: reservas
    }
  };
}

const ref = db.ref(`repartidores/${uid}`);

const tx = await ref.transaction((actual) => {
  console.log('TX callback actual type', typeof actual);
  console.log('TX callback actual value', JSON.stringify(actual, null, 2));
  if (!actual || typeof actual !== 'object') return;
  const reserva = getReservaCapital(actual, pedidoId);
  console.log('existing reserva', JSON.stringify(reserva, null, 2));
  const elegibilidad = evaluarElegibilidadPedido(pedido, actual);
  console.log('eligibility', JSON.stringify(elegibilidad, null, 2));
  if (!elegibilidad.ok) return;
  return aplicarReservaCapital(actual, pedidoId, 250, Date.now());
}, (error, committed, snapshot) => {
  console.log('callback done error', error?.message, 'committed', committed, 'snapshot exists', snapshot?.exists());
});

console.log('TX result committed', tx.committed);
console.log('TX result snapshot exists', tx.snapshot.exists());
console.log('TX result snapshot val', JSON.stringify(tx.snapshot.val(), null, 2));
