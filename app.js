import express from 'express';
import { getAdmin } from './config/firebase-admin-esm.js';
import adminRouter from './routes/admin.js';
import pedidosRouter from './routes/pedidos.js';
import repartidoresRouter from './routes/repartidores.js';
import zonasRouter from './routes/zonas.js';
import { checkAuth } from './middlewares/authMiddleware.js';
import soporteRoutes from './routes/soporte.js';
import notificacionesRouter from './routes/notificaciones.js';
import usuariosRouter from './routes/usuarios.js';
import ordenesRouter from './routes/ordenes.js';

const app = express();
let db;

(async () => {
    const admin = await getAdmin();
    db = admin.firestore();
})();

app.use(express.json());

// ENDPOINT DE DEPURACIÓN DE RUTAS ACTIVAS (Temporal para diagnóstico)
app.get('/api/debug', (req, res) => {
    const rutasActivas = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            rutasActivas.push({ path: middleware.route.path });
        } else if (middleware.name === 'router') {
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    const basePath = middleware.regexp.toString().replace('/^\/', '/').replace('\/?(?=\/|$)/i', '');
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
app.use('/api/repartidores', repartidoresRouter);
app.use('/api/zonas', zonasRouter);
app.use('/soporte', soporteRoutes);
app.use('/api/notificaciones', notificacionesRouter);
app.use('/api/usuarios', usuariosRouter);

app.use('/api/ordenes', ordenesRouter);

// Ruta raíz / Health Check
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "🚀 Nelly API está en línea y operativa",
        version: "1.0.0"
    });
});

// Manejador de errores 404 (al final)
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
