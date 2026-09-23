// This integration is CommonJS because rules-unit-testing is loaded by node directly.
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} = require('@firebase/rules-unit-testing');

function emulatorConfig() {
  const [host = '127.0.0.1', rawPort = '9000'] = String(process.env.FIREBASE_DATABASE_EMULATOR_HOST || '127.0.0.1:9000').split(':');
  return { host, port: Number(rawPort) };
}

async function main() {
  const { host, port } = emulatorConfig();
  const rules = fs.readFileSync(path.resolve(__dirname, '..', '..', 'security_rules.json'), 'utf8');
  const testEnv = await initializeTestEnvironment({
    projectId: 'demo-nelly-pedidos-ssot',
    database: { host, port, rules }
  });

  try {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.database().ref('pedidos/pedido_ssot_001').set({ estado: 'LISTO' });
    });

    const anonymousDb = testEnv.unauthenticatedContext().database();
    const authenticatedDb = testEnv.authenticatedContext('client_001').database();

    await assertFails(anonymousDb.ref('pedidos/pedido_ssot_001').once('value'));
    await assertFails(anonymousDb.ref('pedidos/pedido_ssot_001/estado').set('ENTREGADO'));
    await assertSucceeds(authenticatedDb.ref('pedidos/pedido_ssot_001').once('value'));
    await assertFails(authenticatedDb.ref('pedidos/pedido_ssot_001/estado').set('ENTREGADO'));

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await assertSucceeds(context.database().ref('pedidos/pedido_ssot_001/estado').set('ENTREGADO'));
    });

    console.log(JSON.stringify({
      ok: true,
      checks: {
        anonymous_read_denied: true,
        anonymous_write_denied: true,
        authenticated_read_allowed: true,
        authenticated_write_denied: true,
        backend_admin_write_allowed: true
      }
    }));
  } finally {
    await testEnv.cleanup();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }));
  process.exit(1);
});
