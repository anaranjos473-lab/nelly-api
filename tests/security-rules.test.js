import fs from 'node:fs';

describe('RTDB security rules', () => {
  const rules = JSON.parse(fs.readFileSync(new URL('../security_rules.json', import.meta.url), 'utf8'));
  const pedidos = rules.rules.pedidos;

  test('restricts pedidos reads to authenticated users and rejects client writes', () => {
    expect(pedidos['.read']).toBe('auth != null');
    expect(pedidos['.write']).toBe(false);
    expect(pedidos.$pedido_id['.write']).toBe(false);
  });

  test('declares the estado index used by backend queries', () => {
    expect(pedidos['.indexOn']).toContain('estado');
  });

  test('keeps operational runners and JWT helpers free of non-empty credential defaults', () => {
    const files = [
      'scripts/p1-pilot-internal.mjs',
      'scripts/ov1-rotation-3-drivers.mjs',
      'scripts/validation/validate-operational-port.js',
      'scripts/validation/validate-panels-pre-pilot.mjs',
      'src/middlewares/auth.js',
      'src/utils/jwt.js'
    ];
    const fallbackPattern = /\b[\w$]*(?:password|secret|token|api[_-]?key|credential)[\w$]*\s*=\s*process\.env\.[A-Z0-9_]+\s*\|\|\s*['"][^'"]+/i;

    for (const file of files) {
      const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
      expect(source).not.toMatch(fallbackPattern);
    }
  });

  test('redacts Firebase Auth error bodies in operational runners', () => {
    const files = [
      'scripts/p1-pilot-internal.mjs',
      'scripts/ov1-rotation-3-drivers.mjs',
      'scripts/validation/validate-operational-port.js'
    ];

    for (const file of files) {
      const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
      expect(source).toContain("Firebase Auth response omitted");
      expect(source).not.toContain('error.body = body;');
    }
  });
});
