// Función para subir evidencia fotográfica y vincularla al pedido (Frontend JS)
import { storage, db } from './firebase.js';
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/**
 * Sube una imagen a Storage y actualiza el pedido en Firestore
 * @param {string} pedidoId - ID del pedido
 * @param {File|Blob} archivo - Imagen capturada
 */
export async function subirEvidencia(pedidoId, archivo) {
    const refImg = storageRef(storage, `evidencias/${pedidoId}.jpg`);
    await uploadBytes(refImg, archivo);
    const url = await getDownloadURL(refImg);
    // Actualiza Firestore con la URL y estado
    await updateDoc(doc(db, 'pedidos', pedidoId), {
        fotoEvidencia: url,
        estado: 'Entregado',
        fechaEntrega: serverTimestamp()
    });
    return url;
}

// Uso sugerido:
// const archivo = ... // File/Blob de la cámara
// await subirEvidencia('ID_PEDIDO', archivo);