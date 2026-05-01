import express from 'express';
// ... otros imports (cors, firebase-admin, etc.)
import usuariosRouter from './routes/usuarios.js';
import repartidoresRouter from './routes/repartidores.js';
import { getAdmin } from './config/firebase-admin-esm.js';
import adminRouter from './routes/admin.js';
import pedidosRouter from './routes/pedidos.js';
import zonasRouter from './routes/zonas.js';
import { checkAuth } from './middlewares/authMiddleware.js';
import soporteRoutes from './routes/soporte.js';
import notificacionesRouter from './routes/notificaciones.js';
import ordenesRouter from './routes/ordenes.js';

const app = express();
app.use(express.json()); // El servidor ya sabe leer datos
app.use(express.urlencoded({ extended: true }));

// --- BLOQUE DE RUTAS PRINCIPALES ---
app.use('/api/usuarios', usuariosRouter);
app.use('/api/repartidores', repartidoresRouter);

let db;
(async () => {
    const admin = await getAdmin();
    db = admin.firestore();
})();

// ENDPOINT DE DEPURACIÓN DE RUTAS ACTIVAS (Temporal para diagnóstico)
app.get('/api/debug', (req, res) => {
    const rutasActivas = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            rutasActivas.push({ path: middleware.route.path });
        } else if (middleware.name === 'router') {
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    const basePath = middleware.regexp.toString().replace('/^\\//', '/').replace('/\\/?(?=\\/|$)/i', '');
                    rutasActivas.push({
                        base: basePath,
                        endpoint: handler.route.path,
                        metodos: Object.keys(handler.route.methods)
                    });
                }
            });
        }
    });
    res.status(200).json({
        success: true,
        total_rutas_detectadas: rutasActivas.length,
        rutas: rutasActivas
    });
});

// 1. ENDPOINT DE SALUD (Prioridad Máxima)
app.get('/api/salud', (req, res) => {
    res.status(200).json({
        success: true,
        status: "Servidor Activo 🎉",
        timestamp: new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
    });
});

// Endpoint de health para compatibilidad con monitor
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 3. Vinculación de rutas principales
app.use('/api/admin', adminRouter);
app.use('/api/pedidos', checkAuth, pedidosRouter);
app.use('/api/zonas', zonasRouter);
app.use('/soporte', soporteRoutes);
app.use('/api/notificaciones', notificacionesRouter);
app.use('/api/ordenes', ordenesRouter);

// Ruta raíz (Health Check que ya tienes)
app.get('/', (req, res) => {
    res.send('🚀 Nelly API está en línea y operativa');
});

// =========================================================
// --- INICIO DE RUTAS MOCKEADAS PARA DASHBOARD ANDROID ---
// =========================================================

app.get('/api/admin/metricas/rentabilidad', (req, res) => {
  res.status(200).json([
    {"nombre": "Centro Histórico", "lat": 16.7527, "lng": -93.1167, "montoAcumulado": 4500},
    {"nombre": "Zona Terán", "lat": 16.7432, "lng": -93.1678, "montoAcumulado": 2100},
    {"nombre": "Plaza Las Américas", "lat": 16.7560, "lng": -93.1415, "montoAcumulado": 3200}
  ]);
});

app.get('/api/admin/metricas/eficiencia', (req, res) => {
  res.status(200).json({
    "entregasCompletadas": 145,
    "tiempoPromedioMinutos": 18,
    "repartidoresActivos": 4,
    "cancelaciones": 2
  });
});

app.get('/api/repartidor/status/:uid', (req, res) => {
  res.status(200).json({
    "success": true,
    "uid": req.params.uid,
    "disponible": true,
    "bateria": 95,
    "ultimaUbicacion": {"lat": 16.7528, "lng": -93.1167},
    "ultimaConexion": new Date().toISOString()
  });
});

// =========================================================
// --- FIN DE RUTAS MOCKEADAS ---
// =========================================================


// Manejador de errores 404 (Siempre debe ir al final de las rutas)
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.url} not found` });
});

export default app;

// --- AL FINAL DE TU ARCHIVO app.js ---
// Solo iniciamos el servidor si NO estamos corriendo pruebas con Jest
if (process.env.NODE_ENV !== 'test') {
    // Usamos el puerto dinámico de Render o el 3000 en local
    const PORT = process.env.PORT || 3000;
    // El '0.0.0.0' es vital para que Render pueda conectar el tráfico externo
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Servidor de Nelly Delivery listo y escuchando en el puerto ${PORT}`);
    });
}