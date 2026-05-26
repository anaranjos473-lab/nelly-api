describe('Smoke Test: modulos del sistema multi-agente', () => {
    test('Agente de Despacho debe exportar la funcion de inicio', async () => {
        const modulo = await import('../src/agentes/agenteDespacho.js');
        expect(typeof modulo.iniciarAgenteDespacho).toBe('function');
    });

    test('Agente Financiero debe exportar la funcion de inicio', async () => {
        const modulo = await import('../src/agentes/agenteTarifaDinamica.js');
        expect(typeof modulo.iniciarAgenteFinanciero).toBe('function');
    });

    test('Agente Antifraude debe exportar la funcion de inicio', async () => {
        const modulo = await import('../src/agentes/agenteAntifraude.js');
        expect(typeof modulo.iniciarAgenteAntifraude).toBe('function');
    });

    test('Agente de Soporte debe exportar la funcion de inicio', async () => {
        const modulo = await import('../src/agentes/agenteSoporte.js');
        expect(typeof modulo.iniciarAgenteSoporte).toBe('function');
    });
});
