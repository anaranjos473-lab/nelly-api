# ADR-010: Decision final sobre la maquina de estados logistica

## Estado

Propuesta

## Contexto

RC2 y el comparativo posterior mostraron que la maquina actual de estados cumple el contrato minimo del piloto, pero no modela con suficiente granularidad los hitos reales de ultima milla.

El ecosistema Nelly debe decidir entre:

- mantener el contrato actual como baseline oficial;
- o adoptar una maquina logistica enriquecida con coexistencia controlada.

## Entrada analizada

### Evidencia operativa

- Cinco corridas RC2 ejecutadas.
- Flujo extremo a extremo completado en `ENTREGADO`.
- Observaciones consistentes sobre transiciones intermedias no soportadas.
- Un 500 inicial no reproducido posteriormente.

### Evidencia de contrato

- El contrato actual oficial en `CONTRATO_ESTADOS_V1.md` mantiene un flujo simple y estable.
- El ADR-008 propone la version enriquecida.
- El ADR-009 compara impacto, riesgo y compatibilidad.

## Decision

**No adoptar todavia la maquina de estados logistica enriquecida como contrato oficial del piloto.**

Mantener por ahora el contrato actual como baseline oficial:

- `PENDIENTE`
- `LISTO`
- `EN_CURSO`
- `ENTREGADO`
- `CANCELADO`

## Motivo

La version enriquecida aporta valor real, pero su adopcion inmediata aumenta el riesgo de regresiones en una fase en la que el objetivo principal es estabilizar y operar el piloto.

RC2 demostro que:

- el flujo base funciona;
- el contrato actual es suficiente para cerrar entregas;
- los hitos intermedios son una oportunidad de evolucion, no una necesidad inmediata para liberar el piloto.

## Consecuencias

- `LLEGUE_A_TIENDA` y estados similares quedan como propuesta de evolucion, no como contrato oficial.
- Android debe seguir alineado con el contrato oficial actual.
- Backend, paneles, CRM y metricas continuan operando sobre el flujo simple certificado.
- La version enriquecida queda preparada como siguiente fase de producto.

## Criterios para reabrir la decision

Se debe reabrir la adopcion de la maquina enriquecida solo si:

- hay necesidad de trazabilidad fina de ultima milla;
- existe plan de coexistencia controlada;
- hay capacidad de certificar Android, backend y paneles juntos;
- se valida que no rompe el contrato de `complete-order` ni el cierre `ENTREGADO`.

## Recomendacion operativa

1. Liberar el piloto con el contrato actual.
2. Mantener la version enriquecida documentada como evolucion.
3. Planear una migracion posterior si el negocio requiere hitos logistico-operativos mas finos.

