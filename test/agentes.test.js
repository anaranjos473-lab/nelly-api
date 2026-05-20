// NOTA: Este test originalmente usaba node:test, pero fue adaptado a Jest para compatibilidad CI/CD y multiplataforma.
// Si en el futuro se prefiere node:test, restaurar la versión original.

describe('🛡️ Smoke Test: Verificación de Módulos del Sistema Multi-Agente', () => {
    it('Agente de Despacho debe exportar la función de inicio', async () => {
        const modulo = await import('../src/agentes/agenteDespacho.js');
        expect(typeof modulo.iniciarAgenteDespacho).toBe('function');
    });

    it('Agente Financiero debe exportar la función de inicio', async () => {
        const modulo = await import('../src/agentes/agenteTarifaDinamica.js');
        expect(typeof modulo.iniciarAgenteFinanciero).toBe('function');
    });

    it('Agente Antifraude debe exportar la función de inicio', async () => {
        const modulo = await import('../src/agentes/agenteAntifraude.js');
        expect(typeof modulo.iniciarAgenteAntifraude).toBe('function');
    });

    it('Agente de Soporte debe exportar la función de inicio', async () => {
        const modulo = await import('../src/agentes/agenteSoporte.js');
        expect(typeof modulo.iniciarAgenteSoporte).toBe('function');
    });
});
