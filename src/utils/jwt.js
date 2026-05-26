// src/utils/jwt.js
import jwt from 'jsonwebtoken';

function getSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET es obligatorio en production');
  }

  return 'test-only-secret';
}

export const generateToken = (payload) => {
  return jwt.sign(payload, getSecret(), { expiresIn: '1h' });
};

export const verifyToken = (token) => {
  return jwt.verify(token, getSecret());
};
