const AUTHORIZED_USERS = new Map([
  ['admin@nellydelivery.com', 'NellyS4Test123!'],
  ['operaciones@nellydelivery.com', 'NellyS4Test123!']
]);

const listeners = new Set();
let currentUser = null;

const LOCAL_API_ORIGIN = window.location?.origin || 'http://127.0.0.1:3001';
const PROD_API_ORIGIN = 'https://nelly-api-8lh1.onrender.com';
const FIREBASE_WEB_API_KEY = 'AIzaSyAhHZvA2T-1xkIrCBpljgWPzDmynucT9_E';
const AUTH_API_ORIGIN = (() => {
  const configured = String(window.__NELLY_AUTH_API_ENDPOINT__ || '').trim().replace(/\/+$/, '');
  if (configured) return configured;
  const host = String(window.location?.hostname || '').toLowerCase();
  if (host === '127.0.0.1' || host === 'localhost' || host === '::1') {
    return LOCAL_API_ORIGIN;
  }
  return PROD_API_ORIGIN;
})();

function errorMessage(error, fallback = 'Error desconocido') {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === 'object') {
    return String(error.message || error.error?.message || error.error || fallback);
  }
  return String(error);
}

function emitAuthState() {
  for (const listener of listeners) {
    queueMicrotask(() => listener(currentUser));
  }
}

function makeUser(email, password, token) {
  return {
    email,
    password,
    async getIdToken() {
      return token || createPanelToken(email);
    }
  };
}

async function createPanelToken(email) {
  const url = new URL('/api/auth/panel-token', AUTH_API_ORIGIN);
  url.searchParams.set('uid', email);
  const response = await fetch(url.toString(), { method: 'GET' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.token) {
    throw new Error(errorMessage(payload?.error, `HTTP ${response.status}`));
  }
  return payload.token;
}

export async function signInWithEmailAndPassword(_auth, email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const expectedPassword = AUTHORIZED_USERS.get(normalizedEmail);
  if (!expectedPassword || expectedPassword !== String(password || '')) {
    throw new Error('Credenciales invalidas');
  }

  const token = await createPanelToken(normalizedEmail);
  currentUser = makeUser(normalizedEmail, password, token);
  emitAuthState();
  return { user: currentUser };
}

export async function signInWithCustomToken(_auth, token) {
  if (!token) {
    throw new Error('Token invalido');
  }

  currentUser = {
    token,
    async getIdToken() {
      return token;
    }
  };

  emitAuthState();
  return { user: currentUser };
}

export async function signOut(_auth) {
  currentUser = null;
  emitAuthState();
}

export function onAuthStateChanged(_auth, callback) {
  listeners.add(callback);
  queueMicrotask(() => callback(currentUser));
  return () => listeners.delete(callback);
}

export const auth = {
  get currentUser() {
    return currentUser;
  }
};

export const rtdb = {};

export function ref(_db, path) {
  return { path };
}

export function onValue(_reference, callback) {
  if (typeof callback === 'function') {
    queueMicrotask(() => callback({ exists: () => false, val: () => null }));
  }
  return () => {};
}

export function off() {
  return undefined;
}

export function onChildAdded(_reference, _callback) {
  return () => {};
}

export function onChildChanged(_reference, _callback) {
  return () => {};
}

export function onChildRemoved(_reference, _callback) {
  return () => {};
}

export function query(reference) {
  return reference;
}

export function orderByChild(path) {
  return { type: 'orderByChild', path };
}

export function equalTo(value) {
  return { type: 'equalTo', value };
}

export async function set(_reference, _value) {
  return undefined;
}

export async function update(_reference, _value) {
  return undefined;
}

export async function runTransaction(_reference, updater) {
  const currentValue = null;
  const nextValue = typeof updater === 'function' ? updater(currentValue) : currentValue;
  return {
    committed: nextValue !== undefined,
    snapshot: {
      val: () => nextValue
    }
  };
}

export function push(_reference) {
  return { key: `local-${Date.now()}` };
}
