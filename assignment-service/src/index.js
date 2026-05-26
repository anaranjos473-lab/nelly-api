import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'assignment-service' });
});

app.post('/assign', (req, res) => {
  const { pedidoId, conductores = [] } = req.body || {};
  const seleccionado = conductores[0] || null;

  res.json({
    ok: true,
    pedidoId,
    conductorId: seleccionado?.id || seleccionado?.uid || null,
    conductor: seleccionado
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Assignment service escuchando en ${PORT}`);
});
