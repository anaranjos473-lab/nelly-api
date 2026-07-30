# POST-NAE-001-E1: Ejecucion de integracion de Cocina

## Estado

Pendiente

## Proposito

Ejecutar la integracion de Cocina con `DataAccessService v1` y recolectar evidencia de que la cola visible ya no depende de una lectura mixta con RTDB para la vista certificada.

## Objetivo inmediato

Validar y, si corresponde, retirar la dependencia de la cola certificada respecto a `onValue(ref(rtdb, 'pedidos'))`.

## Paso actual

1. Confirmar que `active_orders` cubre la cola visible que hoy muestra Cocina.
2. Identificar cualquier dato operativo que siga dependiendo de RTDB.
3. Separar o retirar la ruta heredada cuando exista equivalencia funcional.
4. Verificar que la UI conserva el comportamiento esperado.

## Evidencia esperada

- Captura de la cola de Cocina leyendo solo `active_orders`.
- Confirmacion de que no quedan accesos directos a `pedidos` para la cola certificada.
- Regresion visual de estados `PENDIENTE`, `LISTO`, `EN_CURSO` y `ENTREGADO`.

## Criterios de cierre

Este paso puede cerrarse cuando exista evidencia reproducible de que:

- la cola visible de Cocina se alimenta desde `DataAccessService`;
- el legado RTDB no es necesario para la cola certificada;
- la UI no pierde funcionalidad operativa;
- no aparecen errores nuevos en consola ni regresiones visuales.

## Relacion

- [`POST_NAE_001_KITCHEN_INTEGRATION.md`](./POST_NAE_001_KITCHEN_INTEGRATION.md)
- [`../certificaciones/NAE_RELEASE_REPORT_v1.0.md`](./../certificaciones/NAE_RELEASE_REPORT_v1.0.md)

## Historial de cambios

- 2026-07-30: se abre la primera ejecucion del frente de integracion de Cocina.
