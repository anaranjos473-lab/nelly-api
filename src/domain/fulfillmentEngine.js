import { createDomainEventBus } from './eventBus.js';
import { createLedger } from './ledger.js';
import {
  buildAcceptedOrderPayload,
  buildCompletedOrderPayload,
  canAcceptOrder,
  canCompleteOrder,
  getOrderIdentity,
  getOrderState
} from '../services/ordersManager.js';

function createFulfillmentEngine({
  eventBus = createDomainEventBus(),
  ledger = createLedger(),
  clock = () => Date.now()
} = {}) {
  function acceptOrder({ driver, order, uid }) {
    const decision = canAcceptOrder({ driver, order, uid });
    if (!decision.ok) {
      return { ok: false, decision };
    }

    const acceptedAt = clock();
    const acceptedOrder = buildAcceptedOrderPayload(order, uid, acceptedAt);
    const event = eventBus.recordTransition({
      aggregate_id: getOrderIdentity(acceptedOrder),
      from: getOrderState(order) || 'LISTO',
      to: 'EN_CURSO',
      payload: {
        uid,
        estado_pedido: 'EN_CURSO'
      },
      actor: { tipo: 'driver', uid }
    });

    return {
      ok: true,
      order: acceptedOrder,
      event,
      decision
    };
  }

  function completeOrder({ order, uid, isPanel = false, comision = 0, tarifaEntrega = 0, actorType = 'driver' }) {
    const decision = canCompleteOrder({ order, uid, isPanel });
    if (!decision.ok) {
      return { ok: false, decision };
    }

    const completedAt = clock();
    const completedOrder = buildCompletedOrderPayload(order, completedAt, 'normal', comision, tarifaEntrega);
    const aggregateId = getOrderIdentity(completedOrder) || getOrderIdentity(order);
    const event = eventBus.recordTransition({
      aggregate_id: aggregateId,
      from: getOrderState(order) || 'EN_TRANSITO',
      to: 'ENTREGADO',
      payload: {
        uid,
        estado_pedido: 'ENTREGADO',
        comision,
        tarifaEntrega
      },
      actor: { tipo: actorType, uid }
    });

    const ledgerEntry = ledger.append({
      tipo: 'cargo',
      subtipo: 'pedido_entregado',
      origen: 'fulfillment-engine',
      referencia_id: aggregateId,
      actor_id: uid,
      monto: Number(comision || tarifaEntrega || 0),
      moneda: 'MXN',
      idempotency_key: `FULFILLMENT:${aggregateId}`,
      ocurrido_en: completedAt,
      registrado_en: completedAt,
      metadata: {
        event_id: event.id,
        event_tipo: event.tipo
      }
    });

    return {
      ok: true,
      order: {
        ...completedOrder,
        id_pedido: aggregateId,
        id: completedOrder.id || aggregateId,
        pedido_id: completedOrder.pedido_id || aggregateId
      },
      event,
      ledgerEntry,
      decision
    };
  }

  function getState() {
    return {
      events: eventBus.getHistory(),
      ledger: ledger.getEntries(),
      balance: ledger.getBalance()
    };
  }

  return {
    acceptOrder,
    completeOrder,
    getState,
    eventBus,
    ledger
  };
}

export {
  createFulfillmentEngine
};
