# NES_GLOSARIO_V1
## Glosario Oficial del Nelly Engineering System

**Version:** 1.0  
**Estado:** Vigente  
**Ambito:** Plataforma Nelly OS

### 1. Proposito

Definir el significado oficial de los terminos mas usados dentro del NES para mantener consistencia semantica entre politicas, manifiesto, skills, goals, ADRs, certificaciones y documentos operativos.

### 2. Principio de uso

Cuando un termino aparezca en un documento del NES, debe interpretarse segun este glosario salvo que el propio documento indique una definicion mas especifica para un contexto concreto.

### 3. Terminos oficiales

#### Architecture
Estructura de alto nivel que organiza responsabilidades, contratos, dependencias y reglas del sistema.

#### Baseline
Estado de referencia validado que sirve como punto de comparacion, certificacion o recuperacion.

#### Capability
Capacidad de negocio o de sistema que Nelly debe poder ejecutar, automatizar o soportar.

#### Certification
Validacion formal basada en evidencia que confirma que una capacidad, fase o flujo cumple criterios definidos.

#### Dashboard
Vista operativa o analitica que presenta estado, metricas, alertas o resultados del sistema.

#### Decision Matrix
Matriz que registra decisiones relevantes, opciones evaluadas y razon de la eleccion tomada.

#### Evidence
Prueba verificable que respalda una validacion, decision, incidente o cierre.

#### Event
Registro de un hecho relevante del dominio o de la operacion.

#### Freeze
Congelamiento de un estado validado para evitar cambios no justificados.

#### Goal
Iniciativa trazable con objetivo, alcance, no alcance, evidencias y criterios de cierre.

#### Governance
Conjunto de reglas y documentos que controlan como se decide, se desarrolla, se valida y se cierra el trabajo.

#### Harness Engineering
Disciplina que convierte capacidades de negocio en sistemas automatizables basados en reglas, eventos, APIs, skills y observabilidad.

#### Implementation
Trabajo tecnico que materializa una decision, politica, ADR o goal en codigo, configuracion o evidencia.

#### Validation
Comprobacion de que una capacidad o cambio cumple su criterio de aceptacion.

#### Verification
Comprobacion tecnica de que un sistema, script o flujo produce el resultado esperado de forma reproducible.

#### Orchestrator
Componente o capa que coordina pasos, reglas y dependencias para ejecutar una capacidad de forma ordenada.

#### Policy
Regla permanente que orienta decisiones recurrentes del proyecto.

#### Runbook
Guia operativa para ejecutar, revisar o recuperar una capacidad o un proceso.

#### Skill
Procedimiento reutilizable para ejecutar una capacidad concreta de forma consistente.

#### State
Situacion vigente de una entidad o flujo en un momento dado.

#### Baseline Operativo
Baseline que representa la version del sistema validada para operacion controlada.

#### Certification Final
Documento que consolida evidencias, observaciones y decision final sobre una fase o baseline.

#### Operacion
Ejecucion real o controlada de procesos productivos, validaciones o flujos del sistema.

#### Observabilidad
Capacidad de detectar, entender y reconstruir el comportamiento del sistema mediante logs, metricas, health checks y trazas.

#### Workflow
Secuencia de pasos o estados que lleva una capacidad desde su inicio hasta su cierre.

#### Agente
Componente automatizado que ejecuta acciones dentro de un alcance definido y trazable.

#### ADR
Architecture Decision Record. Documento que registra una decision arquitectonica, sus opciones y su justificacion.

#### Manifesto
Documento rector que define la identidad, principios y jerarquia del NES.

### 4. Reglas de interpretacion

- Los terminos del glosario tienen prioridad semantica dentro del NES.
- Si un documento introduce un uso distinto de un termino, debe justificarlo claramente.
- Ningun documento operativo debe redefinir un termino canonico sin actualizacion del glosario.

### 5. Relacion con el NES

- `MANIFIESTO_NES_V1.md` define la identidad y la jerarquia.
- Las politicas definen el gobierno.
- `AGENTS.md` define el contrato operativo resumido.
- Las skills y los goals usan este glosario como referencia comun.

### 6. Criterio de cierre

El glosario se considera util cuando:

- reduce ambiguedad entre documentos;
- mantiene definiciones estables;
- facilita lectura y auditoria;
- apoya la gobernanza documental y tecnica del NES.
