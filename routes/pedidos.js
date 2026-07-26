import express from 'express';
import { getAdmin } from '../config/firebase-admin-esm.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Modulo de pedidos Nelly' });
});

router.get('/:pedidoId/seguimiento', async (req, res) => {
  try {
    const { pedidoId } = req.params;
    const admin = await getAdmin();
    const snap = await admin.database().ref(`pedidos/${pedidoId}`).once('value');
    const pedido = snap.val();

    if (!pedido) {
      return res.status(404).json({ ok: false, error: 'Pedido no encontrado' });
    }

    const estado = String(pedido.estado_pedido || pedido.estado || pedido.logistica?.estado || '').trim().toUpperCase();
    const creadoEn = pedido.createdAt || pedido.created_at || pedido.fecha_creacion || null;
    const despachadoEn = pedido.despachado_en || pedido.hora_cocina || null;
    const aceptadoEn = pedido.aceptado_en || null;
    const enRutaEn = pedido.timestampActualizacion || aceptadoEn || despachadoEn || null;
    const entregadoEn = pedido.entregado_en || pedido.finalizado_at || null;

    return res.json({
      ok: true,
      pedidoId,
      estado,
      estado_pedido: String(pedido.estado_pedido || pedido.estado || '').trim().toUpperCase(),
      actualizado_en: pedido.timestampActualizacion || pedido.finalizado_at || pedido.entregado_en || pedido.aceptado_en || pedido.createdAt || null,
      creado_en: creadoEn,
      despachado_en: despachadoEn,
      aceptado_en: aceptadoEn,
      en_ruta_en: enRutaEn,
      entregado_en: entregadoEn,
      repartidor_id: pedido.repartidor_id || pedido.conductorId || null,
      cliente_nombre: pedido.cliente_nombre || pedido.cliente?.nombre || pedido.cliente || null,
      logistica: {
        estado: pedido.logistica?.estado || null,
        fase_operativa: pedido.logistica?.fase_operativa || null
      },
      timeline: [
        { key: 'CREADO', label: 'Pedido recibido', done: true, time: creadoEn, message: 'Hemos recibido tu pedido.' },
        { key: 'LISTO', label: 'En preparación', done: ['LISTO', 'EN_CURSO', 'ENTREGADO'].includes(estado), time: despachadoEn, message: 'El restaurante lo está preparando.' },
        { key: 'EN_CURSO', label: 'Repartidor asignado', done: ['EN_CURSO', 'ENTREGADO'].includes(estado), time: aceptadoEn, message: 'Un repartidor aceptó tu pedido.' },
        { key: 'EN_RUTA', label: 'En camino', done: ['EN_CURSO', 'ENTREGADO'].includes(estado), time: enRutaEn, message: 'Tu pedido va en camino.' },
        { key: 'ENTREGADO', label: 'Entregado', done: estado === 'ENTREGADO', time: entregadoEn, message: '¡Disfruta tu comida!' }
      ]
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'No se pudo consultar el seguimiento', detalle: error.message });
  }
});

router.post('/reasignar', async (req, res) => {
  try {
    const { pedidoId, nuevoRepartidorId } = req.body;
    return res.json({ ok: true, mensaje: `Pedido reasignado a ${nuevoRepartidorId}`, pedidoId });
  } catch (e) {
    return res.status(500).json({ error: 'Error al reasignar', detalle: e.message });
  }
});

export default router;
