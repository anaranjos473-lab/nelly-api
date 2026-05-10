// ...existing code...
import { getDatabase } from 'firebase-admin/database';
import { getFirestore } from 'firebase-admin/firestore';
// ...otros imports...


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
import { getFirebaseConfig } from './config/firebase-config.js';
import rateLimiter from './src/middlewares/rateLimiter.js';
import secureHeaders from './src/middlewares/secureHeaders.js';
import errorHandler from './src/middlewares/errorHandler.js';
import { iniciarAgenteDespacho } from './src/agentes/agenteDespacho.js';

import { iniciarAgenteSoporte } from './src/agentes/agenteSoporte.js';


import express from 'express';
const app = express();

// --- INICIALIZACIÓN DE AGENTES INTELIGENTES ---
iniciarAgenteDespacho();
// Si tienes agentes financieros o antifraude, inicialízalos aquí
// Inicializar agente de soporte (async)
void iniciarAgenteSoporte();

// --- BLOQUE DE RUTAS PRINCIPALES ---
// Rutas públicas explícitas (no requieren autenticación)
app.use('/api/public/firebase-config', (req, res, next) => next());
app.get('/api/salud', (req, res, next) => next());
app.get('/api/health', (req, res, next) => next());

// Rutas protegidas con autenticación (excepto en entorno de test)


// --- ENDPOINTS DE DIAGNÓSTICO ---

app.get('/api/diagnostico/conductores', async (req, res) => {
    try {
        await getAdmin();
        const rtdb = getDatabase();
        const snap = await rtdb.ref('conductores_activos').once('value');
        const conductores = snap.val() || {};
        res.json({ success: true, total: Object.keys(conductores).length, conductores });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


app.get('/api/diagnostico/pedidos', async (req, res) => {
    try {
        await getAdmin();
        const db = getFirestore();
        const snapshot = await db.collection('pedidos').get();
        const pedidos = [];
        snapshot.forEach(doc => {
            pedidos.push({ id: doc.id, ...doc.data() });
        });
        res.json({ success: true, total: pedidos.length, pedidos });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- AGENTE DE DESPACHO: Selección de mejor conductor usando worker ---
app.post('/api/despacho/mejor-conductor', async (req, res) => {
    try {
        const { origen, conductores } = req.body;
        if (!origen || !conductores) {
            return res.status(400).json({ success: false, error: 'Faltan datos requeridos: origen o conductores' });
        }
        const workerPath = path.resolve('src/agentes/workerDistancias.js');
        const worker = new Worker(workerPath, {
            workerData: { origen, conductores }
        });
        worker.once('message', (mejor) => {
            res.json({ success: true, mejor });
        });
        worker.once('error', (err) => {
            res.status(500).json({ success: false, error: 'Error en worker', detalle: err.message });
        });
        worker.once('exit', (code) => {
            if (code !== 0) {
                console.error('Worker salió con código', code);
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Error interno', detalle: err.message });
    }
});

// ...el resto del archivo permanece igual...
// --- AGENTE DE DESPACHO: Selección de mejor conductor usando worker ---
import { Worker } from 'worker_threads';
import path from 'path';

app.post('/api/despacho/mejor-conductor', async (req, res) => {
    try {
        const { origen, conductores } = req.body;
        if (!origen || !conductores) {
            return res.status(400).json({ success: false, error: 'Faltan datos requeridos: origen o conductores' });
        }
        const workerPath = path.resolve('src/agentes/workerDistancias.js');
        const worker = new Worker(workerPath, {
            workerData: { origen, conductores }
        });
        worker.once('message', (mejor) => {
            res.json({ success: true, mejor });
        });
        worker.once('error', (err) => {
            res.status(500).json({ success: false, error: 'Error en worker', detalle: err.message });
        });
        worker.once('exit', (code) => {
            if (code !== 0) {
                console.error('Worker salió con código', code);
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Error interno', detalle: err.message });
    }
});






// --- ENDPOINTS DE DIAGNÓSTICO (después de middlewares y rutas principales) ---
// Colocar después de middlewares y rutas principales

// ...existing code...

// Middlewares globales de seguridad
app.use(async (req, res, next) => { await getAdmin(); next(); });
app.use(rateLimiter);
app.use(secureHeaders);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- BLOQUE DE RUTAS PRINCIPALES ---
// ...rutas principales...

// --- ENDPOINTS DE DIAGNÓSTICO ---
app.get('/api/diagnostico/conductores', async (req, res) => {
    try {
        const rtdb = getDatabase();
        const snap = await rtdb.ref('conductores_activos').once('value');
        const conductores = snap.val() || {};
        res.json({ success: true, total: Object.keys(conductores).length, conductores });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/diagnostico/pedidos', async (req, res) => {
    try {
        const db = getFirestore();
        const snapshot = await db.collection('pedidos').get();
        const pedidos = [];
        snapshot.forEach(doc => {
            pedidos.push({ id: doc.id, ...doc.data() });
        });
        res.json({ success: true, total: pedidos.length, pedidos });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- BLOQUE DE RUTAS PRINCIPALES ---
// Rutas públicas explícitas (no requieren autenticación)
app.use('/api/public/firebase-config', (req, res, next) => next());
app.get('/api/salud', (req, res, next) => next());
app.get('/api/health', (req, res, next) => next());

// Rutas protegidas con autenticación (excepto en entorno de test)


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

// 3. Vinculación de rutas principales con robustez de errores

// Endpoint seguro para exponer config pública de Firebase (sin secretos)
app.get('/api/public/firebase-config', (req, res) => {
    // Solo expone campos públicos, nunca secretos ni admin keys
    const cfg = getFirebaseConfig();
    // Filtrar solo campos permitidos
    const safeCfg = {
        apiKey: cfg.apiKey,
        authDomain: cfg.authDomain,
        databaseURL: cfg.databaseURL,
        projectId: cfg.projectId,
        storageBucket: cfg.storageBucket,
        messagingSenderId: cfg.messagingSenderId,
        appId: cfg.appId,
        measurementId: cfg.measurementId
    };
    res.json(safeCfg);
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

// 3. Vinculación de rutas principales con robustez de errores
function wrapAsyncRoute(fn) {
    return function(req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(err => {
            console.error('[API ERROR]', req.originalUrl, err);
            res.status(500).json({ error: 'Error interno del servidor', detalle: err.message });
        });
    };
}

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

// =========================================================
// --- FIN DE RUTAS MOCKEADAS ---
// =========================================================

// --- VINCULACIÓN DE RUTAS DE API PRINCIPALES ---
app.use('/api/usuarios', usuariosRouter);
app.use('/api/ordenes', ordenesRouter);
app.use('/api/soporte', soporteRoutes);
app.use('/soporte', soporteRoutes);
app.use('/api/pedidos', pedidosRouter);
app.use('/api/repartidores', repartidoresRouter);
app.use('/api/zonas', zonasRouter);
app.use('/api/notificaciones', notificacionesRouter);
app.use('/api/admin', adminRouter);

// Manejador de errores 404 (Siempre debe ir al final de las rutas)
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.url} not found` });
});

// Middleware global de manejo de errores
app.use(errorHandler);

export default app;


// --- El arranque del servidor ahora solo se controla desde server.js ---