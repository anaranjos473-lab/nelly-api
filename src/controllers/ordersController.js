import { getAdmin } from '../../config/firebase-admin-esm.js';
import { buildCanonicalOrderRecord, buildPersistedOrderRecord } from '../services/orderCreationService.js';

export const getOrders = async (req, res) => {
  try {
    const admin = await getAdmin();
    const db = admin.database();
    const { page = 1, limit = 10, userId, minTotal } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const snapshot = await db.ref('pedidos').get();
    const allOrders = snapshot.exists() ? snapshot.val() : {};
    const orders = Object.entries(allOrders).map(([id, data]) => ({ id, ...(data || {}) }));

    const filtered = orders.filter((order) => {
      if (userId && order.userId !== userId) return false;
      if (minTotal && Number(order.total) < Number(minTotal)) return false;
      return true;
    });

    const paginated = filtered.slice(offset, offset + parseInt(limit));
    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      count: paginated.length,
      orders: paginated
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const admin = await getAdmin();
    const db = admin.database();
    const { userId, items, total } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ errors: [{ msg: 'Debe incluir al menos un producto' }] });
    }
    if (!userId || typeof total === 'undefined') {
      return res.status(400).json({ errors: [{ msg: 'Faltan campos obligatorios' }] });
    }

    const pedidosRef = db.ref('pedidos');
    const newPedidoRef = pedidosRef.push();
    const canonical = buildCanonicalOrderRecord({
      userId,
      items,
      total: Number(total),
      estado: 'CREADO'
    });

    if (!canonical.canonical.validation.ok) {
      return res.status(400).json({
        errors: canonical.canonical.validation.missing.map((field) => ({ msg: `Falta campo canónico: ${field}` }))
      });
    }

    const pedido = buildPersistedOrderRecord({
      id: newPedidoRef.key,
      input: {
        userId,
        items,
        total: Number(total),
        estado: 'CREADO'
      }
    });

    await newPedidoRef.set(pedido);
    res.status(201).json({
      id: newPedidoRef.key,
      ...pedido
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const admin = await getAdmin();
    const db = admin.database();
    const snapshot = await db.ref(`pedidos/${req.params.id}`).get();
    if (!snapshot.exists()) return res.status(404).json({ ok: false, error: 'Pedido no encontrado' });
    res.json({ order: { id: req.params.id, ...(snapshot.val() || {}) } });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const admin = await getAdmin();
    const db = admin.database();
    await db.ref(`pedidos/${req.params.id}`).update(req.body);
    res.json({ message: 'Pedido actualizado', id: req.params.id });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const admin = await getAdmin();
    const db = admin.database();
    await db.ref(`pedidos/${req.params.id}`).remove();
    res.json({ message: 'Pedido eliminado', id: req.params.id });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};
