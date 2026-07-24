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

**Historial:**

- 2026-07-23: Version inicial del goal P1 para piloto controlado.
- 2026-07-23: Primera corrida controlada ejecutada con exito sobre el flujo crear -> despachar -> aceptar -> completar; el dashboard unificado reflejo el estado operativo y el doctor permanecio estable.
- 2026-07-23: Se ejecuto una primera tanda interna de 3 ciclos completos con resultado ok en todos los casos; la validacion global del doctor sigue condicionada por `validate-functional-metrics` debido a la dependencia externa conocida de Firebase.
- 2026-07-23: Se ejecuto una tanda interna extendida de 20 ciclos; los primeros 5 completaron el flujo de forma correcta y el ciclo 6 quedo bloqueado por `403 Limite de deuda alcanzado` en el repartidor del piloto, confirmando una restriccion real de negocio y no una falla de la plataforma.
- 2026-07-23: Se registro un nuevo repartidor de prueba limpio (`tuxtla@nelly.com`) y se ejecuto una serie interna de 20 ciclos sobre la base real; los primeros 10 cerraron correctamente con dashboard `GREEN` y finanzas reconciliadas, y el ciclo 11 quedo bloqueado por `403 Limite de deuda alcanzado`, confirmando que la serie avanza hasta agotar el umbral de deuda operativo.

#### 4.9 GOAL-P1-005

**Estado:** Cerrado  
**Objetivo:** convertir la gestion operativa de deuda en una capacidad oficial y medible del producto para que el piloto no dependa de saneamientos manuales.  
**Alcance:** reglas de generacion de deuda, umbral de bloqueo, proceso de liquidacion, desbloqueo del repartidor, alertas para administracion, estado visible en el dashboard y evidencias de deuda.  
**No alcance:** nuevos consumidores de eventos, refactors del core, cambios de arquitectura o ampliacion comercial del piloto.  
**Riesgos:** persistencia de bloqueos operativos, ambiguedad de reglas, dependencia de saneos manuales mientras la capacidad se implementa.  
**Criterios de aceptacion:** reglas de deuda definidas, umbral explicitado, flujo de liquidacion y desbloqueo trazable, estado visible en dashboard, evidencias y metricas registradas.  
**Evidencias:** documento de alcance de deuda, validaciones operativas, referencias en indice maestro, commits y pruebas relacionadas.  

**Historial:**

- 2026-07-24: Se cierra GOAL-P1-005 tras validar que el bloqueo por deuda es trazable, el saneamiento directo funciona sobre repartidores de prueba, la rotacion controlada opera con deuda en cero y el dashboard refleja el estado sin ambiguedad.

#### 4.10 GOAL-P2-001

**Estado:** Cerrado  
**Objetivo:** preparar y ejecutar un piloto con comercios reales para validar el valor operativo de Nelly en escenarios cotidianos de negocio.  
**Alcance:** seleccion de 5 comercios piloto, criterios de participacion, capacitacion breve, calendario operativo, metricas de negocio y formato unico de incidencias.  
**No alcance:** nuevas capacidades arquitectonicas, refactors del core o ampliacion masiva de comercios.  
**Riesgos:** procesos de comercio demasiado heterogeneos, baja adherencia operativa, ruido en metricas y confundir aprendizaje de negocio con deuda tecnica.  
**Criterios de aceptacion:** 5 comercios definidos, criterios claros, capacitacion preparada, calendario cerrado, formato de incidencias unificado y metricas definidas.  
**Evidencias:** lista de comercios, criterios de participacion, material de capacitacion, calendario operativo, formato unico de incidencias, referencias en indice maestro.

**Historial:**

- 2026-07-24: Se cierra GOAL-P2-001 tras recorrer completamente la semilla `market_v1` con cinco comercios distintos y cinco cierres consecutivos en verde, manteniendo la salud del backend, la sincronizacion y la lectura marketplace del dashboard operativo.

#### 4.11 GOAL-C1-001

