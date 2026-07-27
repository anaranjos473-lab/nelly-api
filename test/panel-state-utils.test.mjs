import {
  normalizarEstado,
  debeConservarEstadoAnterior,
  construirFilaEstadoVacio
} from '../public/js/premium-kitchen/panel-state-utils.mjs';

test('normaliza entregas y estados operativos de forma consistente', () => {
  expect(normalizarEstado('ENTREGADO')).toBe('ENTREGADO');
  expect(normalizarEstado('en_camino')).toBe('EN_CURSO');
  expect(normalizarEstado('LISTO')).toBe('LISTO');
  expect(normalizarEstado('pendiente_aceptacion')).toBe('LISTO');
});

test('conserva pedidos visibles cuando el snapshot nuevo viene vacio', () => {
  expect(debeConservarEstadoAnterior(null, { pendientes: 1, reparto: 0, enCamino: 0 })).toBe(true);
  expect(debeConservarEstadoAnterior({ ok: true }, { pendientes: 0, reparto: 0, enCamino: 0 })).toBe(false);
});

test('genera una fila vacia clara para el historial', () => {
  const html = construirFilaEstadoVacio('Sin ventas en este rango');
  expect(html).toMatch(/Sin ventas en este rango/);
  expect(html).toMatch(/colspan="5"/);
});
