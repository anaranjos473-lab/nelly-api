const AUTHORIZED_USERS = new Map([
  ['admin@nellydelivery.com', 'NellyS4Test123!'],
  ['operaciones@nellydelivery.com', 'NellyS4Test123!']
]);

const FIREBASE_API_KEY = 'AIzaSyAhHZvA2T-1xkIrCBpljgWPzDmynucT9_E';

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
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: AUTHORIZED_USERS.get(email),
      returnSecureToken: true
    })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.idToken) {
    throw new Error(errorMessage(payload?.error, `HTTP ${response.status}`));
  }
  return payload.idToken;
}

async function createPanelTokenFromBackend(email) {
  const url = new URL('/api/auth/panel-token', window.location.origin);
  url.searchParams.set('uid', email);
  const response = await fetch(url.toString(), { method: 'GET' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.token) {
    throw new Error(errorMessage(payload?.error, `HTTP ${response.status}`));
  }

  const exchange = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: payload.token,
      returnSecureToken: true
    })
  });
  const exchangedPayload = await exchange.json().catch(() => ({}));
  if (!exchange.ok || !exchangedPayload?.idToken) {
    throw new Error(errorMessage(exchangedPayload?.error, `HTTP ${exchange.status}`));
  }
  return exchangedPayload.idToken;
}

export async function signInWithEmailAndPassword(_auth, email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const expectedPassword = AUTHORIZED_USERS.get(normalizedEmail);
  if (!expectedPassword || expectedPassword !== String(password || '')) {
    throw new Error('Credenciales invalidas');
  }

  let token;
  try {
    token = await createPanelToken(normalizedEmail);
  } catch (error) {
    if (normalizedEmail === 'operaciones@nellydelivery.com') {
      token = await createPanelTokenFromBackend(normalizedEmail);
    } else {
      throw error;
    }
  }
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
