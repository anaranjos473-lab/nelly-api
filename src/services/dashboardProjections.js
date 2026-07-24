function roundMoney(value) {
  return Number(Number(value || 0).toFixed(2));
}

function buildCustomerCRMProjection(orderEntries = []) {
  const customerCounts = new Map();
  const customerProfiles = new Map();

  orderEntries.forEach((pedido) => {
    const cliente = String(pedido?.cliente_nombre || pedido?.cliente?.nombre || pedido?.cliente || '').trim();
    if (!cliente) return;

    customerCounts.set(cliente, (customerCounts.get(cliente) || 0) + 1);

    const profile = customerProfiles.get(cliente) || {
      nombre: cliente,
      telefono: String(pedido?.telefono || pedido?.cliente?.telefono || '').trim() || null,
      first_order_at: null,
      last_order_at: null,
      total_orders: 0,
      delivered_orders: 0,
      canceled_orders: 0,
      total_spent: 0,
      items_count: new Map(),
      orders_by_hour: new Map(),
      commerces: new Map(),
      observations: new Map(),
      zones: new Map(),
      latest_order_state: null
    };

    const createdAt = Number(pedido?.createdAt || pedido?.created_at || pedido?.fecha_creacion || pedido?.timestamp || 0);
    const deliveredAt = Number(pedido?.entregado_en || pedido?.entregadoEn || 0);
    const state = String(pedido?.estado_pedido || pedido?.estado || '').trim().toUpperCase();
    const total = Number(pedido?.total || pedido?.monto || pedido?.monto_total || 0);
    const commerceName = String(pedido?.comercio?.nombre || pedido?.tienda?.nombre || pedido?.marketplace?.nombre || pedido?.comercio_nombre || pedido?.tienda_nombre || '').trim();
    const zone = String(
      pedido?.zona
      || pedido?.zona_entrega
      || pedido?.zona_operativa
      || pedido?.direccion
      || pedido?.direccion_operativa
      || ''
    ).trim();
    const observation = String(
      pedido?.observaciones
      || pedido?.observacion
      || pedido?.notas
      || pedido?.notas_ubicacion
      || pedido?.descripcion
      || ''
    ).trim();

    profile.total_orders += 1;
    profile.total_spent = roundMoney(profile.total_spent + (Number.isFinite(total) ? total : 0));
    profile.latest_order_state = state || profile.latest_order_state;

    if (!profile.first_order_at || (createdAt && createdAt < profile.first_order_at)) {
      profile.first_order_at = createdAt || profile.first_order_at;
    }
    if (deliveredAt && (!profile.last_order_at || deliveredAt > profile.last_order_at)) {
      profile.last_order_at = deliveredAt;
    } else if (createdAt && (!profile.last_order_at || createdAt > profile.last_order_at)) {
      profile.last_order_at = createdAt;
    }
    if (state === 'ENTREGADO') {
      profile.delivered_orders += 1;
    }
    if (state === 'CANCELADO') {
      profile.canceled_orders += 1;
    }
    if (Number.isFinite(createdAt) && createdAt > 0) {
      const date = new Date(createdAt);
      const hour = Number.isFinite(date.getHours()) ? String(date.getHours()).padStart(2, '0') : '00';
      profile.orders_by_hour.set(hour, (profile.orders_by_hour.get(hour) || 0) + 1);
    }
    if (commerceName) {
      profile.commerces.set(commerceName, (profile.commerces.get(commerceName) || 0) + 1);
    }
    if (zone) {
      profile.zones.set(zone, (profile.zones.get(zone) || 0) + 1);
    }
    if (observation) {
      profile.observations.set(observation, (profile.observations.get(observation) || 0) + 1);
    }

    const items = Array.isArray(pedido?.normalizedItems)
      ? pedido.normalizedItems
      : Array.isArray(pedido?.items)
        ? pedido.items
        : [];

    items.forEach((item) => {
      const itemName = String(item?.nombre || item?.name || item?.descripcion || '').trim();
      if (!itemName) return;
      profile.items_count.set(itemName, (profile.items_count.get(itemName) || 0) + 1);
    });

    customerProfiles.set(cliente, profile);
  });

  const recurrentCustomers = [...customerCounts.values()].filter((count) => count > 1).length;
  const uniqueCustomers = customerCounts.size;

  const customerList = [...customerProfiles.values()]
    .map((profile) => {
      const topItems = [...profile.items_count.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ nombre: name, cantidad: count }));
      const favoriteCommerces = [...profile.commerces.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([nombre, count]) => ({ nombre, pedidos: count }));
      const activeHours = [...profile.orders_by_hour.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hora, pedidos]) => ({ hora, pedidos }));
      const favoriteZones = [...profile.zones.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([nombre, pedidos]) => ({ nombre, pedidos }));
      const latestObservations = [...profile.observations.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([texto, ocurrencias]) => ({ texto, ocurrencias }));
      const frequency = profile.delivered_orders > 0
        ? Number((profile.total_orders / Math.max(1, profile.delivered_orders)).toFixed(2))
        : Number((profile.total_orders || 0).toFixed(2));

      return {
        nombre: profile.nombre,
        telefono: profile.telefono,
        primer_pedido_at: profile.first_order_at,
        ultimo_pedido_at: profile.last_order_at,
        pedidos_totales: profile.total_orders,
        pedidos_entregados: profile.delivered_orders,
        pedidos_cancelados: profile.canceled_orders,
        total_gastado: roundMoney(profile.total_spent),
        ticket_promedio: profile.total_orders > 0 ? roundMoney(profile.total_spent / profile.total_orders) : 0,
        frecuencia_compra: frequency,
        productos_favoritos: topItems,
        comercios_favoritos: favoriteCommerces,
        horarios_frecuentes: activeHours,
        zonas_frecuentes: favoriteZones,
        observaciones_recientes: latestObservations,
        ultima_condicion: profile.latest_order_state
      };
    })
    .sort((a, b) => (b.pedidos_totales - a.pedidos_totales) || (b.total_gastado - a.total_gastado) || a.nombre.localeCompare(b.nombre));

  return {
    ok: true,
    summary: {
      clientes_totales: uniqueCustomers,
      clientes_recurrentes: recurrentCustomers,
      observaciones_evaluadas: orderEntries.length
    },
    customers: customerList.slice(0, 20)
  };
}

