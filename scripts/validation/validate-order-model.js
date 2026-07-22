import { buildCanonicalOrder } from '../../src/domain/index.js';

const canonical = buildCanonicalOrder({
  userId: 'user-1',
  items: [{ id: 'item-1', nombre: 'Taco', cantidad: 2, precio_unitario: 15 }],
  total: 30,
  estado: 'CREADO'
});

if (!canonical.validation.ok) {
  console.error(`Order model invalido: ${canonical.validation.missing.join(', ')}`);
  process.exit(1);
}

if (canonical.order.estado !== 'CREADO') {
  console.error('Order canonical no conserva el estado esperado');
  process.exit(1);
}

console.log('validate-order-model: OK');
