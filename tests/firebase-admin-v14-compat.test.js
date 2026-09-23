import fs from 'node:fs';

const configs = [
  'config/firebase-admin-esm.js',
  'config/firebase-admin.js'
];

describe('Firebase Admin v14 adapter compatibility', () => {
  test.each(configs)('%s uses product modules instead of removed namespace APIs', (file) => {
    const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');

    expect(source).toContain("import firebaseAdmin from 'firebase-admin'");
    expect(source).toContain("import('firebase-admin/auth')");
    expect(source).toContain('admin.getApps().length');
    expect(source).toContain('credentialFactory(serviceAccount)');
    expect(source).not.toContain('!admin.apps.length');
    expect(source).not.toContain('admin.credential.cert');
  });
});
