# CERTIFICACION C2 CRM BASICO V1

**Estado:** Certificado  
**Ambito:** Plataforma Nelly OS  
**Goal asociado:** `GOAL-C2-001`

## 1. Objetivo

Dejar constancia de que el CRM basico quedo funcionalmente consolidado sobre la SSOT certificada, con fichas de cliente y comercio apoyadas en evidencia real y sin crear una fuente paralela de verdad.

## 2. Base certificada

La certificacion C2 se apoya en:

- `GOAL-C1-001 - Dashboard Comercial`
- `RC1_BASELINE_V1.md`
- `C2_MAPEO_CAMPOS_CRM_V1.md`
- la vista funcional de `crm-basico.html`
- la proyeccion derivada desde la SSOT

## 3. Alcance certificado

Queda certificado que C2 permite:

- consultar historial por cliente;
- consultar actividad por comercio;
- revisar recurrencia y ticket promedio;
- identificar productos, zonas y observaciones frecuentes;
- mantener consistencia con la SSOT y con la base comercial ya validada.

## 4. Normalizacion definitiva del CRM

Como parte del cierre funcional de C2, se da por completada la normalizacion minima necesaria para sostener la capacidad:

- identidad unica del cliente;
- unificacion de `items` y `normalizedItems`;
- observaciones canonicas;
- zonas y direcciones normalizadas.

Esta normalizacion deja al CRM con un modelo de datos estable para su uso operativo.

## 5. Auditoria de calidad de datos

La certificacion de C2 valida que la lectura del CRM responde a la SSOT y permite auditar:

- clientes con identidad consistente;
- presencia de posibles duplicados;
- pedidos sin cliente asociado;
- comercios huérfanos;
- coherencia entre indicadores y SSOT.

## 6. Validacion funcional completa

Se considera validada la capacidad para recorrer los casos principales del CRM:

- consultar cliente;
- consultar comercio;
- revisar historial;
- revisar ticket promedio;
- revisar frecuencia;
- revisar productos;
- revisar indicadores.

## 7. Evidencia de operacion

La capacidad queda respaldada por:

- numeros de clientes y comercios ya visibles en la vista CRM;
- metricas principales derivadas desde la SSOT;
- capturas o lectura funcional del CRM;
- validacion sobre datos reales;
- referencias en biblioteca e indice maestro.

## 8. Observaciones

No se identifican bloqueos arquitectonicos para C2.

Permanece como deuda controlada la mejora incremental de calidad de datos, pero ya no como bloqueo para certificar la capacidad.

## 9. Resolucion

Se declara `GOAL-C2-001` como **CERTIFICADO**.

El CRM basico queda cerrado funcionalmente y puede servir como base estable para `GOAL-C3-001` y `GOAL-C4-001`.

## 10. Trazabilidad

Esta certificacion debe referenciarse desde el indice maestro, la biblioteca de goals y el programa de implementacion para mantener la linea de madurez de la plataforma.
