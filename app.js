// Endpoint de salud para monitoreo de Render y Nelly Admin
app.get('/api/salud', async (req, res) => {
    try {
        // Una consulta rápida a Firestore para validar la conexión real
        await db.collection('_health_check').doc('ping').set({ 
            last_check: new Date().toISOString() 
        });

        res.status(200).json({
            success: true,
            status: "Servidor Activo 🎉",
            infra: "Singleton Firebase Admin ✅",
            timestamp: new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: "Error de Conexión a Infraestructura ❌",
            error: error.message
        });
    }
});
// ==========================================
// NELLY DELIVERY - API CORE OPTIMIZED
// ==========================================
import express from 'express';
import cors from 'cors';
import { db } from './config/firebase-admin.js'; // Única instancia de BD necesaria
import zonesRouter from './routes/zonas.js';
import ordersRouter from './routes/pedidos.js';
import sentinelRouter from './routes/sentinel.js';
import adminRouter from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 10000;

// MIDDLEWARES
app.use(cors());
app.use(express.json());

// AUDITORÍA DE CONEXIÓN
console.log('🔍 Agente: Verificando vinculación de base de datos...');
if (db) {
    console.log('✅ Agente: Base de datos vinculada y estructurada.');
} else {
    console.error('❌ Error Crítico: No se pudo conectar con Firebase.');

import express from 'express';
import { db } from './config/firebase-admin.js';

const app = express();

// 1. VALIDACIÓN DE VARIABLES CRÍTICAS
const REQUIRED_VARS = ['FIREBASE_SERVICE_ACCOUNT', 'PORT', 'ZONA_TERAN_ID'];
REQUIRED_VARS.forEach(v => {
    if (!process.env[v]) {
        console.error(`❌ ERROR CRÍTICO: La variable ${v} no está definida en Render.`);
        process.exit(1); 
    }
});

// 2. GESTIÓN DE LISTENERS (Ejemplo con pedidos)
let unsubscribePedidos = null;

const iniciarMonitoreo = () => {
    unsubscribePedidos = db.collection('pedidos')
        .where('status', '==', 'pendiente')
        .onSnapshot(snapshot => {
            console.log(`🔔 Cambio detectado: ${snapshot.size} pedidos pendientes.`);
            // Tu lógica de Sentinel aquí
        }, error => {
            console.error("❌ Error en listener de Firebase:", error);
        });
};

iniciarMonitoreo();

// 3. CIERRE LIMPIO (Graceful Shutdown)
const cerrarSistema = async (signal) => {
    console.log(`\nFrenando Nelly Admin (Señal: ${signal})...`);
    if (unsubscribePedidos) {
        console.log("🔌 Desconectando listeners de Firebase...");
        unsubscribePedidos();
    }
    console.log("✅ Proceso finalizado limpiamente. ¡Hasta pronto, Alberto!");
    process.exit(0);
};

process.on('SIGTERM', () => cerrarSistema('SIGTERM'));
process.on('SIGINT', () => cerrarSistema('SIGINT'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Nelly API volando en puerto ${PORT}`));
app.use('/api/zonas', zonesRouter);
app.use('/api/pedidos', ordersRouter);
app.use('/api/sentinel', sentinelRouter);
app.use('/api/admin', adminRouter);

// ENDPOINT DE SALUD (Optimizado: Sin controladores redundantes)
app.get('/api/salud', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'Servidor Activo 🎉',
        timestamp: new Date().toISOString(),
        node_version: process.version
    });
});

// MANEJO DE RUTAS NO ENCONTRADAS (Prevención de 404 silenciosos)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        path: req.originalUrl
    });
});

// ARRANQUE DEL SISTEMA
app.listen(PORT, () => {
    console.log('-------------------------------------------');
    console.log(`📡 Servidor Activo en Puerto: ${PORT}`);
    console.log(`🚀 URL Principal: https://nelly-api-8lh1.onrender.com`);
    console.log('-------------------------------------------');
});

export default app;

// --- INICIALIZACIÓN DE FIREBASE ADMIN (FIRESTORE) ---
// const admin removed

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const dbFirestore = admin.firestore();
// --- FIN INICIALIZACIÓN FIREBASE ADMIN ---

// --- BLOQUES QUE DEPENDEN DE FIREBASE ---
function inicializarDependientesFirebase() {
    // Monitor de salud de Firebase
    if (firebaseAdminInitialized && db) {
        const dbStatusRef = db.ref(".info/connected");
        let huboConexionPrevia = false;
        dbStatusRef.on("value", (snap) => {
            if (snap.val() === true) {
                huboConexionPrevia = true;
                console.log("✅ Conectado a Firebase RTDB");
            } else {
                if (!huboConexionPrevia) {
                    console.log('ℹ️ Firebase RTDB aun no establece sesion inicial.');
                    return;
                }
                const msg = "Nelly perdió conexión con la base de datos.";
                console.error("🚨 ALERTA: " + msg);
                notificarAlertaConexion(msg);
            }
        });

        // Limpieza automática de pedidos de prueba al arrancar
        (async function limpiarPruebas() {
            try {
                console.log("🧹 Iniciando limpieza de pedidos de prueba...");
                const ref = db.ref('pedidos');
                const snapshot = await ref.once('value');
                snapshot.forEach((child) => {
                    if (child.key.startsWith('test_') || child.key.startsWith('AUTO_')) {
                        child.ref.remove();
                    }
                });
                console.log("✨ Base de datos limpia de logs de prueba.");
            } catch (e) {
                console.error("❌ Error limpiando pruebas:", e.message);
            }
        })();

        // Ejecución periódica del smoke test
        try {
            const cron = require('node-cron');
            cron.schedule('*/15 * * * *', () => {
                console.log('⏱️ Ejecutando smoke-test.js (cada 15 minutos)...');
                require('child_process').exec('node smoke-test.js', (err, stdout, stderr) => {
                    if (err) {
                        console.error('❌ Error ejecutando smoke-test.js:', err.message);
                    } else {
                        console.log(stdout);
                        if (stderr) console.error(stderr);
                    }
                });
            });
        } catch (e) {
            console.error('No se pudo cargar node-cron para el smoke test automático:', e.message);
        }

        // --- Watcher automático: mover pedidos de 'pendiente' a 'en_reparto' tras X minutos ---
        const MINUTOS_ESPERA = 5; // Cambia este valor según lo deseado
        const INTERVALO_MS = 60 * 1000; // 1 minuto
        setInterval(async () => {
            try {
                const ahora = Date.now();
                const ref = db.ref('pedidos');
                const snapshot = await ref.orderByChild('estado').equalTo('pendiente').once('value');
                snapshot.forEach((child) => {
                    const pedido = child.val();
                    if (!pedido || typeof pedido !== 'object') return;
                    const creado = pedido.timestamp || 0;
                    if (ahora - creado > MINUTOS_ESPERA * 60 * 1000) {
                        // Mover a en_reparto automáticamente
                        child.ref.update({
                            estado: 'en_reparto',
                            auto_despacho: true,
                            fecha_en_reparto: new Date().toISOString()
                        });
                        console.log(`🤖 Pedido ${child.key} movido a 'en_reparto' automáticamente tras ${MINUTOS_ESPERA} min.`);
                    }
                });
            } catch (e) {
                console.error('❌ Error en watcher auto-despacho:', e.message);
            }
        }, INTERVALO_MS);
    }
}
// (Eliminado: require duplicados y legacy)
let LIMITES_DEUDA_POR_NIVEL = Object.freeze({
    BRONCE: 300,
    PLATA: 500,
    ORO: 600,
    DIAMANTE: 900,
});
let registrarCobroEfectivoTx = async () => {
    throw new Error('debt-lock.service no disponible');
};
let registrarPagoDeudaTx = async () => {
    throw new Error('debt-lock.service no disponible');
};

// TODO: Migrar debt-lock.service a import si es necesario

const app = express();
// Montar rutas de monitoreo externo
// app.use('/api', require('./router.js')); // Migrar a import si es necesario

function requireOrderApiKey(req, res, next) {
    if (!ORDER_INGEST_API_KEY) {
        if (process.env.NODE_ENV === 'production') {
            return res.status(503).json({ error: 'ORDER_INGEST_API_KEY no configurada en servidor' });
        }
        return next();
    }

    const provided = String(req.headers['x-api-key'] || '').trim();
    if (!provided || provided !== ORDER_INGEST_API_KEY) {
        return res.status(401).json({ error: 'API key invalida' });
    }

    return next();
}

function normalizeOrigin(originValue) {
    return String(originValue || '').trim().replace(/\/$/, '').toLowerCase();
}

const PANEL_ALLOWED_ORIGIN = normalizeOrigin(process.env.PANEL_ALLOWED_ORIGIN || 'https://nelly-delivery.web.app');
const PANEL_LIQUIDACIONES_API_KEY = String(process.env.PANEL_LIQUIDACIONES_API_KEY || '').trim();
const PANEL_ADMIN_EMAILS = new Set(
    String(process.env.PANEL_ADMIN_EMAILS || 'admin@nellydelivery.com,operaciones@nellydelivery.com')
        .split(',')
        .map((email) => String(email || '').trim().toLowerCase())
        .filter(Boolean)
);
const ECOSYSTEM_VERSION = process.env.ECOSYSTEM_VERSION || '4.0.0-PRO';
const UMBRAL_ALERTA_PREVENTIVA_DIAMANTE = 800;
const COOLDOWN_ALERTA_PREVENTIVA_MS = 12 * 60 * 60 * 1000;
const LIMITE_DEUDA_POR_NIVEL = LIMITES_DEUDA_POR_NIVEL;

app.set('trust proxy', 1);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, false);
        }

        const normalizedOrigin = normalizeOrigin(origin);
        if (normalizedOrigin === PANEL_ALLOWED_ORIGIN) {
            return callback(null, true);
        }

        return callback(null, false);
    },
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    optionsSuccessStatus: 200
};

