# BIBLIOTECA_SKILLS_NES_V1
## Biblioteca de Skills del Nelly Engineering System

**Version:** 1.0  
**Estado:** Vigente  
**Ambito:** Plataforma Nelly OS

### 1. Proposito

Definir una biblioteca reutilizable de Skills del NES para ejecutar capacidades del proyecto de forma consistente, trazable y alineada con la gobernanza vigente.

### 2. Que es una Skill

Una Skill es un procedimiento operacional reutilizable que describe como ejecutar una capacidad concreta del proyecto.

Cada Skill debe ser:

- clara;
- repetible;
- verificable;
- orientada a evidencia;
- compatible con la arquitectura vigente.

### 3. Estructura estandar de una Skill

Toda Skill del NES debe seguir esta estructura:

1. Identificador
2. Objetivo
3. Alcance
4. Entradas
5. Pasos
6. Validaciones
7. Evidencias esperadas
8. Criterio de cierre
9. Referencias

### 4. Skills base

#### 4.1 SKILL_BACKEND_ENDPOINT

**Objetivo:** crear o ajustar un endpoint backend de forma segura y trazable.  
**Entradas:** contrato, caso de uso, evidencia, pruebas.  
**Pasos:** revisar contrato, implementar cambio pequeño, probar, verificar logs, documentar.  
**Validaciones:** respuesta correcta, compatibilidad con contratos, ausencia de regresiones.  
**Evidencias esperadas:** test, log, diff, commit, referencia documental.

#### 4.2 SKILL_ANDROID_SCREEN

**Objetivo:** crear o ajustar una pantalla Android sin inventar estado de negocio.  
**Entradas:** diseño, flujo, contrato backend, evidencia.  
**Pasos:** revisar repo Android, implementar UI, consumir estado canónico, probar, verificar ciclo de cierre.  
**Validaciones:** reflejo correcto del backend, sin estado inventado, compilacion exitosa.  
**Evidencias esperadas:** captura, prueba, log, commit.

#### 4.3 SKILL_FIREBASE_SECURITY

**Objetivo:** revisar reglas y validaciones de Firebase de forma reproducible.  
**Entradas:** reglas, entorno, credenciales, casos de prueba.  
**Pasos:** validar reglas, ejecutar pruebas, revisar denial/allow, registrar evidencia.  
**Validaciones:** permisos correctos, ausencia de fallos de entorno, coherencia con el contrato.  
**Evidencias esperadas:** tests, resultados de emulator, logs.

#### 4.4 SKILL_QA_CERTIFICATION

**Objetivo:** ejecutar una certificacion funcional o tecnica sobre una capacidad concreta.  
**Entradas:** baseline, checklist, entorno, datos de prueba.  
**Pasos:** ejecutar flujo, inspeccionar estados, validar resultados, cerrar observaciones.  
**Validaciones:** criterio de aceptacion cumplido, sin regresiones, trazabilidad completa.  
**Evidencias esperadas:** acta, resultados, logs, capturas, baseline comparativo.

#### 4.5 SKILL_ARCHITECTURE_REVIEW

**Objetivo:** revisar una decision o cambio arquitectonico antes de implementarlo.  
**Entradas:** ADR, propuesta, impacto, riesgos.  
**Pasos:** leer documentos rectores, evaluar impacto, definir si requiere ADR o actualizacion, registrar decision.  
**Validaciones:** consistencia con el manifiesto NES y las politicas vigentes.  
**Evidencias esperadas:** ADR, comentario de decision, enlace a documentos afectados.

#### 4.6 SKILL_FINANCIAL_VALIDATION

**Objetivo:** validar conciliacion, ledger, deuda y ganancias sobre un flujo real.  
**Entradas:** pedido, baseline financiero, movimientos, saldos.  
**Pasos:** ejecutar flujo, comparar before/after, validar ledger, revisar consistencia, registrar resultado.  
**Validaciones:** conciliacion correcta, movimientos coherentes, deuda y saldo consistentes.  
**Evidencias esperadas:** reporte financiero, snapshot, validacion automatica, acta.

#### 4.7 SKILL_RELEASE

**Objetivo:** preparar y cerrar una entrega o release con evidencia suficiente.  
**Entradas:** estado del branch, pruebas, certificaciones, observaciones.  
**Pasos:** validar cambios, revisar dif, asegurar doc, commit, push, referenciar baseline.  
**Validaciones:** estado limpio, pruebas verdes, sin rupturas de contrato.  
**Evidencias esperadas:** commit hash, push, checklist, certificacion.

### 5. Reglas de uso

- Una Skill no debe inventar alcance nuevo.
- Una Skill debe operar sobre una capacidad concreta.
- Una Skill debe dejar evidencia verificable.
- Una Skill no reemplaza una politica ni una certificacion.
- Una Skill debe ser reutilizable sin perder contexto.

### 6. Relacion con el NES

- `MANIFIESTO_NES_V1.md` define la identidad del NES.
- Las politicas definen reglas permanentes.
- `AGENTS.md` define el contrato operativo corto.
- Las Skills materializan procedimientos reutilizables.

### 7. Criterio de cierre

La biblioteca de Skills se considera util cuando:

- puede reutilizarse en varios dominios;
- mantiene formato consistente;
- produce evidencia comparable;
- se alinea con las politicas del NES;
- facilita ejecucion, validacion y certificacion.
