// src/middlewares/authMiddleware.js
import { verifyToken } from '../utils/jwt.js';

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ ok: false, message: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ ok: false, message: 'Token inválido o expirado' });
  }
}
