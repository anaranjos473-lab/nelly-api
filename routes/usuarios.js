
import express from 'express';
import { body } from 'express-validator';
import validateRequest from '../src/middlewares/validateRequest.js';
import authMiddleware from '../src/middlewares/authMiddleware.js';
import {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  loginUser
} from '../src/controllers/usersController.js';

const router = express.Router();

// Crear usuario con validación
router.post(
  '/',
  [
    body('email').isEmail().withMessage('Debe ser un email válido'),
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
  ],
  validateRequest,
  createUser
);
// Listar usuarios
router.get('/', authMiddleware, getUsers);
// Login
router.post('/login', loginUser);
// Obtener usuario por ID
router.get('/:id', authMiddleware, getUserById);
// Actualizar usuario
router.put('/:id', authMiddleware, updateUser);
// Eliminar usuario
router.delete('/:id', authMiddleware, deleteUser);

export default router;
