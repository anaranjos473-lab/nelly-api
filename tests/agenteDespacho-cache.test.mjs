import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const state = {
  pedidosListener: null,
  conductoresListener: null,
  conductoresRaw: {
    driver_a: { estado: 'DISPONIBLE', lat: 16.75, lng: -93.11 },
    driver_b: { estado: 'DISPONIBLE', lat: 16.74, lng: -93.12 }
  },
  conductoresOnceCount: 0,
  conductoresOnCount: 0,
  rootUpdates: [],
  workers: []
};

class WorkerMock {
  constructor(_path, options = {}) {
    this.workerData = options.workerData || {};
    this.handlers = {};
    this.terminated = false;
    state.workers.push(this);
  }

  on(event, handler) {
    this.handlers[event] = handler;
  }

  async emitMessage(message) {
    if (this.handlers.message) {
      await this.handlers.message(message);
    }
  }

  emitError(error) {
    if (this.handlers.error) {
      this.handlers.error(error);
    }
  }

  async terminate() {
    this.terminated = true;
  }
}

function buildSnapshot(value) {
  return {
    val: () => value
  };
}

function createRef(path = '') {
  if (path === 'conductores_activos') {
    return {
      once: async () => {
        state.conductoresOnceCount += 1;
        return buildSnapshot(state.conductoresRaw);
      },
      on: (event, handler) => {
        if (event === 'value') {
          state.conductoresOnCount += 1;
          state.conductoresListener = handler;
        }
      },
      off: () => {}
    };
  }

  if (path === 'pedidos') {
    const listener = {
      on: (event, handler) => {
        state.pedidosListener = state.pedidosListener || {};
        state.pedidosListener[event] = handler;
      },
      off: () => {}
    };
    listener.orderByChild = () => ({
      equalTo: () => listener
    });
    return listener;
  }

  return {
    update: async (payload) => {
      state.rootUpdates.push({ path, payload });
    },
    once: async () => buildSnapshot(null),
    on: () => {},
    off: () => {}
  };
}

function createAdminMock() {
  return {
    database: () => ({
      ref: (path = '') => createRef(path)
    })
  };
}

jest.unstable_mockModule('../config/firebase-admin-esm.js', () => ({
  getAdmin: async () => createAdminMock()
}));

jest.unstable_mockModule('worker_threads', () => ({
  Worker: WorkerMock
}));

const { iniciarAgenteDespacho, limpiarAgenteDespacho } = await import('../src/agentes/agenteDespacho.js');

beforeEach(() => {
  state.pedidosListener = null;
  state.conductoresListener = null;
  state.conductoresRaw = {
    driver_a: { estado: 'DISPONIBLE', lat: 16.75, lng: -93.11 },
    driver_b: { estado: 'DISPONIBLE', lat: 16.74, lng: -93.12 }
  };
  state.conductoresOnceCount = 0;
  state.conductoresOnCount = 0;
  state.rootUpdates = [];
  state.workers = [];
  limpiarAgenteDespacho();
});

function triggerPedido(id, pedidoOverrides = {}) {
  const handler = state.pedidosListener?.child_added;
  if (!handler) throw new Error('No se registró child_added');
  return handler({
    key: id,
    val: () => ({
      estado: 'PENDIENTE',
      latTienda: 16.75,
      lngTienda: -93.11,
      ...pedidoOverrides
    })
  });
}

describe('agenteDespacho caché reactiva', () => {
  it('registra una sola lectura inicial de conductores y reutiliza snapshot para varios pedidos', async () => {
    await iniciarAgenteDespacho();

    expect(state.conductoresOnceCount).toBe(1);
    expect(state.conductoresOnCount).toBe(1);

    await triggerPedido('pedido_1');
    await state.workers[0].emitMessage({ id: 'driver_a', distancia: 0.1 });

    await triggerPedido('pedido_2');
    await state.workers[1].emitMessage({ id: 'driver_b', distancia: 0.2 });

    expect(state.workers[0].workerData.revision).toBe(1);
    expect(state.workers[1].workerData.revision).toBe(1);
    expect(state.conductoresOnceCount).toBe(1);
    expect(state.rootUpdates).toHaveLength(2);
  });

  it('incrementa revision cuando cambian los conductores y usa el snapshot actualizado', async () => {
    await iniciarAgenteDespacho();
    await triggerPedido('pedido_1');
    await state.workers[0].emitMessage({ id: 'driver_a', distancia: 0.1 });

    expect(state.workers[0].workerData.revision).toBe(1);

    state.conductoresRaw = {
      driver_a: { estado: 'NO_DISPONIBLE', lat: 16.75, lng: -93.11 },
      driver_c: { estado: 'DISPONIBLE', lat: 16.73, lng: -93.1 }
    };
    await state.conductoresListener(buildSnapshot(state.conductoresRaw));
    await state.conductoresListener(buildSnapshot(state.conductoresRaw));

    await triggerPedido('pedido_2');
    await state.workers[1].emitMessage({ id: 'driver_c', distancia: 0.3 });

    expect(state.workers[1].workerData.revision).toBe(2);
    expect(state.workers[1].workerData.driversSnapshot).toEqual([
      { id: 'driver_a', estado: 'NO_DISPONIBLE', lat: 16.75, lng: -93.11 },
      { id: 'driver_c', estado: 'DISPONIBLE', lat: 16.73, lng: -93.1 }
    ]);
  });

  it('descarta un resultado obsoleto y hace un solo reintento', async () => {
    await iniciarAgenteDespacho();
    await triggerPedido('pedido_1');

    const worker1 = state.workers[0];
    state.conductoresRaw = {
      driver_a: { estado: 'DISPONIBLE', lat: 16.75, lng: -93.11 },
      driver_c: { estado: 'DISPONIBLE', lat: 16.73, lng: -93.1 }
    };
    await state.conductoresListener(buildSnapshot(state.conductoresRaw));
    await state.conductoresListener(buildSnapshot(state.conductoresRaw));

    await worker1.emitMessage({ id: 'driver_a', distancia: 0.1 });

    expect(worker1.terminated).toBe(true);
    expect(state.workers).toHaveLength(2);
    expect(state.workers[1].workerData.revision).toBe(2);

    await state.workers[1].emitMessage({ id: 'driver_c', distancia: 0.3 });

    expect(state.rootUpdates).toHaveLength(1);
    expect(state.rootUpdates[0].payload['pedidos/pedido_1'].conductorId).toBe('driver_c');
    expect(state.rootUpdates[0].payload['pedidos/pedido_1'].estado).toBe('EN_CURSO');
  });

  it('mantiene la escritura final de asignacion sin cambios', async () => {
    await iniciarAgenteDespacho();
    await triggerPedido('pedido_1');
    await state.workers[0].emitMessage({ id: 'driver_a', distancia: 0.1 });

    expect(state.rootUpdates).toHaveLength(1);
    expect(state.rootUpdates[0].payload['pedidos/pedido_1']).toMatchObject({
      conductorId: 'driver_a',
      estado: 'EN_CURSO'
    });
    expect(state.rootUpdates[0].payload['pedidos/pedido_1'].timestampActualizacion).toEqual(expect.any(Number));
  });
});
