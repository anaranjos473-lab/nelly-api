// src/middlewares/rateLimiter.js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // aumentado a 500 para permitir el polling del dashboard
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'Demasiadas peticiones, intenta más tarde.'
  }
});

export default limiter;
