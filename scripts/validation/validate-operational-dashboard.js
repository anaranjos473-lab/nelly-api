import { buildOperationalDashboardSnapshot } from '../../src/services/operationalDashboardService.js';

const snapshot = buildOperationalDashboardSnapshot({
  health: { success: true, ok: true },
  pedidos: {
    PED_S4_1: {
      estado: 'ENTREGADO',
      delivered_at: 1000
    }
  },
  pedidosActivos: {},
  conductores: {
    driver_s4_1: {}
  },
  finanzas: {
    ingresosHoy: 1500
  },
  historialVentas: {
    HIST_1: { pedido_id: 'PED_S4_1' }
  },
  notificaciones: {
    N1: { channel: 'push' }
  },
  eventos: [
    { tipo: 'pedido.entregado', aggregate_id: 'PED_S4_1' }
  ],
  market: {
    comercios: {
      commerce_s4_1: {
        nombre: 'Comercio S4',
        categoria: 'piloto',
        ciudad: 'Tuxtla',
        activo: true
      }
    },
    catalogo_por_comercio: {
      commerce_s4_1: {
        product_s4_1: {
          nombre: 'Producto S4',
          disponible: true
        }
      }
    },
    indices: {
      comercios_por_ciudad: {
        Tuxtla: ['commerce_s4_1']
      }
    }
  },
  now: 1000
});

if (!snapshot.ok) {
  console.error('El dashboard operativo unificado no es consistente');
  process.exit(1);
}

if (snapshot.overview.pedidos_activos !== 0 || snapshot.overview.repartidores !== 1) {
  console.error('La proyeccion operativa no coincide con las fuentes');
  process.exit(1);
}

if (snapshot.projections.audit.summary.total_eventos !== 1) {
  console.error('La proyeccion auditiva no refleja el evento entregado');
  process.exit(1);
}

if (snapshot.projections.finance.summary.ventas_brutas !== 1500 || snapshot.projections.finance.summary.comisiones_nelly !== 225) {
  console.error('La proyeccion financiera no coincide');
  process.exit(1);
}

if (snapshot.projections.notification.summary.active !== 1) {
  console.error('La proyeccion de notificaciones no coincide');
  process.exit(1);
}

console.log('validate-operational-dashboard: OK');
