// Endpoint temporal para depuración: lista rutas montadas
app.get('/api/debug', (req, res) => {
    const rutas = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            rutas.push(middleware.route.path);
        } else if (middleware.name === 'router' && middleware.handle.stack) {
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    rutas.push(handler.route.path);
                }
            });
        }
    });
    res.json({ rutas });
});
import express from 'express';
// Asegúrate de que la ruta a firebase-admin.js sea correcta según tu estructura
import admin from './config/firebase-admin.js';
const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

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

// 2. AUDITORÍA DE CONEXIÓN
console.log('-------------------------------------------');
console.log('🔍 Agente: Iniciando chequeo de sistema...');

if (db) {
    console.log('✅ Agente: Base de datos vinculada y estructurada.');
} else {
    console.error('❌ Error Crítico: No se pudo conectar con Firebase.');
}

// 3. RUTA DE ÓRDENES (expuesta para el monitor y pruebas)
import adminRouter from './routes/admin.js';
import pedidosRouter from './routes/pedidos.js';
import repartidoresRouter from './routes/repartidores.js';
import zonasRouter from './routes/zonas.js';

// Vinculación de rutas principales
app.use('/api/admin', adminRouter);
app.use('/api/pedidos', pedidosRouter);
app.use('/api/repartidores', repartidoresRouter);
app.use('/api/zonas', zonasRouter);

// Manejador de errores 404 (al final)
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.url} not found` });
});

// 4. INICIO DEL SERVIDOR (Host 0.0.0.0 obligatorio para Render)
app.listen(PORT, '0.0.0.0', () => {
    console.log('-------------------------------------------');
    console.log(`📡 Servidor Activo: http://0.0.0.0:${PORT}`);
    console.log('-------------------------------------------');
});
