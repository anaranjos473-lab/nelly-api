const FISCAL_STATUSES = Object.freeze({
  PENDING: 'FISCAL_PENDING',
  CERTIFIED: 'CERTIFIED',
  EXCEPTION: 'EXCEPTION'
});

const ACCOUNTING_STATUSES = Object.freeze({
  PENDING: 'ACCOUNTING_PENDING',
  ACCOUNTED: 'ACCOUNTED'
});

function text(value) {
  const normalized = String(value ?? '').trim();
  return normalized || null;
}

function money(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? Number(amount.toFixed(2)) : null;
}

function firstValue(...values) {
  return values.map(text).find(Boolean) || null;
}

function getOrderId(order = {}, fallback = null) {
  return firstValue(order.id, order.id_pedido, order.pedido_id, fallback);
}

function classifyOrder(order = {}) {
  const orderId = getOrderId(order);
  const subtotal = money(order.subtotal);
  const shipping = money(order.costo_envio ?? order.tarifa_envio);
  const tip = money(order.propina);
  const total = money(order.total ?? order.monto_total ?? order.monto);
  const paymentMethod = firstValue(order.pago?.metodo, order.metodo_pago, order.metodo_pago_cliente);
  const commerceId = firstValue(order.comercio_id, order.id_comercio);
  const driverId = firstValue(order.repartidor_id, order.conductorId, order.idConductor);
  const missing = [];
  const warnings = [];

  if (!orderId) missing.push('operation_id');
  if (total === null || total <= 0) missing.push('total');
  if (!paymentMethod) missing.push('payment_method');
  if (!commerceId) missing.push('commerce_id');
  if (!order.cliente_nombre && !order.cliente) missing.push('customer_identity');
  if (!order.created_at && !order.createdAt && !order.fecha_creacion) missing.push('operation_timestamp');

  // Technical amounts are facts; economic ownership remains pending professional review.
  const calculatedTotal = [subtotal, shipping, tip].every((value) => value !== null)
    ? money(subtotal + shipping + tip)
    : null;
  if (calculatedTotal !== null && total !== null && calculatedTotal !== total) {
    warnings.push('TOTAL_DOES_NOT_MATCH_COMPONENTS');
  }

  const status = missing.length > 0 || warnings.length > 0
    ? FISCAL_STATUSES.EXCEPTION
    : FISCAL_STATUSES.PENDING;

  return {
    operation: {
      order_id: orderId,
      customer: firstValue(order.cliente_nombre, order.cliente),
      commerce_id: commerceId,
      driver_id: driverId,
      payment_method: paymentMethod,
      currency: firstValue(order.moneda, 'MXN')
    },
    amounts: {
      gmv: total,
      subtotal,
      delivery_fee: shipping,
      tip,
      nelly_revenue: null,
      third_party_amount: null,
      tax_amount: null,
      commission_amount: null
    },
    classification: {
      economic: 'UNCLASSIFIED_PENDING_REVIEW',
      revenue_owner: 'PENDING_CONTRACTUAL_REVIEW',
      categories: ['DELIVERY', 'DINERO_TERCEROS_PENDING']
    },
    statuses: {
      fiscal: status,
      accounting: ACCOUNTING_STATUSES.PENDING,
      cfdi: 'CFDI_PENDING',
      reconciliation: 'RECONCILIATION_PENDING'
    },
    evidence: {
      source: 'pedidos',
      source_order_id: orderId,
      order_state: firstValue(order.estado_pedido, order.estado),
      has_ledger_reference: false,
      has_cfdi_reference: Boolean(firstValue(order.cfdi_id, order.cfdiId, order.uuid_cfdi))
    },
    missing,
    warnings,
    risks: [
      'OWNERSHIP_OF_CUSTOMER_MONEY_NOT_CONFIRMED',
      'MEXICAN_FISCAL_TREATMENT_REQUIRES_CURRENT_PROFESSIONAL_REVIEW'
    ],
    recommendations: [
      'Confirm contractual ownership of subtotal, delivery fee, tip and commission.',
      'Attach the applicable CFDI reference before marking the operation certified.',
      'Generate ledger movements through the existing financial core; do not overwrite balances.'
    ],
    state: status === FISCAL_STATUSES.EXCEPTION ? 'EXCEPTION' : 'FISCAL_PENDING'
  };
}

function buildFiscalOrderReview({ order = {}, ledgerEntries = [] } = {}) {
  const review = classifyOrder(order);
  const orderId = review.operation.order_id;
  const relatedLedger = ledgerEntries.filter((entry) => String(entry?.referencia_id || '') === String(orderId || ''));

  return {
    ...review,
    evidence: {
      ...review.evidence,
      ledger_entries: relatedLedger.length,
      has_ledger_reference: relatedLedger.length > 0
    },
    statuses: {
      ...review.statuses,
      accounting: relatedLedger.length > 0 ? ACCOUNTING_STATUSES.ACCOUNTED : ACCOUNTING_STATUSES.PENDING
    }
  };
}

export {
  ACCOUNTING_STATUSES,
  FISCAL_STATUSES,
  buildFiscalOrderReview,
  classifyOrder
};
