# BIBLIOTECA_GOALS_NES_V1
## Biblioteca de Goals del Nelly Engineering System

**Version:** 1.0  
**Estado:** Cerrado  
**Ambito:** Plataforma Nelly OS

### 1. Proposito

Definir una biblioteca de goals trazables para organizar iniciativas del NES con alcance claro, no alcance explicito, evidencia requerida y criterios de aceptacion verificables.

### 2. Que es un Goal

Un goal es una iniciativa concreta del proyecto que debe poder rastrearse desde su definicion hasta su cierre.

Cada goal debe responder:

- que se quiere lograr;
- que no cubre;
- que riesgo toma;
- que evidencia necesita;
- cuando se considera cerrado.

### 3. Estructura estandar de un Goal

Todo goal del NES debe seguir esta estructura:

1. Identificador
2. Estado
3. Objetivo
4. Alcance
5. No alcance
6. Riesgos
7. Criterios de aceptacion
8. Evidencias
9. Referencias
10. Historial

### 4. Goals base

#### 4.1 GOAL-NES-001

**Estado:** Vigente  
**Objetivo:** consolidar la gobernanza base del NES con manifesto, politicas, AGENTS y bibliotecas reutilizables.  
**Alcance:** contrato operativo, politicas, skills, goals, indices maestros.  
**No alcance:** nuevas funcionalidades de producto.  
**Riesgos:** duplicidad documental, ambiguedad de gobernanza.  
**Criterios de aceptacion:** manifesto creado, politicas base publicadas, AGENTS alineado, bibliotecas enlazadas.  
**Evidencias:** commit, push, enlace en indice maestro, revision documental.

#### 4.2 GOAL-RC1-001

**Estado:** Cerrado  
**Objetivo:** certificar RC1 como baseline operativo estable.  
**Alcance:** seguridad, continuidad, observabilidad y cierre documental de RC1.  
**No alcance:** nuevas funcionalidades.  
**Riesgos:** observaciones operativas sin cerrar.  
**Criterios de aceptacion:** validaciones en verde, baseline trazable, cierre documental emitido.  
**Evidencias:** certificacion final, reporte operativo, acta de apertura S1, validaciones funcionales.

#### 4.3 GOAL-S1-001

**Estado:** Cerrado  
**Objetivo:** ejecutar S1 como fase de seguridad, continuidad, observabilidad y cierre de observaciones heredadas.  
**Alcance:** seguridad, continuidad operativa, observabilidad y validaciones funcionales heredadas.  
**No alcance:** ampliacion funcional de producto.  
**Riesgos:** dependencias de entorno y observaciones menores.  
**Criterios de aceptacion:** fases S1.1 a S1.5 completadas y documentadas.  
**Evidencias:** health checks, backup, validacion funcional, observacion de `evidence_url`.

#### 4.4 GOAL-NES-002

**Estado:** Vigente  
**Objetivo:** formalizar la biblioteca de skills reutilizables del NES.  
**Alcance:** definicion de skills, estructura comun y referencias desde el indice maestro.  
**No alcance:** automatizacion completa del harness.  
**Riesgos:** skills duplicadas o demasiado genericas.  
**Criterios de aceptacion:** biblioteca creada, skills base definidas, uso consistente.  
**Evidencias:** documento maestro, indice enlazado, version en git.

#### 4.5 GOAL-S3-001

**Estado:** Vigente  
**Objetivo:** establecer la plataforma de eventos operativos de Nelly como capacidad de negocio gobernada por el NES.  
**Alcance:** catalogo de eventos, contratos, productores, consumidores, trazabilidad y observabilidad del flujo inicial.  
**No alcance:** IA, brokers externos, microservicios, automatizaciones complejas ni orquestacion completa.  
**Riesgos:** sobrecarga de alcance, duplicacion de reglas, dependencias tecnologicas prematuras.  
**Criterios de aceptacion:** catalogo de eventos definido, contratos claros, consumidores identificados, evidencia de ejecucion y Gate de Certificacion aprobado.  
**Evidencias:** `CATALOGO_EVENTOS_V1.md`, `GATE_CERTIFICACION_S3_V1.md`, `CERTIFICACION_S3_EVENTOS_OPERATIVOS_V1.md`, enlaces en indice maestro, commits de validacion y pruebas del flujo inicial.

