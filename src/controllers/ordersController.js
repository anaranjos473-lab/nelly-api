
import { getAdmin } from '../../config/firebase-admin-esm.js';
let dbPromise = getAdmin().then(admin => admin.firestore());

export const getOrders = async (req, res) => {
  try {
    const db = await dbPromise;
    const { page = 1, limit = 10, userId, minTotal } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let query = db.collection('orders');
    if (userId) {
      query = query.where('userId', '==', userId);
    }
    if (minTotal) {
      query = query.where('total', '>=', Number(minTotal));
    }
    const snapshot = await query.get();
    let orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Simular paginación por offset
    const paginated = orders.slice(offset, offset + parseInt(limit));
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
    const db = await dbPromise;
    const { userId, items, total } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ errors: [{ msg: 'Debe incluir al menos un producto' }] });
    }
    const docRef = await db.collection('orders').add({ userId, items, total });
    res.status(201).json({
      id: docRef.id,
      userId,
      items,
      total: Number(total)
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const db = await dbPromise;
    const doc = await db.collection('orders').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ ok: false, error: 'Pedido no encontrado' });
    res.json({ order: { id: doc.id, ...doc.data() } });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const db = await dbPromise;
    await db.collection('orders').doc(req.params.id).update(req.body);
    res.json({ message: 'Pedido actualizado', id: req.params.id });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const db = await dbPromise;
    await db.collection('orders').doc(req.params.id).delete();
    res.json({ message: 'Pedido eliminado', id: req.params.id });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};
