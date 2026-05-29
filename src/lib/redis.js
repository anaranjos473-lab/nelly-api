// src/lib/redis.js
import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL;
const REDIS_PREFIX = process.env.REDIS_PREFIX || 'nelly';
const REDIS_TTL_DEFAULT = parseInt(process.env.REDIS_TTL_DEFAULT || '300', 10);

if (!REDIS_URL) {
  throw new Error('FALTA variable crítica: REDIS_URL');
}

let client;
let isReady = false;

export function getRedisClient() {
  if (!client) {
    client = createClient({ url: REDIS_URL });
    client.on('error', err => {
      console.error('❌ Redis error:', err.message);
    });
    client.on('connect', () => {
      console.log('🔌 Redis conectado');
    });
    client.on('reconnecting', () => {
      console.warn('⏳ Redis reconectando...');
    });
    client.on('ready', () => {
      isReady = true;
      console.log('✅ Redis listo');
    });
    client.on('end', () => {
      isReady = false;
      console.warn('🔌 Redis desconectado');
    });
    client.connect().catch(err => {
      console.error('❌ Error conectando a Redis:', err.message);
    });
    // Graceful shutdown
    process.on('SIGINT', async () => {
      if (client) {
        await client.quit();
        console.log('🛑 Redis cerrado (SIGINT)');
        process.exit(0);
      }
    });
    process.on('SIGTERM', async () => {
      if (client) {
        await client.quit();
        console.log('🛑 Redis cerrado (SIGTERM)');
        process.exit(0);
      }
    });
  }
  return client;
}

export { REDIS_PREFIX, REDIS_TTL_DEFAULT };
