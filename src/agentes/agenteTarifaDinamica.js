
import { getAdmin } from '../../config/firebase-admin-esm.js';
import { ORDER_STATES, FULFILLMENT_NODE_STATES } from '../domain/index.js';
import { getOrderState } from '../services/ordersManager.js';



// Ciclo de evaluación (Ej. cada 3 minutos = 180000 ms)
const INTERVALO_EVALUACION = 180000; 
const RUTA_CONFIGURACION_SISTEMA = 'configuracion/sistema';

const evaluarMercado = async () => {
    try {
        console.log("📊 [Agente Financiero] Evaluando oferta y demanda en Tuxtla...");
        const admin = await getAdmin();
        const rtdb = admin.database();

        // 1. Contar pedidos pendientes (Demanda)
        const snapshotPedidos = await rtdb.ref('pedidos').once('value');
        const pedidos = snapshotPedidos.val() || {};
        let totalPedidos = 0;
        for (const pedido of Object.values(pedidos)) {
            if (getOrderState(pedido) === ORDER_STATES.PENDIENTE) {
                totalPedidos++;
            }
        }

        // 2. Contar conductores DISPONIBLES (Oferta)
        const snapshotConductores = await rtdb.ref('conductores_activos').once('value');
        const conductores = snapshotConductores.val() || {};
        let totalConductoresLibres = 0;
        for (const id in conductores) {
            if (conductores[id].estado === FULFILLMENT_NODE_STATES.DISPONIBLE) {
                totalConductoresLibres++;
            }
        }

        // 3. Lógica del Algoritmo de Tarifa Dinámica
        let nuevoMultiplicador = 1.0; // Tarifa base (Normal)
        let nivelDemanda = "BAJA";

        if (totalConductoresLibres === 0 && totalPedidos > 0) {
            // Situación Crítica: Hay pedidos pero nadie libre
            nuevoMultiplicador = 1.5; 
            nivelDemanda = "CRÍTICA";
        } else if (totalConductoresLibres > 0) {
            const ratio = totalPedidos / totalConductoresLibres;
            if (ratio >= 3) {
                // Alta demanda: 3 o más pedidos por cada repartidor libre
                nuevoMultiplicador = 1.3;
                nivelDemanda = "ALTA";
            } else if (ratio >= 1.5) {
                // Demanda moderada
                nuevoMultiplicador = 1.1;
                nivelDemanda = "MODERADA";
            }
        }

        // 4. Actualizar la configuración global en RTDB solo si cambió el estado relevante
        const configRef = rtdb.ref(RUTA_CONFIGURACION_SISTEMA);
        const configSnapshot = await configRef.once('value');
        const configActual = configSnapshot.val() || {};
        const multiplicadorActual = Number(configActual.multiplicadorTarifa);
        const estadoDemandaActual = String(configActual.estadoDemanda || '');
        const multiplicadorCoincide = Number.isFinite(multiplicadorActual)
            && multiplicadorActual === nuevoMultiplicador;
        const demandaCoincide = estadoDemandaActual === nivelDemanda;

        if (multiplicadorCoincide && demandaCoincide) {
            console.log(`ℹ️ [Mercado] Sin cambios operativos, se omite escritura en ${RUTA_CONFIGURACION_SISTEMA}.`);
            return;
        }

        await configRef.update({
            multiplicadorTarifa: nuevoMultiplicador,
            estadoDemanda: nivelDemanda,
            ultimaActualizacion: new Date().toISOString()
        });

        console.log(`📈 [Mercado] Demanda: ${nivelDemanda} | Multiplicador: x${nuevoMultiplicador} | Pedidos: ${totalPedidos} | Conductores Libres: ${totalConductoresLibres}`);

    } catch (error) {
        console.error("❌ [Error Agente Financiero]:", error);
    }
};

export const iniciarAgenteFinanciero = () => {
    console.log("💰 Agente de Tarifa Dinámica inicializado.");
    // Ejecutar inmediatamente al arrancar el servidor
    evaluarMercado();
    // Programar el ciclo continuo
    setInterval(evaluarMercado, INTERVALO_EVALUACION);
};
