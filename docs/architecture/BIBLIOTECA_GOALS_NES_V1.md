# BIBLIOTECA_GOALS_NES_V1
## Biblioteca de Goals del Nelly Engineering System

**Version:** 1.0  
**Estado:** Vigente  
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
**Criterios de aceptacion:** catalogo de eventos definido, contratos claros, consumidores identificados y evidencia de ejecucion.  
**Evidencias:** `CATALOGO_EVENTOS_V1.md`, enlaces en indice maestro, commits de validacion y pruebas del flujo inicial.

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
