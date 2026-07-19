# ADR-007: Separación de bloqueo manual y bloqueo por deuda

## Estado

Activo

## Contexto

El panel administrativo y Android necesitaban una interpretación clara y consistente del estado de elegibilidad de un repartidor. Antes, el contador visual del panel mezclaba bloqueo manual con bloqueo por deuda, lo que podía generar diagnósticos ambiguos.

## Decisión

- `bloqueo_manual` representa únicamente una decisión administrativa.
- `bloqueo_por_deuda` representa únicamente inelegibilidad por política financiera.
- `total_no_elegible` representa la unión de ambos conjuntos sin duplicar UIDs.
- El endpoint de diagnóstico debe exponer los tres conceptos con la misma terminología usada por el panel.
- Android sigue usando la deuda real y el contrato de `accept-order` para decidir la elegibilidad operativa.

## Consecuencias

- El panel deja de mostrar un único contador ambiguo de "bloqueados".
- Soporte y certificación pueden distinguir con precisión el motivo de inelegibilidad.
- Un mismo repartidor no puede contarse dos veces en `total_no_elegible`.
- La lógica de negocio sigue centralizada en backend.