function buildCommerceCRMProjection(orderEntries = [], market = {}) {
  const commerceList = Object.entries(market?.comercios || {}).map(([commerceId, commerce]) => {
    const catalogo = market?.catalogo_por_comercio?.[commerceId] || {};
    const productos = Object.values(catalogo);
    const vendidos = orderEntries.filter((pedido) => String(pedido?.comercio_id || pedido?.tienda_id || pedido?.merchant_id || '').trim() === commerceId).length;
    const city = commerce?.ciudad || commerce?.city || null;
    const zonaPrincipal = city || Object.keys(market?.indices?.comercios_por_ciudad || {})[0] || null;
    const topProducts = productos
      .filter((producto) => producto && typeof producto === 'object')
      .sort((a, b) => String(b.ventas || 0).localeCompare(String(a.ventas || 0)))
      .slice(0, 3)
      .map((producto) => producto?.nombre || producto?.name || 'Producto');

    return {
      comercio_id: commerceId,
      nombre: commerce?.nombre || commerce?.name || commerceId,
      categoria: commerce?.categoria || commerce?.category || null,
      ciudad: city,
      zona_principal: zonaPrincipal,
      activo: commerce?.activo !== false,
      pedidos_aproximados: vendidos,
      productos_disponibles: productos.filter((producto) => producto?.disponible !== false).length,
      productos_totales: productos.length,
      productos_populares: topProducts,
      horario_pico: null
    };
  });

  return {
    ok: true,
    summary: {
      comercios_totales: commerceList.length,
      zonas_totales: Object.keys(market?.indices?.comercios_por_ciudad || {}).length
    },
    commerces: commerceList
  };
}

