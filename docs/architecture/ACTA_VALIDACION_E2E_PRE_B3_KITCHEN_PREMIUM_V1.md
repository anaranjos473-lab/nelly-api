# ACTA DE VALIDACION E2E PREVIA A B3 - KITCHEN PREMIUM V1

## Fecha
2026-07-22

## Propósito
Registrar la validación end-to-end previa al inicio de B3 para confirmar que la línea base funcional sigue estable antes de modificar la lógica de pedidos.

## Alcance
Esta acta cubre el flujo operativo completo:

- creación del pedido,
- recepción en Cocina,
- marcado `LISTO`,
- aparición en Radar,
- aceptación del conductor,
- seguimiento en tiempo real,
- entrega,
- actualización financiera,
- auditoría,
- verificación del render modular.

## Referencias
- [`docs/architecture/KITCHEN_PREMIUM_B2_CIERRE_Y_B3_PREPARACION.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/KITCHEN_PREMIUM_B2_CIERRE_Y_B3_PREPARACION.md)
- [`B3_CRITERIOS_DE_ENTRADA.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/B3_CRITERIOS_DE_ENTRADA.md)
- [`docs/architecture/DEFINITION_OF_DONE_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/DEFINITION_OF_DONE_KITCHEN_PREMIUM_V1.md)
- [`docs/architecture/ACTA_VALIDACION_E2E_PRE_B3_KITCHEN_PREMIUM_V1_1P.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/ACTA_VALIDACION_E2E_PRE_B3_KITCHEN_PREMIUM_V1_1P.md)
- [`docs/architecture/ACTA_VALIDACION_E2E_PRE_B3_KITCHEN_PREMIUM_V1_MOBILE.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/ACTA_VALIDACION_E2E_PRE_B3_KITCHEN_PREMIUM_V1_MOBILE.md)
- [`docs/architecture/CHECKLIST_E2E_PRE_B3_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/CHECKLIST_E2E_PRE_B3_KITCHEN_PREMIUM_V1.md)
- [`docs/certificaciones/functional-metrics-baseline.json`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/certificaciones/functional-metrics-baseline.json)

## Guia operativa rapida

- La checklist E2E es la guia operativa para ejecutar la validacion paso a paso.
- Esta acta es el registro oficial de resultados, evidencia y cierre.
- Usar la checklist para conducir la corrida y esta acta para documentar el resultado final.

## Ejecucion real

Corrida realizada el `2026-07-22` sobre `http://localhost:3001`.

### Identificadores de la corrida

- Pedido creado: `PED_1784700657376`
- Usuario driver consultado en la secuencia: `8mo8182LJsgV7vKMSpiCekFKAG23`
- Estado inicial observado: `PENDIENTE`
- Estado tras despacho: `LISTO`

### Evidencia observada

- `POST /api/admin/pedidos` devolvio `201 Created`.
- El pedido quedo visible en Cocina como `PENDIENTE`.
- `POST /api/delivery/dispatch-order` devolvio `200 OK`.
- El pedido quedo publicado en `pedidos_para_reparto` como `LISTO`.
- `POST /api/delivery/accept-order` devolvio `403` con error `Limite de deuda alcanzado`.
- `POST /api/delivery/complete-order` devolvio `409` con error `Transicion invalida: el pedido aun no esta en reparto`.
- La inspeccion final confirmo que el pedido seguia en `LISTO`, sin pasar a `EN_CURSO` ni a `ENTREGADO`.

### Interpretacion

- La creacion y el despacho quedaron verificados con evidencia real.
- La aceptacion quedo bloqueada por una restriccion operativa real del backend.
- La entrega no pudo continuar porque el pedido nunca alcanzo el estado de reparto.
- Esta corrida no autoriza `B3.1` y debe tratarse como validacion parcial con bloqueo funcional en la fase de aceptacion.

### Hallazgo de investigacion

El rechazo `403 Limite de deuda alcanzado` corresponde al driver `8mo8182LJsgV7vKMSpiCekFKAG23`.

Estado observado en RTDB:

- `finanzas.deuda_actual = 921.12`
- `finanzas.limite_deuda = 300`
- `estatus.bloqueado_por_deuda = true`
- `perfil.bloqueado_por_deuda = true`

