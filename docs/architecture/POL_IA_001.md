# POL-IA-001
## Politica de IA y Automatizacion - Nelly OS

**Version:** 1.0  
**Estado:** Vigente  
**Ambito:** Plataforma Nelly OS

### 1. Objetivo

Establecer los principios de uso de IA y automatizacion dentro del proyecto Nelly OS, garantizando trazabilidad, reversibilidad, auditabilidad y alineacion con la arquitectura certificada.

### 2. Principios

- La IA no modifica produccion sin reglas definidas.
- Toda accion automatica debe ser trazable.
- Las decisiones importantes deben quedar registradas.
- Las automatizaciones deben ser reversibles cuando sea posible.
- La IA no sustituye la fuente de verdad del backend.
- La IA no inventa comportamiento de negocio fuera de contrato.

### 3. Alcance

Esta politica aplica a:

- agentes automatizados;
- validadores;
- asistentes de prueba;
- orquestadores de tareas;
- scripts que tomen decisiones sobre flujos operativos;
- herramientas que propongan o ejecuten cambios en el repositorio.

### 4. Reglas de uso

- Toda automatizacion debe operar sobre un dominio o capacidad concreta, no como agente aislado.
- Ninguna automatizacion puede alterar flujos certificados sin evidencia nueva.
- Toda decision automatica relevante debe poder auditarse por log, reporte o acta.
- Los cambios automaticos que afecten contratos deben pasar por prueba y certificacion.
- La automatizacion debe preferir configuracion declarativa y no heuristicas opacas.

### 5. Harness Engineering

La plataforma debe modelar capacidades de negocio, por ejemplo:

- despacho inteligente;
- conciliacion financiera;
- validacion de seguridad;
- supervision operativa;
- certificacion funcional.

Cada capacidad puede apoyarse en eventos, reglas, APIs, paneles e IA, pero no debe depender exclusivamente de un agente aislado.

### 6. Gobernanza

- `AGENTS.md` es el contrato operativo de ingenieria del proyecto.
- Las ADRs definen decisiones de arquitectura.
- Las certificaciones definen hechos validados.
- Esta politica regula el uso de IA dentro de ese marco.

### 7. Criterio de cumplimiento

Una automatizacion se considera aceptable cuando:

- opera dentro de alcance definido;
- deja evidencia verificable;
- no rompe contratos certificados;
- puede desactivarse o revertirse si es necesario;
- no introduce comportamiento no documentado.
