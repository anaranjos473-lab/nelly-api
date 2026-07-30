# POST-NAE-001-E1: Ejecucion de integracion de Cocina

## Estado

K5 certificado

## Proposito

Ejecutar la integracion de Cocina con `DataAccessService v1` y recolectar evidencia de que la cola visible ya no depende de una lectura mixta con RTDB para la vista certificada.

## Objetivo inmediato

Validar y, si corresponde, retirar la dependencia de la cola certificada respecto a `onValue(ref(rtdb, 'pedidos'))`.

## Nota de infraestructura de validacion

La corrida de K5 confirmo que el contrato de datos responde correctamente, que el panel puede bootstrapping sin errores nuevos y que la cola de Cocina se reconstruye desde `active_orders`.

La evidencia visual y de contrato ya no depende de Firebase remoto para esta certificacion.

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

Este paso se considera cerrado porque existe evidencia reproducible de que:

- la cola visible de Cocina se alimenta desde `DataAccessService`;
- el legado RTDB no es necesario para la cola certificada;
- la UI no pierde funcionalidad operativa;
- no aparecen errores nuevos en consola ni regresiones visuales.

## Conclusion de la corrida actual

- Migracion de origen aplicada y certificada.
- Contrato operativo.
- Backend local operativo.
- Render visual validado con la cola reconstruida desde `active_orders`.
- La evidencia de calidad queda separada para saneamiento posterior.

## Cierre de K5

K5 queda certificado como cierre E2E del frente de Cocina.

La corrida demostro que:

- la cola principal ya no depende de RTDB como fuente principal;
- el bootstrap local completa sin depender de Firebase remoto;
- la reconstruccion de Cocina es coherente con el contrato;
- el pedido de referencia sigue el flujo esperado entre datos activos e historicos.

## Relacion

- [`POST_NAE_001_KITCHEN_INTEGRATION.md`](./POST_NAE_001_KITCHEN_INTEGRATION.md)
- [`../certificaciones/NAE_RELEASE_REPORT_v1.0.md`](./../certificaciones/NAE_RELEASE_REPORT_v1.0.md)

## Historial de cambios

- 2026-07-30: se abre la primera ejecucion del frente de integracion de Cocina.
- 2026-07-30: se registra el inventario K1 de listeners RTDB y consumidores de Cocina.
