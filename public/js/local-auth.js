const AUTHORIZED_USERS = new Map([
  ['admin@nellydelivery.com', 'NellyS4Test123!'],
  ['operaciones@nellydelivery.com', 'NellyS4Test123!']
]);

const FIREBASE_API_KEY = 'AIzaSyAhHZvA2T-1xkIrCBpljgWPzDmynucT9_E';

const listeners = new Set();
let currentUser = null;

function emitAuthState() {
  for (const listener of listeners) {
    queueMicrotask(() => listener(currentUser));
  }
}

function makeUser(email, token) {
  return {
    email,
    async getIdToken() {
      return token;
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
    throw new Error(payload?.error || `HTTP ${response.status}`);
  }
  return payload.idToken;
}

export async function signInWithEmailAndPassword(_auth, email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const expectedPassword = AUTHORIZED_USERS.get(normalizedEmail);
  if (!expectedPassword || expectedPassword !== String(password || '')) {
    throw new Error('Credenciales invalidas');
  }

  const token = await createPanelToken(normalizedEmail);
  currentUser = makeUser(normalizedEmail, token);
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
