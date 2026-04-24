#!/usr/bin/env node
/**
 * Test: Agente Asignador - Validación End-to-End
 * 
 * Este script:
 * 1. Crea repartidores de prueba disponibles
 * 2. Crea un pedido de prueba
 * 3. Espera asignación automática
 * 4. Reporta resultados
 * 
 * Uso: node test-asignador.js
 */

const dotenv = require('dotenv');
dotenv.config();

const admin = require('firebase-admin');
const fs = require('fs');

// === CONFIGURACIÓN ===
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com';
const TEST_TIMEOUT_MS = 15000; // Esperar 15 segundos max

// === COLORES PARA LOGS ===
const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(color, prefix, msg) {
    console.log(`${COLORS[color]}[${prefix}] ${msg}${COLORS.reset}`);
}

// === INICIALIZACIÓN FIREBASE ===
async function initFirebase() {
    try {
        let serviceAccount;
        const secretPath = '/etc/secrets/nelly-admin.json';

        if (fs.existsSync(secretPath)) {
            serviceAccount = require(secretPath);
        } else if (process.env.FIREBASE_ADMIN_JSON) {
            const rawEnv = process.env.FIREBASE_ADMIN_JSON;
            serviceAccount = rawEnv.trim().startsWith('{')
                ? JSON.parse(rawEnv)
                : JSON.parse(Buffer.from(rawEnv, 'base64').toString('utf8'));
        } else {
            serviceAccount = require('./nelly-admin.json');
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: FIREBASE_DATABASE_URL
        });

        log('green', 'INIT', 'Firebase inicializado correctamente');
        return admin.database();
    } catch (error) {
        log('red', 'INIT', `Error: ${error.message}`);
        process.exit(1);
    }
}

// === SETUP: Crear repartidores de prueba ===
async function crearRepartidoresPrueba(db) {
    log('cyan', 'SETUP', 'Creando repartidores de prueba...');

    const repartidores = [
        {
            uid: 'test_driver_oro',
            nombre: 'Test Driver ORO',
            nivel: 'ORO',
            isLibre: true,
            bloqueado_por_deuda: false,
            currentLocation: { lat: 16.755, lng: -93.109, updatedAt: Date.now() },
        },
        {
            uid: 'test_driver_plata',
            nombre: 'Test Driver PLATA',
            nivel: 'PLATA',
            isLibre: true,
            bloqueado_por_deuda: false,
            currentLocation: { lat: 16.760, lng: -93.110, updatedAt: Date.now() },
        },
        {
            uid: 'test_driver_bronce',
            nombre: 'Test Driver BRONCE',
            nivel: 'BRONCE',
            isLibre: false, // Ocupado, no debe ser asignado
            bloqueado_por_deuda: false,
            currentLocation: { lat: 16.750, lng: -93.108, updatedAt: Date.now() },
        },
    ];

    const updates = {};
    for (const rep of repartidores) {
        updates[`repartidores/${rep.uid}`] = rep;
    }

    await db.ref().update(updates);
    log('green', 'SETUP', `${repartidores.length} repartidores de prueba creados`);
    return repartidores;
}

