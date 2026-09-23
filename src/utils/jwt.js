// src/utils/jwt.js
import jwt from 'jsonwebtoken';

function getSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET es obligatorio');
  }
  return process.env.JWT_SECRET;
}

export const generateToken = (payload) => {
  return jwt.sign(payload, getSecret(), { expiresIn: '1h' });
};

export const verifyToken = (token) => {
  return jwt.verify(token, getSecret());
};
