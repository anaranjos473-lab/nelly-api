# ARQ_HARNESS_ENGINEERING_V1
## Arquitectura de Harness Engineering - Nelly OS

**Version:** 1.0  
**Estado:** Vigente  
**Ambito:** Plataforma Nelly OS

### 1. Objetivo

Definir la arquitectura de Harness Engineering como la capa que convierte capacidades de negocio en sistemas automatizables, trazables y gobernados dentro del NES.

### 2. Que resuelve

Harness Engineering resuelve la necesidad de:

- coordinar capacidades complejas de negocio;
- separar reglas, eventos, automatizacion y presentacion;
- evitar agentes aislados que actuen sin gobierno;
- permitir evolucion incremental sobre capacidades validadas;
- soportar automatizacion asistida por IA sin perder trazabilidad.

### 3. Principios arquitectonicos

- El negocio define la capacidad.
- La arquitectura define el modelo de ejecucion.
- Los eventos describen hechos, no decisiones arbitrarias.
- Las reglas gobiernan el comportamiento.
- Las skills ejecutan procedimientos.
- Los goals organizan iniciativas.
- La IA potencia la automatizacion, pero no sustituye el gobierno.
- Toda automatizacion debe dejar evidencia.

### 4. Componentes principales

#### 4.1 Orchestrator
Coordina el flujo de una capacidad, distribuye tareas y mantiene el orden de ejecucion.

#### 4.2 Event Bus
Propaga eventos relevantes para desacoplar productores y consumidores.

#### 4.3 Rules Engine
Contiene reglas de negocio, politicas o condiciones operativas que determinan comportamiento.

#### 4.4 Skills
Procedimientos reutilizables para ejecutar partes concretas de una capacidad.

#### 4.5 Goals
Iniciativas trazables que definen el trabajo a implementar, validar o certificar.

#### 4.6 APIs
Contratos de entrada y salida para que otros sistemas o paneles consuman la capacidad.

#### 4.7 Memory and State
Persistencia del estado necesario para continuidad, observacion y recuperacion.

#### 4.8 Observability
Logs, metricas, health checks y trazas para reconstruir lo que ocurrio.

#### 4.9 AI Layer
Capas de asistencia, recomendacion o automatizacion que operan bajo reglas y trazabilidad.

### 5. Flujo canonical

Capacidad de negocio
-> Orchestrator
-> Rules Engine
-> Event Bus
-> APIs / Skills / AI Layer
-> Observability
-> Evidencia

### 6. Relacion con otras capas del NES

- `MANIFIESTO_NES_V1.md` define identidad, vision y jerarquia.
- `POL_IA_001.md` regula automatizacion y decisiones asistidas.
- `BIBLIOTECA_SKILLS_NES_V1.md` define procedimientos reutilizables.
- `BIBLIOTECA_GOALS_NES_V1.md` organiza iniciativas trazables.
- `NES_GLOSARIO_V1.md` fija el lenguaje comun.

### 7. Gobierno

La arquitectura de Harness Engineering debe respetar:

- la fuente de verdad del backend;
- los contratos certificados;
- la trazabilidad documental;
- la posibilidad de deshabilitar automatizaciones;
- la capacidad de auditoria de cada accion relevante.

### 8. Criterios de evolucion

Una capacidad basada en Harness Engineering puede considerarse madura cuando:

- existe un objetivo claro;
- el flujo es reproducible;
- las reglas estan documentadas;
- los eventos son observables;
- la automatizacion puede auditarse;
- el sistema puede operar sin intervención manual constante.

### 9. No alcance

Esta arquitectura no define:

- implementacion especifica de proveedores;
- modelo exacto de IA;
- librerias concretas;
- infraestructura de despliegue;
- UI final de cada capacidad.

### 10. Cierre

Esta arquitectura sirve como referencia para construir capacidades de negocio gobernadas por eventos, reglas, skills, goals, APIs y IA dentro del NES.
