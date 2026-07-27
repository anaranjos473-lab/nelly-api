import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizarEstado,
  debeConservarEstadoAnterior,
  construirFilaEstadoVacio
} from '../public/js/premium-kitchen/panel-state-utils.mjs';

test('normaliza entregas y estados operativos de forma consistente', () => {
  assert.equal(normalizarEstado('ENTREGADO'), 'ENTREGADO');
  assert.equal(normalizarEstado('en_camino'), 'EN_CURSO');
  assert.equal(normalizarEstado('LISTO'), 'LISTO');
  assert.equal(normalizarEstado('pendiente_aceptacion'), 'LISTO');
});

test('conserva pedidos visibles cuando el snapshot nuevo viene vacio', () => {
  assert.equal(debeConservarEstadoAnterior(null, { pendientes: 1, reparto: 0, enCamino: 0 }), true);
  assert.equal(debeConservarEstadoAnterior({ ok: true }, { pendientes: 0, reparto: 0, enCamino: 0 }), false);
});

test('genera una fila vacia clara para el historial', () => {
  const html = construirFilaEstadoVacio('Sin ventas en este rango');
  assert.match(html, /Sin ventas en este rango/);
  assert.match(html, /colspan="5"/);
});