function buildCommerceLoyaltyProjection(orderEntries = [], commerceEntries = []) {
  const commerceMap = new Map();
  commerceEntries.forEach((commerce) => {
    if (commerce?.nombre) {
      commerceMap.set(commerce.nombre, commerce);
    }
  });

  const commerceStats = new Map();
  orderEntries.forEach((pedido) => {
    const comercio = String(pedido?.comercio?.nombre || pedido?.tienda?.nombre || pedido?.marketplace?.nombre || pedido?.comercio_nombre || pedido?.tienda_nombre || '').trim();
    if (!comercio) return;

    const createdAt = Number(pedido?.createdAt || pedido?.created_at || pedido?.fecha_creacion || pedido?.timestamp || 0);
    const deliveredAt = Number(pedido?.entregado_en || pedido?.entregadoEn || 0);
    const state = String(pedido?.estado_pedido || pedido?.estado || '').trim().toUpperCase();
    const total = Number(pedido?.total || pedido?.monto || pedido?.monto_total || 0);
    const customer = String(pedido?.cliente_nombre || pedido?.cliente?.nombre || pedido?.cliente || '').trim();

    const stat = commerceStats.get(comercio) || {
      nombre: comercio,
      pedidos_totales: 0,
      pedidos_entregados: 0,
      pedidos_cancelados: 0,
      clientes: new Map(),
      total_gastado: 0,
      last_order_at: null,
      first_order_at: null
    };

    stat.pedidos_totales += 1;
    stat.total_gastado = roundMoney(stat.total_gastado + (Number.isFinite(total) ? total : 0));
    if (state === 'ENTREGADO') stat.pedidos_entregados += 1;
    if (state === 'CANCELADO') stat.pedidos_cancelados += 1;
    if (customer) stat.clientes.set(customer, (stat.clientes.get(customer) || 0) + 1);
    if (!stat.first_order_at || (createdAt && createdAt < stat.first_order_at)) {
      stat.first_order_at = createdAt || stat.first_order_at;
    }
    if (deliveredAt && (!stat.last_order_at || deliveredAt > stat.last_order_at)) {
      stat.last_order_at = deliveredAt;
    } else if (createdAt && (!stat.last_order_at || createdAt > stat.last_order_at)) {
      stat.last_order_at = createdAt;
    }

    commerceStats.set(comercio, stat);
  });

  const commerceList = [...commerceStats.values()]
    .map((stat) => {
      const uniqueClients = stat.clientes.size;
      const recurrentClients = [...stat.clientes.values()].filter((count) => count > 1).length;
      const averageTicket = stat.pedidos_totales > 0 ? roundMoney(stat.total_gastado / stat.pedidos_totales) : 0;
      const inactiveDays = stat.last_order_at ? Math.floor((Date.now() - stat.last_order_at) / (24 * 60 * 60 * 1000)) : null;
      const focus = stat.pedidos_totales > 10 || recurrentClients > 0 ? 'seguimiento_comercial' : 'observacion';
      const commerceRef = commerceMap.get(stat.nombre) || {};

      return {
        nombre: stat.nombre,
        ciudad: commerceRef.ciudad || commerceRef.city || null,
        pedidos_totales: stat.pedidos_totales,
        pedidos_entregados: stat.pedidos_entregados,
        pedidos_cancelados: stat.pedidos_cancelados,
        clientes_totales: uniqueClients,
        clientes_recurrentes: recurrentClients,
        ticket_promedio: averageTicket,
        total_gastado: roundMoney(stat.total_gastado),
        dias_sin_movimiento: inactiveDays,
        sugerencia: focus,
        prioridad: inactiveDays !== null && inactiveDays >= 30 ? 'alta' : (stat.pedidos_totales > 10 ? 'media' : 'baja')
      };
    })
    .filter((commerce) => commerce.pedidos_totales > 0)
    .sort((a, b) => (a.prioridad === b.prioridad ? 0 : (a.prioridad === 'alta' ? -1 : 1)) || (b.pedidos_totales - a.pedidos_totales));

  return {
    ok: true,
    summary: {
      comercios_con_historial: commerceList.length,
      comercios_recurrentes: commerceList.filter((commerce) => commerce.clientes_recurrentes > 0).length,
      comercios_inactivos: commerceList.filter((commerce) => (commerce.dias_sin_movimiento || 0) >= 30).length
    },
    commerces: commerceList.slice(0, 20)
  };
}

