import { buildAdminOrdersMetrics } from './adminSyncService.js';
import {
  buildCommercialProjection,
  buildCommerceCRMProjection,
  buildMarketplaceProjection,
  buildCustomerCRMProjection,
  buildLoyaltyProjection,
  roundMoney
} from './dashboardProjections.js';

function buildOperationalDashboardSnapshot({
  health = {},
  pedidos = {},
  pedidosActivos = {},
  conductores = {},
  finanzas = {},
  historialVentas = {},
  notificaciones = {},
  eventos = [],
  market = {},
  now = Date.now()
} = {}) {
  const ordersMetrics = buildAdminOrdersMetrics({
    pedidos,
    pedidosActivos,
    conductores,
    now
  });

  const ventasBrutas = roundMoney(finanzas.ingresosHoy || 0);
  const comisionesNelly = roundMoney(ventasBrutas * 0.15);
  const totalNotificaciones = Object.keys(notificaciones || {}).length;
  const totalEventos = Array.isArray(eventos) ? eventos.length : 0;
  const entregasHistoricas = Object.keys(historialVentas || {}).length;

  const orderEntries = Object.values(pedidos || {});
  const deliveredOrders = orderEntries.filter((pedido) => {
    const estado = String(pedido?.estado_pedido || pedido?.estado || pedido?.logistica?.estado || '').trim().toUpperCase();
    return estado === 'ENTREGADO';
  });
  const averageTicket = deliveredOrders.length > 0
    ? roundMoney(ventasBrutas / deliveredOrders.length)
    : roundMoney(ventasBrutas);
  const averageDeliveryMinutes = ordersMetrics.avgEntregaMinutos || 0;
  const averageAcceptanceMinutes = ordersMetrics.avgAsignacionMinutos || 0;
  const pendingOrders = ordersMetrics.activos;
  const marketplaceProjection = buildMarketplaceProjection(market);
  const customerCRMProjection = buildCustomerCRMProjection(orderEntries);
  const commerceCRMProjection = buildCommerceCRMProjection(orderEntries, market);
  const loyaltyProjection = buildLoyaltyProjection(customerCRMProjection.customers);

  const auditProjection = {
    ok: true,
    summary: {
      total_eventos: totalEventos,
      entregas_registradas: entregasHistoricas,
      observaciones: 0
    },
    signal: totalEventos > 0 ? 'eventos_operativos_registrados' : 'sin_eventos_en_memoria'
  };

  const metricsProjection = {
    ok: true,
    summary: {
      pedido_entregado: ordersMetrics.pedidosEntregadosHoy,
      total_eventos: totalEventos,
      ultimos_eventos: totalEventos
    },
    signal: ordersMetrics.pedidosEntregadosHoy > 0
      ? 'flujo_operativo_mostrando_entregas'
      : 'sin_entregas_recientes'
  };

  const financeProjection = {
    ok: true,
    summary: {
      ventas_brutas: ventasBrutas,
      comisiones_nelly: comisionesNelly,
      entregas: entregasHistoricas
    },
    ledger: {
      entries: entregasHistoricas,
      reconciled: true
    }
  };

  const notificationProjection = {
    ok: true,
    summary: {
      active: totalNotificaciones,
      byChannel: {
        push: totalNotificaciones
      }
    }
  };

  const aiProjection = {
    ok: true,
    insights: [
      {
        id: 'ai-dashboard-001',
        recommendation: ordersMetrics.activos > 0
          ? 'mantener seguimiento de pedidos activos y sincronizacion'
          : 'sin pedidos activos; plataforma lista para nueva carga',
        score: ordersMetrics.activos > 0 ? 1 : 0
      }
    ]
  };

  const commercialProjection = buildCommercialProjection({
    ventasBrutas,
    deliveredOrders,
    orderEntries,
    ordersMetrics,
    financeProjection: { ledger: { reconciled: true } },
    totalComercios: marketplaceProjection.summary.comercios,
    averageTicket,
    averageDeliveryMinutes,
    averageAcceptanceMinutes,
    uniqueCustomers: customerCRMProjection.summary.clientes_totales,
    recurrentCustomers: customerCRMProjection.summary.clientes_recurrentes
  });

  const operationalHealth = {
    backend: Boolean(health?.success ?? health?.ok ?? false),
    rtdb: true,
    sincronizacion: true,
    ledger: true,
    finanzas: true
  };

  const overallOk = Boolean(operationalHealth.backend)
    && ordersMetrics.ok
    && financeProjection.ok
    && metricsProjection.ok
    && auditProjection.ok
    && notificationProjection.ok
    && aiProjection.ok
    && marketplaceProjection.ok;

  return {
    ok: overallOk,
    generated_at: now,
    source: 'S4_OPERATIVE_DASHBOARD',
    health: operationalHealth,
    overview: {
      pedidos_activos: ordersMetrics.activos,
      repartidores: ordersMetrics.conductoresActivos,
      ventas_brutas: ventasBrutas,
      comisiones_nelly: comisionesNelly,
      entregas_hoy: ordersMetrics.pedidosEntregadosHoy
    },
    projections: {
      audit: auditProjection,
      metrics: metricsProjection,
      finance: financeProjection,
      notification: notificationProjection,
      ai: aiProjection,
      marketplace: marketplaceProjection,
      commercial: commercialProjection,
      crm: {
        ok: Boolean(customerCRMProjection.ok && commerceCRMProjection.ok),
        summary: {
          ...customerCRMProjection.summary,
          ...commerceCRMProjection.summary,
          comercios_totales: marketplaceProjection.summary.comercios
        },
        customers: customerCRMProjection.customers,
        commerces: commerceCRMProjection.commerces,
        loyalty: loyaltyProjection
      }
    },
    operational_metrics: ordersMetrics
  };
}

export {
  buildOperationalDashboardSnapshot
};
