# POST-NAE-001: Integracion de Cocina con DataAccessService

## Estado

Propuesto

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

## Relacion con el NAE

- NAE queda congelado.
- Este trabajo es posterior al release `NAE v1.0 Certified`.
- Cualquier ajuste aqui debe preservar el contrato de lectura existente.

## Historial de cambios

- 2026-07-30: frente de integracion creado a partir de la deuda detectada en Cocina.
