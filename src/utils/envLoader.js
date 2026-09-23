// src/utils/envLoader.js
import fs from 'fs';
import path from 'path';

function failFastIfMissing(vars) {
  const missing = Object.entries(vars).filter(([k, v]) => !v);
  if (missing.length) {
    missing.forEach(([k]) => {
      console.error(`❌ FALTA variable de entorno: ${k}`);
    });
    throw new Error('Faltan variables de entorno críticas. Deteniendo startup.');
  }
}

function hasFirebaseAdminCredentials() {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    process.env.FIREBASE_ADMIN_JSON ||
    (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    )
  );
}

export function loadEnv(envFile = '.env.local') {
  const envPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(line => {
      if (!line.trim() || line.startsWith('#')) return;
      const [key, ...rest] = line.split('=');
      process.env[key.trim()] = rest.join('=').trim();
    });
  }
}

export function validateEnv() {
  const required = {
    FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    RENDER_API_KEY: process.env.RENDER_API_KEY
  };
  failFastIfMissing(required);

  if (!hasFirebaseAdminCredentials()) {
    console.error('❌ FALTA credencial Firebase Admin compatible con el backend');
    throw new Error('Faltan credenciales compatibles de Firebase Admin. Deteniendo startup.');
  }

  // Report only configuration state; never expose any part of a secret in logs.
  Object.keys(required).forEach((key) => {
    console.log(`ENV ${key}: configured`);
  });
}
