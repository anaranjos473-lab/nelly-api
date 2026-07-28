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

function toNumberSafe(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseMinutes(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.round(value));
  const match = String(value).match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return null;
  const parsed = Number(match[1].replace(',', '.'));
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : null;
}

function formatClockMinutes(minutes) {
  const total = Math.max(0, Math.round(toNumberSafe(minutes, 0)));
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function bucketForMinutes(minutes) {
  if (minutes === null) return { tone: 'neutral', label: 'Sin reloj' };
  if (minutes <= 2) return { tone: 'good', label: 'Nuevo' };
  if (minutes <= 5) return { tone: 'good', label: 'Verde' };
  if (minutes <= 8) return { tone: 'warn', label: 'Atención' };
  return { tone: 'danger', label: 'Riesgo' };
}

function getPedidoTimestamp(pedido = {}) {
  const candidate = pedido.createdAt
    || pedido.created_at
    || pedido.fecha_creacion
    || pedido.fecha_creado
    || pedido.timestamp
    || pedido.timestampCreacion
    || pedido.timestamp_creacion
    || pedido.fecha;
  const value = new Date(candidate || 0).getTime();
  return Number.isFinite(value) && value > 0 ? value : Date.now();
}

export function createRenderManager() {
  const resolvePhase = (pedido = {}) => {
    const estado = String(pedido?.fase || pedido?.fase_panel || pedido?.estado || '').trim().toUpperCase();
    if (estado === 'PENDIENTE' || estado === 'COCINA' || estado === 'CREADO' || estado === 'NUEVO') return 'COCINA';
    if (estado === 'LISTO' || estado === 'DESPACHO' || estado === 'PENDIENTE_ACEPTACION' || estado === 'LISTO_PARA_REPARTO' || estado === 'ESPERANDO_REPARTIDOR') return 'DESPACHO';
    if (estado === 'EN_CURSO' || estado === 'EN_REPARTO' || estado === 'EN_CAMINO' || estado === 'REPARTO' || estado === 'ASIGNADO') return 'EN_REPARTO';
    if (estado === 'ENTREGADO') return 'ENTREGADO';
    return estado || 'COCINA';
  };

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
      setText('kpi-nuevos', counters.nuevos ?? counters.pendientes ?? 0);
      setText('kpi-preparando', counters.listo ?? 0);
      setText('kpi-esperando', counters.reparto ?? 0);
      setText('kpi-tiempo-promedio', `${Number(counters.tiempoPromedio ?? 0).toFixed(0)} min`);
      setText('kpi-riesgo', counters.riesgo ?? 0);
      setText('kpi-antiguedad', counters.antiguedad ?? 0);
      setText('kpi-eta', `${Number(counters.eta ?? 0).toFixed(0)} min`);
      setText('kpi-visibles', counters.visibles ?? counters.total ?? 0);

      return renderState.lastCounters;
    },
    renderOrderLists({
      pedidosPendientes = new Map(),
      pedidosReparto = new Map(),
      pedidosEnCamino = new Map(),
      pedidosEntregados = new Map()
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

      const pedidosPendientesOrdenados = Array.from(pedidosPendientes.entries()).sort((a, b) => {
        const pedidoA = a[1] || {};
        const pedidoB = b[1] || {};
        const urgenciaA = toNumberSafe(pedidoA.urgencia || pedidoA.priority || pedidoA.prioridad, 0);
        const urgenciaB = toNumberSafe(pedidoB.urgencia || pedidoB.priority || pedidoB.prioridad, 0);
        if (urgenciaA !== urgenciaB) {
          return urgenciaB - urgenciaA;
        }
        return getPedidoTimestamp(pedidoA) - getPedidoTimestamp(pedidoB);
      });

      pedidosPendientesOrdenados.forEach(([id, pedido]) => {
        const fase = resolvePhase(pedido);
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
          const tarjeta = renderTarjeta({ ...pedido, estado: 'LISTO', fase: 'DESPACHO' }, id, false);
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
            const tarjeta = renderTarjeta({ ...pedido, estado, fase: 'ENTREGADO' }, id, false);
            if (!tarjeta) {
              return;
            }
            contenedorEntregados.insertAdjacentHTML('beforeend', tarjeta);
            counts.entregados += 1;
          }
          return;
        }

        if (contenedorReparto && typeof renderTarjeta === 'function') {
          const tarjeta = renderTarjeta({ ...pedido, estado, fase: 'EN_REPARTO' }, id, false);
          if (!tarjeta) {
            return;
          }
          contenedorReparto.insertAdjacentHTML('beforeend', tarjeta);
          counts.reparto += 1;
        }
      });

      pedidosEntregados.forEach((pedido, id) => {
        if (pedidosPendientes.has(id) || pedidosReparto.has(id) || pedidosEnCamino.has(id)) {
          return;
        }
        if (contenedorEntregados && typeof renderTarjeta === 'function') {
          const tarjeta = renderTarjeta({ ...pedido, estado: 'ENTREGADO', fase: 'ENTREGADO' }, id, false);
          if (!tarjeta) {
            return;
          }
          contenedorEntregados.insertAdjacentHTML('beforeend', tarjeta);
          counts.entregados += 1;
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
      const escapeHtml = (value = '') => String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

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
      const transcurridoMin = Math.max(0, Math.round((Date.now() - getPedidoTimestamp(pedido)) / 60000));
      const reloj = formatClockMinutes(transcurridoMin * 60);
      const bucket = bucketForMinutes(transcurridoMin);
      const etaRepartidor = parseMinutes(pedido.eta_repartidor || pedido.repartidor_eta || pedido.driver_eta || pedido.tiempo_eta);
      const repartidorNombre = String(
        pedido.repartidor_nombre ||
        pedido.conductor_nombre ||
        pedido.driver_name ||
        pedido.driver ||
        pedido.repartidor ||
        ''
      ).trim();
      const repartidorTexto = repartidorNombre
        ? `Repartidor asignado: ${repartidorNombre}${etaRepartidor !== null ? ` · Llegada estimada ${etaRepartidor} min` : ''}`
        : 'Buscando repartidor...';
      const riesgoCritico = transcurridoMin >= 12;
      const riesgoAlerta = transcurridoMin >= 8;
      const historialAcciones = Array.isArray(pedido.historico_acciones) && pedido.historico_acciones.length
        ? pedido.historico_acciones.slice(0, 4)
        : [
            { label: 'Pedido recibido', time: pedido.createdAt || pedido.created_at || pedido.fecha_creacion || null },
            { label: 'Preparación iniciada', time: pedido.timestampActualizacion || pedido.updatedAt || null },
            { label: estadoNormalizado === 'LISTO' ? 'Marcado listo' : 'En cocina', time: pedido.fecha_despacho || null },
            { label: estadoNormalizado === 'EN_CURSO' ? 'En reparto' : 'Esperando repartidor', time: pedido.eta_repartidor || pedido.repartidor_eta || null }
          ];
      const config = esPendiente || fase === 'COCINA'
        ? { texto: 'MARCAR LISTO', clase: 'btn-danger', funcion: `window.moverAReparto('${id}')`, disabled: false }
        : (esListo
          ? { texto: 'ESPERANDO REPARTIDOR', clase: 'btn-neutral', funcion: '', disabled: true }
          : { texto: 'ENTREGADO', clase: 'btn-success', funcion: `window.finalizarPedido('${id}')`, disabled: false });
      const botonAttrs = config.disabled
        ? 'disabled aria-disabled="true" title="Pedido listo para que lo acepte un repartidor"'
        : `onclick="${config.funcion}"`;

      const html = `
                <div class="nelly-pattern-card animate__animated animate__fadeIn ${riesgoCritico ? 'card-risk--critical' : (riesgoAlerta ? 'card-risk--warning' : '')}">
                    <div class="nelly-pattern-card__meta">
                        <strong class="repartidor-mini__folio">#${displayId}</strong>
                        <span class="nelly-state nelly-state--empty">${estadoLabel}</span>
                    </div>
                    <div class="card-clock card-clock--${bucket.tone}">
                        <span class="card-clock__time">${reloj}</span>
                        <span class="card-clock__tag">${bucket.label}</span>
                    </div>
                    <p class="nelly-pattern-card__title">${escapeHtml(pedido.cliente_nombre || pedido.cliente || 'Cliente')}</p>
                    <p class="nelly-pattern-card__body">${pedido.direccion ? `Direccion: ${escapeHtml(pedido.direccion)}` : 'Direccion no disponible'}</p>
                    ${ubicacionHumanizada ? `<p class="nelly-pattern-card__body">${escapeHtml(ubicacionHumanizada)}</p>` : ''}
                    <p class="nelly-pattern-card__body">${pedido.descripcion || 'Sin descripcion'}</p>
                    <p class="nelly-pattern-card__body">${repartidorTexto}</p>
                    <div class="card-history">
                        <span class="card-history__label">Historial de acciones</span>
                        <div class="card-history__items">
                            ${historialAcciones.map((item) => {
                              const fecha = item?.time ? new Date(item.time).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '—';
                              return `<div class="card-history__item"><span>${escapeHtml(item.label || 'Evento')}</span><span class="card-history__time">${fecha}</span></div>`;
                            }).join('')}
                        </div>
                    </div>
                    <p class="nelly-pattern-card__amount">${monto.toFixed(2)}</p>
                    <div class="nelly-card-actions">
                        <button ${botonAttrs} class="nelly-btn ${config.clase}">
                            ${config.texto}
                        </button>
                        <button onclick="window.reimprimirTicket('${id}')" class="nelly-btn nelly-btn--ghost">
                            Reimprimir ticket
                        </button>
                        <button onclick="window.verDetallePedido('${id}')" class="nelly-btn nelly-btn--ghost">
                            Ver detalle
                        </button>
                    </div>
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
