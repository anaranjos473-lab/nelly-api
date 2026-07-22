const renderState = {
  mounted: false,
  lastRenderAt: null,
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
