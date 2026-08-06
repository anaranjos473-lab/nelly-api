import { buildCanonicalOrder } from '../domain/index.js';
import { normalizeOrderState } from './ordersManager.js';

function roundMoney(value) {
  return Number(Number(value || 0).toFixed(2));
}

function parseTimestamp(value) {
  if (value == null) return null;
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizeAdminOrderItems(inputItems) {
  let source = [];
  if (Array.isArray(inputItems)) {
    source = inputItems;
  } else if (typeof inputItems === 'string') {
    try {
      const parsed = JSON.parse(inputItems);
      if (Array.isArray(parsed)) {
        source = parsed;
      }
    } catch {
      source = [];
    }
  } else if (inputItems && typeof inputItems === 'object') {
    if (Array.isArray(inputItems.normalizedItems)) {
      source = inputItems.normalizedItems;
    } else if (Array.isArray(inputItems.items)) {
      source = inputItems.items;
    }
  }
  return source.map((item, index) => {
    const nombre = String(item?.nombre || item?.name || item?.descripcion || '').trim();
    const cantidad = Number(item?.cantidad ?? item?.quantity ?? 1);
    const precio = Number(item?.precio ?? item?.precio_unitario ?? item?.price ?? item?.unitPrice);

    return {
      ...item,
      id: item?.id || item?.producto_id || item?.sku || `item_${index + 1}`,
      nombre,
      cantidad: Number.isFinite(cantidad) && cantidad > 0 ? cantidad : 1,
      precio: Number.isFinite(precio) ? roundMoney(precio) : 0,
      precio_unitario: Number.isFinite(precio) ? roundMoney(precio) : 0
    };
  }).filter((item) => item.nombre && item.precio > 0);
}

function normalizeAdminOrderRequest(input = {}) {
  const cliente_nombre = String(input.cliente_nombre || '').trim();
  const telefono = String(input.telefono || '').trim();
  const direccion = String(input.direccion || '').trim();
  const descripcion = String(input.descripcion || '').trim();
  const notas = String(input.notas || '').trim();
  const comercio_nombre = String(
    input.comercio_nombre
    || input.restaurante_nombre
    || input.tienda_nombre
    || input.restaurant_name
    || input.nombre_comercial
    || ''
  ).trim();
  const comercio_id = String(
    input.comercio_id
    || input.tienda_id
    || input.merchant_id
    || input.restaurant_id
    || input.merchantId
    || input.restaurantId
    || ''
  ).trim();
  const tipo_ubicacion = String(input.tipo_ubicacion || '').trim() || 'otro';
  const metodo_entrega = String(input.metodo_entrega || '').trim() || 'puerta';
  const referencia_ubicacion = String(input.referencia_ubicacion || '').trim();
  const notas_ubicacion = String(input.notas_ubicacion || '').trim();
  const coordenadas = {
    clienteLat: Number(input.coordenadas?.clienteLat),
    clienteLng: Number(input.coordenadas?.clienteLng),
    tiendaLat: Number(input.coordenadas?.tiendaLat),
    tiendaLng: Number(input.coordenadas?.tiendaLng)
  };
  const normalizedItems = normalizeAdminOrderItems(
    Array.isArray(input.normalizedItems) ? input.normalizedItems : input.items
  );
  const subtotal = Number(input.subtotal);
  const costo_envio = Number(input.costo_envio);
  const propina = Number(input.propina);
  const total = Number(input.total);
  const pago = {
    metodo: String(input.pago?.metodo || '').trim(),
    estado: String(input.pago?.estado || '').trim()
  };

  return {
    cliente_nombre,
    telefono,
    direccion,
    descripcion,
    notas,
    comercio_nombre,
    comercio_id,
    tipo_ubicacion,
    metodo_entrega,
    referencia_ubicacion,
    notas_ubicacion,
    coordenadas,
    normalizedItems,
    subtotal,
    costo_envio,
    propina,
    total,
    pago
  };
}

function validateAdminOrderRequest(input = {}) {
  const errors = [];
  if (!input.cliente_nombre) errors.push('Faltan campos de cliente obligatorios');
  if (!input.telefono) errors.push('Faltan campos de cliente obligatorios');
  if (!input.direccion) errors.push('Faltan campos de cliente obligatorios');

  const hasValidCoordinates = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng)
    && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && lat !== 0 && lng !== 0;

  if (!hasValidCoordinates(input.coordenadas?.clienteLat, input.coordenadas?.clienteLng)
    || !hasValidCoordinates(input.coordenadas?.tiendaLat, input.coordenadas?.tiendaLng)) {
    errors.push('Coordenadas operativas de cliente y tienda obligatorias');
  }

  if (!Array.isArray(input.normalizedItems) || input.normalizedItems.length === 0) {
    errors.push('El pedido debe contener al menos un item');
  }

  if (!Number.isFinite(input.subtotal) || input.subtotal <= 0) {
    errors.push('Subtotal invalido');
  }

  if (!Number.isFinite(input.costo_envio) || input.costo_envio < 0) {
    errors.push('Costo de envio invalido');
  }

  if (!Number.isFinite(input.propina) || input.propina < 0) {
    errors.push('Propina invalida');
  }

  if (!Number.isFinite(input.total) || input.total <= 0) {
    errors.push('Total invalido o no coincide con subtotal + envio + propina');
  }

  if (!input.pago?.metodo || !input.pago?.estado) {
    errors.push('Informacion de pago incompleta');
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

function buildAdminOrderPayload({
  pedidoId,
  timestamp,
  cliente_nombre,
  telefono,
  direccion,
  descripcion,
  notas,
  comercio_nombre,
  comercio_id,
  comercio_codigo,
  tipo_ubicacion,
  metodo_entrega,
  referencia_ubicacion,
  notas_ubicacion,
  coordenadas,
  normalizedItems,
  subtotal,
  costo_envio,
  propina,
  total,
  pago
}) {
  const canonical = buildCanonicalOrder({
    id: pedidoId,
    userId: String(cliente_nombre).trim(),
    items: normalizedItems,
    total,
    estado: 'PENDIENTE',
    createdAt: timestamp,
    updatedAt: timestamp,
    metadata: {
      source: 'panel_admin'
    }
  });

  return {
    id: pedidoId,
    pedido_id: pedidoId,
    id_pedido: pedidoId,
    shortId: null,
    folio: null,
    cliente_nombre: String(cliente_nombre).trim(),
    cliente: String(cliente_nombre).trim(),
    telefono: String(telefono).trim(),
    direccion: String(direccion).trim(),
    tipo_ubicacion: String(tipo_ubicacion || 'otro').trim(),
    metodo_entrega: String(metodo_entrega || 'puerta').trim(),
    referencia_ubicacion: String(referencia_ubicacion || '').trim(),
    notas_ubicacion: String(notas_ubicacion || '').trim(),
    notas: String(notas || '').trim(),
    lat: coordenadas.clienteLat,
    lng: coordenadas.clienteLng,
    latTienda: coordenadas.tiendaLat,
    lngTienda: coordenadas.tiendaLng,
    descripcion: String(descripcion || '').trim(),
    comercio_nombre: String(comercio_nombre || '').trim(),
    comercio_id: String(comercio_id || '').trim(),
    comercio_codigo: String(comercio_codigo || comercio_id || '').trim(),
    commerce_name: String(comercio_nombre || '').trim(),
    commerce_id: String(comercio_id || '').trim(),
    commerce_code: String(comercio_codigo || comercio_id || '').trim(),
    id_comercio: String(comercio_id || '').trim(),
    items: canonical.order.items.length > 0 ? normalizedItems : [],
    lineas: canonical.order.lineas,
    subtotal: roundMoney(subtotal),
    costo_envio: roundMoney(costo_envio),
    propina: roundMoney(propina),
    monto: roundMoney(total),
    total: roundMoney(total),
    monto_total: roundMoney(total),
    pago: {
      metodo: String(pago.metodo).trim(),
      estado: String(pago.estado).trim()
    },
    estado: 'PENDIENTE',
    estado_pedido: 'PENDIENTE',
    fase_panel: 'Pendiente',
    repartidor_id: null,
    conductorId: null,
    pedido_activo: null,
    fecha_creacion: canonical.order.created_at,
    createdAt: canonical.order.created_at,
    created_at: canonical.order.created_at,
    origen: 'panel_admin',
    logistica: {
      estado: 'pendiente',
      repartidor_id: null
    }
  };
}

function buildPersistedAdminOrderRecord({
  pedidoId,
  timestamp,
  normalizedRequest,
  shortId = null
}) {
  const payload = buildAdminOrderPayload({
    pedidoId,
    timestamp,
    ...normalizedRequest
  });

  return {
    ...payload,
    shortId
  };
}

function getOrderTimestamp(pedido, keys) {
  if (!pedido || typeof pedido !== 'object') return null;
  for (const key of keys) {
    const candidate = pedido[key];
    const timestamp = parseTimestamp(candidate);
    if (timestamp) return timestamp;
  }
  const logistica = pedido.logistica;
  if (logistica && typeof logistica === 'object') {
    for (const key of keys) {
      const candidate = logistica[key];
      const timestamp = parseTimestamp(candidate);
      if (timestamp) return timestamp;
    }
  }
  return null;
}

function normalizeAdminOrderState(pedido) {
  const values = [pedido?.estado, pedido?.estado_pedido, pedido?.logistica?.estado];
  for (const raw of values) {
    if (!raw) continue;
    const estado = normalizeOrderState(raw);
    if (estado) return estado;
  }
  return '';
}

function isDeliveredAdminOrder(pedido) {
  return normalizeAdminOrderState(pedido) === 'ENTREGADO';
}

function isCancelledAdminOrder(pedido) {
  return normalizeAdminOrderState(pedido) === 'CANCELADO';
}

function isFraudAlertAdminOrder(pedido) {
  if (pedido == null || typeof pedido !== 'object') return false;
  if (pedido.alertaFraude === true) return true;
  return String(pedido.alertaFraude || '').trim().toLowerCase() === 'true';
}

function getTodayStartMexicoCity(now = Date.now()) {
  const formatter = new Intl.DateTimeFormat('sv', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const formatted = formatter.format(new Date(now));
  const iso = formatted.replace(' ', 'T');
  const mexicoNow = new Date(`${iso}.000`);
  return new Date(mexicoNow.getFullYear(), mexicoNow.getMonth(), mexicoNow.getDate(), 0, 0, 0, 0).getTime();
}

function buildAdminOrdersMetrics({
  pedidos = {},
  pedidosActivos = {},
  conductores = {},
  now = Date.now()
} = {}) {
  const todayStart = getTodayStartMexicoCity(now);
  const MAX_ASSIGNMENT_MINUTES = 120;
  const MAX_DELIVERY_MINUTES = 240;

  let pedidosCreadosHoy = 0;
  let pedidosEntregadosHoy = 0;
  let pedidosCanceladosHoy = 0;
  let fraudesDetectadosHoy = 0;
  let totalAssignmentMinutes = 0;
  let assignmentCount = 0;
  let totalDeliveryMinutes = 0;
  let deliveryCount = 0;

  Object.values(pedidos || {}).forEach((pedido) => {
    const createdAt = getOrderTimestamp(pedido, ['createdAt', 'created_at', 'fecha_creacion', 'fechaCreacion', 'fecha_creado', 'created_at']);
    const assignedAt = getOrderTimestamp(pedido, ['aceptado_en', 'tomado_en', 'aceptadoEn', 'tomadoEn', 'repartidor_asignado_en']);
    const deliveredAt = getOrderTimestamp(pedido, ['entregado_en', 'entregadoEn']);
    const isDelivered = isDeliveredAdminOrder(pedido);
    const isCancelled = isCancelledAdminOrder(pedido);
    const fraudAlert = isFraudAlertAdminOrder(pedido);

    if (createdAt && createdAt >= todayStart) {
      pedidosCreadosHoy += 1;
    }

    if (deliveredAt && deliveredAt >= todayStart) {
      pedidosEntregadosHoy += 1;
    } else if (isDelivered && createdAt && createdAt >= todayStart) {
      pedidosEntregadosHoy += 1;
    }

    if (isCancelled && createdAt && createdAt >= todayStart) {
      pedidosCanceladosHoy += 1;
    }

    if (fraudAlert && deliveredAt && deliveredAt >= todayStart) {
      fraudesDetectadosHoy += 1;
    }

    if (createdAt && assignedAt && assignedAt >= createdAt) {
      const assignmentMinutes = (assignedAt - createdAt) / 60000;
      if (assignmentMinutes <= MAX_ASSIGNMENT_MINUTES) {
        totalAssignmentMinutes += assignmentMinutes;
        assignmentCount += 1;
      }
    }

    if (assignedAt && deliveredAt && deliveredAt >= assignedAt) {
      const deliveryMinutes = (deliveredAt - assignedAt) / 60000;
      if (deliveryMinutes <= MAX_DELIVERY_MINUTES) {
        totalDeliveryMinutes += deliveryMinutes;
        deliveryCount += 1;
      }
    }
  });

  const avgAsignacionMinutos = assignmentCount > 0 ? Number((totalAssignmentMinutes / assignmentCount).toFixed(1)) : 0;
  const avgEntregaMinutos = deliveryCount > 0 ? Number((totalDeliveryMinutes / deliveryCount).toFixed(1)) : 0;

  return {
    ok: true,
    activos: Object.keys(pedidosActivos || {}).length,
    pedidosCreadosHoy,
    pedidosEntregadosHoy,
    pedidosCanceladosHoy,
    avgAsignacionMinutos,
    avgEntregaMinutos,
    conductoresActivos: Object.keys(conductores || {}).length,
    fraudesDetectadosHoy
  };
}

export { buildAdminOrderPayload };
export { buildPersistedAdminOrderRecord };
export { buildAdminOrdersMetrics };
export { normalizeAdminOrderRequest };
export { validateAdminOrderRequest };