app.use('/api/auth', cors(corsOptions));
app.options('/api/auth/panel-token', cors(corsOptions));

const openCors = cors();
app.use((req, res, next) => {
    if (req.path.startsWith('/api/auth')) {
        return next();
    }
    return openCors(req, res, next);
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Demasiados intentos. Intenta mas tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const etaLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    message: { error: 'Demasiadas consultas de ETA. Intenta en unos segundos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.json());

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static('public'));

// --- CONFIGURACIONES ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
const resend = new Resend(process.env.RESEND_API_KEY); // 2. Inicialización de Resend
const googleMapsClient = new GoogleMapsClient({});


// --- CONFIGURACIÓN FIREBASE (Notificaciones) ---
try {
    // Migrar carga de credenciales a import dinámico si es necesario

    const firebaseDatabaseUrl = process.env.FIREBASE_DATABASE_URL || "https://nelly-delivery-default-rtdb.firebaseio.com";
    if (!process.env.FIREBASE_DATABASE_URL) {
        console.warn('⚠️ FIREBASE_DATABASE_URL no está configurada. En Render, fija esta variable de entorno al URL de tu proyecto Firebase RTDB.');
    }

    // admin.initializeApp({ ... }); // Migrar a import si es necesario
} catch (error) {
    console.error("❌ Error Crítico Firebase:", error.message);
    if (error.message && (error.message.includes('invalid_grant') || error.message.includes('Invalid JWT Signature'))) {
        console.error('⚠️ Verifica la clave de servicio de Firebase en nelly-admin.json o la variable FIREBASE_ADMIN_JSON.');
        console.error('   - Asegúrate de que el archivo no esté revocado.');
        console.error('   - Revisa que la clave JSON sea la correcta para el proyecto.');
        console.error('   - Si usas env var, valida que sea JSON válido o base64 válido.');
        console.error('   - Si el problema persiste, sincroniza el reloj del servidor.');
    }
}

// --- Verificación inmediata de Firebase Admin ---
const checkFirebase = async () => {
    if (!firebaseAdminInitialized) {
        console.error('❌ Firebase Admin no inicializado: omitiendo verificación.');
        return;
    }
    try {
        await admin.auth().listUsers(1);
        console.log('✅ Firebase Admin: Conexión verificada y activa');
    } catch (error) {
        console.error('❌ Error crítico en Firebase:', error.message);
    }
};
checkFirebase();

const requireFirebase = (res) => {
    if (!firebaseAdminInitialized) {
        res.status(500).json({ error: 'Firebase Admin no está inicializado. Revisa las credenciales de servicio.' });
        return false;
    }
    return true;
};

// --- MIDDLEWARE: VALIDACION DE IDENTIDAD DEL REPARTIDOR ---
const requireDriverAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (!idToken) {
        return res.status(401).json({ error: 'No se proporciono token' });
    }

    if (!firebaseAdminInitialized) {
        return res.status(503).json({ error: 'Firebase Admin no inicializado' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (decodedToken.driver === true || decodedToken.role === 'repartidor') {
            req.user = decodedToken;
            return next();
        }

        return res.status(403).json({ error: 'Acceso denegado: No es un perfil de repartidor' });
    } catch (error) {
        console.error('[AUTH ERROR Driver]:', error.message);
        return res.status(401).json({ error: 'Token invalido o expirado' });
    }
};

const requirePanelSessionAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (!idToken) {
        return res.status(401).json({ error: 'No se proporciono token' });
    }

    if (!firebaseAdminInitialized) {
        return res.status(503).json({ error: 'Firebase Admin no inicializado' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (decodedToken.admin === true || decodedToken.role === 'panel_cocina') {
            req.user = decodedToken;
            return next();
        }

        return res.status(403).json({ error: 'Acceso denegado: sesion de panel invalida' });
    } catch (error) {
        console.error('[AUTH ERROR Panel]:', error.message);
        return res.status(401).json({ error: 'Token invalido o expirado' });
    }
};

const requirePanelAdminEmailAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (!idToken) {
        return res.status(401).json({ error: 'No se proporciono token' });
    }

    if (!firebaseAdminInitialized) {
        return res.status(503).json({ error: 'Firebase Admin no inicializado' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const email = String(decodedToken.email || '').trim().toLowerCase();

        if (!email || !PANEL_ADMIN_EMAILS.has(email)) {
            return res.status(403).json({ error: 'Acceso denegado: correo no autorizado' });
        }

        req.user = decodedToken;
        return next();
    } catch (error) {
        console.error('[AUTH ERROR Panel Admin Email]:', error.message);
        return res.status(401).json({ error: 'Token invalido o expirado' });
    }
};

const requirePanelApiKey = (req, res, next) => {
    if (!PANEL_LIQUIDACIONES_API_KEY) {
        return next();
    }

    const provided = String(req.headers['x-panel-key'] || '').trim();
    if (!provided || provided !== PANEL_LIQUIDACIONES_API_KEY) {
        return res.status(401).json({ error: 'x-panel-key invalido' });
    }

    return next();
};

// --- LISTENER DE PEDIDOS (Panel de Cocina) ---
if (firebaseAdminInitialized) {
  const pedidosRef = db.ref('pedidos');

  pedidosRef.on('child_added', (snapshot) => {
      const nuevoPedido = snapshot.val();
      console.log("📦 Nuevo pedido recibido para cocina:", nuevoPedido);
      // Aquí puedes disparar la lógica para actualizar el panel.html
  });
} else {
  console.log('⚠️ Omitiendo listener de pedidos porque Firebase Admin no está inicializado.');
}

// --- KEEP-ALIVE: Script para mantener el servidor despierto en Render ---
const URL_DE_TU_API = process.env.RENDER_URL || 'https://nelly-api-8lh1.onrender.com'; // Base URL canónica para keep-alive

if (process.env.NODE_ENV === 'production') {
    setInterval(async () => {
        try {
            await axios.get(`${URL_DE_TU_API}/healthcheck`);
            console.log('📡 Keep-Alive: Ping enviado para evitar inactividad');
        } catch (err) {
            console.log('📡 Keep-Alive: Error en el ping, pero el servidor sigue intentando');
        }
    }, 14 * 60 * 1000); // 14 minutos en milisegundos
}

// --- MATEMÁTICAS (Haversine) ---
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
}

// --- VALIDACIÓN DE CORREO ELECTRÓNICO ---
function validarCorreo(email) { // eslint-disable-line no-unused-vars
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexCorreo.test(email);
}

// === ENDPOINT: Resumen Semanal Estratégico (solo canal privado, requiere API key panel) ===
app.post('/api/auditoria/resumen-semanal', requirePanelApiKey, async (req, res) => {
    if (!firebaseAdminInitialized) {
        return res.status(503).json({ error: 'Firebase Admin no inicializado' });
    }
    try {
        const LIMITE_DIAS = 7;
        const COMISION_PCT = 0.18;
        const ahora = Date.now();
        const limite = ahora - LIMITE_DIAS * 24 * 60 * 60 * 1000;
        // 1. Pedidos últimos 7 días
        const pedidosSnap = await db.ref('pedidos').once('value');
        const pedidosSemana = [];
        pedidosSnap.forEach(child => {
            const pedido = child.val();
            const fecha = pedido.fecha_finalizado || pedido.fecha_creacion || pedido.creado || 0;
            if (pedido.estado === 'entregado' && fecha >= limite) {
                pedidosSemana.push({ ...pedido, fecha });
            }
        });
        // 2. Masa financiera
        const totalVentas = pedidosSemana.reduce((acc, p) => acc + Number(p.monto || p.total || 0), 0);
        const comisionTotal = totalVentas * COMISION_PCT;
        // 3. Ranking repartidores
        const ranking = {};
        pedidosSemana.forEach(p => {
            const rep = p.repartidorUid || p.driverUid || 'SIN_UID';
            if (!ranking[rep]) ranking[rep] = { uid: rep, pedidos: 0, monto: 0 };
            ranking[rep].pedidos++;
            ranking[rep].monto += Number(p.monto || p.total || 0);
        });
        const rankingArr = Object.values(ranking).sort((a, b) => b.monto - a.monto);
        // 4. Deuda total
        const repSnap = await db.ref('repartidores').once('value');
        let deudaTotal = 0;
        repSnap.forEach(child => {
            deudaTotal += Number(child.val().deuda || 0);
        });
        // 5. Armar reporte
        const reporte = {
            periodo: 'Semana Actual',
            ingresos_brutos: totalVentas,
            comisiones_nelly: comisionTotal,
            top_performers: rankingArr.slice(0, 3),
            estado_deuda_calle: deudaTotal
        };
        // 6. Enviar solo a canal privado (Discord webhook)
        if (DISCORD_WEBHOOK_URL) {
            const content = `\n**Resumen Semanal Nelly**\n\n` +
                `Periodo: ${reporte.periodo}\n` +
                `Ingresos brutos: $${reporte.ingresos_brutos.toFixed(2)}\n` +
                `Comisiones Nelly (18%): $${reporte.comisiones_nelly.toFixed(2)}\n` +
                `Top repartidores:\n` +
                reporte.top_performers.map((r, i) => `${i + 1}. ${r.uid} · $${r.monto.toFixed(2)} · ${r.pedidos} pedidos`).join('\n') +
                `\nDeuda total en sistema: $${reporte.estado_deuda_calle.toFixed(2)}`;
            await axios.post(DISCORD_WEBHOOK_URL, { content });
        }
        // 7. Nunca exponer datos sensibles en respuesta
        res.json({ ok: true, enviado: true, resumen: 'Reporte semanal enviado a canal privado.' });
    } catch (e) {
        console.error('[AUDITORIA][RESUMEN_SEMANAL] Error:', e.message);
        res.status(500).json({ error: 'No se pudo generar el resumen semanal' });
    }
});

function esCoordenadaValida(lat, lng) {
    return Number.isFinite(lat)
        && Number.isFinite(lng)
        && lat >= -90
        && lat <= 90
        && lng >= -180
        && lng <= 180;
}

function distanciaMetrosHaversine(lat1, lng1, lat2, lng2) {
    const R = 6371e3;
    const p1 = lat1 * Math.PI / 180;
    const p2 = lat2 * Math.PI / 180;
    const dp = (lat2 - lat1) * Math.PI / 180;
    const dl = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function parseCoordInput(value) {
    if (typeof value === 'string') {
        const parts = value.split(',').map((p) => Number(p.trim()));
        if (parts.length === 2) {
            const [lat, lng] = parts;
            return esCoordenadaValida(lat, lng) ? { lat, lng } : null;
        }
        return null;
    }

    if (value && typeof value === 'object') {
        const lat = Number(value.lat ?? value.latitude);
        const lng = Number(value.lng ?? value.lon ?? value.longitude);
        return esCoordenadaValida(lat, lng) ? { lat, lng } : null;
    }

    return null;
}

function normalizarNivelRepartidor(nivelRaw) {
    const nivel = String(nivelRaw || 'BRONCE').trim().toUpperCase();
    if (Object.prototype.hasOwnProperty.call(LIMITE_DEUDA_POR_NIVEL, nivel)) {
        return nivel;
    }
    return 'BRONCE';
}

function numeroSeguro(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

async function enviarAlertaPreventivaDiamante(uid, deudaActual, limite) {
    if (!DISCORD_WEBHOOK_URL || !firebaseAdminInitialized) {
        return;
    }

    const alertaRef = db.ref(`repartidores/${uid}/alertas/deuda_diamante_800_at`);
    const snap = await alertaRef.once('value');
    const ultimaAlerta = numeroSeguro(snap.val(), 0);
    const ahora = Date.now();
    if (ahora - ultimaAlerta < COOLDOWN_ALERTA_PREVENTIVA_MS) {
        return;
    }

    const faltante = Math.max(0, limite - deudaActual);
    await axios.post(DISCORD_WEBHOOK_URL, {
        content: `⚠️ Atención: Repartidor ${uid} está a $${faltante.toFixed(2)} de su límite de crédito DIAMANTE.`
    });
    await alertaRef.set(ahora);
}

async function verificarCapacidadReparto(uid) {
    const snap = await db.ref(`repartidores/${uid}`).once('value');
    if (!snap.exists()) {
        return {
            permitir: false,
            mensaje: 'Perfil de repartidor no encontrado',
            nivel: null,
            deudaActual: null,
            limite: null
        };
    }

    const perfil = snap.val() || {};
    if (perfil.activo === false) {
        return {
            permitir: false,
            mensaje: 'Perfil de repartidor inactivo',
            nivel: null,
            deudaActual: null,
            limite: null
        };
    }

    // Motor de ascenso: se conserva la progresion historica y se sincroniza en estatus.
    const entregas = Number(perfil.entregas || 0);
    let nuevoNivel = normalizarNivelRepartidor(perfil?.estatus?.nivel || perfil.nivel);
    if (entregas >= 500 && nuevoNivel !== 'DIAMANTE') {
        nuevoNivel = 'DIAMANTE';
    } else if (entregas >= 150 && nuevoNivel !== 'ORO' && nuevoNivel !== 'DIAMANTE') {
        nuevoNivel = 'ORO';
    } else if (entregas >= 50 && nuevoNivel === 'BRONCE') {
        nuevoNivel = 'PLATA';
    }
    if (nuevoNivel !== perfil.nivel || nuevoNivel !== perfil?.estatus?.nivel) {
        await db.ref(`repartidores/${uid}`).update({
            nivel: nuevoNivel,
            estatus: {
                ...(perfil.estatus || {}),
                nivel: nuevoNivel,
            },
        });
        // (Opcional) Notificar ascenso por Discord
        if (DISCORD_WEBHOOK_URL) {
            await axios.post(DISCORD_WEBHOOK_URL, {
                content: `🎉 Repartidor ${uid} ascendió a nivel ${nuevoNivel} con ${entregas} entregas.`
            });
        }
    }

    const nivel = nuevoNivel;
    const limite = LIMITE_DEUDA_POR_NIVEL[nivel] || 300;
    const deudaActual = numeroSeguro(
        perfil?.finanzas?.deuda_actual,
        numeroSeguro(perfil?.billetera?.deuda_comision, 0)
    );
    const bloqueadoPorFlag = perfil?.estatus?.bloqueado_por_deuda === true || perfil?.perfil?.bloqueado_por_deuda === true;
    const excedeLimite = deudaActual > limite;
    const bloqueadoPorDeuda = bloqueadoPorFlag || excedeLimite;

    // Auto-healing del estado de bloqueo para mantener cliente, reglas y backend sincronizados.
    if ((perfil?.estatus?.bloqueado_por_deuda === true) !== bloqueadoPorDeuda
        || (perfil?.perfil?.bloqueado_por_deuda === true) !== bloqueadoPorDeuda
        || numeroSeguro(perfil?.finanzas?.limite_deuda, -1) !== limite) {
        await db.ref(`repartidores/${uid}`).update({
            estatus: {
                ...(perfil.estatus || {}),
                nivel,
                bloqueado_por_deuda: bloqueadoPorDeuda,
                actualizado_en: Date.now(),
            },
            perfil: {
                ...(perfil.perfil || {}),
                bloqueado_por_deuda: bloqueadoPorDeuda,
            },
            finanzas: {
                ...(perfil.finanzas || {}),
                deuda_actual: deudaActual,
                limite_deuda: limite,
            },
        });
    }

    if (nivel === 'DIAMANTE' && deudaActual >= UMBRAL_ALERTA_PREVENTIVA_DIAMANTE && deudaActual < limite) {
        try {
            await enviarAlertaPreventivaDiamante(uid, deudaActual, limite);
        } catch (error) {
            console.error('[DEUDA][ALERTA_PREVENTIVA_DIAMANTE] Error:', error.message);
        }
    }

    if (bloqueadoPorDeuda) {
        return {
            permitir: false,
            mensaje: 'Limite de deuda alcanzado. Favor de liquidar comisiones.',
            nivel,
            deudaActual,
            limite
        };
    }

    return {
        permitir: true,
        nivel,
        deudaActual,
        limite
    };
}

// === ENDPOINT: Heatmap de pedidos entregados en Tuxtla ===
app.get('/api/auditoria/heatmap-tuxtla', requirePanelApiKey, async (req, res) => {
    if (!firebaseAdminInitialized) {
        return res.status(503).json({ error: 'Firebase Admin no inicializado' });
    }
    try {
        // Coordenadas aproximadas de Tuxtla Gutiérrez
        const TUXTLA_BOUNDS = {
            minLat: 16.65,
            maxLat: 16.85,
            minLng: -93.25,
            maxLng: -93.05
        };
        const pedidosSnap = await db.ref('pedidos').once('value');
        const puntos = [];
        pedidosSnap.forEach(child => {
            const pedido = child.val();
            if (pedido.estado !== 'entregado') return;
            // Extraer lat/lng del cliente
            const lat = numeroSeguro(pedido.cliente_lat ?? pedido.lat_cliente ?? pedido.lat ?? pedido.latitude);
            const lng = numeroSeguro(pedido.cliente_lng ?? pedido.lng_cliente ?? pedido.lng ?? pedido.longitude ?? pedido.lon);
            if (!esCoordenadaValida(lat, lng)) return;
            if (lat < TUXTLA_BOUNDS.minLat || lat > TUXTLA_BOUNDS.maxLat || lng < TUXTLA_BOUNDS.minLng || lng > TUXTLA_BOUNDS.maxLng) return;
            puntos.push({ lat, lng });
        });
        res.json({ ok: true, puntos });
    } catch (e) {
        console.error('[HEATMAP][ERROR]:', e.message);
        res.status(500).json({ error: 'No se pudo generar el heatmap' });
    }
});

// --- RUTA 1: CHAT IA (Actualizado a GPT-4o-mini) ---
app.post('/chat', async (req, res) => {
  try {
    const { mensaje } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modelo más rápido y económico
      messages: [
        { role: "system", content: "Eres Nelly, la asistente de delivery más eficiente de Tuxtla. Amable y servicial." },
        { role: "user", content: mensaje }
      ],
    });
    res.send(completion.choices[0].message.content); 
  } catch (error) { res.status(500).send("Error chat"); }
});

// --- RUTA 2: COTIZAR ---
app.post('/api/pedidos/cotizar', async (req, res) => {
    try {
        const { latRestaurante, lonRestaurante, latCliente, lonCliente, subtotalComida, propina } = req.body;
        let distanciaKm = 3.0; 
        if(latRestaurante && latCliente) distanciaKm = calcularDistancia(latRestaurante, lonRestaurante, latCliente, lonCliente);
        
        const TARIFA_BASE = 16.50;      
        const PRECIO_POR_KM = 4.00;     
        const TARIFA_SERVICIO = 2.50;   
        
        const costoEnvio = TARIFA_BASE + (distanciaKm * PRECIO_POR_KM);
        const totalCliente = parseFloat(subtotalComida) + costoEnvio + TARIFA_SERVICIO + (parseFloat(propina) || 0);
        const gananciaRepartidor = costoEnvio + (parseFloat(propina) || 0);

        res.json({
            desglose: {
                distancia: distanciaKm.toFixed(2) + " km",
                costo_envio: costoEnvio.toFixed(2),
                tarifa_servicio: TARIFA_SERVICIO.toFixed(2),
                propina: propina || 0,
                total_pagar: totalCliente.toFixed(2)
            },
            backend_data: { ganancia_repartidor: gananciaRepartidor.toFixed(2) }
        });
    } catch (error) { res.status(500).json({ error: "Error cotizando" }); }
});

// --- RUTA 2.0: CREAR PEDIDO (SMOKE TEST / API) ---
app.post('/api/pedidos', requireOrderApiKey, async (req, res) => {
    if (!requireFirebase(res)) return;

    try {
        const payload = req.body || {};
        const baseId = payload.id_pedido || payload.id || `test_${Date.now()}`;
        const pedidoId = String(baseId).trim();

        if (!pedidoId) {
            return res.status(400).json({ error: 'id_pedido es requerido' });
        }

        const nuevoPedido = {
            id: pedidoId,
            id_pedido: pedidoId,
            cliente_nombre: payload.cliente_nombre || payload.cliente || 'Cliente Anonimo',
            descripcion: payload.descripcion || payload.items || 'Sin descripcion',
            monto: Number(payload.monto || payload.total || 0),
            estado: 'pendiente',
            timestamp: Date.now(),
            fecha_creacion: new Date().toISOString()
        };

        await db.ref(`pedidos/${pedidoId}`).set(nuevoPedido);
        console.log(`✅ Pedido inyectado con exito: ${pedidoId}`);

        return res.status(201).json({ mensaje: 'Pedido creado', data: nuevoPedido });
    } catch (error) {
        console.error('❌ Error en POST /api/pedidos:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// --- RUTA 2.1: PEDIDO LISTO ---
const handlePedidoListo = async (req, res) => {
    if (!requireFirebase(res)) return;

    const { pedidoId, restauranteId, mensaje } = req.body;
    if (!pedidoId || !restauranteId) {
        return res.status(400).json({ error: 'pedidoId y restauranteId son requeridos' });
    }

    try {
        const pedidoRef = db.ref(`pedidos/${restauranteId}/${pedidoId}`);
        const snapshot = await pedidoRef.once('value');

        if (!snapshot.exists()) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        await pedidoRef.update({
            estado: 'Listo',
            mensaje_listo: mensaje || 'Pedido listo para entrega',
            fecha_listo: new Date().toISOString()
        });

        console.log(`✅ Pedido ${pedidoId} marcado como Listo en restaurante ${restauranteId}`);
        return res.json({ ok: true, pedidoId, restauranteId });
    } catch (error) {
        console.error('Error al marcar pedido listo:', error);
        return res.status(500).json({ error: 'Error al procesar pedido listo' });
    }
};

app.post('/api/pedidos/listo', handlePedidoListo);
app.post('/pedido-listo', handlePedidoListo);

// --- RUTA 2.2: ENVIAR NOTIFICACIÓN FCM DE PEDIDO LISTO ---
app.post('/api/pedidos/notificar-listo', async (req, res) => {
    if (!requireFirebase(res)) return;

    const { deviceToken, pedidoId, restauranteId } = req.body;
    if (!deviceToken || !pedidoId || !restauranteId) {
        return res.status(400).json({ error: 'deviceToken, pedidoId y restauranteId son requeridos' });
    }

    try {
        const message = {
            token: deviceToken,
            notification: {
                title: 'Pedido listo',
                body: `Tu pedido #${pedidoId} ya está listo para entrega`
            },
            data: {
                pedidoId,
                restauranteId,
                estado: 'Listo',
                mensaje: 'Pedido listo para entrega'
            }
        };

        // Añadir channelId para Android
        message.android = {
            notification: {
                channelId: 'alertas_criticas'
            }
        };

        await admin.messaging().send(message);
        console.log(`🔔 Notificación FCM enviada para pedido ${pedidoId} (con channelId 'alertas_criticas')`);
        return res.json({ ok: true, pedidoId });
    } catch (error) {
        console.error('Error enviando notificación FCM:', error);
        return res.status(500).json({ error: 'No se pudo enviar la notificación' });
    }
});

// --- RUTA 3: GENERAR PAGO ---
app.post('/pago/generar', async (req, res) => {
  try {
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [{ title: req.body.titulo || 'Pedido Nelly', quantity: 1, unit_price: Number(req.body.precio) || 150, currency_id: "MXN" }],
        notification_url: `${URL_DE_TU_API}/webhook`, 
        back_urls: { success: `${URL_DE_TU_API}/success` },
        auto_return: "approved",
      }
    });
    res.json({ link: result.init_point }); 
  } catch (error) { res.status(500).json({ error: "Error pago", detalle: error.message }); }
});

// --- RUTA 4: EL WEBHOOK (Con Resend y Notificaciones) ---
app.post('/webhook', async (req, res) => {
    const { type, data } = req.body;
    if (type !== 'payment') return res.sendStatus(200);
    if (!requireFirebase(res)) return;

    try {
        const payment = new Payment(client);
        const infoPago = await payment.get({ id: data.id });
        
        if (infoPago.status === 'approved') {
            const monto = infoPago.transaction_amount;
            const emailCliente = infoPago.payer?.email || 'cliente@ejemplo.com';
            console.log(`💰 PAGO APROBADO: $${monto} de ${emailCliente}`);

            // 1. Registro en Firebase
            try {
                await admin.database().ref(`pagos_confirmados/${data.id}`).set({
                    monto: monto,
                    email: emailCliente,
                    fecha: new Date().toISOString(),
                    status: 'approved'
                });
            } catch (e) { console.error("Error en DB:", e.message); }

            // 2. Enviar Correo con Resend
            try {
                await resend.emails.send({
                    from: 'Nelly Delivery <onboarding@resend.dev>',
                    to: emailCliente,
                    subject: '¡Tu pedido en Nelly está en camino! 🛵',
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #2ecc71;">¡Gracias por tu compra!</h2>
                            <p>Hemos recibido tu pago de <strong>$${monto} MXN</strong>.</p>
                            <p><strong>Folio:</strong> #${data.id}</p>
                            <p>Nelly ya está coordinando con el repartidor. ¡Buen provecho!</p>
                        </div>
                    `
                });
                console.log("📧 Correo enviado a:", emailCliente);
            } catch (mailError) { console.error("❌ Error correo:", mailError.message); }

            // 3. Notificar al repartidor
                if (!firebaseAdminInitialized) {
                console.warn('⚠️ Firebase Admin no inicializado, no se enviará notificación al repartidor.');
            } else {
                const snapshot = await db.ref(`repartidores/driver_123/fcm_token`).once('value');
                const fcmToken = snapshot.val();

                if (fcmToken) {
                    const mensaje = {
                        notification: { title: '¡PAGO RECIBIDO! 🤑', body: `Nuevo pedido por $${monto}. ¡A rodar!` },
                        android: {
                            notification: {
                                channelId: 'alertas_criticas'
                            }
                        },
                        token: fcmToken
                    };
                    await admin.messaging().send(mensaje);
                    console.log("🔔 Notificación enviada (con channelId 'alertas_criticas')");
                }
            }
        }
        res.sendStatus(200); 
    } catch (error) {
        console.error("❌ Error en webhook:", error.message);
        res.sendStatus(500);
    }
});

// --- ENDPOINT: ACTUALIZACION DE UBICACION GPS ---
app.post('/api/delivery/update-location', requireDriverAuth, async (req, res) => {
    if (!requireFirebase(res)) return;

    const { lat, lng, pedidoId } = req.body;
    const uid = req.user.uid;
    const updatedAt = Date.now();

    if (
        typeof lat !== 'number' ||
        lat < -90 ||
        lat > 90 ||
        typeof lng !== 'number' ||
        lng < -180 ||
        lng > 180
    ) {
        return res.status(400).json({ error: 'Coordenadas invalidas' });
    }

    try {
        const updates = {};
        updates[`repartidores/${uid}/currentLocation`] = { lat, lng, updatedAt };

        if (pedidoId) {
            updates[`pedidos_en_camino/${pedidoId}/driverLocation`] = {
                lat,
                lng,
                driverUid: uid,
                updatedAt
            };
        }

        await db.ref().update(updates);
        return res.status(200).json({ status: 'Location updated' });
    } catch (error) {
        console.error('[DB ERROR Location]:', error.message);
        return res.status(500).json({ error: 'Error al escribir en base de datos' });
    }
});

// --- ENDPOINT: REGISTRAR COBRO EN EFECTIVO (TX ATOMICA + BLOQUEO REALTIME) ---
app.post('/api/delivery/finanzas/registrar-cobro-efectivo', requireDriverAuth, async (req, res) => {
    if (!requireFirebase(res)) return;

    const uid = req.user.uid;
    const montoEfectivo = Number(req.body?.monto_efectivo);
    const pedidoId = String(req.body?.pedidoId || '').trim() || null;

    if (!Number.isFinite(montoEfectivo) || montoEfectivo <= 0) {
        return res.status(400).json({ error: 'monto_efectivo debe ser un numero mayor a cero' });
    }

    try {
        const finanzas = await registrarCobroEfectivoTx(db, {
            uid,
            montoEfectivo,
            pedidoId,
            origen: 'driver_app',
        });

        return res.status(200).json({
            ok: true,
            uid,
            nivel: finanzas.nivel,
            deudaActual: finanzas.deudaActual,
            limiteDeuda: finanzas.limiteDeuda,
            saldoGanancias: finanzas.saldoGanancias,
            bloqueadoPorDeuda: finanzas.bloqueadoPorDeuda,
            mensaje: finanzas.bloqueadoPorDeuda
                ? 'Bloqueo por deuda aplicado automaticamente'
                : 'Cobro registrado correctamente',
        });
    } catch (error) {
        console.error('[FINANZAS][COBRO_EFECTIVO] Error:', error.message);
        return res.status(500).json({ error: 'No se pudo registrar el cobro en efectivo' });
    }
});

// --- ENDPOINT: REGISTRAR LIQUIDACION/PAGO DE DEUDA (TX ATOMICA) ---
app.post('/api/panel/finanzas/registrar-pago-deuda', requirePanelSessionAuth, async (req, res) => {
    if (!requireFirebase(res)) return;

    const uid = String(req.body?.uid || '').trim();
    const montoPago = Number(req.body?.monto_pago);

    if (!uid) {
        return res.status(400).json({ error: 'uid es requerido' });
    }

    if (!Number.isFinite(montoPago) || montoPago <= 0) {
        return res.status(400).json({ error: 'monto_pago debe ser un numero mayor a cero' });
    }

    try {
        const finanzas = await registrarPagoDeudaTx(db, {
            uid,
            montoPago,
            origen: 'panel_cocina',
        });

        return res.status(200).json({
            ok: true,
            uid,
            nivel: finanzas.nivel,
            deudaActual: finanzas.deudaActual,
            limiteDeuda: finanzas.limiteDeuda,
            saldoGanancias: finanzas.saldoGanancias,
            bloqueadoPorDeuda: finanzas.bloqueadoPorDeuda,
            mensaje: finanzas.bloqueadoPorDeuda
                ? 'Pago aplicado, pero el repartidor sigue bloqueado por deuda'
                : 'Pago aplicado y repartidor habilitado para nuevos pedidos',
        });
    } catch (error) {
        console.error('[FINANZAS][PAGO_DEUDA] Error:', error.message);
        return res.status(500).json({ error: 'No se pudo registrar el pago de deuda' });
    }
});

// --- ENDPOINT: BLOQUEO MANUAL DE REPARTIDOR (PANEL ADMIN WEB) ---
app.get('/api/admin/repartidores', requirePanelAdminEmailAuth, async (req, res) => {
    if (!requireFirebase(res)) return;

    try {
        const [usuariosSnap, repartidoresSnap] = await Promise.all([
            db.ref('usuarios/repartidores').once('value'),
            db.ref('repartidores').once('value'),
        ]);

        const usuarios = usuariosSnap.val();
        const repartidores = repartidoresSnap.val();
        const source = usuarios && typeof usuarios === 'object' && Object.keys(usuarios).length > 0
            ? 'usuarios/repartidores'
            : 'repartidores';
        const drivers = source === 'usuarios/repartidores'
            ? (usuarios || {})
            : (repartidores || {});

        return res.status(200).json({
            ok: true,
            source,
            drivers,
        });
    } catch (error) {
        console.error('[ADMIN][DRIVERS_LIST] Error:', error.message);
        return res.status(500).json({ error: 'No se pudo obtener la lista de repartidores' });
    }
});

app.get('/api/admin/pedidos/metricas', requirePanelAdminEmailAuth, async (req, res) => {
    if (!requireFirebase(res)) return;

    try {
        const snapshot = await db.ref('pedidos_activos').once('value');
        const orders = snapshot.val() || {};

        return res.status(200).json({
            ok: true,
            activos: Object.keys(orders).length,
        });
    } catch (error) {
        console.error('[ADMIN][ORDERS_METRICS] Error:', error.message);
        return res.status(500).json({ error: 'No se pudieron obtener las metricas de pedidos' });
    }
});

app.post('/api/admin/repartidores/manual-lock', requirePanelAdminEmailAuth, async (req, res) => {
    if (!requireFirebase(res)) return;

    const uid = String(req.body?.uid || '').trim();
    const bloqueado = req.body?.bloqueado === true;

    if (!uid) {
        return res.status(400).json({ error: 'uid es requerido' });
    }

    try {
        const now = Date.now();
        const updates = {};
        updates[`repartidores/${uid}/bloqueado_por_deuda`] = bloqueado;
        updates[`repartidores/${uid}/estatus/bloqueado_por_deuda`] = bloqueado;
        updates[`repartidores/${uid}/estatus/bloqueo_manual`] = bloqueado;
        updates[`repartidores/${uid}/estatus/updated_at`] = now;
        updates[`repartidores/${uid}/perfil/bloqueado_por_deuda`] = bloqueado;

        updates[`usuarios/repartidores/${uid}/bloqueado_por_deuda`] = bloqueado;
        updates[`usuarios/repartidores/${uid}/estatus/bloqueado_por_deuda`] = bloqueado;
        updates[`usuarios/repartidores/${uid}/estatus/bloqueo_manual`] = bloqueado;
        updates[`usuarios/repartidores/${uid}/estatus/updated_at`] = now;
        updates[`usuarios/repartidores/${uid}/perfil/bloqueado_por_deuda`] = bloqueado;

        await db.ref().update(updates);

        return res.status(200).json({ ok: true, uid, bloqueado });
    } catch (error) {
        console.error('[ADMIN][MANUAL_LOCK] Error:', error.message);
        return res.status(500).json({ error: 'No se pudo actualizar bloqueo manual' });
    }
});


// --- MÓDULO DE INTELIGENCIA FINANCIERA NELLY ---
app.get('/api/admin/metricas/rentabilidad', requirePanelAdminEmailAuth, async (req, res) => {
    try {
        const hoyStr = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        const pedidosRef = admin.database().ref('pedidos_activos');
        // Traemos los pedidos del día (puedes filtrar por timestamp si lo prefieres)
        const snapshot = await pedidosRef.once('value');
        const pedidos = snapshot.val();

        let metrics = {
            ventasBrutas: 0,
            comisionesNelly: 0,
            conteoEntregas: 0,
            mapaCalor: {}
        };

        if (pedidos) {
            Object.values(pedidos).forEach(p => {
                // Solo sumamos lo que ya se cobró y entregó hoy
                if (p.estado === 'ENTREGADO' && p.fecha === hoyStr) {
                    const total = parseFloat(p.total_pago || 0);
                    const comision = parseFloat(p.comision_app || 0);

                    metrics.ventasBrutas += total;
                    metrics.comisionesNelly += comision;
                    metrics.conteoEntregas++;

                    // Agrupación por zona (Colonia)
                    const zona = p.colonia || "Zona Desconocida";
                    metrics.mapaCalor[zona] = (metrics.mapaCalor[zona] || 0) + total;
                }
            });
        }

        console.log(`[FINANZAS] 💰 Corte de caja generado: $${metrics.ventasBrutas} brutos.`);
        res.status(200).json(metrics);

    } catch (error) {
        console.error("🔥 Error en Dashboard Financiero:", error);
        res.status(500).json({ error: "No se pudo calcular la rentabilidad" });
    }
});

// --- ENDPOINT: CREACION MANUAL DE PEDIDO (PANEL ADMIN WEB) ---
app.post('/api/admin/pedidos/manual', requirePanelAdminEmailAuth, async (req, res) => {
    if (!requireFirebase(res)) return;

    const clienteNombre = String(req.body?.cliente_nombre || '').trim();
    const telefono = String(req.body?.telefono || '').trim();
    const direccion = String(req.body?.direccion || '').trim();
    const descripcion = String(req.body?.descripcion || 'Pedido telefonico').trim();
    const repartidorId = String(req.body?.repartidor_id || '').trim() || null;
    const monto = Number(req.body?.monto || 0);

    if (!clienteNombre || !telefono || !direccion) {
        return res.status(400).json({ error: 'cliente_nombre, telefono y direccion son requeridos' });
    }

    if (!Number.isFinite(monto) || monto <= 0) {
        return res.status(400).json({ error: 'monto debe ser un numero mayor a cero' });
    }

    try {
        const pedidoRef = db.ref('pedidos_activos').push();
        const now = Date.now();
        const payload = {
            id_pedido: pedidoRef.key,
            cliente_nombre: clienteNombre,
            telefono,
            direccion,
            monto: Number(monto.toFixed(2)),
            descripcion,
            origen: 'panel_admin',
            created_at: now,
            logistica: {
                estado: repartidorId ? 'en_reparto' : 'pendiente',
                repartidor_id: repartidorId,
                manual: true,
            },
        };

        await pedidoRef.set(payload);
        return res.status(201).json({ ok: true, pedidoId: pedidoRef.key, pedido: payload });
    } catch (error) {
        console.error('[ADMIN][PEDIDO_MANUAL] Error:', error.message);
        return res.status(500).json({ error: 'No se pudo crear el pedido manual' });
    }
});

// --- ENDPOINT: ACEPTAR PEDIDO (SERVER-AUTHORITATIVE) ---
app.post('/api/delivery/accept-order', requireDriverAuth, async (req, res) => {
    if (!requireFirebase(res)) return;

    const pedidoId = String(req.body?.pedidoId || '').trim();
    const uid = req.user.uid;

    if (!pedidoId) {
        return res.status(400).json({ error: 'pedidoId es requerido' });
    }

    try {
        const capacidad = await verificarCapacidadReparto(uid);
        if (!capacidad.permitir) {
            return res.status(403).json({
                error: capacidad.mensaje,
                nivel: capacidad.nivel,
                deudaActual: capacidad.deudaActual,
                limite: capacidad.limite
            });
        }

        const pedidoRef = db.ref(`pedidos_para_reparto/${pedidoId}`);
        const acceptedAt = Date.now();

        const tx = await pedidoRef.transaction((actual) => {
            if (!actual || typeof actual !== 'object') {
                return;
            }

            const logistica = actual.logistica && typeof actual.logistica === 'object'
                ? actual.logistica
                : {};

            const estado = String(logistica.estado || actual.estado || '').trim().toLowerCase();
            const repartidorActual = String(logistica.repartidor_id || actual.repartidor || '').trim();
            const disponible = !repartidorActual
                || repartidorActual === uid
                || estado === ''
                || estado === 'disponible'
                || estado === 'esperando_repartidor'
                || estado === 'listo'
                || estado === 'listo_para_reparto';

            if (!disponible) {
                return;
            }

            return {
                ...actual,
                estado: 'en_camino',
                repartidor: uid,
                aceptado_en: acceptedAt,
                logistica: {
                    ...logistica,
                    estado: 'tomado',
                    repartidor_id: uid,
                    tomado_en: acceptedAt
                }
            };
        });

        if (!tx.committed || !tx.snapshot.exists()) {
            return res.status(409).json({ error: 'El pedido ya fue tomado por otro repartidor' });
        }

        const pedidoTomado = tx.snapshot.val() || {};
        const updates = {};
        updates[`pedidos/${pedidoId}/estado`] = 'en_reparto';
        updates[`pedidos/${pedidoId}/repartidor_asignado`] = uid;
        updates[`pedidos_en_camino/${pedidoId}`] = pedidoTomado;

        await db.ref().update(updates);

        return res.json({
            ok: true,
            pedidoId,
            estado: 'en_reparto',
            repartidorUid: uid
        });
    } catch (error) {
        console.error('[DELIVERY][ACCEPT_ORDER] Error:', error.message);
        return res.status(500).json({ error: 'No se pudo aceptar pedido' });
    }
});

// --- ENDPOINT: COMPLETAR PEDIDO (SERVER-AUTHORITATIVE PANEL) ---
app.post('/api/delivery/complete-order', requirePanelSessionAuth, async (req, res) => {
    if (!requireFirebase(res)) return;

    const orderId = String(req.body?.orderId || req.body?.pedidoId || '').trim();
    if (!orderId) {
        return res.status(400).json({ error: 'orderId es requerido' });
    }

    try {
        const pedidoRef = db.ref(`pedidos/${orderId}`);
        const pedidoSnap = await pedidoRef.once('value');
        if (!pedidoSnap.exists()) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const pedidoActual = pedidoSnap.val() || {};
        const estadoActual = String(pedidoActual.estado || '').trim().toLowerCase();
        const puedeFinalizar = estadoActual === 'en_reparto' || estadoActual === 'en_camino' || estadoActual === 'reparto';
        if (!puedeFinalizar) {
            return res.status(409).json({
                error: 'Transicion invalida: el pedido aun no esta en reparto',
                estadoActual
            });
        }

        const now = Date.now();
        const updates = {};
        updates[`pedidos/${orderId}/estado`] = 'entregado';
        updates[`pedidos/${orderId}/fecha_finalizado`] = now;
        updates[`pedidos_en_camino/${orderId}/estado`] = 'entregado';
        updates[`pedidos_en_camino/${orderId}/entregado_en`] = now;
        updates[`pedidos_para_reparto/${orderId}`] = null;

        await db.ref().update(updates);

        return res.json({
            ok: true,
            orderId,
            estado: 'entregado',
            finalizedAt: now
        });
    } catch (error) {
        console.error('[DELIVERY][COMPLETE_ORDER] Error:', error.message);
        return res.status(500).json({ error: 'No se pudo completar pedido' });
    }
});

// --- ENDPOINT: ETA CON TRAFICO REAL (DISTANCE MATRIX) ---
app.post('/api/delivery/eta', etaLimiter, async (req, res) => {
    const {
        originLat,
        originLng,
        destinationLat,
        destinationLng
    } = req.body || {};

    const oLat = Number(originLat);
    const oLng = Number(originLng);
    const dLat = Number(destinationLat);
    const dLng = Number(destinationLng);

    if (!esCoordenadaValida(oLat, oLng) || !esCoordenadaValida(dLat, dLng)) {
        return res.status(400).json({ error: 'Coordenadas invalidas para calcular ETA' });
    }

    const googleMapsApiKey = process.env.GOOGLE_DISTANCE_MATRIX_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    if (!googleMapsApiKey) {
        return res.status(503).json({ error: 'GOOGLE_DISTANCE_MATRIX_API_KEY no configurada' });
    }

    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
            params: {
                origins: `${oLat},${oLng}`,
                destinations: `${dLat},${dLng}`,
                departure_time: 'now',
                traffic_model: 'best_guess',
                mode: 'driving',
                language: 'es-MX',
                units: 'metric',
                key: googleMapsApiKey
            },
            timeout: 10000
        });

        const payload = response.data;
        if (payload?.status !== 'OK') {
            console.error('[ETA ERROR] Google status:', payload?.status);
            return res.status(502).json({ error: 'Google Distance Matrix no disponible', providerStatus: payload?.status || 'UNKNOWN' });
        }

        const element = payload.rows?.[0]?.elements?.[0];
        if (!element || element.status !== 'OK') {
            return res.status(422).json({ error: 'No se pudo calcular ruta para este pedido', providerElementStatus: element?.status || 'UNKNOWN' });
        }

        const distanceMeters = Number(element.distance?.value || 0);
        const durationSec = Number(element.duration?.value || 0);
        const durationInTrafficSec = Number(element.duration_in_traffic?.value || durationSec);
        const etaSeconds = Math.max(0, durationInTrafficSec);
        const etaMinutes = Math.ceil(etaSeconds / 60);
        const arrivesAtMs = Date.now() + etaSeconds * 1000;

        return res.json({
            ok: true,
            distanceMeters,
            distanceText: element.distance?.text || `${(distanceMeters / 1000).toFixed(1)} km`,
            durationSec,
            durationInTrafficSec,
            etaSeconds,
            etaMinutes,
            etaText: `${etaMinutes} min`,
            arrivesAtMs
        });
    } catch (error) {
        console.error('[ETA ERROR] Fallo consultando Distance Matrix:', error.message);
        return res.status(500).json({ error: 'Error calculando ETA', detail: error.message });
    }
});

// --- ENDPOINT: ETA LOGISTICO PARA EN_CAMINO ---
app.post('/api/logistics/eta', requireDriverAuth, etaLimiter, async (req, res) => {
    if (!requireFirebase(res)) return;

    const { origin, destination, pedidoId } = req.body || {};
    if (!pedidoId || typeof pedidoId !== 'string') {
        return res.status(400).json({ error: 'pedidoId es requerido' });
    }

    const originCoords = parseCoordInput(origin);
    const destinationCoords = parseCoordInput(destination);
    if (!originCoords || !destinationCoords) {
        return res.status(400).json({ error: 'origin y destination deben ser coordenadas validas (lat,lng)' });
    }

    const mapsApiKey = process.env.GOOGLE_DISTANCE_MATRIX_API_KEY
        || process.env.GOOGLE_MAPS_API_KEY
        || process.env.MAPS_API_KEY;

    if (!mapsApiKey) {
        return res.status(503).json({ error: 'MAPS API key no configurada' });
    }

    try {
        const pedidoRef = db.ref(`pedidos_en_camino/${pedidoId}`);
        const pedidoSnap = await pedidoRef.once('value');

        if (!pedidoSnap.exists()) {
            return res.status(404).json({ error: 'Pedido EN_CAMINO no encontrado' });
        }

        const pedido = pedidoSnap.val() || {};
        const estado = String(pedido.estado || '').toLowerCase();
        if (estado && estado !== 'en_camino') {
            return res.status(409).json({ error: 'El pedido no esta en estado EN_CAMINO' });
        }

        const pedidoDriverUid = pedido.driverLocation?.driverUid || pedido.repartidor;
        if (pedidoDriverUid && pedidoDriverUid !== req.user.uid) {
            return res.status(403).json({ error: 'No autorizado para actualizar ETA de este pedido' });
        }

        const prevEta = pedido.eta;
        const prevOrigin = prevEta?.origin;
        if (prevEta && prevOrigin && esCoordenadaValida(Number(prevOrigin.lat), Number(prevOrigin.lng))) {
            const movedMeters = distanciaMetrosHaversine(
                Number(prevOrigin.lat),
                Number(prevOrigin.lng),
                originCoords.lat,
                originCoords.lng
            );

            if (movedMeters < 50) {
                return res.json({
                    ...prevEta,
                    cached: true,
                    movedMeters: Math.round(movedMeters)
                });
            }
        }

        const dmResponse = await googleMapsClient.distancematrix({
            params: {
                origins: [`${originCoords.lat},${originCoords.lng}`],
                destinations: [`${destinationCoords.lat},${destinationCoords.lng}`],
                mode: 'driving',
                departure_time: 'now',
                traffic_model: 'best_guess',
                language: 'es-MX',
                units: 'metric',
                key: mapsApiKey
            },
            timeout: 10000
        });

        const element = dmResponse?.data?.rows?.[0]?.elements?.[0];
        if (!element || element.status !== 'OK') {
            return res.status(422).json({
                error: 'No se pudo calcular ETA para esta ruta',
                providerElementStatus: element?.status || 'UNKNOWN'
            });
        }

        const etaData = {
            durationText: element.duration_in_traffic?.text || element.duration?.text || '--',
            durationValue: Number(element.duration_in_traffic?.value || element.duration?.value || 0),
            distanceText: element.distance?.text || '--',
            distanceValue: Number(element.distance?.value || 0),
            origin: originCoords,
            destination: destinationCoords,
            updatedAt: Date.now()
        };

        await db.ref(`pedidos_en_camino/${pedidoId}/eta`).set(etaData);
        return res.json({ ...etaData, cached: false });
    } catch (e) {
        console.error('[ETA ERROR]:', e.message);
        return res.status(500).json({ error: 'No se pudo calcular el tiempo' });
    }
});

// --- ENDPOINT: LIQUIDACIONES DE BILLETERA (NELLY ECONOMICS) ---
app.post('/api/liquidaciones', async (req, res) => {
    if (!requireFirebase(res)) return;

    const {
        action,
        liquidacionId,
        monto,
        evidencia,
        observaciones,
        repartidorUid,
        aprobadoPor,
        rechazadoPor,
        motivo
    } = req.body || {};

    const accion = String(action || 'reportar').trim().toLowerCase();
    const idNormalizado = String(liquidacionId || '').trim();

    if (accion === 'reportar') {
        const authHeader = req.headers.authorization || '';
        const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
        if (!idToken) {
            return res.status(401).json({ error: 'No se proporciono token' });
        }

        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            if (!(decodedToken.driver === true || decodedToken.role === 'repartidor')) {
                return res.status(403).json({ error: 'Acceso denegado: No es un perfil de repartidor' });
            }

            const uid = repartidorUid || decodedToken.uid;
            const nuevoId = idNormalizado || `liq_${Date.now()}`;
            const montoNumero = Number(monto || 0);
            if (!Number.isFinite(montoNumero) || montoNumero <= 0) {
                return res.status(400).json({ error: 'monto debe ser numerico y mayor a 0' });
            }

            const payload = {
                id: nuevoId,
                repartidorUid: uid,
                monto: Number(montoNumero.toFixed(2)),
                evidencia: evidencia || null,
                observaciones: observaciones || '',
                estado: 'PENDIENTE',
                versionSistema: ECOSYSTEM_VERSION,
                creadoEn: Date.now(),
                actualizadoEn: Date.now()
            };

            const updates = {};
            updates[`liquidaciones/${nuevoId}`] = payload;
            updates[`liquidaciones_auditoria/${nuevoId}_${Date.now()}`] = {
                liquidacionId: nuevoId,
                estado: 'PENDIENTE',
                evento: 'LIQUIDACION_REPORTADA',
                repartidorUid: uid,
                monto: payload.monto,
                versionSistema: ECOSYSTEM_VERSION,
                timestamp: Date.now()
            };

            await db.ref().update(updates);
            return res.status(201).json({ ok: true, liquidacion: payload });
        } catch (error) {
            console.error('[LIQUIDACION][REPORTAR] Error:', error.message);
            return res.status(401).json({ error: 'Token invalido o expirado' });
        }
    }

    if (accion !== 'autorizar' && accion !== 'rechazar') {
        return res.status(400).json({ error: 'action debe ser reportar, autorizar o rechazar' });
    }

    return requirePanelApiKey(req, res, async () => {
        if (!idNormalizado) {
            return res.status(400).json({ error: 'liquidacionId es requerido para autorizar/rechazar' });
        }

        try {
            const liqRef = db.ref(`liquidaciones/${idNormalizado}`);
            const snap = await liqRef.once('value');
            if (!snap.exists()) {
                return res.status(404).json({ error: 'Liquidacion no encontrada' });
            }

            const actual = snap.val() || {};
            if (String(actual.estado || '').toUpperCase() !== 'PENDIENTE') {
                return res.status(409).json({ error: 'La liquidacion ya fue resuelta' });
            }

            const nuevoEstado = accion === 'autorizar' ? 'AUTORIZADA' : 'RECHAZADA';
            const actualizacion = {
                estado: nuevoEstado,
                actualizadoEn: Date.now(),
                versionSistema: ECOSYSTEM_VERSION,
                motivo: motivo || actual.motivo || null
            };

            if (accion === 'autorizar') {
                actualizacion.aprobadoPor = aprobadoPor || 'panel_cocina';
            } else {
                actualizacion.rechazadoPor = rechazadoPor || 'panel_cocina';
            }

            await liqRef.update(actualizacion);
            await db.ref(`liquidaciones_auditoria/${idNormalizado}_${Date.now()}`).set({
                liquidacionId: idNormalizado,
                estado: nuevoEstado,
                evento: accion === 'autorizar' ? 'LIQUIDACION_AUTORIZADA' : 'LIQUIDACION_RECHAZADA',
                repartidorUid: actual.repartidorUid || null,
                monto: Number(actual.monto || 0),
                aprobadoPor: actualizacion.aprobadoPor || null,
                rechazadoPor: actualizacion.rechazadoPor || null,
                motivo: actualizacion.motivo,
                versionSistema: ECOSYSTEM_VERSION,
                timestamp: Date.now()
            });

            return res.json({
                ok: true,
                liquidacionId: idNormalizado,
                estado: nuevoEstado
            });
        } catch (error) {
            console.error('[LIQUIDACION][RESOLVER] Error:', error.message);
            return res.status(500).json({ error: 'No se pudo resolver la liquidacion' });
        }
    });
});

app.get('/api/liquidaciones', requirePanelApiKey, async (req, res) => {
    if (!requireFirebase(res)) return;

    try {
        const estadoFiltro = String(req.query.estado || '').trim().toUpperCase();
        const snap = await db.ref('liquidaciones').once('value');
        const raiz = snap.val() || {};
        const items = Object.values(raiz)
            .filter((item) => item && typeof item === 'object')
            .filter((item) => !estadoFiltro || String(item.estado || '').toUpperCase() === estadoFiltro)
            .sort((a, b) => Number(b.actualizadoEn || 0) - Number(a.actualizadoEn || 0));

        return res.json({ ok: true, total: items.length, items });
    } catch (error) {
        console.error('[LIQUIDACION][LISTA] Error:', error.message);
        return res.status(500).json({ error: 'No se pudo listar liquidaciones' });
    }
});

// --- CONTROLADOR: TOKEN SEGURO PARA PANEL DE COCINA ---
const panelTokenController = async (req, res) => {
    const origin = req.headers.origin || '';
    const normalizedOrigin = normalizeOrigin(origin);
    if (normalizedOrigin !== PANEL_ALLOWED_ORIGIN) {
        console.warn(`[AUTH BLOCK] Origen no autorizado: ${origin || 'sin-origin'}`);
        return res.status(403).json({ error: 'Origen no autorizado' });
    }

    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : req.socket.remoteAddress);

    if (!firebaseAdminInitialized) {
        console.error(`[ERROR AUTH] Firebase Admin no inicializado para IP ${ip}`);
        return res.status(503).json({ error: 'Firebase Admin no inicializado' });
    }

    try {
        const uid = 'panel-cocina-nelly';
        const additionalClaims = {
            admin: true,
            role: 'panel_cocina'
        };

        const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
        console.log(`[AUTH] Token generado exitosamente para IP: ${ip} a las ${new Date().toISOString()}`);
        return res.json({ token: customToken });
    } catch (error) {
        console.error(`[ERROR AUTH] Fallo al generar token para IP ${ip}:`, error.message);
        return res.status(500).json({ error: 'Error interno de seguridad' });
    }
};

// --- CONTROLADOR: TOKEN PARA MODULO WEB DE REPARTIDOR ---
const driverTokenController = async (req, res) => {
    const origin = req.headers.origin || '';
    const normalizedOrigin = normalizeOrigin(origin);
    if (normalizedOrigin !== PANEL_ALLOWED_ORIGIN) {
        console.warn(`[AUTH BLOCK][DRIVER] Origen no autorizado: ${origin || 'sin-origin'}`);
        return res.status(403).json({ error: 'Origen no autorizado' });
    }

    const uid = String(req.query.uid || '').trim();
    if (!uid || !/^[A-Za-z0-9_-]{4,128}$/.test(uid)) {
        return res.status(400).json({ error: 'uid de repartidor invalido' });
    }

    if (!firebaseAdminInitialized) {
        return res.status(503).json({ error: 'Firebase Admin no inicializado' });
    }

    try {
        const repartidorSnap = await db.ref(`repartidores/${uid}`).once('value');
        if (!repartidorSnap.exists()) {
            return res.status(404).json({ error: 'Repartidor no registrado' });
        }

        const repartidor = repartidorSnap.val() || {};
        if (repartidor.activo === false) {
            return res.status(403).json({ error: 'Repartidor inactivo' });
        }

        const additionalClaims = {
            driver: true,
            role: 'repartidor'
        };

        const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
        return res.json({ token: customToken, uid });
    } catch (error) {
        console.error('[ERROR AUTH][DRIVER TOKEN]:', error.message);
        return res.status(500).json({ error: 'No se pudo generar token de repartidor' });
    }
};

// --- CONTROLADOR: HEALTHCHECK (para Keep-Alive en Render) ---
const healthcheckController = (req, res) => {
    return res.status(200).json({
        status: 'ok',
        service: 'nelly-api',
        versionSistema: ECOSYSTEM_VERSION,
        timestamp: new Date().toISOString(),
    });
};

// --- RUTAS EXPUESTAS ---
app.get('/api/auth/panel-token', authLimiter, panelTokenController);
app.get('/api/auth/driver-token', authLimiter, driverTokenController);
// app.get('/healthcheck', healthcheckController);
// app.get('/api/healthcheck', healthcheckController);
// app.get('/health', healthcheckController);


// CONFIGURACIÓN DE CONEXIÓN FINAL

// import os from 'os'; // Migrar si es necesario
// Función para obtener la IP local automáticamente
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            // Filtramos solo IPv4 y que no sea interna (127.0.0.1)
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const PORT = 10000;
const currentIp = getLocalIp();

app.listen(PORT, '0.0.0.0', () => {
    console.log('-------------------------------------------');
    console.log('   🛵 NELLY DELIVERY - BACKEND ACTIVO 🛵   ');
    console.log('-------------------------------------------');
    console.log(`📡 Red Local: http://${currentIp}:${PORT}`);
    console.log(`🏥 Salud:    http://${currentIp}:${PORT}/api/health`);
    console.log('-------------------------------------------');
    console.log('Presiona Ctrl+C para detener el servidor');
});

