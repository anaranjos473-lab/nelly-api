/**
 * seed-market-v1.js
 * Siembra la estructura market_v1 en Firebase RTDB para el Pilar 3 (App Clientes).
 * Crea 3 comercios de Tuxtla + catálogos + índices.
 *
 * Uso:
 *   node scripts/seed-market-v1.js              # Sembrar datos
 *   node scripts/seed-market-v1.js --cleanup    # Eliminar nodo market_v1
 *   node scripts/seed-market-v1.js --dry-run    # Mostrar datos sin escribir
 */

"use strict";

const admin = require("firebase-admin");
const path  = require("path");
const fs    = require("fs");

// ── firebase-admin ────────────────────────────────────────────────────────────
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

// ── Timestamp común ───────────────────────────────────────────────────────────
const NOW = Date.now();

// ── Dataset market_v1 ─────────────────────────────────────────────────────────

const MARKET = {
  comercios: {
    "com_tuxtla_001": {
      nombre: "Tacos El Inge",
      categoria: "Comida Mexicana",
      ciudad: "tuxtla",
      rating: 4.8,
      coords: { lat: 16.7516, lng: -93.1132 },
      abierto: true,
      banner_url: "https://cdn.nelly.app/comercios/com_tuxtla_001/banner.jpg",
      telefono: "9611234567",
      descripcion: "Los mejores tacos al pastor del centro de Tuxtla.",
      tiempo_entrega_min: 20,
      costo_envio_centavos: 1500,
      pedido_minimo_centavos: 5000,
      updated_at: NOW
    },
    "com_tuxtla_002": {
      nombre: "Hamburguesas La Posta",
      categoria: "Comida Rápida",
      ciudad: "tuxtla",
      rating: 4.3,
      coords: { lat: 16.7581, lng: -93.1208 },
      abierto: true,
      banner_url: "https://cdn.nelly.app/comercios/com_tuxtla_002/banner.jpg",
      telefono: "9619876543",
      descripcion: "Hamburguesas artesanales con ingredientes frescos.",
      tiempo_entrega_min: 30,
      costo_envio_centavos: 2000,
      pedido_minimo_centavos: 8000,
      updated_at: NOW
    },
    "com_tuxtla_003": {
      nombre: "Farmacia San Rafael",
      categoria: "Farmacia",
      ciudad: "tuxtla",
      rating: 4.9,
      coords: { lat: 16.7493, lng: -93.1075 },
      abierto: true,
      banner_url: "https://cdn.nelly.app/comercios/com_tuxtla_003/banner.jpg",
      telefono: "9615551234",
      descripcion: "Medicamentos y artículos de salud.",
      tiempo_entrega_min: 15,
      costo_envio_centavos: 1000,
      pedido_minimo_centavos: 3000,
      updated_at: NOW
    },
    "com_tuxtla_004": {
      nombre: "Pizzeria La Ruta",
      categoria: "Pizzeria",
      ciudad: "tuxtla",
      rating: 4.6,
      coords: { lat: 16.7564, lng: -93.1183 },
      abierto: true,
      banner_url: "https://cdn.nelly.app/comercios/com_tuxtla_004/banner.jpg",
      telefono: "9617778899",
      descripcion: "Pizzas familiares y por rebanada para entrega rapida.",
      tiempo_entrega_min: 28,
      costo_envio_centavos: 1800,
      pedido_minimo_centavos: 7000,
      updated_at: NOW
    },
    "com_tuxtla_005": {
      nombre: "Mini Super Central",
      categoria: "Minisuper",
      ciudad: "tuxtla",
      rating: 4.4,
      coords: { lat: 16.7539, lng: -93.1104 },
      abierto: true,
      banner_url: "https://cdn.nelly.app/comercios/com_tuxtla_005/banner.jpg",
      telefono: "9614442211",
      descripcion: "Abarrotes, bebidas y productos de consumo diario.",
      tiempo_entrega_min: 18,
      costo_envio_centavos: 1200,
      pedido_minimo_centavos: 4000,
      updated_at: NOW
    }
  },

  // Catálogo por comercio — precios en centavos (evita decimales flotantes)
  catalogo_por_comercio: {
    "com_tuxtla_001": {
      "prod_1001": {
        nombre: "Orden de Pastor",
        descripcion: "5 tacos con piña y salsa secreta",
        categoria: "tacos",
        precio_centavos: 8500,
        foto_url: "https://cdn.nelly.app/comercios/com_tuxtla_001/prod_1001.jpg",
        disponible: true,
        version_precio: 1,
        updated_at: NOW
      },
      "prod_1002": {
        nombre: "Orden de Suadero",
        descripcion: "5 tacos de suadero con cilantro y cebolla",
        categoria: "tacos",
        precio_centavos: 9000,
        foto_url: "https://cdn.nelly.app/comercios/com_tuxtla_001/prod_1002.jpg",
        disponible: true,
        version_precio: 1,
        updated_at: NOW
      },
      "prod_1003": {
        nombre: "Refresco 600ml",
        descripcion: "Coca-Cola, Pepsi o agua mineral",
        categoria: "bebidas",
        precio_centavos: 2500,
        foto_url: null,
        disponible: true,
        version_precio: 1,
        updated_at: NOW
      },
      "prod_1004": {
        nombre: "Quesadilla con queso",
        descripcion: "Tortilla de maíz, queso fundido y elección de guisado",
        categoria: "quesadillas",
        precio_centavos: 3500,
        foto_url: null,
        disponible: false,  // agotado — para probar filtro de disponibles
        version_precio: 1,
        updated_at: NOW
      }
    },
    "com_tuxtla_002": {
      "prod_2001": {
        nombre: "Hamburguesa Clásica",
        descripcion: "Carne 200g, lechuga, jitomate, cebolla y catsup",
        categoria: "hamburguesas",
        precio_centavos: 9500,
        foto_url: "https://cdn.nelly.app/comercios/com_tuxtla_002/prod_2001.jpg",
        disponible: true,
        version_precio: 1,
        updated_at: NOW
      },
      "prod_2002": {
        nombre: "Hamburguesa BBQ Doble",
        descripcion: "Doble carne, tocino, queso amarillo y salsa BBQ",
        categoria: "hamburguesas",
        precio_centavos: 14900,
        foto_url: "https://cdn.nelly.app/comercios/com_tuxtla_002/prod_2002.jpg",
        disponible: true,
        version_precio: 1,
        updated_at: NOW
      },
      "prod_2003": {
        nombre: "Papas con aderezo",
        descripcion: "Porción grande de papas fritas con aderezo ranch",
        categoria: "acompañamientos",
        precio_centavos: 4500,
        foto_url: null,
        disponible: true,
        version_precio: 1,
        updated_at: NOW
      }
    },
    "com_tuxtla_003": {
      "prod_3001": {
        nombre: "Paracetamol 500mg (caja 10)",
        descripcion: "Analgésico y antipirético genérico",
        categoria: "medicamentos",
        precio_centavos: 2800,
        foto_url: null,
        disponible: true,
        version_precio: 1,
        updated_at: NOW
      },
      "prod_3002": {
        nombre: "Gel antibacterial 400ml",
        descripcion: "Alcohol al 70%",
        categoria: "higiene",
        precio_centavos: 5500,
        foto_url: null,
        disponible: true,
        version_precio: 1,
        updated_at: NOW
      },
      "prod_3003": {
        nombre: "Termómetro digital",
        descripcion: "Lectura en 30 segundos, pila incluida",
        categoria: "dispositivos",
        precio_centavos: 18900,
        foto_url: null,
        disponible: true,
        version_precio: 1,
        updated_at: NOW
      }
    },
    "com_tuxtla_004": {
      "prod_4001": {
        nombre: "Pizza Pepperoni Mediana",
        descripcion: "Queso, pepperoni y salsa de la casa",
        categoria: "pizzas",
        precio_centavos: 12900,
        foto_url: "https://cdn.nelly.app/comercios/com_tuxtla_004/prod_4001.jpg",
        disponible: true,
        version_precio: 1,
        updated_at: NOW
      },
      "prod_4002": {
        nombre: "Pizza Hawaiana Mediana",
        descripcion: "Piña, jamon y queso mozzarella",
        categoria: "pizzas",
        precio_centavos: 13500,
        foto_url: "https://cdn.nelly.app/comercios/com_tuxtla_004/prod_4002.jpg",
        disponible: true,
        version_precio: 1,
        updated_at: NOW
      },
      "prod_4003": {
        nombre: "Refresco 2L",
        descripcion: "Bebida para compartir",
        categoria: "bebidas",
        precio_centavos: 3200,
        foto_url: null,
        disponible: true,
        version_precio: 1,
        updated_at: NOW
      }
    },
    "com_tuxtla_005": {
      "prod_5001": {
        nombre: "Pan de caja",
        descripcion: "Pan blanco para consumo diario",
        categoria: "abarrotes",
        precio_centavos: 4200,
        foto_url: null,
        disponible: true,
        version_precio: 1,
        updated_at: NOW
      },
      "prod_5002": {
        nombre: "Leche entera 1L",
        descripcion: "Leche fresca de uso diario",
        categoria: "abarrotes",
        precio_centavos: 2800,
        foto_url: null,
        disponible: true,
        version_precio: 1,
        updated_at: NOW
      },
      "prod_5003": {
        nombre: "Paquete de agua 6 pzas",
        descripcion: "Agua embotellada",
        categoria: "bebidas",
        precio_centavos: 3900,
        foto_url: null,
        disponible: true,
        version_precio: 1,
        updated_at: NOW
      }
    }
  },

  // Índices: lectura O(1), no se lleva manualmente — se actualiza vía Cloud Function o admin script
  indices: {
    comercios_por_ciudad: {
      tuxtla: {
        "com_tuxtla_001": true,
        "com_tuxtla_002": true,
        "com_tuxtla_003": true,
        "com_tuxtla_004": true,
        "com_tuxtla_005": true
      }
    },
    comercios_por_categoria: {
      "comida_mexicana":  { "com_tuxtla_001": true },
      "comida_rapida":    { "com_tuxtla_002": true },
      "farmacia":         { "com_tuxtla_003": true },
      "pizzeria":         { "com_tuxtla_004": true },
      "minisuper":        { "com_tuxtla_005": true }
    },
    // Solo productos disponibles: evita leer catálogo completo en la app
    productos_disponibles_por_comercio: {
      "com_tuxtla_001": {
        "prod_1001": true,
        "prod_1002": true,
        "prod_1003": true
        // prod_1004 agotado — no aparece aquí
      },
      "com_tuxtla_002": {
        "prod_2001": true,
        "prod_2002": true,
        "prod_2003": true
      },
      "com_tuxtla_003": {
        "prod_3001": true,
        "prod_3002": true,
        "prod_3003": true
      },
      "com_tuxtla_004": {
        "prod_4001": true,
        "prod_4002": true,
        "prod_4003": true
      },
      "com_tuxtla_005": {
        "prod_5001": true,
        "prod_5002": true,
        "prod_5003": true
      }
    }
  }
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function printSummary() {
  const numComercios = Object.keys(MARKET.comercios).length;
  const numProductos = Object.values(MARKET.catalogo_por_comercio)
    .reduce((acc, cat) => acc + Object.keys(cat).length, 0);
  const numDisponibles = Object.values(MARKET.catalogo_por_comercio)
    .reduce((acc, cat) => acc + Object.values(cat).filter(p => p.disponible).length, 0);
  const numAgotados = numProductos - numDisponibles;
  console.log("\n📦 Resumen market_v1:");
  console.log(`   Comercios  : ${numComercios}`);
  console.log(`   Productos  : ${numProductos} (${numDisponibles} disponibles, ${numAgotados} agotados)`);
  console.log(`   Ciudades   : 1 (tuxtla)`);
  console.log(`   Categorías : Comida Mexicana, Comida Rápida, Farmacia, Pizzeria, Minisuper`);
}

async function seed() {
  console.log("🌱 Sembrando market_v1 en Firebase RTDB...\n");
  await db.ref("market_v1").set(MARKET);
  console.log("  ✅ Nodo market_v1 creado.");
  printSummary();
  console.log("\n  ⚠️  Para eliminar: node scripts/seed-market-v1.js --cleanup");
}

async function cleanup() {
  console.log("🧹 Eliminando nodo market_v1...\n");
  await db.ref("market_v1").remove();
  console.log("  ✅ Nodo market_v1 eliminado.");
}

function dryRun() {
  console.log("🔍 DRY RUN — datos que se escribirían en market_v1:");
  console.log(JSON.stringify(MARKET, null, 2));
  printSummary();
}

// ── Entry point ───────────────────────────────────────────────────────────────

const args      = process.argv.slice(2);
const doCleanup = args.includes("--cleanup");
const isDryRun  = args.includes("--dry-run");

let op;
if (isDryRun) {
  dryRun();
  process.exit(0);
} else if (doCleanup) {
  op = cleanup();
} else {
  op = seed();
}

op
  .then(() => {
    console.log("\n✅ Operación completa.");
    process.exit(0);
  })
  .catch(err => {
    console.error("\n❌ Error:", err.message);
    process.exit(1);
  });