#### 4.6 GATE-CERT-S3-001

**Estado:** Cerrado  
**Objetivo:** consolidar la fase de eventos de S3 antes de abrir nuevos consumidores o automatizaciones sensibles.  
**Alcance:** contrato de evento, aislamiento de fallos, idempotencia, observabilidad y validacion automatizada.  
**No alcance:** nuevas capacidades de notificacion o IA.  
**Riesgos:** duplicidad de efectos, acoplamiento entre consumidores, observabilidad insuficiente.  
**Criterios de aceptacion:** validadores en verde, productor estable, fallos aislados, dedupe logico y evidencia de pruebas.  
**Evidencias:** `GATE_CERTIFICACION_S3_V1.md`, `CERTIFICACION_S3_EVENTOS_OPERATIVOS_V1.md`, `scripts/validation/validate-event-bus-hardening.js`, `test/eventBusHardening.test.js`.

#### 4.7 GOAL-S4-001

**Estado:** Certificado  
**Objetivo:** construir el Dashboard Operativo Unificado como primer consumidor visual de la Plataforma de Eventos Operativos.  
**Alcance:** consumo de proyecciones derivadas, visualizacion operativa, observabilidad y toma de decisiones sin tocar el core.  
**No alcance:** acceso directo al flujo de negocio, productor de eventos, redefinicion del bus o del ledger.  
**Riesgos:** acoplamiento a fuentes operativas, duplicacion de logica, desalineacion visual.  
**Criterios de aceptacion:** dashboard consume proyecciones de S3, no modifica el productor y refleja una fuente de verdad derivada.  
**Evidencias:** `CERTIFICACION_S4_DASHBOARD_OPERATIVO_V1.md`, prototipo o implementacion, enlaces en indice maestro, commits, pruebas de consumo visual.

#### 4.8 GOAL-P1-001

**Estado:** Vigente  
**Objetivo:** ejecutar un piloto controlado sobre la base certificada de RC1 y S4 para validar la operacion real de la plataforma en un entorno medible, supervisado y trazable.  
**Alcance:** flujos E2E controlados, integracion cocina-repartidor-backend-dashboard, evidencia operativa y observacion del doctor.  
**No alcance:** nuevas capacidades arquitectonicas o refactors del core.  
**Riesgos:** divergencia entre dashboard y realidad operativa, dependencias externas, regresiones de campo.  
**Criterios de aceptacion:** flujo completo con evidencia, dashboard en tiempo real, consumidor de eventos desacoplado, doctor estable salvo observacion conocida.  
**Evidencias:** registro del piloto, capturas o logs, snapshot del dashboard, salida del doctor, commits y push, referencias en el indice maestro.

### 5. Reglas de uso

- Cada goal debe tener identificador unico.
- Cada goal debe tener un solo estado claro.
- Cada goal debe tener evidencias asociadas.
- Un goal cerrado no debe reabrirse sin evidencia nueva.
- Un goal no debe mezclar objetivos de arquitectura, operacion y producto sin separacion explicita.

### 6. Relacion con el NES

- `MANIFIESTO_NES_V1.md` define la vision y principios.
- Las politicas definen reglas permanentes.
- `AGENTS.md` define el contrato operativo resumido.
- Las skills describen procedimientos.
- Los goals organizan iniciativas trazables.

### 7. Criterio de cierre

La biblioteca de goals se considera util cuando:

- permite rastrear iniciativas de extremo a extremo;
- mantiene estados coherentes;
- referencia evidencias verificables;
- no duplica el manifiesto ni las politicas;
- facilita priorizacion y seguimiento.
