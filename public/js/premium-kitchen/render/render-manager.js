const renderState = {
  mounted: false,
  lastRenderAt: null,
  lastSystemHealth: null,
  lastCounters: null,
  lastOrderLists: null,
  lastTargets: {
    dashboard: null,
    kanban: null,
    orderDetail: null,
    alerts: null
  }
};

function updateRenderState(partial = {}) {
  Object.assign(renderState, partial);
  return renderState;
}

export function createRenderManager() {
  return {
    getState() {
      return renderState;
    },
    mount() {
      renderState.mounted = true;
      renderState.lastRenderAt = Date.now();
      return renderState;
    },
    unmount() {
      renderState.mounted = false;
      return renderState;
    },
    renderSystemHealth(state = {}) {
      renderState.lastSystemHealth = {
        ...state,
        at: Date.now()
      };

      const badge = document.getElementById('badge-estado');
      if (!badge) {
        return null;
      }

      const text = String(state.text || '').trim();
      if (text) {
        badge.textContent = text;
      }

      if (state.className) {
        badge.className = state.className;
      }

      if (typeof state.addClass === 'string' && state.addClass) {
        badge.classList.add(state.addClass);
      }

      if (Array.isArray(state.removeClasses)) {
        state.removeClasses.forEach((className) => {
          if (className) {
            badge.classList.remove(className);
          }
        });
      }

      return badge;
    },
    renderCounters(counters = {}) {
      renderState.lastCounters = {
        ...counters,
        at: Date.now()
      };

      const setText = (id, value) => {
        const node = document.getElementById(id);
        if (node) {
          node.innerText = String(value);
        }
      };

      setText('ganancias', `$${Number(counters.ganancias || 0).toFixed(2)}`);
      setText('count-pendientes', counters.pendientes ?? 0);
      setText('count-listo', counters.listo ?? 0);
      setText('count-reparto', counters.reparto ?? 0);
      setText('count-entregados', counters.entregados ?? 0);
      setText('contador', counters.total ?? 0);

      return renderState.lastCounters;
    },
    renderOrderLists({
      pedidosPendientes = new Map(),
      pedidosReparto = new Map(),
      pedidosEnCamino = new Map()
    } = {}, renderTarjeta) {
      const contenedorPendientes = document.getElementById('contenedor-pendientes');
      const contenedorListo = document.getElementById('contenedor-listo');
      const contenedorReparto = document.getElementById('contenedor-reparto');
      const contenedorEntregados = document.getElementById('contenedor-entregados');

      [contenedorPendientes, contenedorListo, contenedorReparto, contenedorEntregados].forEach((node) => {
        if (node) {
          node.innerHTML = '';
        }
      });

      const counts = {
        pendientes: 0,
        listo: 0,
        reparto: 0,
        entregados: 0
      };

      pedidosPendientes.forEach((pedido, id) => {
        const fase = String(pedido?.fase || pedido?.estado || '').trim().toUpperCase();
        const tarjeta = typeof renderTarjeta === 'function'
          ? renderTarjeta(pedido, id, true)
          : '';

        if (!tarjeta) {
          return;
        }

        if (fase === 'COCINA' && contenedorPendientes) {
          contenedorPendientes.insertAdjacentHTML('beforeend', tarjeta);
          counts.pendientes += 1;
          return;
        }

        if (fase === 'DESPACHO' && contenedorListo) {
          contenedorListo.insertAdjacentHTML('beforeend', tarjeta);
          counts.listo += 1;
          return;
        }

        if (fase === 'EN_REPARTO' && contenedorReparto) {
          contenedorReparto.insertAdjacentHTML('beforeend', tarjeta);
          counts.reparto += 1;
        }
      });

      pedidosReparto.forEach((pedido, id) => {
        if (pedidosPendientes.has(id)) {
          return;
        }
        if (contenedorListo && typeof renderTarjeta === 'function') {
          const tarjeta = renderTarjeta({ ...pedido, estado: 'LISTO' }, id, false);
          if (!tarjeta) {
            return;
          }
          contenedorListo.insertAdjacentHTML('beforeend', tarjeta);
          counts.listo += 1;
        }
      });

      pedidosEnCamino.forEach((pedido, id) => {
        if (pedidosPendientes.has(id) || pedidosReparto.has(id)) {
          return;
        }
        const estado = String(pedido?.estado || '').trim().toUpperCase();
        if (estado === 'ENTREGADO') {
          if (contenedorEntregados && typeof renderTarjeta === 'function') {
            const tarjeta = renderTarjeta({ ...pedido, estado }, id, false);
            if (!tarjeta) {
              return;
            }
            contenedorEntregados.insertAdjacentHTML('beforeend', tarjeta);
            counts.entregados += 1;
          }
          return;
        }

        if (contenedorReparto && typeof renderTarjeta === 'function') {
          const tarjeta = renderTarjeta({ ...pedido, estado }, id, false);
          if (!tarjeta) {
            return;
          }
          contenedorReparto.insertAdjacentHTML('beforeend', tarjeta);
          counts.reparto += 1;
        }
      });

      renderState.lastOrderLists = {
        ...counts,
        at: Date.now()
      };

      return renderState.lastOrderLists;
    },
    renderDashboard(target = null) {
      updateRenderState({
        lastRenderAt: Date.now(),
        lastTargets: {
          ...renderState.lastTargets,
          dashboard: target
        }
      });
      return null;
    },
    renderKanban(target = null) {
      updateRenderState({
        lastRenderAt: Date.now(),
        lastTargets: {
          ...renderState.lastTargets,
          kanban: target
        }
      });
      return null;
    },
    renderOrderDetail(target = null) {
      updateRenderState({
        lastRenderAt: Date.now(),
        lastTargets: {
          ...renderState.lastTargets,
          orderDetail: target
        }
      });
      return null;
    },
    renderAlerts(target = null) {
      updateRenderState({
        lastRenderAt: Date.now(),
        lastTargets: {
          ...renderState.lastTargets,
          alerts: target
        }
      });
      return null;
    }
  };
}

const renderManager = createRenderManager();

export function getRenderManager() {
  return renderManager;
}

export function renderDashboard(target = null) {
  return renderManager.renderDashboard(target);
}

export function renderKanban(target = null) {
  return renderManager.renderKanban(target);
}

export function renderOrderDetail(target = null) {
  return renderManager.renderOrderDetail(target);
}

export function renderAlerts(target = null) {
  return renderManager.renderAlerts(target);
}