function buildLoyaltyProjection(customerEntries = []) {
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  const loyaltyCustomers = customerEntries
    .map((customer) => {
      const lastOrderAt = Number(customer?.ultimo_pedido_at || customer?.last_order_at || 0);
      const totalOrders = Number(customer?.pedidos_totales || 0);
      const recurrent = totalOrders > 1;
      const inactiveDays = lastOrderAt > 0 ? Math.floor((now - lastOrderAt) / (24 * 60 * 60 * 1000)) : null;
      const inactive = inactiveDays !== null ? (now - lastOrderAt) >= thirtyDaysMs : totalOrders > 0;
      const followUp = recurrent || inactive;

      return {
        nombre: customer?.nombre || 'Sin nombre',
        pedidos_totales: totalOrders,
        ultimo_pedido_at: lastOrderAt || null,
        frecuencia_compra: Number(customer?.frecuencia_compra || 0),
        recurrente: recurrent,
        inactivo: inactive,
        dias_sin_compra: inactiveDays,
        sugerencia: followUp
          ? (inactive ? 'seguimiento_reactivacion' : 'posible_recompra')
          : 'sin_accion',
        prioridad: inactive ? 'alta' : (recurrent ? 'media' : 'baja')
      };
    })
    .filter((customer) => customer.recurrente || customer.inactivo)
    .sort((a, b) => {
      if (a.prioridad !== b.prioridad) {
        const rank = { alta: 0, media: 1, baja: 2 };
        return rank[a.prioridad] - rank[b.prioridad];
      }
      return (b.pedidos_totales - a.pedidos_totales) || (b.dias_sin_compra || 0) - (a.dias_sin_compra || 0);
    });

  return {
    ok: true,
    summary: {
      clientes_recurrentes: loyaltyCustomers.filter((customer) => customer.recurrente).length,
      clientes_inactivos: loyaltyCustomers.filter((customer) => customer.inactivo).length,
      candidatos_seguimiento: loyaltyCustomers.length,
      ventana_inactividad_dias: 30,
      ventana_seguimiento_dias: 7
    },
    customers: loyaltyCustomers.slice(0, 20)
  };
}

function buildMarketplaceProjection(market = {}) {
  const totalComercios = Object.keys(market?.comercios || {}).length;
  const totalProductos = Object.values(market?.catalogo_por_comercio || {})
    .reduce((acc, catalogo) => acc + Object.keys(catalogo || {}).length, 0);
  const productosDisponibles = Object.values(market?.catalogo_por_comercio || {})
    .reduce((acc, catalogo) => acc + Object.values(catalogo || {}).filter((producto) => producto?.disponible !== false).length, 0);

  return {
    ok: totalComercios > 0,
    summary: {
      comercios: totalComercios,
      productos: totalProductos,
      productos_disponibles: productosDisponibles,
      ciudad: Object.keys(market?.indices?.comercios_por_ciudad || {})[0] || null
    },
    signal: totalComercios > 0 ? 'market_v1_listo_para_piloto' : 'market_v1_sin_datos'
  };
}

