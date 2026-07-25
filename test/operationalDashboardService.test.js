import { buildOperationalDashboardSnapshot } from '../src/services/operationalDashboardService.js';

describe('Operational dashboard snapshot', () => {
  test('consolida la proyeccion operativa desde las fuentes certificadas', () => {
    const snapshot = buildOperationalDashboardSnapshot({
      health: { success: true, ok: true },
      pedidos: {
        P1: {
          id: 'P1',
          estado: 'ENTREGADO',
          calidad_operativa: {
            tipo: 'empaque_danado',
            causa_raiz: 'sellado_insuficiente',
            merma_estimada: 20,
            accion_correctiva: 'reforzar_empaque'
          }
        }
      },
      pedidosActivos: {},
      conductores: {
        D1: { nombre: 'Driver 1' }
      },
      finanzas: {
        ingresosHoy: 500
      },
      historialVentas: {
        H1: { pedido_id: 'P1' }
      },
      notificaciones: {
        N1: { channel: 'push' }
      },
      eventos: [
        { tipo: 'pedido.entregado' }
      ],
      market: {
        comercios: {
          M1: { nombre: 'Comercio 1', ciudad: 'Tuxtla' }
        },
        catalogo_por_comercio: {
          M1: {
            P1: { nombre: 'Producto 1', disponible: true }
          }
        },
        indices: {
          comercios_por_ciudad: {
            Tuxtla: { M1: true }
          }
        }
      },
      now: 1000
    });

    expect(snapshot.ok).toBe(true);
    expect(snapshot.source).toBe('S4_OPERATIVE_DASHBOARD');
    expect(snapshot.overview).toMatchObject({
      pedidos_activos: 0,
      repartidores: 1,
      ventas_brutas: 500,
      comisiones_nelly: 75,
      entregas_hoy: 0
    });
    expect(snapshot.projections.audit.summary.total_eventos).toBe(1);
    expect(snapshot.projections.metrics.summary.pedido_entregado).toBe(0);
    expect(snapshot.projections.finance.summary.ventas_brutas).toBe(500);
    expect(snapshot.projections.notification.summary.active).toBe(1);
    expect(snapshot.projections.ai.insights[0].score).toBe(0);
    expect(snapshot.projections.operational_quality.summary.incidencias).toBe(1);
    expect(snapshot.projections.operational_quality.summary.merma_estimada).toBe(20);
    expect(snapshot.projections.operational_quality.root_causes[0]).toMatchObject({
      causa: 'sellado_insuficiente',
      total: 1
    });
  });
});
