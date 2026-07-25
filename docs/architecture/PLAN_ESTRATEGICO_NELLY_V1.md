# PLAN ESTRATEGICO NELLY V1

**Estado:** Vigente como marco de vision  
**Ambito:** Plataforma Nelly OS  
**Fecha:** 2026-07-25

## 1. Proposito

Definir la vision estrategica que explica por que Nelly se construye como una plataforma operativa autocontrolada y no solo como una aplicacion de delivery.

Este documento responde a la pregunta:

**Por que Nelly esta siendo construido de esta manera?**

No sustituye a RC2, OV1 ni al Doctor Operativo. Los ordena como materializacion progresiva de la vision.

## 2. Lectura correcta

La secuencia oficial es:

```text
Plan Estrategico
        |
        v
Principios de diseno
        |
        v
RC2 - Arquitectura estable
        |
        v
Dominios activos
C2, C3, C4, C5, Q1
        |
        v
Doctor Operativo
        |
        v
OV1 - Evidencia operativa
        |
        v
Piloto controlado
        |
        v
Evaluacion post-piloto
        |
        v
Decision sobre O1
```

## 3. Principios vigentes

Los siguientes principios guian la evolucion de Nelly.

| Principio | Interpretacion en Nelly | Estado |
| --- | --- | --- |
| Murphy | Lo que puede fallar debe ser detectable, diagnosticable y recuperable | Vigente |
| No decidir manualmente sin evidencia | La operacion debe reducir decisiones improvisadas | Vigente |
| Trazabilidad | Cada evento, incidencia, validacion y decision debe dejar evidencia | Vigente |
| Responsabilidad unica | Cada dominio debe tener una funcion clara | Vigente |
| Validar antes de escalar | Ninguna nueva capacidad debe abrirse sin evidencia operativa | Vigente |
| Evolucion incremental | Una capacidad debe operar, validarse y documentarse antes de avanzar | Vigente |

## 4. Materializacion en RC2

RC2 traduce la vision estrategica en arquitectura estable.

| Principio del plan | Materializacion actual |
| --- | --- |
| Resiliencia | Health checks, validadores, Doctor Operativo y puerto oficial `3001` |
| Reducir decisiones manuales | C4 sugiere oportunidades y C5 propone acciones comerciales |
| Trazabilidad | Q1 registra incidencias, causa raiz, merma y accion correctiva |
| Responsabilidades claras | Dominios C2, C3, C4, C5 y Q1 separados |
| Validar antes de escalar | OV1 y gate pre piloto |
| No abrir dominios prematuros | O1 permanece como candidato post-piloto |

## 5. Estado actual del ecosistema

### 5.1 Implementado

- Backend estabilizado.
- Flujo principal validado.
- RC2 consolidado como contrato arquitectonico vigente.
- C2 - CRM Basico certificado.
- C3 - Fidelizacion Basica cerrada funcionalmente.
- C4 - Inteligencia Comercial con oportunidades y acciones sugeridas.
- C5 - Promociones Ligeras con sugerencias derivadas de C4.
- Q1 - Calidad Operativa como dominio transversal.
- OV1 funcionando como mecanismo de evidencia.
- Doctor Operativo consolidado.
- Diagnostico por capas.
- Snapshot operativo.
- Validadores automaticos.
- Puerto operativo oficial `3001`.

### 5.2 En validacion operativa

- Corridas OV1 repetidas.
- Evidencia pre piloto.
- Medicion de C4, C5 y Q1 con datos vivos.
- Estabilidad de Doctor -> OV1 -> Doctor.
- Criterios Go/No-Go para piloto comercial controlado.

### 5.3 Post-piloto

- O1 - Observabilidad Operativa como dominio candidato.
- Analitica operativa mas avanzada.
- Automatizaciones derivadas de evidencia real.
- Alertas de impacto y severidad basadas en patrones reales.

## 6. RC2

RC2 es el contrato arquitectonico activo.

RC2 define:

- la SSOT;
- la separacion de dominios;
- la responsabilidad de C2, C3, C4, C5 y Q1;
- la restriccion de no abrir nuevos dominios sin evidencia;
- la relacion con G1 y OV1.

El Plan Estrategico explica la vision. RC2 define la arquitectura vigente.

## 7. OV1

OV1 no es un dominio.

OV1 es el mecanismo de obtencion de evidencia que permite responder:

- C4 mejora decisiones?
- C5 produce resultados medibles?
- Q1 reduce incidencias, mermas o incertidumbre?
- La informacion capturada es suficiente para detectar patrones?
- El ecosistema puede operar de forma repetible?

OV1 es el puente entre una arquitectura estable y una decision de crecimiento.

## 8. Doctor Operativo

El Doctor Operativo es la implementacion tecnica actual del diagnostico de jornada.

Su responsabilidad es:

- diagnosticar;
- clasificar por capas;
- mostrar severidad;
- proponer una accion inicial;
- emitir evidencia humana y JSON;
- decidir si una corrida puede iniciar.

El Doctor Operativo no es O1.

Es la base tecnica sobre la cual O1 podria construirse si el piloto demuestra que el autodiagnostico debe convertirse en dominio formal.

## 9. O1 - Dominio candidato post-piloto

O1 no forma parte activa de RC2.

O1 queda definido como candidato post-piloto:

> Si el piloto demuestra que el autodiagnostico aporta valor operativo de forma consistente, el Doctor Operativo podra evolucionar hacia el dominio O1 - Observabilidad Operativa, encargado de consolidar diagnosticos, alertas, severidad, impacto y recomendaciones a nivel de plataforma. Hasta entonces, O1 permanece como propuesta arquitectonica y no forma parte del RC2 activo.

La apertura de O1 debera justificarse con evidencia de:

- fallos frecuentes;
- impacto medible;
- reduccion de tiempo de investigacion;
- alertas utiles y no ruidosas;
- patrones repetidos en OV1;
- necesidad de consolidar diagnostico como dominio propio.

## 10. Regla de gobierno

No se debe abrir una nueva capacidad o dominio porque "parece util".

Debe abrirse solo cuando exista evidencia de:

- problema real;
- impacto operativo;
- beneficio esperado;
- costo de mantenimiento aceptable;
- relacion clara con RC2;
- criterio de salida verificable.

## 11. Historial

- 2026-07-25: Se crea el Plan Estrategico Nelly V1 como marco de vision y alineacion entre RC2, OV1, Doctor Operativo y O1 candidato.
