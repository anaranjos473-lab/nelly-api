import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rulesPath = path.join(__dirname, '..', 'security_rules.json');
const rules = JSON.parse(readFileSync(rulesPath, 'utf8'));

describe('RTDB driver access rules', () => {
  it('allows authenticated drivers to read pending and active delivery orders', () => {
    const pedidosParaReparto = rules.rules.pedidos_para_reparto;
    expect(pedidosParaReparto).toBeDefined();
    expect(pedidosParaReparto['.read']).toContain('auth != null');

    const pedidosEnCamino = rules.rules.pedidos_en_camino;
    expect(pedidosEnCamino).toBeDefined();
    expect(pedidosEnCamino['.read']).toContain('auth != null');
  });
});