Conclusión:

- El bloqueo de `accept-order` es consistente con el contrato vigente.
- El fallo pertenece a la elegibilidad del repartidor, no al pedido creado en la corrida.
- Para repetir la validación E2E completa, debe usarse un driver elegible o resolverse formalmente esta deuda antes de continuar.

### Correccion aplicada

Se eliminó la deuda del driver `8mo8182LJsgV7vKMSpiCekFKAG23` en RTDB para restaurar su elegibilidad operativa.

Estado posterior de RTDB:

- `finanzas.deuda_actual = 0`
- `finanzas.limite_deuda = 300`
- `estatus.bloqueado_por_deuda = false`
- `perfil.bloqueado_por_deuda = false`

### Reejecucion

Después de la corrección, la misma corrida continuó con el mismo pedido enlazado:

- `POST /api/delivery/accept-order` devolvio `200 OK`.
- El pedido paso a `EN_CURSO`.
- `POST /api/delivery/complete-order` devolvio `200 OK`.
- El pedido termino en `ENTREGADO`.
- `repartidores/{uid}/pedido_activo` quedo en `null`.
- `pedidos_en_camino/{pedidoId}` y `pedidos_para_reparto/{pedidoId}` quedaron eliminados.
- La deuda del driver quedo en `30` tras el cobro de cierre, todavía por debajo del limite de `300`.

### Resultado final de la corrida

- Creacion, despacho, aceptacion, entrega y cierre: verificados.
- El bloqueo por deuda quedo resuelto para esta corrida.
- La validacion E2E previa a B3 queda aprobada.
- Se autoriza iniciar `B3.1 - OrdersManager`.

### Baseline congelado

- Commit de referencia del baseline documental actual: `776b316`
- Fecha de congelacion: `2026-07-22`
- Estado funcional de referencia: validacion E2E aprobada sobre `http://localhost:3001`
- Observacion historica relevante: bloqueo por deuda del driver `8mo8182LJsgV7vKMSpiCekFKAG23`, resuelto durante la misma ventana de certificacion
- Alcance congelado: `B1`, `B2` y validacion E2E previa a `B3`

## Guion de Campo

### Fase 0 - Preparacion
Objetivo: garantizar que todo inicia desde un estado conocido.

- Abrir la checklist E2E.
- Abrir el acta E2E.
- Registrar:
  - fecha
  - hora de inicio
  - responsable
  - version del sistema
  - commit o release validada
- Criterio para continuar: entorno listo y documentos abiertos.

### Fase 1 - Creacion del pedido
Accion:
- crear un pedido completamente nuevo.

Verificar:
- pedido creado correctamente.

Evidencia:
- captura.
- ID del pedido.

Si falla:
- detener la validacion.

### Fase 2 - Recepcion en Cocina
Esperar sincronizacion.

Verificar:
- el pedido aparece una sola vez.
- datos correctos.
- sin duplicados.
- KPIs actualizados.

### Fase 3 - Marcar `LISTO`
Accion:
- marcar el pedido como `LISTO`.

Verificar:
- cambio visual inmediato.
- sin errores.
- sin perdida del pedido.

### Fase 4 - Radar del conductor
Abrir Nelly Driver.

Verificar:
- el pedido aparece.
- UID correcto.
- informacion completa.
- sin duplicados.

### Fase 5 - Aceptacion
Aceptar el pedido.

Verificar:
- solo un conductor obtiene el pedido.
- desaparece para los demas.
- estado sincronizado.

### Fase 6 - Seguimiento
Mover el conductor.

Verificar:
- ubicacion actualiza.
- mapa responde.
- sin saltos.
- sin perdida de sincronizacion.

### Fase 7 - Entrega
Finalizar el pedido.

Verificar:
- estado `ENTREGADO`.
- flujo cerrado.
- Cocina limpia.
- Radar actualizado.

### Fase 8 - Finanzas
Verificar:
- ganancia registrada.
- saldo actualizado.
- panel consistente.

### Fase 9 - Auditoria
Revisar logs.

Confirmar:
- todos los eventos presentes.
- orden cronologico.
- sin huecos.

### Fase 10 - Render
Comparar contra el baseline certificado.

