import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 8080;
const ASSIGNMENT_URL = process.env.ASSIGNMENT_URL || 'http://assignment-service:3001';

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'gateway' });
});

app.use('/assignment', createProxyMiddleware({
  target: ASSIGNMENT_URL,
  changeOrigin: true,
  pathRewrite: { '^/assignment': '' }
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gateway escuchando en ${PORT}`);
});
