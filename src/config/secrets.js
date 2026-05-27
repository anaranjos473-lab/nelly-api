// src/config/secrets.js

function maskSecret(value) {
  if (!value) return '';
  if (value.length <= 8) return '****';
  return value.slice(0, 2) + '****' + value.slice(-2);
}

export function getFirebaseAdminConfig() {
  if (!process.env.FIREBASE_ADMIN_JSON) {
    throw new Error('FALTA variable crítica: FIREBASE_ADMIN_JSON');
  }
  let config;
  try {
    config = JSON.parse(process.env.FIREBASE_ADMIN_JSON);
  } catch (e) {
    throw new Error('FIREBASE_ADMIN_JSON inválido: ' + e.message);
  }
  // Nunca loggear private_key ni secretos completos
  console.log('FIREBASE_ADMIN_JSON cargado:', {
    client_email: maskSecret(config.client_email),
    project_id: config.project_id
  });
  return config;
}

export function validateCriticalSecrets() {
  const required = [
    'FIREBASE_ADMIN_JSON',
    'JWT_SECRET',
    'REDIS_URL',
    'GOOGLE_MAPS_API_KEY'
  ];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    missing.forEach(k => console.error('❌ FALTA variable crítica:', k));
    throw new Error('Startup abortado: faltan secretos críticos.');
  }
  console.log('✅ Validación de secretos críticos OK');
}
