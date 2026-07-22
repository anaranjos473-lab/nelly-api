import { createLedger, createLedgerEntry, projectLedger } from '../../src/domain/index.js';

const ledger = createLedger([
  {
    tipo: 'cargo',
    subtipo: 'pedido_entregado',
    referencia_id: 'ORD-1',
    actor_id: 'driver-1',
    monto: 30,
    saldo_antes: 100,
    ocurrio_en: 1,
    registrado_en: 1
  }
]);

ledger.append({
  tipo: 'abono',
  subtipo: 'ajuste',
  referencia_id: 'ORD-1',
  actor_id: 'system',
  monto: -10,
  ocurrio_en: 2,
  registrado_en: 2
});

const projection = projectLedger(ledger.getEntries());
const manual = createLedgerEntry({
  tipo: 'comision',
  subtipo: 'plataforma',
  referencia_id: 'ORD-2',
  monto: 18,
  saldo_antes: 0,
  ocurrio_en: 3,
  registrado_en: 3
});

let ok = true;

if (ledger.getEntries().length !== 2) {
  console.error('El ledger no es append-only');
  ok = false;
}

if (!ledger.reconcile(20).ok) {
  console.error('La conciliacion no coincide con el saldo esperado');
  ok = false;
}

if (projection.balance !== 20 || projection.count !== 2) {
  console.error('La proyeccion del ledger no coincide');
  ok = false;
}

if (!manual.validation.ok || manual.saldo_despues !== 18) {
  console.error('La entrada manual no cumple el contrato');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-ledger: OK');