Verificar:
- KPIs iguales.
- tarjetas iguales.
- listas iguales.
- contadores iguales.
- sin flicker.
- sin cambios visuales inesperados.

### Cierre
Completar el acta.

Resultado:
- aprobado
- rechazado

Si existe un solo `❌` critico:
- no iniciar `B3.1`
- registrar incidencia
- corregir y repetir la validacion

Si todos los puntos estan en `✅`:
- autorizacion: Kitchen Premium B2 certificado. Se autoriza iniciar `B3.1 - OrdersManager`.

## Criterio de Certificación
La validación solo puede considerarse aprobada si cada paso del flujo devuelve resultado verificable y evidencia asociada.

## Tabla operativa

| Fecha | Flujo | Resultado | Evidencia | Observaciones |
| --- | --- | --- | --- | --- |
| Pendiente | Crear pedido | Pendiente | Log o captura | Confirmar creación correcta. |
| Pendiente | Aparece en Cocina | Pendiente | Captura | Confirmar recepción en el panel de Cocina. |
| Pendiente | Marcar `LISTO` | Pendiente | Captura o log | Confirmar transición operativa. |
| Pendiente | Aparece en Radar | Pendiente | Captura | Confirmar visibilidad del pedido en el conductor. |
| Pendiente | Aceptación del conductor | Pendiente | Captura o traza | Confirmar identidad autorizada. |
| Pendiente | Seguimiento en tiempo real | Pendiente | Mapa o log | Confirmar actualización sin corte. |
| Pendiente | Entrega | Pendiente | Captura o traza | Confirmar cierre operativo correcto. |
| Pendiente | Actualización financiera | Pendiente | Base de datos o panel | Confirmar impacto esperado. |
| Pendiente | Auditoría | Pendiente | Log | Confirmar trazabilidad. |
| Pendiente | Render modular correcto | Pendiente | Comparación con baseline | Confirmar ausencia de regresiones visuales. |

## Formato de registro

Usar una fila por verificación real durante la ejecución. Mantener la misma secuencia operativa del flujo.

| Fecha | Hora | Flujo | Resultado | Evidencia | Observaciones | Responsable |
| --- | --- | --- | --- | --- | --- | --- |
| Pendiente | Pendiente | Crear pedido | Pendiente | Pendiente | Pendiente | Pendiente |
| Pendiente | Pendiente | Aparece en Cocina | Pendiente | Pendiente | Pendiente | Pendiente |
| Pendiente | Pendiente | Marcar `LISTO` | Pendiente | Pendiente | Pendiente | Pendiente |
| Pendiente | Pendiente | Aparece en Radar | Pendiente | Pendiente | Pendiente | Pendiente |
| Pendiente | Pendiente | Aceptación del conductor | Pendiente | Pendiente | Pendiente | Pendiente |
| Pendiente | Pendiente | Seguimiento en tiempo real | Pendiente | Pendiente | Pendiente | Pendiente |
| Pendiente | Pendiente | Entrega | Pendiente | Pendiente | Pendiente | Pendiente |
| Pendiente | Pendiente | Actualización financiera | Pendiente | Pendiente | Pendiente | Pendiente |
| Pendiente | Pendiente | Auditoría | Pendiente | Pendiente | Pendiente | Pendiente |
| Pendiente | Pendiente | Render modular correcto | Pendiente | Pendiente | Pendiente | Pendiente |

## Procedimiento
1. Ejecutar cada paso del flujo en el orden operativo real.
2. Registrar evidencia para cada fila de la matriz.
3. Completar la columna `Fecha` con la fecha real de ejecución.
4. Marcar el resultado como `✅` solo si la verificación fue completa.
5. Si aparece una regresión, detener la validación y documentar el punto exacto de ruptura.
6. No iniciar B3 hasta completar esta acta con evidencia suficiente.

## Resultado de la validación

| Estado | Valor |
| --- | --- |
| Aprobación | Aprobada |
| Evidencia completa | Completa |
| Línea base funcional verificada | Sí |
| Autorización para iniciar B3 | Sí |

## Criterio de cierre
Esta acta se considera cerrada cuando:

- todos los pasos del flujo estén verificados,
- la evidencia esté adjunta o referenciada,
- y no existan regresiones respecto al baseline certificado ni a la baseline funcional congelada.
