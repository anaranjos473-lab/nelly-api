import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import { allocateCommerceShortId, resolveCommerceIdentity } from '../../src/services/orderShortIdService.js';

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
  if (process.env.FIREBASE_ADMIN_JSON) {
    const raw = process.env.FIREBASE_ADMIN_JSON.trim();
    return raw.startsWith('{')
      ? JSON.parse(raw)
      : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }
  const localPath = path.join(process.cwd(), 'nelly-admin.json');
  if (fs.existsSync(localPath)) {
    return JSON.parse(fs.readFileSync(localPath, 'utf8'));
  }
  throw new Error('No se encontro credencial Firebase Admin');
}

function buildScenario(label, comercioId, comercioNombre) {
  const identity = resolveCommerceIdentity({
    comercio_id: comercioId,
    comercio_nombre: comercioNombre
  });
  const timestamp = Date.now();
  return {
    label,
    timestamp,
    identity
  };
}

async function runConcurrentAllocation(db, scenario, count = 5) {
  const allocations = await Promise.all(
    Array.from({ length: count }, () => allocateCommerceShortId(db, {
      timestamp: scenario.timestamp,
      commerceKey: scenario.identity.commerceKey,
      commerceCode: scenario.identity.commerceCode
    }))
  );

  const shortIds = allocations.map((item) => item.shortId);
  const uniqueShortIds = Array.from(new Set(shortIds));
  const expectedSequence = Array.from({ length: count }, (_, index) => String(index + 1).padStart(3, '0'));
  const sequenceSuffixes = allocations.map((item) => String(item.sequence).padStart(3, '0'));
  const day = allocations[0]?.day || new Date(scenario.timestamp).toISOString().slice(0, 10);
  const sequenceValue = await db.ref(`order_sequences/${scenario.identity.commerceKey}/${day}`).once('value');

  return {
    label: scenario.label,
    commerceKey: scenario.identity.commerceKey,
    commerceCode: scenario.identity.commerceCode,
    timestamp: scenario.timestamp,
    day,
    allocations,
    shortIds,
    uniqueShortIds,
    expectedSequence,
    sequenceSuffixes,
    sequenceValue: sequenceValue.val(),
    passed:
      uniqueShortIds.length === count
      && sequenceSuffixes.join(',') === expectedSequence.join(',')
      && Number(sequenceValue.val() || 0) >= count
  };
}

async function main() {
  const serviceAccount = loadServiceAccount();
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com'
    });
  }

  const db = admin.database();
  const commerceA = buildScenario('COMERCIO_A', 'QA-COMERCIO-A', 'QA Comercio A');
  const commerceB = buildScenario('COMERCIO_B', 'QA-COMERCIO-B', 'QA Comercio B');

  const resultA = await runConcurrentAllocation(db, commerceA, 5);
  const resultB = await runConcurrentAllocation(db, commerceB, 3);

  const report = {
    ok: resultA.passed && resultB.passed,
    standard: '<COMERCIO>-<AAAAMMDD>-<NNN>',
    results: [resultA, resultB]
  };

  console.log(JSON.stringify(report, null, 2));

  if (!report.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(JSON.stringify({
    ok: false,
    message: error.message,
    stack: error.stack
  }, null, 2));
  process.exit(1);
});
