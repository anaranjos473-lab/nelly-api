import {
  DOMAIN_EVENT_CONTRACT,
  EVIDENCE_CONTRACT,
  FULFILLMENT_NODE_CONTRACT,
  INVENTORY_ITEM_CONTRACT,
  LEDGER_ENTRY_CONTRACT,
  ORDER_CONTRACT,
  ORDER_ITEM_CONTRACT,
  PAYMENT_CONTRACT,
  SHIPMENT_CONTRACT,
  validateDomainEvent,
  validateEvidence,
  validateFulfillmentNode,
  validateInventoryItem,
  validateLedgerEntry,
  validateOrder,
  validateOrderItem,
  validatePayment,
  validateShipment
} from '../src/domain/index.js';

describe('Domain contracts', () => {
  test('expone contratos canonicos congelados', () => {
    expect(Object.isFrozen(ORDER_CONTRACT)).toBe(true);
    expect(Object.isFrozen(PAYMENT_CONTRACT)).toBe(true);
    expect(Object.isFrozen(DOMAIN_EVENT_CONTRACT)).toBe(true);
  });

  test('valida order con contrato canonico', () => {
    expect(validateOrder({ id: 'ORD-1', cliente: 'c1', lineas: [], estado: 'CREADO', created_at: 1, updated_at: 1 }).ok).toBe(true);
    expect(validateOrder({ id: 'ORD-1', cliente: 'c1' }).ok).toBe(false);
  });

  test('valida entidades canonicas del dominio', () => {
    expect(validateOrderItem({ id: 'IT-1', pedido_id: 'ORD-1', producto_id: 'SKU-1', cantidad: 1, precio_unitario: 10 }).ok).toBe(true);
    expect(validateFulfillmentNode({ id: 'NODE-1', tipo: 'kitchen', estado: 'DISPONIBLE', capabilities: [] }).ok).toBe(true);
    expect(validateInventoryItem({ id: 'INV-1', sku: 'SKU-1', nodo_id: 'NODE-1', disponible: 10, reservado: 0 }).ok).toBe(true);
    expect(validateLedgerEntry({ id: 'LED-1', tipo: 'cargo', monto: 10, moneda: 'MXN', referencia_id: 'ORD-1', idempotency_key: 'CARGO:ORD-1', ocurrido_en: 1 }).ok).toBe(true);
    expect(validatePayment({ id: 'PAY-1', pedido_id: 'ORD-1', metodo: 'cash', estado: 'CONFIRMADO', monto: 10 }).ok).toBe(true);
    expect(validateShipment({ id: 'SHP-1', pedido_id: 'ORD-1', repartidor_id: 'DRV-1', estado: 'EN_TRANSITO' }).ok).toBe(true);
    expect(validateDomainEvent({ id: 'EVT-1', tipo: 'pedido.creado', aggregate_id: 'ORD-1', ocurrido_en: 1, registrado_en: 1 }).ok).toBe(true);
    expect(validateEvidence({ id: 'EVD-1', tipo: 'captura', url: 'https://example.test/evidence.png', timestamp: 1 }).ok).toBe(true);
  });

  test('mantiene estructuras basicas por contrato', () => {
    expect(ORDER_CONTRACT.requiredFields).toContain('estado');
    expect(ORDER_ITEM_CONTRACT.requiredFields).toContain('pedido_id');
    expect(FULFILLMENT_NODE_CONTRACT.states).toContain('DISPONIBLE');
    expect(INVENTORY_ITEM_CONTRACT.states).toContain('RESERVADO');
    expect(LEDGER_ENTRY_CONTRACT.requiredFields).toContain('referencia_id');
    expect(SHIPMENT_CONTRACT.requiredFields).toContain('repartidor_id');
    expect(EVIDENCE_CONTRACT.requiredFields).toContain('url');
  });
});
