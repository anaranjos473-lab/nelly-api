/**
 * seed-panel-test.js
 * Inyecta 10 repartidores (con estados/niveles/deudas variados) y 15 pedidos activos
 * en Firebase RTDB para validar visualmente el panel admin.
 *
 * Uso:
 *   node scripts/seed-panel-test.js              # Inyectar datos
 *   node scripts/seed-panel-test.js --cleanup    # Eliminar datos de prueba
 */

"use strict";

const admin = require("firebase-admin");
const path  = require("path");
const fs    = require("fs");

// ── Inicializar firebase-admin ────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, "../nelly-admin.json");

if (!admin.apps.length) {
  let credential;
  if (process.env.FIREBASE_ADMIN_JSON) {
    credential = admin.credential.cert(
      JSON.parse(Buffer.from(process.env.FIREBASE_ADMIN_JSON, "base64").toString("utf8"))
    );
  } else if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    credential = admin.credential.cert(require(SERVICE_ACCOUNT_PATH));
  } else {
    console.error("❌ No se encontró credencial (FIREBASE_ADMIN_JSON o nelly-admin.json)");
    process.exit(1);
  }

  admin.initializeApp({
    credential,
    databaseURL: "https://nelly-delivery-default-rtdb.firebaseio.com"
  });
}

const db = admin.database();

// ── Dataset ───────────────────────────────────────────────────────────────────

const REPARTIDORES = {
  "test_rep_01": {
    nombre: "Juan Camaney",
    nivel: "DIAMANTE",
    finanzas: { deuda_total: 850, cobros_pendientes: 2 },
    bloqueado_por_deuda: false,  // 850 < 900 → no bloqueado
    online: true,
    foto_url: null,
    estatus: "activo"
  },
  "test_rep_02": {
    nombre: "Pedro Páramo",
    nivel: "BRONCE",
    finanzas: { deuda_total: 350, cobros_pendientes: 3 },
    bloqueado_por_deuda: true,   // 350 > 300 → bloqueado
    online: true,
    foto_url: null,
    estatus: "activo"
  },
  "test_rep_03": {
    nombre: "Maria Enchilada",
    nivel: "ORO",
    finanzas: { deuda_total: 120, cobros_pendientes: 0 },
    bloqueado_por_deuda: false,
    online: false,
    foto_url: null,
    estatus: "activo"
  },
  "test_rep_04": {
    nombre: "Gabo Márquez",
    nivel: "PLATA",
    finanzas: { deuda_total: 550, cobros_pendientes: 1 },
    bloqueado_por_deuda: false,  // 550 == 500 → depende de la lógica exacta (>=)
    online: true,
    foto_url: null,
    estatus: "activo"
  },
  "test_rep_05": {
    nombre: "Sor Juana Inés",
    nivel: "DIAMANTE",
    finanzas: { deuda_total: 920, cobros_pendientes: 4 },
    bloqueado_por_deuda: true,   // 920 > 900 → bloqueado
    online: true,
    foto_url: null,
    estatus: "activo"
  },
  "test_rep_06": {
    nombre: "Pancho Villa",
    nivel: "BRONCE",
    finanzas: { deuda_total: 50, cobros_pendientes: 0 },
    bloqueado_por_deuda: false,
    online: true,
    foto_url: null,
    estatus: "activo"
  },
  "test_rep_07": {
    nombre: "Emiliano Zapata",
    nivel: "PLATA",
    finanzas: { deuda_total: 410, cobros_pendientes: 1 },
    bloqueado_por_deuda: false,
    online: false,
    foto_url: null,
    estatus: "activo"
  },
  "test_rep_08": {
    nombre: "Frida K.",
    nivel: "ORO",
    finanzas: { deuda_total: 680, cobros_pendientes: 2 },
    bloqueado_por_deuda: true,   // 680 > 600 → bloqueado
    online: true,
    foto_url: null,
    estatus: "activo"
  },
  "test_rep_09": {
    nombre: "Diego Rivera",
    nivel: "BRONCE",
    finanzas: { deuda_total: 290, cobros_pendientes: 0 },
    bloqueado_por_deuda: false,
    online: true,
    foto_url: null,
    estatus: "activo"
  },
  "test_rep_10": {
    nombre: "Nelly Boss",
    nivel: "DIAMANTE",
    finanzas: { deuda_total: 0, cobros_pendientes: 0 },
    bloqueado_por_deuda: false,
    online: true,
    foto_url: null,
    estatus: "activo"
  }
};

