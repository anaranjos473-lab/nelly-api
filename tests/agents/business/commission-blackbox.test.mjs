import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const policyPath = path.join(root, "tests", "agents", "config", "commission-policy.json");
const policy = JSON.parse(fs.readFileSync(policyPath, "utf8"));

const enginePath = process.env.COMMISSION_ENGINE_PATH
  ? path.resolve(root, process.env.COMMISSION_ENGINE_PATH)
  : path.join(root, "scripts", "commission-engine.js");

if (!fs.existsSync(enginePath)) {
  console.error("NO PASA: test de comisiones");
  console.error(`- motor no encontrado: ${path.relative(root, enginePath).replaceAll("\\", "/")}`);
  process.exit(1);
}

let api;
try {
  api = await import(`file://${enginePath.replaceAll("\\", "/")}`);
  api = api.default ?? api;
} catch (err) {
  console.error("NO PASA: no se pudo cargar el motor de comisiones", err);
  process.exit(1);
}

function exactEqual(label, actual, expected) {
  assert.equal(actual, expected, `${label}: esperado=${expected}, actual=${actual}`);
}

function run() {
  const fnCommission = api.calculateRestaurantCommission;
  const fnSettlement = api.calculateDriverSettlement;

  assert.equal(typeof fnCommission, "function", "calculateRestaurantCommission no existe");
  assert.equal(typeof fnSettlement, "function", "calculateDriverSettlement no existe");

  const c15 = fnCommission(1000, 0.15, { minMargin: policy.minMargin, maxMargin: policy.maxMargin });
  exactEqual("commission_15", c15.commission, 150);

  const c20 = fnCommission(1000, 0.2, { minMargin: policy.minMargin, maxMargin: policy.maxMargin });
  exactEqual("commission_20", c20.commission, 200);

  assert.throws(
    () => fnCommission(1000, 0.1, { minMargin: policy.minMargin, maxMargin: policy.maxMargin }),
    /margin_fuera_de_rango/,
    "margin inferior a politica debe fallar"
  );

  const s = fnSettlement(
    { orderTotal: 1000, restaurantMargin: policy.defaultMargin, driverBase: 40, adjustments: 10 },
    { minMargin: policy.minMargin, maxMargin: policy.maxMargin }
  );

  exactEqual("settlement_commission", s.restaurantCommission, 150);
  exactEqual("settlement_platform_net", s.platformNet, 850);
  exactEqual("settlement_driver", s.driverSettlement, 900);
}

try {
  run();
  console.log("PASA: pruebas de caja negra de comisiones");
} catch (error) {
  console.error("NO PASA: pruebas de caja negra de comisiones");
  console.error(`- Error: ${error.message}`);
  console.error("  Skill requerida: skills/negocio_comisiones.md");
  console.error("  Referencia: AGENTS.md");
  process.exit(1);
}