**Estado:** Certificado  
**Objetivo:** transformar los datos operativos ya certificados en un Dashboard Comercial util para tomar decisiones de ventas, operacion, clientes y finanzas.  
**Alcance:** consumo exclusivo de la SSOT certificada, indicadores esenciales, visualizacion operativa y alertas accionables.  
**No alcance:** nuevas fuentes de datos, cambios al core, CRM completo ni automatizaciones comerciales complejas.  
**Riesgos:** acoplar la vista comercial al flujo de negocio, duplicar logica o introducir metricas inconsistentes.  
**Criterios de aceptacion:** indicadores definidos, lectura consistente desde la SSOT, vista util y sin dependencia de fuentes paralelas.  
**Evidencias:** Dashboard Comercial, pruebas de lectura desde SSOT, alertas basicas, referencias en indice maestro y commits de validacion.

**Historial:**

- 2026-07-24: Version inicial del goal C1 para formalizar el Dashboard Comercial como capacidad oficial.
- 2026-07-24: Se define como siguiente objetivo operativo tras P1.5 y P2, con foco en ventas, pedidos, clientes, operacion y finanzas.
- 2026-07-24: Se certifica con evidencia operativa real; el snapshot comercial responde en verde y expone datos consistentes con la SSOT y la operacion viva.

#### 4.12 GOAL-C2-001

**Estado:** Vigente  
**Objetivo:** construir un CRM basico sobre la SSOT certificada para registrar y consultar historial de clientes y comercios sin crear una fuente paralela de verdad.  
**Alcance:** historial de pedidos por cliente, actividad por comercio, recurrencia, ticket promedio, consultas basicas de seguimiento y plan tecnico de cuatro etapas.  
**No alcance:** campañas automaticas, scoring predictivo, IA comercial o automatizaciones de marketing.  
**Riesgos:** duplicar datos, mezclar seguimiento con core, convertir el CRM en una fuente distinta de verdad y sobrecargar la primera version con funciones prematuras.  
**Criterios de aceptacion:** plan tecnico definido, lectura consistente desde la SSOT, historial util y continuidad con C1.  
**Evidencias:** vistas o consultas de CRM, referencias en indice maestro y commits de validacion.

**Historial:**

- 2026-07-24: Version inicial del goal C2 para formalizar el CRM basico como siguiente capacidad.
- 2026-07-24: Se define como capacidad posterior a GOAL-C1-001, apoyandose solo en la evidencia ya certificada.
- 2026-07-24: Se formaliza el plan tecnico de cuatro etapas para arrancar por inventario y normalizacion antes de construir la ficha de cliente y la ficha de comercio.
- 2026-07-24: Se incorpora el mapa inicial de campos CRM como primer entregable de la etapa de inventario y normalizacion.

#### 4.13 GOAL-C3-001

**Estado:** Vigente  
**Objetivo:** construir una capa basica de fidelizacion sobre la SSOT certificada para convertir el historial real de clientes y comercios en acciones simples de recompra, seguimiento y retencion.  
**Alcance:** recurrencia, inactividad, frecuencia de compra, oportunidades de seguimiento y reglas simples de fidelizacion sobre la evidencia ya validada por C1 y C2.  
**No alcance:** campanas automaticas, scoring predictivo, IA comercial completa, automatizaciones de marketing o nuevas fuentes de datos.  
**Riesgos:** duplicar datos, crear una fuente paralela de verdad, introducir automatizaciones prematuras o mezclar fidelizacion con el core.  
**Criterios de aceptacion:** definicion clara de acciones de fidelizacion, lectura consistente desde la SSOT, continuidad con C2 y ausencia de fuentes paralelas.  
**Evidencias:** vistas o consultas de fidelizacion basica, referencias en indice maestro y commits de validacion.

**Historial:**

- 2026-07-24: Version inicial del goal para formalizar la fidelizacion basica como siguiente capacidad sobre la SSOT certificada.
- 2026-07-24: Se define como paso posterior al CRM basico, con foco en recompra, seguimiento y retencion.

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
