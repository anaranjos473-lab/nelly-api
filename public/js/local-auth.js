const AUTHORIZED_USERS = new Map([
  ['admin@nellydelivery.com', 'NellyS4Test123!'],
  ['operaciones@nellydelivery.com', 'NellyS4Test123!']
]);

const listeners = new Set();
let currentUser = null;

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
      try {
        return await createPanelToken(email);
      } catch (error) {
        if (email === 'operaciones@nellydelivery.com') {
          return await createPanelTokenFromBackend(email);
        }
        if (token) {
          return token;
        }
        throw error;
      }
    }
  };
}

async function createPanelToken(email) {
  const url = new URL('/api/auth/panel-token', window.location.origin);
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

  let token;
  token = await createPanelToken(normalizedEmail);
  currentUser = makeUser(normalizedEmail, password, token);
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

export async function set(_reference, _value) {
  return undefined;
}

export async function update(_reference, _value) {
  return undefined;
}

export function push(_reference) {
  return { key: `local-${Date.now()}` };
}
