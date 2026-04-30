
import { getAdmin } from '../../config/firebase-admin-esm.js';
import { generateToken } from '../utils/jwt.js';
let dbPromise = getAdmin().then(admin => admin.firestore());
// Login de usuario
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const db = await dbPromise;
    const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
    if (snapshot.empty) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }
    const userDoc = snapshot.docs[0];
    const user = userDoc.data();
    if (user.password !== password) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }
    // Generar token JWT
    const token = generateToken({ id: userDoc.id, email: user.email, name: user.name });
    res.json({ ok: true, token, user: { id: userDoc.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const db = await dbPromise;
    const { page = 1, limit = 10, name, email } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let query = db.collection('users');
    if (name) {
      query = query.where('name', '==', name);
    }
    if (email) {
      query = query.where('email', '==', email);
    }
    const snapshot = await query.get();
    let users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Simular paginación por offset
    const paginated = users.slice(offset, offset + parseInt(limit));
    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      count: paginated.length,
      users: paginated
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const db = await dbPromise;
    const { name, email, password } = req.body;
    const docRef = await db.collection('users').add({ name, email, password });
    res.status(201).json({ id: docRef.id, name, email });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const db = await dbPromise;
    const doc = await db.collection('users').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    res.json({ user: { id: doc.id, ...doc.data() } });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const db = await dbPromise;
    await db.collection('users').doc(req.params.id).update(req.body);
    res.json({ message: 'Usuario actualizado', id: req.params.id });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const db = await dbPromise;
    await db.collection('users').doc(req.params.id).delete();
    res.json({ message: 'Usuario eliminado', id: req.params.id });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};
