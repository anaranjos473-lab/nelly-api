// Prueba automatizada: subir evidencia y validar visualización
import { subirEvidencia } from './subirEvidencia.js';
import { db } from './firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

async function pruebaSubidaEvidencia(pedidoId) {
    // Crear imagen de prueba (blob PNG)
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('OK', 32, 80);
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));

    // Subir evidencia
    const url = await subirEvidencia(pedidoId, blob);
    console.log('URL de evidencia subida:', url);

    // Validar en Firestore
    const pedidoSnap = await getDoc(doc(db, 'pedidos', pedidoId));
    if (pedidoSnap.exists() && pedidoSnap.data().fotoEvidencia === url) {
        console.log('✅ Evidencia vinculada correctamente en Firestore');
    } else {
        console.error('❌ Evidencia no vinculada en Firestore');
    }
}

// Ejecutar prueba automática (ajusta el ID de pedido de prueba)
window.probarSubidaEvidencia = pruebaSubidaEvidencia;
// Uso: abre consola y ejecuta probarSubidaEvidencia('ID_PEDIDO_PRUEBA');