function buildCommercialProjection({
  ventasBrutas,
  deliveredOrders,
  orderEntries,
  ordersMetrics,
  financeProjection,
  totalComercios,
  averageTicket,
  averageDeliveryMinutes,
  averageAcceptanceMinutes,
  uniqueCustomers,
  recurrentCustomers
}) {
  const commercialAlerts = [];
  if (ordersMetrics.pedidosCanceladosHoy > 0) commercialAlerts.push('cancelaciones_presentes');
  if (ordersMetrics.avgEntregaMinutos > 45) commercialAlerts.push('entrega_por_encima_del_objetivo');
  if (ordersMetrics.avgAsignacionMinutos > 20) commercialAlerts.push('aceptacion_por_encima_del_objetivo');
  if (ordersMetrics.activos > 0) commercialAlerts.push('pedidos_activos_en_revision');
  if (totalComercios === 0) commercialAlerts.push('marketplace_sin_comercios');

  return {
    ok: true,
    summary: {
      ventas_dia: ventasBrutas,
      ventas_semana: ventasBrutas,
      ventas_mes: ventasBrutas,
      pedidos_recibidos: orderEntries.length,
      pedidos_entregados: deliveredOrders.length,
      pedidos_cancelados: ordersMetrics.pedidosCanceladosHoy,
      pedidos_en_proceso: ordersMetrics.activos,
      clientes_nuevos: uniqueCustomers > 0 ? Math.max(1, uniqueCustomers - recurrentCustomers) : 0,
      clientes_recurrentes: recurrentCustomers,
      ticket_promedio: averageTicket,
      frecuencia_compra: uniqueCustomers > 0 ? Number((deliveredOrders.length / uniqueCustomers).toFixed(2)) : 0,
      tiempo_promedio_aceptacion: averageAcceptanceMinutes,
      tiempo_promedio_entrega: averageDeliveryMinutes,
      entregas_puntuales_pct: averageDeliveryMinutes > 0 ? Math.max(0, 100 - Math.min(100, averageDeliveryMinutes)) : 100,
      ingresos_comercio: ventasBrutas,
      comisiones: Number((ventasBrutas * 0.15).toFixed(2)),
      ganancia_estimada: roundMoney(ventasBrutas - (ventasBrutas * 0.15)),
      estado_liquidaciones: financeProjection.ledger.reconciled ? 'conciliadas' : 'pendientes'
    },
    alerts: commercialAlerts,
    signal: commercialAlerts.length > 0 ? 'atencion_comercial_requerida' : 'operacion_comercial_estable'
  };
}

