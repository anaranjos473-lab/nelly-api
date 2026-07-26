import express from 'express';
import cors from 'cors';
import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';
import usuariosRouter from './routes/usuarios.js';
import repartidoresRouter from './routes/repartidores.js';
import { getAdmin } from './config/firebase-admin-esm.js';
import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';
import deliveryRouter from './routes/delivery.js';
import pedidosRouter from './routes/pedidos.js';
import panelRouter from './routes/panel.js';
import zonasRouter from './routes/zonas.js';
import soporteRoutes from './routes/soporte.js';
import notificacionesRouter from './routes/notificaciones.js';
import ordenesRouter from './routes/ordenes.js';
import { getFirebaseConfig } from './config/firebase-config.js';
import rateLimiter from './src/middlewares/rateLimiter.js';
import secureHeaders from './src/middlewares/secureHeaders.js';
import errorHandler from './src/middlewares/errorHandler.js';
import { loadEnv, validateEnv } from './src/utils/envLoader.js';
import { validateCriticalSecrets } from './src/config/secrets.js';

// Cargar variables de entorno según NODE_ENV antes de validar secretos
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : (process.env.NODE_ENV === 'staging' ? '.env.staging' : '.env.local');
loadEnv(envFile);
validateEnv();
validateCriticalSecrets();

const app = express();
app.set('trust proxy', 1);
const runtimeStartedAt = new Date().toISOString();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
    origin: [
        'https://nelly-delivery.web.app',
        'http://localhost:3000',
        'http://localhost:5173'
    ],
    credentials: true
}));

app.use(secureHeaders);
app.use(rateLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Publica el contenido de `public/` por HTTP para que /panel.html y recursos asociados funcionen.
app.use(express.static('public'));

const panelAliases = {
    '/nellydelivery': '/os',
    '/nellydelivery/comercial': '/commerce',
    '/nellydelivery/operativo': '/control',
    '/nellydelivery/admin': '/admin',
    '/nellydelivery/crm': '/crm',
    '/nellydelivery/repartidor': '/driver',
    '/nellydelivery/panel': '/os',
    '/control': '/dashboard-operativo.html',
    '/commerce': '/dashboard-comercial.html',
    '/admin': '/admin-dashboard.html',
    '/crm': '/crm-basico.html',
    '/driver': '/repartidor.html',
    '/analytics': '/panel.html',
    '/developer': '/panel.html',
    '/tracking': '/seguimiento.html',
    '/cliente': '/seguimiento.html'
};

for (const [alias, target] of Object.entries(panelAliases)) {
    app.get(alias, (req, res) => {
        const queryString = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
        res.redirect(302, `${target}${queryString}`);
    });
}

app.get('/os', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'os.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'os.html'));
});

function isProduction() {
    return process.env.NODE_ENV === 'production';
}

async function requireDiagnosticAccess(req, res, next) {
    if (!isProduction()) {
        return next();
    }

    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) {
        return res.status(401).json({ success: false, error: 'Token requerido' });
    }

    try {
        const admin = await getAdmin();
        const decoded = await admin.auth().verifyIdToken(token);
        if (!decoded.admin) {
            return res.status(403).json({ success: false, error: 'Permisos insuficientes' });
        }
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Token invalido' });
    }
}

app.get('/api/salud', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'Servidor Activo',
        timestamp: new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
    });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'OK_TEST_20260620',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        pid: process.pid,
        runtime_started_at: runtimeStartedAt,
        port: process.env.PORT || 3001
    });
});

app.get('/api/public/firebase-config', (req, res) => {
    const cfg = getFirebaseConfig();
    res.json({
        apiKey: cfg.apiKey,
        authDomain: cfg.authDomain,
        databaseURL: cfg.databaseURL,
        projectId: cfg.projectId,
        storageBucket: cfg.storageBucket,
        messagingSenderId: cfg.messagingSenderId,
        appId: cfg.appId,
        measurementId: cfg.measurementId
    });
});

app.get('/api/debug', requireDiagnosticAccess, (req, res) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        }
    });
    res.status(200).json({ success: true, total: routes.length, routes });
});

app.get('/api/diagnostico/conductores', requireDiagnosticAccess, async (req, res, next) => {
    try {
        const admin = await getAdmin();
        const snap = await admin.database().ref('conductores_activos').once('value');
        const conductores = snap.val() || {};
        res.json({ success: true, total: Object.keys(conductores).length, conductores });
    } catch (error) {
        next(error);
    }
});

