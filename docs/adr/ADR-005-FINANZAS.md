# ADR-005: Finanzas Canonical Scope

## Estado

Activo

## Contexto

Las finanzas del pedido y del repartidor deben poder auditarse sin recorrer estados duplicados ni ramas paralelas.

## Decisión

- `finanzas` contiene agregados globales.
- El perfil del repartidor contiene su estado financiero operativo.
- El panel consume métricas agregadas.

## Consecuencias

- Menos lecturas directas desde la UI.
- Menos riesgo de duplicar cálculos.

