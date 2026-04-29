import { Router } from 'express';
import { createOrder, getOrders } from '../controllers/ordersController.js';
import { body } from 'express-validator';
import validateRequest from '../middlewares/validateRequest.js';
import authMiddleware from '../middlewares/authMiddleware.js';


const router = Router();

// Middleware condicional para entorno de test
const testBypassAuth = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') return next();
  return authMiddleware(req, res, next);
};

// Listado de órdenes (protegido, pero permite bypass en test)
router.get('/', testBypassAuth, getOrders);

// Crear orden (protegido, pero permite bypass en test)
router.post(
  '/',
  [
    body('userId').notEmpty().withMessage('El ID de usuario es obligatorio'),
    body('items')
      .isArray({ min: 1 })
      .withMessage('Debe incluir al menos un producto'),
    body('total')
      .isFloat({ gt: 0 })
      .withMessage('El total debe ser mayor a 0'),
  ],
  testBypassAuth,
  validateRequest,
  createOrder
);

// (Opcional: agregar los otros endpoints CRUD si lo deseas)

export default router;
