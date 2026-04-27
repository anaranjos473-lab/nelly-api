const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Middleware de seguridad
function securityMiddleware(req, res, next) {
  const apiKey = req.header('x-api-key');
  const adminEmail = req.header('x-admin-email');
  if (!apiKey || !adminEmail) {
    return res.status(400).json({ error: 'Faltan headers de autenticación' });
  }
  if (apiKey !== process.env.ORDER_INGEST_API_KEY) {
    return res.status(403).json({ error: 'API Key inválida' });
  }
  // Validación adicional de email si aplica
  next();
}

router.use(securityMiddleware);

// Registro de usuarios de prueba
router.post('/users/register', async (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan parámetros obligatorios (email, password)' });
  }
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: displayName || email,
    });
    res.json({ uid: userRecord.uid, email: userRecord.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sentinel Boost
router.post('/sentinel/boost', async (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ error: 'Falta el ID del repartidor' });
  }
  try {
    await admin.firestore().collection('repartidores').doc(uid).update({ boost: true });
    res.json({ status: 'Boost aplicado', uid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sentinel Reasignar
router.post('/sentinel/reasignar', async (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).json({ error: 'Falta el ID del repartidor' });
  }
  try {
    await admin.firestore().collection('repartidores').doc(uid).update({ reasignar: true });
    res.json({ status: 'Reasignación disparada', uid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
