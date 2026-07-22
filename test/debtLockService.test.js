import { buildDebtChargePayload, buildDebtPaymentPayload } from '../src/services/debtLockService.js';

describe('debtLockService payload builders', () => {
  test('buildDebtChargePayload increases deuda and saldo coherently', () => {
    const payload = buildDebtChargePayload(
      {
        finanzas: { deuda_actual: 100, saldo_ganancias: 500, ganancia_hoy: 20 },
        estatus: { nivel: 'BRONCE' }
      },
      { uid: 'D1', monto: 30, pedidoId: 'P1', origen: 'api', now: 1000, limite: 300 }
    );

    expect(payload.finanzas.deuda_actual).toBe(130);
    expect(payload.finanzas.saldo_ganancias).toBe(530);
    expect(payload.finanzas.ganancia_hoy).toBe(50);
    expect(payload.estatus.bloqueado_por_deuda).toBe(false);
    expect(payload.finanzas.ultimo_cobro_efectivo.pedido_id).toBe('P1');
  });

  test('buildDebtPaymentPayload reduces deuda and saldo coherently', () => {
    const payload = buildDebtPaymentPayload(
      {
        finanzas: { deuda_actual: 100, saldo_ganancias: 500 },
        estatus: { nivel: 'BRONCE' }
      },
      { monto: 30, origen: 'panel', now: 2000, limite: 300 }
    );

    expect(payload.finanzas.deuda_actual).toBe(70);
    expect(payload.finanzas.saldo_ganancias).toBe(470);
    expect(payload.estatus.bloqueado_por_deuda).toBe(false);
    expect(payload.finanzas.ultimo_pago_deuda.origen).toBe('panel');
  });
});
