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
  next();
}

router.use(securityMiddleware);

// GET /zonas - Mapa de calor Tuxtla Gutiérrez
router.get('/zonas', async (req, res) => {
  try {
    const zonasSnap = await admin.firestore()
      .collection('zonas')
      .select('nombre', 'lat', 'lng', 'montoAcumulado')
      .limit(100)
      .get();
    const zonas = [];
    zonasSnap.forEach(doc => {
      const data = doc.data();
      zonas.push({
        nombre: data.nombre,
        lat: data.lat,
        lng: data.lng,
        montoAcumulado: data.montoAcumulado || 0
      });
    });
    res.json(zonas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
