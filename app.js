import express from 'express';
import admin from './config/firebase-admin.js';
import adminRouter from './routes/admin.js';
import pedidosRouter from './routes/pedidos.js';
import repartidoresRouter from './routes/repartidores.js';
import zonasRouter from './routes/zonas.js';

const app = express();
const db = admin.firestore();
const PORT = process.env.PORT || 10000;

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
                    const basePath = middleware.regexp.toString().replace('/^\\/', '/').replace('\\/?(?=\\/|$)/i', '');
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

// 2. AUDITORÍA DE CONEXIÓN
console.log('-------------------------------------------');
console.log('🔍 Agente: Iniciando chequeo de sistema...');

if (db) {
    console.log('✅ Agente: Base de datos vinculada y estructurada.');
} else {
    console.error('❌ Error Crítico: No se pudo conectar con Firebase.');
}

// 3. Vinculación de rutas principales
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
