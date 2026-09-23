// src/middlewares/auth.js
import jwt from 'jsonwebtoken';

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET es obligatorio');
  }
  return process.env.JWT_SECRET;
}

export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'Token requerido' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'Token inválido' });
  }
};

export const generateToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '12h' });
};
