import { getAdmin } from './config/firebase-admin-esm.js';
const admin = await getAdmin();
const db = admin.database();
const repartidoresSnap = await db.ref('repartidores').once('value');
const repartidores = repartidoresSnap.val() || {};
const repartidoresList = [];
for (const [uid, driver] of Object.entries(repartidores)) {
  const valoresCapital = [
    driver?.billetera?.capital_disponible,
    driver?.billetera?.efectivo_disponible,
    driver?.finanzas?.capital_disponible,
    driver?.finanzas?.efectivo_disponible,
  ];
  const capitalDisponible = valoresCapital.map(v => (v === undefined || v === null ? NaN : Number(v))).find(Number.isFinite);
  const billeteraGuerra = [
    driver?.billetera_guerra,
    driver?.billetera?.billetera_guerra,
    driver?.finanzas?.billetera_guerra,
    driver?.perfil?.billetera_guerra
  ].map(v => (v === undefined || v === null ? NaN : Number(v))).find(Number.isFinite);
  const capitalReservado = [
    driver?.capital_reservado,
    driver?.billetera?.capital_reservado,
    driver?.finanzas?.capital_reservado,
  ].map(v => (v === undefined || v === null ? NaN : Number(v))).find(Number.isFinite);
  repartidoresList.push({
    uid,
    capitalDisponible: Number.isFinite(capitalDisponible) ? capitalDisponible : null,
    billeteraGuerra: Number.isFinite(billeteraGuerra) ? billeteraGuerra : null,
    capitalReservado: Number.isFinite(capitalReservado) ? capitalReservado : null,
    deuda: Number(driver?.finanzas?.deuda_actual ?? driver?.billetera?.deuda_comision ?? null) || null,
    bloqueado: driver?.estatus?.bloqueado_por_deuda === true || driver?.perfil?.bloqueado_por_deuda === true || false
  });
}
const pedidosSnap = await db.ref('pedidos_para_reparto').once('value');
const pedidos = pedidosSnap.val() || {};
const pedidosList = [];
for (const [id, pedido] of Object.entries(pedidos)) {
  const monto = Number(pedido.monto_total ?? pedido.monto ?? pedido.total ?? pedido.total_pedido ?? pedido.cobro_efectivo ?? pedido.monto_cliente);
  pedidosList.push({
    id,
    monto: Number.isFinite(monto) ? monto : null,
    estado: pedido.estado || pedido.estado_pedido || null,
    requiere_tensor: pedido.requiere_tensor || pedido.requisitos?.tensor || false
  });
}
console.log(JSON.stringify({ repartidores: repartidoresList, pedidos: pedidosList }, null, 2));
