// src/middlewares/errorHandler.js
export default function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  res.status(500).json({ ok: false, error: err.message || 'Error interno del servidor' });
}
