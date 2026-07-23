import { createAIConsumer, createDomainEventBus, createFulfillmentEngine } from '../../src/domain/index.js';

const bus = createDomainEventBus();
const ai = createAIConsumer({ logger: { info: () => {} } });

bus.subscribe('pedido.entregado', (event) => {
  ai.onEvent(event);
});

const engine = createFulfillmentEngine({ eventBus: bus, clock: () => 1000 });
const result = engine.completeOrder({
  order: { id: 'PED_AI_1', estado_pedido: 'EN_CURSO', conductorId: 'driver-ai', logistica: {} },
  uid: 'driver-ai',
  comision: 45,
  tarifaEntrega: 20
});

let ok = true;

if (!result.ok) {
  console.error('El flujo de entrega no pudo completarse');
  ok = false;
}

const insights = ai.getInsights();
if (insights.length !== 1 || insights[0]?.recommendation !== 'reforzar analitica y notificacion del cierre') {
  console.error('El consumidor de IA no genero una recomendacion valida');
  ok = false;
}

if (insights[0]?.inputs?.comision !== 45 || insights[0]?.inputs?.tarifaEntrega !== 20) {
  console.error('El consumidor de IA no registro correctamente los insumos');
  ok = false;
}

if (result.event.tipo !== 'pedido.entregado') {
  console.error('El productor del evento cambio inesperadamente');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-ai-consumer: OK');
