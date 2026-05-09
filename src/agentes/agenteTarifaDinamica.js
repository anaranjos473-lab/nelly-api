import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';

const db = getFirestore();
const rtdb = getDatabase();

// Ciclo de evaluación (Ej. cada 3 minutos = 180000 ms)
const INTERVALO_EVALUACION = 180000; 

const evaluarMercado = async () => {
    try {
        console.log("📊 [Agente Financiero] Evaluando oferta y demanda en Tuxtla...");

        // 1. Contar pedidos PENDIENTES (Demanda)
        const snapshotPedidos = await db.collection('pedidos')
            .where('estado', '==', 'PENDIENTE')
            .get();
        const totalPedidos = snapshotPedidos.size;

        // 2. Contar conductores DISPONIBLES (Oferta)
        const snapshotConductores = await rtdb.ref('conductores_activos').once('value');
        const conductores = snapshotConductores.val() || {};
        
        let totalConductoresLibres = 0;
        for (const id in conductores) {
            if (conductores[id].estado === 'DISPONIBLE') {
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

        // 4. Actualizar la configuración global en Firestore
        // La app en Kotlin leerá este documento para mostrar "Tarifa Dinámica Activa"
        await db.collection('configuracion').doc('sistema').set({
            multiplicadorTarifa: nuevoMultiplicador,
            estadoDemanda: nivelDemanda,
            ultimaActualizacion: new Date().toISOString()
        }, { merge: true });

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
