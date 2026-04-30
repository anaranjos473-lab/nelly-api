import express from 'express';
import {
  getOrders,
  createOrder,
  getOrderById,
  updateOrder,
  deleteOrder
} from '../src/controllers/ordersController.js';

const router = express.Router();

// Crear orden
router.post('/', createOrder);
// Listar órdenes
router.get('/', getOrders);
// Obtener orden por ID
router.get('/:id', getOrderById);
// Actualizar orden
router.put('/:id', updateOrder);
// Eliminar orden
router.delete('/:id', deleteOrder);

export default router;
