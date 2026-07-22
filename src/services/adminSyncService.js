import { buildCanonicalOrder } from '../domain/index.js';

function roundMoney(value) {
  return Number(Number(value || 0).toFixed(2));
}

function buildAdminOrderPayload({
  pedidoId,
  timestamp,
  cliente_nombre,
  telefono,
  direccion,
  descripcion,
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
    estado: 'CREADO',
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
    cliente_nombre: String(cliente_nombre).trim(),
    cliente: canonical.order.cliente,
    telefono: String(telefono).trim(),
    direccion: String(direccion).trim(),
    tipo_ubicacion: String(tipo_ubicacion || 'otro').trim(),
    metodo_entrega: String(metodo_entrega || 'puerta').trim(),
    referencia_ubicacion: String(referencia_ubicacion || '').trim(),
    notas_ubicacion: String(notas_ubicacion || '').trim(),
    lat: coordenadas.clienteLat,
    lng: coordenadas.clienteLng,
    latTienda: coordenadas.tiendaLat,
    lngTienda: coordenadas.tiendaLng,
    descripcion: String(descripcion || '').trim(),
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
    estado: canonical.order.estado,
    estado_pedido: canonical.order.estado,
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

export { buildAdminOrderPayload };
