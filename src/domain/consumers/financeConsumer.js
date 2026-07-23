import { createEventConsumerGuard } from './consumerGuard.js';

function createFinanceConsumer({ logger = console } = {}) {
  const ledger = [];
  const state = {
    total_comision: 0,
    total_tarifa_entrega: 0,
    total_eventos: 0
  };
  const guard = createEventConsumerGuard({ logger, name: 'FinanceConsumer' });

  function onEvent(event) {
    const gate = guard.shouldProcess(event);
    if (!gate.ok) {
      return null;
    }

    state.total_eventos += 1;

    if (event?.tipo === 'pedido.entregado') {
      const comision = Number(event?.payload?.comision || 0);
      const tarifaEntrega = Number(event?.payload?.tarifaEntrega || 0);

      state.total_comision += comision;
      state.total_tarifa_entrega += tarifaEntrega;

      ledger.push({
        tipo: 'pedido_entregado',
        aggregate_id: event?.aggregate_id || null,
        comision,
        tarifaEntrega,
        source: event?.metadata?.source || null,
        contract_version: event?.metadata?.contract_version || null,
        recorded_at: event?.registrado_en || null
      });
    }

    logger.info?.('[FinanceConsumer]', JSON.stringify(getSnapshot()));
    return getSnapshot();
  }

  function getSnapshot() {
    return {
      total_comision: state.total_comision,
      total_tarifa_entrega: state.total_tarifa_entrega,
      total_eventos: state.total_eventos,
      ledger: [...ledger]
    };
  }

  return {
    onEvent,
    getSnapshot
  };
}

export {
  createFinanceConsumer
};
