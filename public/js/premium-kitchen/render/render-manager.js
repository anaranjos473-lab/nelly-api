const renderState = {
  mounted: false,
  lastRenderAt: null,
  lastSystemHealth: null,
  lastCounters: null,
  lastOrderLists: null,
  lastOrderCards: null,
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

      const emptyStateHTML = (titulo, cuerpo) => `
        <div class="nelly-empty-state">
          <p class="nelly-empty-state__title">${titulo}</p>
          <p class="nelly-empty-state__body">${cuerpo}</p>
        </div>
      `;

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

      if (contenedorPendientes && counts.pendientes === 0) {
        contenedorPendientes.innerHTML = emptyStateHTML(
          'Sin pedidos en cocina',
          'Los pedidos nuevos apareceran aqui en cuanto lleguen desde la SSOT.'
        );
      }

      if (contenedorListo && counts.listo === 0) {
        contenedorListo.innerHTML = emptyStateHTML(
          'Nada listo por ahora',
          'Cuando cocina despache un pedido, esta columna mostrara la espera del repartidor.'
        );
      }

      if (contenedorReparto && counts.reparto === 0) {
        contenedorReparto.innerHTML = emptyStateHTML(
          'Sin pedidos en reparto',
          'Apareceran aqui los pedidos que ya fueron tomados por repartidores.'
        );
      }

      if (contenedorEntregados && counts.entregados === 0) {
        contenedorEntregados.innerHTML = emptyStateHTML(
          'Todavia sin entregados',
          'Los pedidos finalizados se moveran aqui para el corte operativo.'
        );
      }

      return renderState.lastOrderLists;
    },
    renderOrderCard(pedido = {}, id = '', esPendiente = false, helpers = {}) {
      const normalize = typeof helpers.normalizarEstado === 'function'
        ? helpers.normalizarEstado
        : (value) => String(value || '').trim().toUpperCase();
      const toPhase = typeof helpers.obtenerFasePanel === 'function'
        ? helpers.obtenerFasePanel
        : () => 'COCINA';

      const monto = Number(pedido.monto || pedido.total || 0);
      const displayId = pedido.shortId || pedido.id_pedido || String(id).substring(0, 8);
      const estadoNormalizado = normalize(pedido.estado);
      const fase = toPhase(estadoNormalizado);
      const esListo = estadoNormalizado === 'LISTO';
      const estadoLabel = esListo ? 'ESPERANDO REPARTIDOR' : estadoNormalizado;
      const tipoUbicacion = String(pedido.tipo_ubicacion || pedido.tipoUbicacion || '').trim();
      const metodoEntrega = String(pedido.metodo_entrega || pedido.metodoEntrega || '').trim();
      const referenciaUbicacion = String(pedido.referencia_ubicacion || pedido.referenciaUbicacion || '').trim();
      const notasUbicacion = String(pedido.notas_ubicacion || pedido.notasUbicacion || '').trim();
      const ubicacionHumanizada = [
        tipoUbicacion ? `Tipo: ${tipoUbicacion}` : '',
        metodoEntrega ? `Entrega: ${metodoEntrega}` : '',
        referenciaUbicacion ? `Referencia: ${referenciaUbicacion}` : '',
        notasUbicacion ? `Notas: ${notasUbicacion}` : ''
      ].filter(Boolean).join(' · ');
      const config = esPendiente || fase === 'COCINA'
        ? { texto: 'DESPACHAR', clase: 'btn-danger', funcion: `window.moverAReparto('${id}')`, disabled: false }
        : (esListo
          ? { texto: 'ESPERANDO REPARTIDOR', clase: 'btn-neutral', funcion: '', disabled: true }
          : { texto: 'ENTREGA COMPLETADA', clase: 'btn-success', funcion: `window.finalizarPedido('${id}')`, disabled: false });
      const botonAttrs = config.disabled
        ? 'disabled aria-disabled="true" title="Pedido listo para que lo acepte un repartidor"'
        : `onclick="${config.funcion}"`;

      const html = `
                <div class="nelly-pattern-card animate__animated animate__fadeIn">
                    <div class="nelly-pattern-card__meta">
                        <strong class="repartidor-mini__folio">#${displayId}</strong>
                        <span class="nelly-state nelly-state--empty">${estadoLabel}</span>
                    </div>
                    <p class="nelly-pattern-card__title">${pedido.cliente_nombre || pedido.cliente || 'Cliente'}</p>
                    <p class="nelly-pattern-card__body">${pedido.direccion ? `Direccion: ${pedido.direccion}` : 'Direccion no disponible'}</p>
                    ${ubicacionHumanizada ? `<p class="nelly-pattern-card__body">${ubicacionHumanizada}</p>` : ''}
                    <p class="nelly-pattern-card__body">${pedido.descripcion || 'Sin descripcion'}</p>
                    <p class="nelly-pattern-card__amount">$${monto.toFixed(2)}</p>
                    <button ${botonAttrs} class="nelly-btn ${config.clase}">
                        ${config.texto}
                    </button>
                </div>
            `;

      renderState.lastOrderCards = {
        id: String(id),
        fase,
        esPendiente: Boolean(esPendiente),
        at: Date.now()
      };

      return html;
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

