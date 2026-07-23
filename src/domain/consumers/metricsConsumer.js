function createMetricsConsumer({ logger = console } = {}) {
  const metrics = {
    pedido_entregado: 0,
    ultimos_eventos: [],
    total_eventos: 0
  };

  function onEvent(event) {
    metrics.total_eventos += 1;
    if (event?.tipo === 'pedido.entregado') {
      metrics.pedido_entregado += 1;
    }

    metrics.ultimos_eventos.push({
      tipo: event?.tipo || null,
      aggregate_id: event?.aggregate_id || null,
      source: event?.metadata?.source || null,
      occurred_at: event?.ocurrido_en || null
    });

    if (metrics.ultimos_eventos.length > 10) {
      metrics.ultimos_eventos.shift();
    }

    logger.info?.('[MetricsConsumer]', JSON.stringify(metrics));
    return getMetrics();
  }

  function getMetrics() {
    return {
      pedido_entregado: metrics.pedido_entregado,
      ultimos_eventos: [...metrics.ultimos_eventos],
      total_eventos: metrics.total_eventos
    };
  }

  return {
    onEvent,
    getMetrics
  };
}

export {
  createMetricsConsumer
};
