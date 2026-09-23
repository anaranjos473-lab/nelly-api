# NELLY-FISCAL V1.1 - Certification Record

## Estado

`IMPLEMENTED / NOT CERTIFIED`

## Evidencia técnica

- `FinancialEvent` valida campos obligatorios, importes no negativos e idempotencia.
- Las reglas fiscales no validadas no producen importes de impuesto.
- `FiscalCase` conserva pedido, evento, ledger, CFDI, settlement, excepciones y certificación.
- El ciclo CFDI rechaza transiciones inválidas y detecta referencias faltantes, duplicados y diferencias.
- El centro de control calcula únicamente métricas derivadas de las revisiones.

## Evidencia de pruebas

La matriz automatizada debe cubrir contrato, reglas pendientes, CFDI, conciliación, importes, excepciones, seguridad y resumen. La ejecución registrada para esta entrega se conserva en la suite `tests/nelly-fiscal.test.js`.

## Pendientes de certificación

- aprobación profesional de reglas mexicanas aplicables;
- contrato económico definitivo de Nelly por componente;
- settlement y conciliación bancaria canónicos;
- RBAC específico para ver, analizar, ajustar, certificar y exportar;
- pruebas de integración con datos controlados y evidencia redactada.
