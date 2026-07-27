import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  COEXISTENCE_RULES,
  FIRESTORE_BUSINESS_COLLECTIONS,
  RTDB_ENTITIES
} from '../../src/services/dataArchitectureService.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const REQUIRED_COEXISTENCE_RULES = [
  { id: 'orders_rtdb_firestore', severityWhenBoth: 'warning' },
  { id: 'finance_rtdb_firestore', severityWhenBoth: 'high' },
  { id: 'drivers_live_duplicates', severityWhenBoth: 'warning' }
];

const PUBLIC_DIRECT_WRITE_PATTERNS = [
  /\b(updateDoc|setDoc|addDoc|deleteDoc)\s*\(/,
  /\b(update|set|push|remove)\s*\(\s*ref\s*\(\s*(?:rtdb|database|db)\s*,/,
  /firebase\.database\(\)\.ref\([^)]*\)\.(set|update|push|remove)\s*\(/,
  /\.collection\([^)]*['"`](pedidos|orders|finanzas|liquidaciones|repartidores|market_v1|restaurantes)['"`][^)]*\)\.(add|set|update|delete)\s*\(/
];

const FINANCIAL_KEYWORDS = [
  'finanzas',
  'liquidaciones',
  'historial_ventas',
  'pagos',
  'comisiones',
  'cuentas',
  'deuda'
];

const ALLOWED_FINANCIAL_RTDB_PREFIXES = [
  'finanzas',
  'historial_ventas',
  'liquidaciones',
  'liquidaciones_auditoria',
  'pagos_confirmados',
  'repartidores/',
  'usuarios/repartidores/'
];

const CODE_SCAN_TARGETS = [
  'app.js',
  'run_server.js',
  'routes',
  'src'
];

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(target) {
  if (!(await pathExists(target))) return [];
  const stat = await fs.stat(target);
  if (stat.isFile()) return [target];

  const entries = await fs.readdir(target, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const fullPath = path.join(target, entry.name);
    if (entry.isDirectory()) return listFiles(fullPath);
    if (entry.isFile()) return [fullPath];
    return [];
  }));
  return nested.flat();
}

function normalizeRelative(file) {
  return path.relative(ROOT, file).replaceAll(path.sep, '/');
}

async function readText(file) {
  return fs.readFile(file, 'utf8');
}

async function validateCoexistenceRules(failures) {
  for (const expected of REQUIRED_COEXISTENCE_RULES) {
    const rule = COEXISTENCE_RULES.find((item) => item.id === expected.id);
    if (!rule) {
      failures.push(`Falta regla de coexistencia: ${expected.id}`);
      continue;
    }
    if (rule.severityWhenBoth !== expected.severityWhenBoth) {
      failures.push(`Regla ${expected.id} debe ser ${expected.severityWhenBoth}, actual: ${rule.severityWhenBoth}`);
    }
  }
}

async function validateEntityDescriptors(failures) {
  const rtdbMissing = RTDB_ENTITIES.filter((item) => !item.path || !item.owner || !item.sourceRole || !Array.isArray(item.centers));
  const firestoreMissing = FIRESTORE_BUSINESS_COLLECTIONS.filter((item) => !item.collection || !item.owner || !item.targetRole || !Array.isArray(item.centers));

  for (const item of rtdbMissing) {
    failures.push(`Entidad RTDB incompleta en dataArchitectureService: ${item.path || '(sin path)'}`);
  }
  for (const item of firestoreMissing) {
    failures.push(`Coleccion Firestore incompleta en dataArchitectureService: ${item.collection || '(sin collection)'}`);
  }
}

async function validatePublicDirectWrites(failures) {
  const publicFiles = (await listFiles(path.join(ROOT, 'public')))
    .filter((file) => /\.(js|mjs|html)$/i.test(file));

  for (const file of publicFiles) {
    const content = await readText(file);
    for (const pattern of PUBLIC_DIRECT_WRITE_PATTERNS) {
      if (pattern.test(content)) {
        failures.push(`Escritura directa critica detectada en public: ${normalizeRelative(file)} (${pattern})`);
      }
    }
  }
}

function extractRtdbRefs(content) {
  const refs = [];
  const regex = /(?:admin\.database\(\)|db|database)\.ref\(\s*([`'"])([\s\S]*?)\1/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    refs.push(match[2]);
  }
  return refs;
}

function isFinancialPath(refPath) {
  return FINANCIAL_KEYWORDS.some((keyword) => refPath.includes(keyword));
}

function isAllowedFinancialPath(refPath) {
  return ALLOWED_FINANCIAL_RTDB_PREFIXES.some((prefix) => refPath === prefix || refPath.startsWith(prefix));
}

async function validateFinancialRtdbPaths(failures) {
  const filesNested = await Promise.all(CODE_SCAN_TARGETS.map((target) => listFiles(path.join(ROOT, target))));
  const files = filesNested.flat().filter((file) => /\.(js|mjs|cjs)$/i.test(file));

  for (const file of files) {
    const content = await readText(file);
    const refs = extractRtdbRefs(content);
    for (const refPath of refs) {
      if (isFinancialPath(refPath) && !isAllowedFinancialPath(refPath)) {
        failures.push(`Ruta financiera RTDB no catalogada: ${refPath} en ${normalizeRelative(file)}`);
      }
    }
  }
}

async function main() {
  const failures = [];

  await validateCoexistenceRules(failures);
  await validateEntityDescriptors(failures);
  await validatePublicDirectWrites(failures);
  await validateFinancialRtdbPaths(failures);

  if (failures.length > 0) {
    console.error('validate-data-architecture: FAIL');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('validate-data-architecture: OK');
  console.log(`- Reglas de coexistencia protegidas: ${REQUIRED_COEXISTENCE_RULES.length}`);
  console.log('- Escrituras directas criticas desde public: 0');
  console.log('- Rutas financieras RTDB fuera de catalogo: 0');
}

main().catch((error) => {
  console.error('validate-data-architecture: ERROR');
  console.error(error);
  process.exit(1);
});