// 15 pedidos activos con estados variados
const PEDIDOS = {};
const pedidosMeta = [
  { cliente: "Carlos V",        monto: 150,  dir: "Col. Centro",         estado: "buscando",  rep: null },
  { cliente: "Ana González",    monto: 320,  dir: "Plaza Cristal",       estado: "en_camino", rep: "test_rep_01" },
  { cliente: "Luis Barrios",    monto:  85,  dir: "Fracc. Las Palmas",   estado: "en_reparto",rep: "test_rep_06" },
  { cliente: "Carmen López",    monto: 430,  dir: "Col. Burócrata",      estado: "buscando",  rep: null },
  { cliente: "Roberto Soto",    monto: 270,  dir: "Blvd. Belisario",     estado: "pendiente", rep: null },
  { cliente: "Sofía Neri",      monto: 190,  dir: "Col. Copoya",         estado: "en_camino", rep: "test_rep_09" },
  { cliente: "Miguel Ángel",    monto: 560,  dir: "Terán",               estado: "en_reparto",rep: "test_rep_04" },
  { cliente: "Patricia Cruz",   monto: 110,  dir: "Col. Moctezuma",      estado: "buscando",  rep: null },
  { cliente: "Fernando Díaz",   monto: 740,  dir: "Libramiento Norte",   estado: "en_camino", rep: "test_rep_10" },
  { cliente: "Valentina H.",    monto: 220,  dir: "Col. Jardines",       estado: "pendiente", rep: null },
  { cliente: "Jorge Morales",   monto: 390,  dir: "Centro Histórico",    estado: "buscando",  rep: null },
  { cliente: "Elena Ramos",     monto:  65,  dir: "Col. Guadalupe",      estado: "en_camino", rep: "test_rep_03" },
  { cliente: "Tomás Quiñones",  monto: 175,  dir: "Fracc. Universo",     estado: "en_reparto",rep: "test_rep_07" },
  { cliente: "Laura Espinosa",  monto: 980,  dir: "Plaza Las Américas",  estado: "en_camino", rep: "test_rep_08" },
  { cliente: "Ricardo Ochoa",   monto: 310,  dir: "Col. Patria Nueva",   estado: "buscando",  rep: null }
];

const now = Date.now();
pedidosMeta.forEach((p, i) => {
  const id = `order_panel_test_${String(i + 1).padStart(3, "0")}`;
  PEDIDOS[id] = {
    cliente: p.cliente,
    monto: p.monto,
    direccion: p.dir,
    estado: p.estado,
    repartidor_id: p.rep,
    createdAt: now - (i * 60000),  // escalonados cada 1 min
    fuente: "seed_panel_test"
  };
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Iniciando seed de datos de prueba para el Panel...\n");

  console.log("  → Escribiendo 10 repartidores en usuarios/repartidores ...");
  await db.ref("usuarios/repartidores").update(REPARTIDORES);
  console.log("  ✅ Repartidores escritos.");

  console.log("  → Escribiendo 15 pedidos en pedidos_activos ...");
  await db.ref("pedidos_activos").update(PEDIDOS);
  console.log("  ✅ Pedidos escritos.");

  // Resumen de lo que debería ver el Panel
  const bloqueados = Object.values(REPARTIDORES).filter(r => r.bloqueado_por_deuda).length;
  const enReparto  = Object.values(PEDIDOS).filter(p => p.estado === "en_reparto" || p.estado === "en_camino").length;

  console.log("\n📊 Métricas esperadas en el Panel:");
  console.log(`   Repartidores : 10  (+ alberto merlin si ya existía)`);
  console.log(`   Bloqueados   : ${bloqueados}  (Pedro Páramo, Sor Juana, Frida K.)`);
  console.log(`   En reparto   : ${enReparto}  pedidos con estado en_reparto/en_camino`);
  console.log(`   Total activos: 15`);
  console.log("\n  ⚠️  Para limpiar: node scripts/seed-panel-test.js --cleanup");
}

async function cleanup() {
  console.log("🧹 Eliminando datos de prueba del Panel...\n");

  // Eliminar repartidores de prueba
  const updates = {};
  Object.keys(REPARTIDORES).forEach(uid => {
    updates[`usuarios/repartidores/${uid}`] = null;
  });
  Object.keys(PEDIDOS).forEach(id => {
    updates[`pedidos_activos/${id}`] = null;
  });

  await db.ref("/").update(updates);
  console.log(`  ✅ Eliminados ${Object.keys(REPARTIDORES).length} repartidores y ${Object.keys(PEDIDOS).length} pedidos.`);
}

// ── Entry point ───────────────────────────────────────────────────────────────

const doCleanup = process.argv.includes("--cleanup");

(doCleanup ? cleanup() : seed())
  .then(() => {
    console.log("\n✅ Operación completa.");
    process.exit(0);
  })
  .catch(err => {
    console.error("\n❌ Error:", err.message);
    process.exit(1);
  });
