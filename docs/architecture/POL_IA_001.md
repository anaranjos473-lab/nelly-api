# POL-IA-001
## Politica de Inteligencia Artificial y Decisiones Automatizadas - Nelly OS

**Version:** 1.0  
**Estado:** Vigente  
**Ambito:** Plataforma Nelly OS

### 1. Proposito

Establecer los principios para el uso de inteligencia artificial y automatizacion de decisiones en Nelly OS, garantizando trazabilidad, auditabilidad, reversibilidad y alineacion con el gobierno tecnico del NES.

### 2. Alcance

Esta politica aplica a:

- asistentes de ingenieria;
- validadores automaticos;
- orquestadores asistidos por IA;
- scripts de decision o recomendacion;
- automatizaciones operativas;
- herramientas que propongan o ejecuten acciones sobre flujos del sistema.

### 3. Principios

- La IA asiste decisiones; no reemplaza el gobierno del sistema.
- Toda accion automatica debe ser trazable.
- Toda accion automatica debe ser auditable.
- Debe existir un responsable funcional de cada automatizacion.
- Ninguna IA modifica informacion critica sin reglas de negocio definidas.
- Toda automatizacion debe poder deshabilitarse.
- Las decisiones importantes deben registrar contexto suficiente para su revision.

### 4. Reglas de uso

- La IA debe operar dentro de un alcance concreto y documentado.
- La IA no debe inventar comportamiento de negocio ni ampliar contratos.
- Ninguna accion automatica puede alterar flujos certificados sin evidencia nueva.
- Si una automatizacion afecta una capacidad critica, debe existir validacion previa y evidencia de prueba.
- La IA debe preferir configuracion declarativa, reglas explicitas y salidas auditables.

### 5. Gobierno de decisiones automatizadas

Cada automatizacion relevante debe registrar, al menos:

- que accion fue tomada;
- por que se tomo;
- con base en que reglas o evidencias;
- quien es el responsable funcional;
- como puede revertirse o detenerse.

### 6. Harness Engineering

La IA forma parte de capacidades del negocio, no de agentes aislados.

La automatizacion puede participar en:

- despacho inteligente;
- supervision operativa;
- conciliacion financiera;
- validacion tecnica;
- certificacion asistida.

### 7. Excepciones

- Se permite una excepcion solo si existe justificacion tecnica documentada.
- Toda excepcion debe mantener trazabilidad y posibilidad de revision.
- Ninguna excepcion debe comprometer contratos certificados ni la fuente de verdad del sistema.

### 8. Cumplimiento

Una automatizacion basada en IA se considera aceptable cuando:

- esta acotada por alcance;
- deja evidencia verificable;
- puede auditarse;
- puede desactivarse;
- no rompe contratos certificados;
- esta alineada con el manifiesto NES y con las politicas vigentes.

### 9. Referencias

- `MANIFIESTO_NES_V1.md`
- `AGENTS.md`
- `POL_ARCH_001.md`
- `POL_DEV_001.md`
- `POL_DOC_001.md`

### 10. Historial de cambios

- 2026-07-23: Version inicial de la politica de IA y decisiones automatizadas.
