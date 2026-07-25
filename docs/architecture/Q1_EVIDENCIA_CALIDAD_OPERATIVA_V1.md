# Q1 EVIDENCIA CALIDAD OPERATIVA V1

**Estado:** Evidencia preparatoria  
**Ambito:** Plataforma Nelly OS  
**Goal asociado:** `GOAL-Q1-001`

## 1. Objetivo

Dejar constancia de la primera definicion estructural de Calidad Operativa como dominio separado sobre la SSOT certificada.

## 2. Fuente de verdad

La evidencia se apoya en:

- `GOAL-C1-001 - Dashboard Comercial`
- `GOAL-C2-001 - CRM Basico`
- `GOAL-C3-001 - Fidelizacion Basica`
- `GOAL-C4-001 - Inteligencia Comercial`
- `GOAL-C5-001 - Promociones Ligeras`

## 3. Evidencia estructural

La definicion propuesta separa la calidad operativa en:

- incidencias;
- mermas;
- calidad de entrega;
- calidad de empaque;
- calidad de producto;
- calidad de servicio;
- recomendaciones.

## 4. Lectura operativa

La capa de Calidad Operativa queda separada del CRM para evitar mezclar:

- conocimiento del cliente y comercio;
- con la observacion de fallas, mermas y causas raiz.

## 5. Restricciones

- no crear nuevas fuentes de datos;
- no mezclarla con el CRM;
- no automatizar recomendaciones complejas;
- no modificar el core para registrar estas vistas.

## 6. Criterio de continuidad

Esta evidencia permite abrir la revision funcional de `GOAL-Q1-001` como dominio independiente y usarlo para mejorar la operacion sin contaminar la capa comercial.
