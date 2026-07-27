// src/middlewares/rateLimiter.js
import rateLimit from 'express-rate-limit';

const isProductionLike = process.env.NODE_ENV === 'production' || Boolean(process.env.RENDER);
const defaultMax = isProductionLike ? 1500 : 5000;
const configuredMax = Number(process.env.RATE_LIMIT_MAX || defaultMax);
const configuredWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);

const limiter = rateLimit({
  windowMs: Number.isFinite(configuredWindowMs) && configuredWindowMs > 0
    ? configuredWindowMs
    : 15 * 60 * 1000,
  max: Number.isFinite(configuredMax) && configuredMax > 0
    ? configuredMax
    : defaultMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'Demasiadas peticiones, intenta más tarde.'
  }
});

export default limiter;
