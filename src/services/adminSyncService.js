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
  return {
    id: pedidoId,
    pedido_id: pedidoId,
    id_pedido: pedidoId,
    shortId: null,
    cliente_nombre: String(cliente_nombre).trim(),
    cliente: String(cliente_nombre).trim(),
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
    items: normalizedItems,
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
    estado: 'pendiente',
    estado_pedido: 'PENDIENTE',
    fase_panel: 'Pendiente',
    repartidor_id: null,
    conductorId: null,
    pedido_activo: null,
    fecha_creacion: timestamp,
    createdAt: timestamp,
    created_at: timestamp,
    origen: 'panel_admin',
    logistica: {
      estado: 'pendiente',
      repartidor_id: null
    }
  };
}

export { buildAdminOrderPayload };
