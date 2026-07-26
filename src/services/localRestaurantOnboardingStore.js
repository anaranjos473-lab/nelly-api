import fs from 'fs/promises';
import path from 'path';

const LOCAL_STORE_PATH = path.resolve(process.cwd(), '.codex-tmp', 'local-restaurant-onboarding.json');

async function ensureStoreFile() {
  try {
    await fs.mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
    await fs.access(LOCAL_STORE_PATH);
  } catch {
    await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify({ restaurantes: [] }, null, 2), 'utf8');
  }
}

export async function saveRestaurantOnboardingLocal(record) {
  await ensureStoreFile();
  const raw = await fs.readFile(LOCAL_STORE_PATH, 'utf8');
  let payload = { restaurantes: [] };
  try {
    payload = JSON.parse(raw);
  } catch {
    payload = { restaurantes: [] };
  }

  if (!Array.isArray(payload.restaurantes)) {
    payload.restaurantes = [];
  }

  payload.restaurantes.push(record);
  await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(payload, null, 2), 'utf8');
  return { store: 'local-file', path: LOCAL_STORE_PATH };
}

export async function listRestaurantOnboardingLocal() {
  await ensureStoreFile();
  const raw = await fs.readFile(LOCAL_STORE_PATH, 'utf8');
  try {
    const payload = JSON.parse(raw);
    return Array.isArray(payload.restaurantes) ? payload.restaurantes : [];
  } catch {
    return [];
  }
}

export { LOCAL_STORE_PATH };

export async function updateRestaurantOnboardingLocal(restaurantId, updates = {}) {
  await ensureStoreFile();
  const raw = await fs.readFile(LOCAL_STORE_PATH, 'utf8');
  let payload = { restaurantes: [] };
  try {
    payload = JSON.parse(raw);
  } catch {
    payload = { restaurantes: [] };
  }

  if (!Array.isArray(payload.restaurantes)) {
    payload.restaurantes = [];
  }

  const index = payload.restaurantes.findIndex((restaurant) => String(restaurant?.id || '') === String(restaurantId || ''));
  if (index < 0) {
    return null;
  }

  payload.restaurantes[index] = {
    ...payload.restaurantes[index],
    ...updates,
    actualizado_en: Date.now()
  };

  await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(payload, null, 2), 'utf8');
  return payload.restaurantes[index];
}
