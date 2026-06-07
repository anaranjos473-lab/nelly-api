import { getAdmin } from '../../config/firebase-admin-esm.js';

let firestoreDb = null;
let rtdb = null;
let unsubscribeHandlers = [];

export function normalizeFirestoreValue(value) {
  if (value && typeof value.toMillis === 'function') {
    return value.toMillis();
  }
  if (Array.isArray(value)) {
    return value.map(normalizeFirestoreValue);
  }
  if (value && typeof value === 'object') {
    const normalized = {};
    for (const [key, item] of Object.entries(value)) {
      normalized[key] = normalizeFirestoreValue(item);
    }
    return normalized;
  }
  return value;
}

function normalizeFirestoreDocument(docData) {
  if (!docData || typeof docData !== 'object') return docData;
  const normalized = {};
  for (const [key, value] of Object.entries(docData)) {
    normalized[key] = normalizeFirestoreValue(value);
  }
  return normalized;
}

async function initBridgeRefs() {
  if (firestoreDb && rtdb) return;
  const admin = await getAdmin();
  firestoreDb = admin.firestore();
  rtdb = admin.database();
}

function bridgeCollection(collectionName, nodePath) {
  const collectionRef = firestoreDb.collection(collectionName);
  const unsubscribe = collectionRef.onSnapshot(async (snapshot) => {
    const updates = {};
    snapshot.docChanges().forEach((change) => {
      const docId = change.doc.id;
      const targetPath = `${nodePath}/${docId}`;
      if (change.type === 'removed') {
        updates[targetPath] = null;
      } else {
        updates[targetPath] = normalizeFirestoreDocument(change.doc.data());
      }
    });
    if (Object.keys(updates).length > 0) {
      await rtdb.ref().update(updates);
    }
  }, (error) => {
    console.error(`[FirestoreBridge] Error escuchando ${collectionName}:`, error.message || error);
  });
  unsubscribeHandlers.push(() => unsubscribe());
  console.log(`[FirestoreBridge] Puente activo para ${collectionName} → ${nodePath}`);
}

export async function iniciarFirestoreRtdbBridge() {
  try {
    await initBridgeRefs();
    bridgeCollection('pedidos', 'pedidos');
    bridgeCollection('pedidos_para_reparto', 'pedidos_para_reparto');
    bridgeCollection('pedidos_en_camino', 'pedidos_en_camino');
    bridgeCollection('liquidaciones', 'liquidaciones');
    bridgeCollection('liquidaciones_auditoria', 'liquidaciones_auditoria');
    console.log('✅ Firestore → RTDB bridge iniciado');
  } catch (error) {
    console.error('❌ No se pudo iniciar Firestore → RTDB bridge:', error.message || error);
  }
}

export function limpiarFirestoreRtdbBridge() {
  unsubscribeHandlers.forEach((unsub) => {
    try {
      unsub();
    } catch (error) {
      console.error('[FirestoreBridge] Error al limpiar listener:', error.message || error);
    }
  });
  unsubscribeHandlers = [];
  console.log('🧹 Firestore → RTDB bridge detenido');
}
