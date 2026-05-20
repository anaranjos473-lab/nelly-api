// __mocks__/firebase-admin.js
let apps = [{ options: { databaseURL: 'https://mock.firebaseio.test' } }];
let mockOnceImpl = async () => ({ val: () => null });
const __setMockOnce = (fn) => { mockOnceImpl = fn; };
const mockFirestore = () => ({
  collection: () => ({
    where: () => ({
      limit: () => ({ get: async () => ({ empty: true, docs: [] }) }),
      get: async () => ({ empty: true, docs: [] }),
      onSnapshot: (cb) => {
        // Simula un snapshot vacío
        cb({
          docChanges: () => [],
          size: 0
        });
        // Devuelve función de unsuscribe
        return () => {};
      }
    }),
    add: async () => ({ id: 'mockId' }),
    doc: () => ({
      get: async () => ({ exists: false, data: () => ({}) }),
      update: async () => ({}),
      delete: async () => ({})
    })
  })
});

const mockDatabase = () => {
  return {
    ref: () => ({
      once: (...args) => mockOnceImpl(...args),
      set: async () => ({}),
      update: async () => ({}),
      get: async () => ({ exists: false, val: () => null })
    })
  };
};

const initializeApp = jest.fn((opts) => {
  // Si ya existe una app, no volver a inicializar ni lanzar error
  if (apps.length) {
    return apps[0];
  }
  apps.push({ name: '[DEFAULT]', options: { ...opts } });
  if (!apps[0].options.databaseURL) {
    apps[0].options.databaseURL = 'https://mock.firebaseio.test';
  }
  return apps[0];
});

const getApps = () => apps;

const mock = {
  initializeApp,
  credential: { cert: jest.fn() },
  apps,
  getApps,
  firestore: mockFirestore,
  database: mockDatabase,
  __setMockOnce,
};
module.exports = mock;
module.exports.default = mock;
