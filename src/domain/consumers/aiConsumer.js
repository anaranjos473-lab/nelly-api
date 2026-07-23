import { createEventConsumerGuard } from './consumerGuard.js';

function createAIConsumer({ logger = console } = {}) {
  const insights = [];
  const guard = createEventConsumerGuard({ logger, name: 'AIConsumer' });

  function onEvent(event) {
    const gate = guard.shouldProcess(event);
    if (!gate.ok) {
      return null;
    }

    if (event?.tipo === 'pedido.entregado') {
      const comision = Number(event?.payload?.comision || 0);
      const tarifaEntrega = Number(event?.payload?.tarifaEntrega || 0);
      const total = comision + tarifaEntrega;
      const insight = {
        event_tipo: event?.tipo || null,
        aggregate_id: event?.aggregate_id || null,
        source: event?.metadata?.source || null,
        contract_version: event?.metadata?.contract_version || null,
        recommendation: total > 0 ? 'reforzar analitica y notificacion del cierre' : 'revisar flujo economico del pedido',
        score: total > 0 ? 1 : 0,
        inputs: {
          comision,
          tarifaEntrega
        }
      };
      insights.push(insight);
    }

    logger.info?.('[AIConsumer]', JSON.stringify(getInsights()));
    return getInsights();
  }

  function getInsights() {
    return [...insights];
  }

  return {
    onEvent,
    getInsights
  };
}

export {
  createAIConsumer
};