// === TEST: Crear pedido y esperar asignación ===
async function testAsignacion(db) {
    log('cyan', 'TEST', 'Creando pedido de prueba...');

    const pedidoId = `test_asignador_${Date.now()}`;
    const pedido = {
        id: pedidoId,
        cliente: {
            nombre: 'Cliente Test',
            coords: {
                lat: 16.758,
                lng: -93.109,
            },
        },
        monto: 250,
        estado: 'listo_para_reparto',
        createdAt: Date.now(),
    };

    // Crear pedido
    await db.ref(`pedidos_para_reparto/${pedidoId}`).set(pedido);
    log('blue', 'TEST', `Pedido creado: ${pedidoId}`);
    log('blue', 'TEST', `Coords: ${pedido.cliente.coords.lat}, ${pedido.cliente.coords.lng}`);

    // Esperar asignación
    log('yellow', 'TEST', 'Esperando asignación automática (máx 15 segundos)...');

    return new Promise((resolve) => {
        const startTime = Date.now();
        let listenerCanceled = false;
        const pedidoRef = db.ref(`pedidos_para_reparto/${pedidoId}`);

        const onValueChange = (snapshot) => {
            if (listenerCanceled) return;

            const datosActuales = snapshot.val() || {};
            const tiempoTranscurrido = Date.now() - startTime;

            if (datosActuales.repartidor_uid) {
                clearTimeout(timeout);
                pedidoRef.off('value', onValueChange);
                listenerCanceled = true;

                log('green', 'TEST', '✅ Asignación completada exitosamente');
                log('green', 'TEST', `Tiempo: ${tiempoTranscurrido}ms`);

                resolve({
                    exitosa: true,
                    pedidoId,
                    repartidor_uid: datosActuales.repartidor_uid,
                    repartidor_nombre: datosActuales.repartidor_nombre,
                    repartidor_nivel: datosActuales.repartidor_nivel,
                    distancia_metros: datosActuales.distancia_metros,
                    timestamp_asignacion: datosActuales.timestamp_asignacion,
                    tiempoTranscurrido,
                });
            }
        };

        const timeout = setTimeout(() => {
            listenerCanceled = true;
            pedidoRef.off('value', onValueChange);
            log('red', 'TEST', 'Timeout: No se asignó en el tiempo límite');
            resolve({ exitosa: false, razon: 'TIMEOUT', pedidoId });
        }, TEST_TIMEOUT_MS);

        pedidoRef.on('value', onValueChange);
    });
}

// === VERIFY: Verificar datos en RTDB ===
async function verificarDatos(db, pedidoId) {
    log('cyan', 'VERIFY', 'Verificando datos en RTDB...');

    const pedidoSnap = await db.ref(`pedidos_para_reparto/${pedidoId}`).once('value');
    const asignacionSnap = await db.ref(`pedidos_asignados/${pedidoId}`).once('value');

    const pedidoData = pedidoSnap.val();
    const asignacionData = asignacionSnap.val();

    log('blue', 'VERIFY', 'Pedido (pedidos_para_reparto):');
    console.log(JSON.stringify(pedidoData, null, 2));

    log('blue', 'VERIFY', 'Nodo de notificación (pedidos_asignados):');
    console.log(JSON.stringify(asignacionData, null, 2));

    return { pedidoData, asignacionData };
}

// === CLEANUP: Eliminar datos de prueba ===
async function limpiar(db, pedidoId, repartidores) {
    log('cyan', 'CLEANUP', 'Eliminando datos de prueba...');

    const updates = {};
    updates[`pedidos_para_reparto/${pedidoId}`] = null;
    updates[`pedidos_asignados/${pedidoId}`] = null;

    for (const rep of repartidores) {
        updates[`repartidores/${rep.uid}`] = null;
    }

    await db.ref().update(updates);
    log('green', 'CLEANUP', 'Datos de prueba eliminados');
}

// === MAIN ===
async function main() {
    log('green', 'START', '=== Test: Agente Asignador ===');

    const db = await initFirebase();

    try {
        // 1. Setup
        const repartidores = await crearRepartidoresPrueba(db);

        // 2. Test
        const resultado = await testAsignacion(db);

        // 3. Verificar
        if (resultado.exitosa) {
            await verificarDatos(db, resultado.pedidoId);

            log('green', 'RESULT', '');
            log('green', 'RESULT', '✅ TEST EXITOSO');
            log('green', 'RESULT', `Repartidor asignado: ${resultado.repartidor_nombre} (${resultado.repartidor_nivel})`);
            log('green', 'RESULT', `Distancia: ${(resultado.distancia_metros / 1000).toFixed(2)}km`);
            log('green', 'RESULT', `Tiempo de asignación: ${resultado.tiempoTranscurrido}ms`);
        } else {
            log('red', 'RESULT', '❌ TEST FALLIDO');
            log('red', 'RESULT', `Razón: ${resultado.razon}`);
            log('red', 'RESULT', 'Posibles causas:');
            log('red', 'RESULT', '- El listener no se disparó');
            log('red', 'RESULT', '- La lógica de asignación no se ejecutó');
            log('red', 'RESULT', '- Revisa los logs de Render');
        }

        // 4. Cleanup
        await limpiar(db, resultado.pedidoId || `test_asignador_${Date.now()}`, repartidores);

        process.exit(resultado.exitosa ? 0 : 1);
    } catch (error) {
        log('red', 'ERROR', error.message);
        process.exit(1);
    }
}

main();
