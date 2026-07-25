# DECISION CONGELACION ARQUITECTONICA PILOTO V1

**Estado:** Vigente durante piloto comercial controlado
**Ambito:** RC2, dominios activos, Doctor Operativo, OV1, GO/NO-GO, Runbook y jornadas de piloto
**Fecha:** 2026-07-25
**Referencia arquitectonica:** `RC2_BASELINE_ARQUITECTONICA_ECOSISTEMA_V1.md`
**Referencia ejecutiva:** `GO_NO_GO_PRE_PILOTO_V1.md`
**Referencia operativa:** `RUNBOOK_OPERATIVO_PILOTO_V1.md`

## 1. Proposito

Declarar la congelacion arquitectonica del ecosistema Nelly durante el piloto comercial controlado, con el fin de que el piloto evalue el comportamiento real de la arquitectura vigente y no una plataforma que cambia continuamente.

Esta decision protege RC2 como contrato arquitectonico activo y desplaza el foco del proyecto hacia operacion, adopcion, soporte y evidencia.

## 2. Alcance congelado

Durante el piloto quedan congelados:

| Elemento | Estado |
| --- | --- |
| Plan Estrategico | Referencia de vision |
| RC2 | Contrato arquitectonico vigente |
| C2 | CRM Basico |
| C3 | Fidelizacion Basica |
| C4 | Inteligencia Comercial |
| C5 | Promociones Ligeras |
| Q1 | Calidad Operativa |
| Doctor Operativo | Diagnostico tecnico |
| OV1 | Evidencia operativa |
| GO/NO-GO | Autorizacion condicionada |
| Runbook Operativo | Procedimiento diario |

## 3. Cambios permitidos

Durante el piloto se permiten unicamente:

- correcciones de errores reproducibles;
- mejoras de rendimiento;
- ajustes operativos;
- mejoras de mensajes, soporte o procedimientos;
- actualizacion de evidencia OV1;
- documentacion de incidencias, aprendizajes y dictamenes diarios.

Toda correccion debe conservar los contratos certificados y dejar evidencia suficiente.

## 4. Cambios no permitidos

Durante el piloto no se permite:

- modificar RC2;
- crear nuevos dominios;
- activar O1;
- iniciar Q2;
- iniciar C6;
- incorporar IA predictiva;
- crear fuentes de verdad paralelas;
- redisenar la arquitectura;
- cambiar el puerto oficial `3001` para evitar diagnosticos;
- modificar el core sin incidencia reproducible.

## 5. Criterio de excepcion

Una excepcion solo podra evaluarse si existe evidencia operativa clara de que la arquitectura congelada impide continuar el piloto de forma segura.

La excepcion requiere:

1. incidencia registrada;
2. evidencia reproducible;
3. diagnostico por capas;
4. impacto operativo documentado;
5. decision explicita antes de modificar arquitectura.

Si la excepcion implica cambiar RC2 o abrir un dominio nuevo, el piloto debe pausarse hasta emitir un nuevo dictamen.

## 6. Relacion con el GO condicionado

La congelacion arquitectonica no sustituye el GO/NO-GO.

El GO permanece condicionado a:

- Doctor Operativo `OPERABLE`;
- puerto oficial `3001`;
- ledger y finanzas saludables;
- C4, C5 y Q1 visibles;
- OV1 trazable;
- cero errores criticos abiertos.

Si el GO se suspende, la congelacion sigue vigente hasta que exista nuevo dictamen.

## 7. Criterio para avanzar de jornada

No se avanza de una jornada a la siguiente solo por calendario.

Se avanza cuando el cierre diario confirma:

- Doctor Operativo `OPERABLE`;
- sin errores criticos abiertos;
- OV1 completo;
- snapshot final registrado;
- incidencias clasificadas;
- acciones asignadas;
- dictamen emitido.

## 8. Dictamen

Con esta decision, Nelly entra en etapa de estabilidad arquitectonica durante piloto.

La prioridad deja de ser ampliar arquitectura y pasa a ser:

- operar con personas reales;
- medir comportamiento;
- registrar fricciones;
- validar adopcion;
- clasificar incidencias;
- decidir con evidencia.

## 9. Historial

- 2026-07-25: Se declara la congelacion arquitectonica de piloto para proteger RC2 y enfocar la siguiente etapa en operacion y evidencia.
