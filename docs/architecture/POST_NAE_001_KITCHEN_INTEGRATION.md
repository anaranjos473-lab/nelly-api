# POST-NAE-001: Integracion de Cocina con DataAccessService

## Estado

K5 certificado

## Proposito

Convertir Cocina en un consumidor exclusivo de `DataAccessService v1`, retirando de forma controlada la dependencia paralela de RTDB en la cola operativa visible.

## Contexto

El Nelly Archive Engine ya quedo certificado y congelado como `v1.0`. Sin embargo, Cocina todavia puede mezclar lectura desde el contrato con lectura directa a `pedidos` en RTDB para mantener compatibilidad operativa durante la transicion.

Este trabajo no reabre el NAE ni modifica su release.

## Problema

Cocina debe dejar de mostrar una fuente de verdad mixta:

- contrato NAE para `active_orders`;
- listener directo a `pedidos` para la cola heredada.

Mientras ambas rutas sigan activas, la UI puede exponer estados operativos distintos a los certificados.

## Objetivo

Lograr que la cola visible de Cocina se construya unicamente desde `DataAccessService.getActiveOrders()` y que el listener legado de RTDB quede eliminado o aislado en una capa temporal explicitamente justificada.

## Alcance

- Inventariar la informacion que hoy aporta el listener de RTDB.
- Comparar esa informacion con `active_orders`.
- Confirmar equivalencia funcional antes de retirar nada.
- Migrar la cola visible de Cocina al contrato NAE.
- Validar que la experiencia operativa siga siendo estable.

## No alcance

- No se modifica el release del NAE.
- No se cambia `DataAccessService v1`.
- No se cambia el scheduler.
- No se toca el flujo de archivado historico.
- No se reabre la certificacion E2E del NAE.
- No se eliminan fallbacks documentados si siguen siendo necesarios para resiliencia.

## Criterios de salida

El trabajo puede cerrarse cuando exista evidencia reproducible de que:

- Cocina renderiza la cola operativa solo desde `active_orders`;
- no quedan dependencias directas a `onValue(ref(rtdb, 'pedidos'))` para la cola certificada;
- la UI sigue mostrando pedidos activos, sin perder funcionalidad operativa;
- no aparecen regresiones en los estados visibles de Cocina;
- la traza del contrato sigue estable.

## Riesgos

- Puede existir informacion transitoria que solo resida en RTDB y aun no este representada en `active_orders`.
- Retirar el listener demasiado pronto podria degradar la continuidad operativa.
- Mantener dos fuentes de verdad puede seguir generando divergencia visual.

## Estrategia sugerida

1. Inventario de datos.
2. Equivalencia funcional.
3. Desacoplamiento gradual.
4. Regresion visual y operativa.

## Frente actual

- [`POST_NAE_001_KITCHEN_INTEGRATION_K1_INVENTORY.md`](./POST_NAE_001_KITCHEN_INTEGRATION_K1_INVENTORY.md)
- [`POST_NAE_001_KITCHEN_INTEGRATION_K2_EQUIVALENCE.md`](./POST_NAE_001_KITCHEN_INTEGRATION_K2_EQUIVALENCE.md)
- [`POST_NAE_001_KITCHEN_INTEGRATION_K2_1_OPERATIONAL_VIEW.md`](./POST_NAE_001_KITCHEN_INTEGRATION_K2_1_OPERATIONAL_VIEW.md)
- [`POST_NAE_001_KITCHEN_INTEGRATION_K2_1_EXECUTION.md`](./POST_NAE_001_KITCHEN_INTEGRATION_K2_1_EXECUTION.md)
- [`POST_NAE_001_K4_RTDB_RESIDUAL_DECOUPLING.md`](./POST_NAE_001_K4_RTDB_RESIDUAL_DECOUPLING.md)

## Estado por fase

- K1: cerrado
- K2: cerrado
- K2.1: cerrado
- K3: certificado
- K4: certificado
- K5: certificado

## Relacion con el NAE

- NAE queda congelado.
- Este trabajo es posterior al release `NAE v1.0 Certified`.
- Cualquier ajuste aqui debe preservar el contrato de lectura existente.

## Certificacion final

La certificacion final del frente de Cocina quedo cerrada con:

- K3: migracion del render principal hacia `DataAccessService`.
- K4: desacoplamiento residual de RTDB.
- K5: certificacion E2E completa del frente.

### Conclusiones finales

- La cola principal de Cocina se construye desde `active_orders` mediante `DataAccessService`.
- `window.__nellyArchiveEngineMeta` quedo en modo `archive-engine` con `error: null`.
- El contrato `/api/data-architecture/data-access` respondio correctamente y entrego datos validos.
- El pedido de referencia `PED_1784509957904` aparece exactamente una vez en `historical_orders` y no permanece en `active_orders` ni `today_orders`.
- RTDB dejo de ser la fuente principal de la cola operativa.
- No se observo un faltante estructural que comprometa la operacion basica de Cocina.

### Observaciones de calidad

Estas observaciones no bloquean la certificacion final, pero se registran para saneamiento posterior:

- Existe un registro con identificador `TES ` que conviene revisar por higiene de datos.
- La vista historica de entregados puede requerir una mejora de presentacion o navegacion si se quiere mostrar el pedido archivado de forma mas explicita en una corrida visual dedicada.

## Historial de cambios

- 2026-07-30: frente de integracion creado a partir de la deuda detectada en Cocina.
