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
import usuariosRouter from './routes/usuarios.js';
import ordenesRouter from './routes/ordenes.js';
import zonasRouter from './routes/zonas.js';

// Vinculación de rutas principales
app.use('/api/usuarios', usuariosRouter);
app.use('/api/ordenes', ordenesRouter);
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