app.get('/api/diagnostico/pedidos', requireDiagnosticAccess, async (req, res, next) => {
    try {
        const admin = await getAdmin();
        const snapshot = await admin.database().ref('pedidos').once('value');
        const pedidosObj = snapshot.val() || {};
        const pedidos = Object.entries(pedidosObj).map(([id, pedido]) => ({ id, ...pedido }));
        res.json({ success: true, total: pedidos.length, pedidos });
    } catch (error) {
        next(error);
    }
});

app.post('/api/despacho/mejor-conductor', async (req, res, next) => {
    try {
        const { origen, conductores } = req.body;
        if (!origen || !conductores) {
            return res.status(400).json({ success: false, error: 'Faltan datos requeridos: origen o conductores' });
        }

        const workerPath = path.resolve('src/agentes/workerDistancias.js');
        const worker = new Worker(workerPath, { workerData: { origen, conductores } });

        worker.once('message', (mejor) => {
            res.json({ success: true, mejor });
        });
        worker.once('error', (error) => {
            if (!res.headersSent) {
                res.status(500).json({ success: false, error: 'Error en worker', detalle: error.message });
            }
        });
        worker.once('exit', (code) => {
            if (code !== 0) {
                console.error('Worker salio con codigo', code);
            }
        });
    } catch (error) {
        next(error);
    }
});

if (!isProduction()) {
    app.get('/api/admin/metricas/rentabilidad', (req, res) => {
        res.status(200).json([
            { nombre: 'Centro Historico', lat: 16.7527, lng: -93.1167, montoAcumulado: 4500 },
            { nombre: 'Zona Teran', lat: 16.7432, lng: -93.1678, montoAcumulado: 2100 },
            { nombre: 'Plaza Las Americas', lat: 16.7560, lng: -93.1415, montoAcumulado: 3200 }
        ]);
    });

    app.get('/api/admin/metricas/eficiencia', (req, res) => {
        res.status(200).json({
            entregasCompletadas: 145,
            tiempoPromedioMinutos: 18,
            repartidoresActivos: 4,
            cancelaciones: 2
        });
    });

    app.get('/api/repartidor/status/:uid', (req, res) => {
        res.status(200).json({
            success: true,
            uid: req.params.uid,
            disponible: true,
            bateria: 95,
            ultimaUbicacion: { lat: 16.7528, lng: -93.1167 },
            ultimaConexion: new Date().toISOString()
        });
    });
}

app.use('/api/usuarios', usuariosRouter);
app.use('/api/ordenes', ordenesRouter);
app.use('/api/auth', authRouter);
app.use('/api/delivery', deliveryRouter);
app.use('/api/panel', panelRouter);
app.use('/api/soporte', soporteRoutes);
app.use('/soporte', soporteRoutes);
app.use('/api/pedidos', pedidosRouter);
app.use('/api/repartidores', repartidoresRouter);
app.use('/api/drivers', repartidoresRouter);
app.use('/api/zonas', zonasRouter);
app.use('/api/notificaciones', notificacionesRouter);
app.use('/api/admin', adminRouter);

app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.url} not found` });
});

app.use(errorHandler);

// Auto-start server when run directly (not when imported)
const isRunningDirectly = import.meta.url === `file://${process.argv[1]}`;
if (isRunningDirectly && process.env.NODE_ENV !== 'test') {
  const { iniciarAgenteDespacho, limpiarAgenteDespacho } = await import('./src/agentes/agenteDespacho.js');
  const { iniciarAgenteFinanciero } = await import('./src/agentes/agenteTarifaDinamica.js');
  const { iniciarAgenteAntifraude } = await import('./src/agentes/agenteAntifraude.js');
  const { iniciarAgenteSoporte, limpiarAgenteSoporte } = await import('./src/agentes/agenteSoporte.js');
  
  try {
    await iniciarAgenteDespacho();
    await iniciarAgenteFinanciero();
    await iniciarAgenteAntifraude();
    await iniciarAgenteSoporte();
    console.log('✅ Runtime principal operando sin Firestore bridge');
    
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor de Nelly corriendo en el puerto ${PORT}`);
    });
    
    process.on('SIGINT', () => {
      limpiarAgenteDespacho();
      limpiarAgenteSoporte();
      process.exit(0);
    });
    process.on('SIGTERM', () => {
      limpiarAgenteDespacho();
      limpiarAgenteSoporte();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error inicializando agentes:', error.message);
    process.exit(1);
  }
}

export default app;
