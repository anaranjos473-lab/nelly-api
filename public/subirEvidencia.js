// Función para subir evidencia fotográfica y vincularla al pedido (Frontend JS)
import { storage, db } from './firebase.js';
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { saveEvidenceFallback } from './evidence-fallback.js';

/**
 * Sube una imagen a Storage y actualiza el pedido en Firestore.
 * Si Storage no está habilitado, usa un fallback temporal basado en data URL.
 * @param {string} pedidoId - ID del pedido
 * @param {File|Blob} archivo - Imagen capturada
 */
export async function subirEvidencia(pedidoId, archivo) {
    try {
        const refImg = storageRef(storage, `evidencias/${pedidoId}.jpg`);
        await uploadBytes(refImg, archivo);
        const url = await getDownloadURL(refImg);
        // Mantener el estado canónico del backend para evitar reabrir flujos por comparaciones mixtas.
        await updateDoc(doc(db, 'pedidos', pedidoId), {
            fotoEvidencia: url,
            estado: 'ENTREGADO',
            fechaEntrega: serverTimestamp()
        });
        return url;
    } catch (error) {
        console.warn('Storage no disponible, usando fallback temporal:', error?.message || error);
        const fallback = await saveEvidenceFallback(pedidoId, archivo, async (pedido, payload) => {
            await updateDoc(doc(db, 'pedidos', pedido), payload);
        });
        return fallback.url;
    }
}

// Uso sugerido:
// const archivo = ... // File/Blob de la cámara
// await subirEvidencia('ID_PEDIDO', archivo);
