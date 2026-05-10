import { test } from 'node:test';
import assert from 'node:assert';

// Importaciones dinámicas para validar la sintaxis y exportaciones
test('🛡️ Smoke Test: Verificación de Módulos del Sistema Multi-Agente', async (t) => {
    
    await t.test('Agente de Despacho debe exportar la función de inicio', async () => {
        const modulo = await import('../src/agentes/agenteDespacho.js');
        assert.strictEqual(typeof modulo.iniciarAgenteDespacho, 'function');
    });

    await t.test('Agente Financiero debe exportar la función de inicio', async () => {
        const modulo = await import('../src/agentes/agenteTarifaDinamica.js');
        assert.strictEqual(typeof modulo.iniciarAgenteFinanciero, 'function');
    });

    await t.test('Agente Antifraude debe exportar la función de inicio', async () => {
        const modulo = await import('../src/agentes/agenteAntifraude.js');
        assert.strictEqual(typeof modulo.iniciarAgenteAntifraude, 'function');
    });

    await t.test('Agente de Soporte debe exportar la función de inicio', async () => {
        const modulo = await import('../src/agentes/agenteSoporte.js');
        assert.strictEqual(typeof modulo.iniciarAgenteSoporte, 'function');
    });
});