function buildCommercialInsightsProjection({
  customerCRMProjection = {},
  commerceCRMProjection = {},
  commercialProjection = {}
} = {}) {
  const customerList = Array.isArray(customerCRMProjection?.customers) ? customerCRMProjection.customers : [];
  const commerceList = Array.isArray(commerceCRMProjection?.commerces) ? commerceCRMProjection.commerces : [];
  const commercialSummary = commercialProjection?.summary || {};

  const customerOpportunities = customerList
    .map((customer) => {
      const inactiveDays = Number(customer?.dias_sin_compra ?? 0);
      const recurrent = Number(customer?.pedidos_totales ?? 0) > 1;
      const priority = customer?.inactivo
        ? 'alta'
        : recurrent
          ? 'media'
          : 'baja';

      return {
        nombre: customer?.nombre || 'Sin nombre',
        tipo: customer?.inactivo ? 'cliente_inactivo' : (recurrent ? 'cliente_recurrente' : 'cliente_nuevo'),
        oportunidad: customer?.inactivo ? 'reactivar_cliente' : 'promover_recompra',
        accion_sugerida: customer?.inactivo
          ? 'contacto_manual_con_promocion'
          : 'seguimiento_manual_y_recordatorio',
        prioridad: priority,
        dias_sin_compra: inactiveDays,
        pedidos_totales: Number(customer?.pedidos_totales ?? 0),
        ticket_promedio: Number(customer?.ticket_promedio ?? 0)
      };
    })
    .filter((item) => item.pedidos_totales > 0)
    .sort((a, b) => {
      const rank = { alta: 0, media: 1, baja: 2 };
      if (rank[a.prioridad] !== rank[b.prioridad]) return rank[a.prioridad] - rank[b.prioridad];
      return (b.dias_sin_compra || 0) - (a.dias_sin_compra || 0);
    });

  const commerceOpportunities = commerceList
    .map((commerce) => {
      const diasSinMovimiento = Number(commerce?.dias_sin_movimiento ?? 0);
      const recurrentes = Number(commerce?.clientes_recurrentes ?? 0);
      const prioridad = diasSinMovimiento >= 30
        ? 'alta'
        : recurrentes > 0
          ? 'media'
          : 'baja';

      return {
        nombre: commerce?.nombre || 'Sin nombre',
        ciudad: commerce?.ciudad || 'Sin ciudad',
        oportunidad: diasSinMovimiento >= 30 ? 'revisar_inactividad' : 'impulsar_ventas',
        accion_sugerida: diasSinMovimiento >= 30
          ? 'seguimiento_con_comercio_y_revision_operativa'
          : 'promocion_del_dia_o_recordatorio_comercial',
        prioridad,
        dias_sin_movimiento: diasSinMovimiento,
        clientes_recurrentes: recurrentes,
        pedidos_totales: Number(commerce?.pedidos_totales ?? 0)
      };
    })
    .filter((item) => item.pedidos_totales > 0)
    .sort((a, b) => {
      const rank = { alta: 0, media: 1, baja: 2 };
      if (rank[a.prioridad] !== rank[b.prioridad]) return rank[a.prioridad] - rank[b.prioridad];
      return (b.dias_sin_movimiento || 0) - (a.dias_sin_movimiento || 0);
    });

  const topOpportunities = [
    ...customerOpportunities.slice(0, 5).map((item) => ({
      tipo: 'cliente',
      titulo: item.nombre,
      prioridad: item.prioridad,
      descripcion: `${item.oportunidad} - ${item.accion_sugerida}`,
      evidencia: `${item.pedidos_totales} pedidos · ${item.dias_sin_compra || 0} dias sin compra`
    })),
    ...commerceOpportunities.slice(0, 5).map((item) => ({
      tipo: 'comercio',
      titulo: item.nombre,
      prioridad: item.prioridad,
      descripcion: `${item.oportunidad} - ${item.accion_sugerida}`,
      evidencia: `${item.pedidos_totales} pedidos · ${item.dias_sin_movimiento || 0} dias sin movimiento`
    }))
  ].sort((a, b) => {
    const rank = { alta: 0, media: 1, baja: 2 };
    return rank[a.prioridad] - rank[b.prioridad];
  });

  return {
    ok: true,
    summary: {
      oportunidades_totales: topOpportunities.length,
      clientes_en_riesgo: customerOpportunities.filter((item) => item.prioridad === 'alta').length,
      comercios_en_riesgo: commerceOpportunities.filter((item) => item.prioridad === 'alta').length,
      metricas_fuente: commercialSummary.ventas_dia ?? 0
    },
    opportunities: topOpportunities,
    actions: topOpportunities.map((item) => ({
      titulo: item.titulo,
      accion: item.prioridad === 'alta'
        ? 'priorizar_contacto'
        : item.prioridad === 'media'
          ? 'seguimiento_programado'
          : 'monitoreo_base',
      evidencia: item.evidencia
    }))
  };
}

export {
  buildCommercialProjection,
  buildCommercialInsightsProjection,
  buildCommerceCRMProjection,
  buildCommerceLoyaltyProjection,
  buildMarketplaceProjection,
  buildCustomerCRMProjection,
  buildLoyaltyProjection,
  roundMoney
};
