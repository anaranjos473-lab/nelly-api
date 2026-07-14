# C5.2-B.2 - Ventana controlada de observacion B2

Estado: **ACTIVA - EN OBSERVACION**

## Registro oficial T0

| Campo | Valor |
|---|---|
| Campana | `B2-2026-07` |
| T0 Ciudad de Mexico | `2026-07-14 11:08:19.740 -06:00` |
| T0 UTC | `2026-07-14T17:08:19.740Z` |
| Fuente de T0 | `event=initial_metrics`, `generated_at=1784048899740` |
| Instancia | Render `nelly-api`, tipo `Starter`, una instancia (`WEB_CONCURRENCY=1`) |
| Auto-Deploy | `Off` |
| Commit desplegado | `d78395f` |
| Flag | `ENABLE_C5_SHADOW_VALIDATOR=true` |
| Observation ID | `C5_SHADOW_OBSERVATION_ID=B2-2026-07` |
| Backend | Saludable (`/api/health`) |

## Evidencia de activacion

Se observaron las dos senales requeridas con el identificador correcto:

```text
[C5_SHADOW] {"observation_id":"B2-2026-07","event":"initial_metrics",...}
[C5_SHADOW] {"event":"enabled","observation_id":"B2-2026-07"}
```

No aparecieron `stopped` ni `listener_error` en la evidencia de activacion. Dos lecturas posteriores de `/api/health` devolvieron estado saludable: `uptime=209.819115554` a las `2026-07-14T17:11:48.258Z` y `uptime=290.966282704` a las `2026-07-14T17:13:09.405Z`. El aumento continuo confirma que no hubo un reinicio entre ambas muestras.

## Linea base historica

Los registros presentes antes de T0 no forman parte de la cohorte B2:

| Metrica | Valor |
|---|---:|
| Pedidos historicos | 85 |
| Pedidos V2 | 0 |
| Pedidos validos V2 | 0 |
| Pedidos invalidos | 85 |
| Pedidos con aliases | 84 |
| Corridas de validacion inicial | 85 |
| Transiciones invalidas iniciales | 0 |

La cohorte B2 se construye exclusivamente con ids unicos emitidos mediante `event=order_validation` y `source=child_added` despues de T0. Los eventos `child_changed` no incrementan la cohorte.

## Incidencia previa a T0

Antes de esta activacion se intento habilitar el observador conservando por error `B1-2026-07`. El intento fue detectado, descartado y desactivado. Luego se realizo un despliegue manual del mismo commit para aplicar `ENABLE_C5_SHADOW_VALIDATOR=false`; el backend quedo Live y saludable antes de activar B2.

Ese intento no pertenece a B2, no reabre B1 y no se contabiliza en ninguna cohorte. El estado interno del observador B2 se creo de nuevo en el arranque asociado al T0 registrado arriba.

## Condiciones de la ventana

- Duracion minima continua: 72 horas.
- Primer momento posible de cierre normal: `2026-07-17 11:08:19.740 -06:00`, siempre que existan al menos 15 pedidos nuevos unicos conforme a las enmiendas `B2-E1` y `B2-E2`.
- Tamano objetivo vigente: 15 pedidos nuevos unicos.
- Limite maximo: `2026-07-21 11:08:19.740 -06:00`.
- Sin cambios funcionales, despliegues, pushes, migraciones, limpieza de historicos ni reanudacion de C4.
- C5.2-C, C5.2-D y C5.2-E permanecen bloqueadas.

## Aborto inmediato

Se conserva el protocolo definido en `C5_2_B_1_VENTANA_OBSERVACION.md`. Adicionalmente, cualquier evento `stopped`, reinicio inesperado o perdida de continuidad invalida esta ventana y obliga a desactivar el flag, documentar T1 y cerrar B2 como interrumpida.

## Estado de seguimiento

- Cohorte nueva certificada: `11 / 12`.
- Reinicios posteriores a T0 observados: `0` al validar la activacion.
- Eventos `stopped`: `0` al validar la activacion.
- Eventos `listener_error`: `0` al validar la activacion.

## Enmienda B2-E1 - Tamano de cohorte

Fecha de aprobacion: `2026-07-14`, despues de completar y aceptar la Cohorte 6.

- Criterio original: 25 pedidos nuevos y un minimo de 72 horas continuas.
- Criterio enmendado: 12 pedidos nuevos y un minimo de 72 horas continuas; ambos son obligatorios.
- Limite maximo: 7 dias desde T0, sin cambios.
- Si al limite de 7 dias no se cumplen los 12 pedidos y las 72 horas, B2 debe cerrar como incompleta, no como cierre normal exitoso.
- T0, `observation_id`, reglas de cohorte, criterios de interrupcion y congelacion permanecen sin cambios.
- La enmienda es documental; no modifica codigo, configuracion, datos ni infraestructura.

La enmienda se adopto despues de observar un patron P0 sin excepciones en 6 de 6 pedidos aceptados. Por transparencia, las anotaciones anteriores conservan su denominador historico `/25`; desde este punto el seguimiento vigente usa `/12`. La reduccion no convierte seis observaciones en una muestra preespecificada de 12 ni autoriza generalizaciones fuera del flujo `panel_admin -> Cocina -> Repartidores` observado.

## Enmienda B2-E2 - Extension diagnostica de cohorte

Fecha de adopcion: `2026-07-14`, despues de completar el alta y procesamiento operativo de la Cohorte 12.

- Criterio anterior bajo B2-E1: 12 pedidos nuevos y un minimo de 72 horas continuas.
- Criterio vigente: 15 pedidos nuevos y un minimo de 72 horas continuas; ambos son obligatorios.
- Limite maximo: 7 dias desde T0, sin cambios.
- T0, `observation_id`, linea base historica y criterios de interrupcion no cambian.
- No se autorizan cambios de codigo, despliegues, reinicios del backend ni modificaciones de infraestructura o Firebase.

La extension se adopta despues de conocer el resultado del Pedido 12 y tiene un objetivo diagnostico acotado: observar tres repeticiones adicionales usando deliberadamente el UID autenticado del telefono. Por transparencia, los registros historicos hasta la Cohorte 12 conservan el denominador `/12`; desde este punto el seguimiento vigente usa `/15`.

Los Pedidos 13 a 15 pueden demostrar si el resultado externo es reproducible cuando identidad Web y Android coinciden. Si Android sigue sin mostrar los pedidos, fortalecen la existencia de un bloqueo posterior a la asignacion. **No demuestran por si solos la causa interna** —coordenadas, listener, sincronizacion u otra condicion— mientras no exista una traza del consumidor que identifique la etapa exacta.

Protocolo especifico para Pedidos 13 a 15:

1. Mantener en el modulo web exactamente el UID Android `8mo8...AG23`; verificarlo antes de cada aceptacion.
2. Crear y despachar por el flujo habitual, sin scripts ni edicion directa de RTDB.
3. Conservar `child_added`, todos los `child_changed` y `metrics`.
4. Verificar read-only identidad, estado e indices despues de aceptar.
5. Observar pasivamente Android y `logcat`, sin cerrar, reinstalar ni instrumentar la aplicacion durante B2.
6. Registrar por separado si el pedido aparece o no en Android y si existe una traza correlacionable.

## Checkpoint - Cohorte 1

El primer pedido nuevo fue creado mediante el productor oficial Admin y entro a la cohorte a las `2026-07-14 12:23:44.372 -06:00`.

| Campo | Valor |
|---|---|
| Evento | `order_validation` |
| Fuente | `child_added` |
| Observation ID | `B2-2026-07` |
| Productor detectado | `panel_admin` |
| Contract version | `null` |
| Valido V2 | `false` |
| Cumplimiento V2 de cohorte | `0 / 1 (0%)` |

Failure codes observados:

- `CAMPO_REQUERIDO`
- `PRODUCTOR_INVALIDO`
- `VERSION_INVALIDA`
- `COORDENADAS_INVALIDAS`
- `ITEM_INVALIDO`
- `PAGO_INVALIDO`
- `TIPO_INVALIDO`
- `ESTADO_INVALIDO`
- `FASE_INVALIDA`
- `ASIGNACION_INVALIDA`

Aliases observados:

- `id_pedido`, `pedido_id`, `shortId`
- `origen`
- `createdAt`, `created_at`
- `cliente_nombre`, `telefono`
- `monto`, `total`, `monto_total`
- `estado_pedido`, `fase_panel`, `logistica.estado`

Metricas agregadas posteriores al alta: 86 pedidos totales, 0 V2, 0 validos V2, 86 invalidos, 85 con aliases y 86 corridas de validacion. Frente a la linea base de 85 historicos, este incremento de una unidad confirma el alta unica de la Cohorte 1.

No se observaron `initial_metrics` posteriores a T0, `stopped` ni `listener_error` en la evidencia entregada. Una comprobacion posterior de salud devolvio `uptime=4792.008448332` a las `2026-07-14T18:28:10.447Z`, sin reinicio.

### Transicion 1 - Despacho desde Cocina

A las `2026-07-14 12:37:50.056 -06:00`, Cocina produjo un `order_validation` con `source=child_changed`. El pedido salio de En Cocina y quedo esperando repartidor.

El resultado continuo en `valid=false`. `ESTADO_INVALIDO` dejo de aparecer al persistirse `LISTO`, pero se agrego `TRANSICION_INVALIDA`. La causa observada es la incompatibilidad entre el estado inicial V1 `pendiente` y la maquina canonica, que solo admite `PENDIENTE -> COCINA -> LISTO`. Tambien se agrego el alias `fuente_origen`.

Las metricas quedaron en 86 pedidos totales, 87 corridas de validacion y 1 evento de transicion invalida. La cohorte permanece en `1 / 25`, porque `child_changed` no incrementa el conteo.

No se observaron nuevos `initial_metrics`, `stopped` ni `listener_error`. Una lectura de salud posterior devolvio `uptime=5571.723052205` a las `2026-07-14T18:41:10.162Z`, sin reinicio.

### Transicion 2 - Aceptacion por Repartidores

A las `2026-07-14 12:44:43.447 -06:00`, el modulo web Repartidores acepto el pedido y genero otro `order_validation` con `source=child_changed`.

El pedido paso de `LISTO` a `EN_CURSO`, una transicion admitida por la maquina canonica. Por ello `TRANSICION_INVALIDA` dejo de aparecer en la validacion actual, aunque el contador historico de transiciones invalidas permanece en 1. Se agregaron los aliases `repartidor_id` y `conductorId`; `ASIGNACION_INVALIDA` continuo presente.

Las metricas quedaron en 86 pedidos totales, 88 corridas de validacion, 85 pedidos con aliases y 1 evento historico de transicion invalida. La cohorte permanece en `1 / 25`.

Operativamente, el backend retiro el pedido de `pedidos_para_reparto`, lo mantuvo en `pedidos` con estado `EN_CURSO`, registro el pedido activo del repartidor y creo el espejo en `pedidos_en_camino`. Una lectura posterior de salud devolvio `uptime=5976.565009317` a las `2026-07-14T18:47:55.004Z`, sin reinicio.

### Hallazgo de consumidor - Android no recupera la asignacion

El pedido aceptado desde el modulo web no aparecio en Nelly Driver Android. La inspeccion read-only del dispositivo conectado confirmo:

1. Una lectura directa del pedido canonico confirmo que `conductorId` y `repartidor_id` son iguales entre si, pero no coinciden con `FirebaseAuth.currentUser.uid` de Android.
2. Los campos de asignacion corresponden a la sesion administrativa que permanecia autenticada en el navegador, no al UID escrito visualmente en el modulo web Repartidores. La interfaz mostraba el UID capturado, pero `/accept-order` uso el UID efectivo del token Firebase.
3. Android consulta `pedidos` por `conductorId` igual a su propio UID autenticado. El pedido no entro en esa consulta, por lo que la causa directa de que no apareciera en esta ejecucion fue la discrepancia de identidad.
4. Android exige coordenadas operativas de tienda y cliente tanto para ofertas disponibles como para pedidos activos. El productor Admin no genero ninguna. Este es un bloqueo secundario demostrado por inspeccion del codigo, pero no fue la causa inmediata observada: el pedido fue excluido antes, por la consulta de identidad.
5. El dispositivo registra `Permission denied` al intentar publicar presencia en `repartidores_activos`. El error esta confirmado, pero su impacto sobre la recepcion del pedido no fue demostrado en esta ejecucion.

El pedido permanece `EN_CURSO` en la fuente canonica, fuera de `pedidos_para_reparto`, presente en `pedidos_en_camino` y con el puntero `pedido_activo` de la identidad asignada. No se realizo reasignacion, correccion manual ni cambio de datos. El resultado operativo queda marcado como **no recuperado por Android por discrepancia confirmada entre el UID asignado y el UID autenticado en la app**. Las coordenadas ausentes quedan registradas como el siguiente bloqueo previsible, pendiente de una ejecucion donde la identidad si coincida.

## Cohorte 2 - Alta oficial

El pedido anonimizado `PED_1784057966304` ingreso oficialmente como Cohorte 2 a las `2026-07-14 13:39:26.305 -06:00`.

Criterios de ingreso comprobados:

- `observation_id=B2-2026-07`
- `event=order_validation`
- `source=child_added`
- evento posterior a T0
- productor habitual `panel_admin`

Resultado del Shadow Validator:

- `contract_version=null`
- `valid=false`
- cumplimiento V2 acumulado: `0 / 2` (`0%`)
- cohorte acumulada: `2 / 25`

Failure codes observados:

- `CAMPO_REQUERIDO`
- `PRODUCTOR_INVALIDO`
- `VERSION_INVALIDA`
- `COORDENADAS_INVALIDAS`
- `ITEM_INVALIDO`
- `PAGO_INVALIDO`
- `TIPO_INVALIDO`
- `ESTADO_INVALIDO`
- `FASE_INVALIDA`
- `ASIGNACION_INVALIDA`

Aliases observados:

- `id_pedido`, `pedido_id`, `shortId`
- `origen`
- `createdAt`, `created_at`
- `cliente_nombre`, `telefono`
- `monto`, `total`, `monto_total`
- `estado_pedido`, `fase_panel`, `logistica.estado`

Las metricas posteriores al alta quedaron en 87 pedidos totales, 0 V2, 0 validos V2, 87 invalidos, 86 pedidos con aliases, 89 corridas de validacion y 1 evento historico de transicion invalida. `panel_admin` aumento de 13 a 14 pedidos.

La evidencia entregada contiene solo el `initial_metrics` de T0 y no contiene `initial_metrics` posteriores, `stopped` ni `listener_error`. Por tanto, la continuidad metodologica permanece valida con el alcance de los logs revisados. Los eventos `child_changed` que produzca este pedido se conservaran como evolucion, sin incrementar la cohorte.

### Cohorte 2 - Transicion 1: despacho desde Cocina

A las `2026-07-14 13:43:35.499 -06:00`, Cocina genero un `order_validation` con `source=child_changed`. `ESTADO_INVALIDO` dejo de aparecer, se agrego `fuente_origen` y aparecio `TRANSICION_INVALIDA`, reproduciendo la incompatibilidad V1 ya observada entre el estado inicial y la secuencia canonica.

Las metricas quedaron en 87 pedidos totales, 90 corridas de validacion y 2 eventos historicos de transicion invalida. La cohorte permanece en `2 / 25`.

### Cohorte 2 - Transicion 2: aceptacion por Repartidores

A las `2026-07-14 13:47:45.435 -06:00`, el modulo web Repartidores acepto el pedido. El Shadow registro otro `child_changed`; `TRANSICION_INVALIDA` dejo de aparecer en la validacion actual y se agregaron los aliases `repartidor_id` y `conductorId`.

Las metricas quedaron en 87 pedidos totales, 91 corridas de validacion, 86 pedidos con aliases y 2 eventos historicos de transicion invalida. La cohorte permanece en `2 / 25` y el cumplimiento V2 en `0 / 2`.

Una inspeccion read-only posterior confirmo que el pedido canonico quedo `EN_CURSO`, salio de `pedidos_para_reparto`, fue creado en `pedidos_en_camino` y actualizo el puntero `pedido_activo`. `conductorId` y `repartidor_id` coinciden entre si, pero la identidad asignada (`42aU...FZY2`) no coincide con el UID autenticado en Android (`8mo8...AG23`). Tampoco existen coordenadas operativas de cliente ni tienda.

Este segundo caso reproduce el incidente de identidad del Pedido 1 bajo el mismo flujo V1. Se clasifica como **patron repetible en las dos ejecuciones observadas**, sin corregirlo durante B2. La evidencia revisada no contiene `initial_metrics` posteriores a T0, `stopped` ni `listener_error`; la ventana conserva continuidad metodologica.

## Cohorte 3 - Alta oficial

El pedido anonimizado `PED_1784059144023` ingreso oficialmente como Cohorte 3 a las `2026-07-14 13:59:04.024 -06:00`.

Criterios de ingreso comprobados:

- `observation_id=B2-2026-07`
- `event=order_validation`
- `source=child_added`
- evento posterior a T0
- productor habitual `panel_admin`

Resultado del Shadow Validator:

- `contract_version=null`
- `valid=false`
- cumplimiento V2 acumulado: `0 / 3` (`0%`)
- cohorte acumulada: `3 / 25`
- failure codes: `CAMPO_REQUERIDO`, `PRODUCTOR_INVALIDO`, `VERSION_INVALIDA`, `COORDENADAS_INVALIDAS`, `ITEM_INVALIDO`, `PAGO_INVALIDO`, `TIPO_INVALIDO`, `ESTADO_INVALIDO`, `FASE_INVALIDA`, `ASIGNACION_INVALIDA`
- aliases: `id_pedido`, `pedido_id`, `shortId`, `origen`, `createdAt`, `created_at`, `cliente_nombre`, `telefono`, `monto`, `total`, `monto_total`, `estado_pedido`, `fase_panel`, `logistica.estado`

Las metricas posteriores al alta quedaron en 88 pedidos totales, 0 V2, 0 validos V2, 88 invalidos, 87 pedidos con aliases, 92 corridas de validacion y 2 eventos historicos de transicion invalida. `panel_admin` aumento de 14 a 15 pedidos.

La evidencia revisada contiene unicamente el `initial_metrics` de T0 y no contiene `initial_metrics` posteriores, `stopped` ni `listener_error`. La continuidad metodologica permanece valida. El alta por si sola no permite clasificar P0 como `3/3`; esa comprobacion requiere la aceptacion del pedido y la comparacion read-only entre la identidad asignada y la sesion Android.

### Cohorte 3 - Transicion 1: despacho desde Cocina

A las `2026-07-14 14:00:49.672 -06:00`, Cocina genero un `child_changed`. `ESTADO_INVALIDO` dejo de aparecer, se agrego `fuente_origen` y aparecio `TRANSICION_INVALIDA`, repitiendo la secuencia V1 observada en las dos cohortes anteriores.

Las metricas quedaron en 88 pedidos totales, 93 corridas de validacion y 3 eventos historicos de transicion invalida. La cohorte permanece en `3 / 25`.

### Cohorte 3 - Transicion 2: aceptacion y tercera comprobacion de P0

A las `2026-07-14 14:04:10.738 -06:00`, el modulo web Repartidores acepto el pedido y genero otro `child_changed`. El pedido quedo `EN_CURSO`; `TRANSICION_INVALIDA` dejo de aparecer en la validacion actual y se agregaron `repartidor_id` y `conductorId`.

Las metricas quedaron en 88 pedidos totales, 94 corridas de validacion, 87 pedidos con aliases y 3 eventos historicos de transicion invalida. La cohorte permanece en `3 / 25` y el cumplimiento V2 en `0 / 3`.

La inspeccion read-only confirmo nuevamente que `conductorId` y `repartidor_id` son iguales (`42aU...FZY2`), pero no coinciden con el UID Android (`8mo8...AG23`). El pedido salio de `pedidos_para_reparto`, quedo en `pedidos_en_camino`, actualizo `pedido_activo` y carece de coordenadas de tienda y cliente.

P0 queda respaldado como **defecto estructural reproducido en 3 de 3 pedidos aceptados durante B2**. La evidencia revisada no contiene `initial_metrics` posteriores a T0, `stopped` ni `listener_error`; B2 conserva continuidad metodologica.

## Cohorte 4 - Alta oficial

El pedido anonimizado `PED_1784060021304` ingreso oficialmente como Cohorte 4 a las `2026-07-14 14:13:41.305 -06:00`.

Criterios de ingreso comprobados:

- `observation_id=B2-2026-07`
- `event=order_validation`
- `source=child_added`
- evento posterior a T0
- productor habitual `panel_admin`

Resultado del Shadow Validator:

- `contract_version=null`
- `valid=false`
- cumplimiento V2 acumulado: `0 / 4` (`0%`)
- cohorte acumulada: `4 / 25`
- failure codes: `CAMPO_REQUERIDO`, `PRODUCTOR_INVALIDO`, `VERSION_INVALIDA`, `COORDENADAS_INVALIDAS`, `ITEM_INVALIDO`, `PAGO_INVALIDO`, `TIPO_INVALIDO`, `ESTADO_INVALIDO`, `FASE_INVALIDA`, `ASIGNACION_INVALIDA`
- aliases: `id_pedido`, `pedido_id`, `shortId`, `origen`, `createdAt`, `created_at`, `cliente_nombre`, `telefono`, `monto`, `total`, `monto_total`, `estado_pedido`, `fase_panel`, `logistica.estado`

Las metricas posteriores al alta quedaron en 89 pedidos totales, 0 V2, 0 validos V2, 89 invalidos, 88 pedidos con aliases, 95 corridas de validacion y 3 eventos historicos de transicion invalida. `panel_admin` aumento de 15 a 16 pedidos.

La captura operativa confirma que el pedido llego a Cocina en estado `PENDIENTE`. La evidencia revisada solo contiene el `initial_metrics` de T0 y no contiene `initial_metrics` posteriores, `stopped` ni `listener_error`; B2 conserva continuidad metodologica. P0 permanece en `3/3` hasta completar la aceptacion y la comparacion de identidad de este pedido.

### Cohorte 4 - Transicion 1: despacho desde Cocina

A las `2026-07-14 14:17:23.358 -06:00`, Cocina genero un `child_changed`. `ESTADO_INVALIDO` dejo de aparecer, se agrego `fuente_origen` y aparecio `TRANSICION_INVALIDA` por cuarta vez en la secuencia V1 observada.

Las metricas quedaron en 89 pedidos totales, 96 corridas de validacion y 4 eventos historicos de transicion invalida. La cohorte permanece en `4 / 25`.

### Cohorte 4 - Transicion 2: aceptacion y cuarta comprobacion de P0

A las `2026-07-14 14:18:31.519 -06:00`, el modulo web Repartidores acepto el pedido y genero otro `child_changed`. El pedido quedo `EN_CURSO`; se agregaron `repartidor_id` y `conductorId` y `TRANSICION_INVALIDA` dejo de aparecer en la validacion actual.

Las metricas quedaron en 89 pedidos totales, 97 corridas de validacion, 88 pedidos con aliases y 4 eventos historicos de transicion invalida. La cohorte permanece en `4 / 25` y el cumplimiento V2 en `0 / 4`.

La inspeccion read-only confirmo que `conductorId` y `repartidor_id` coinciden (`42aU...FZY2`), pero no con el UID Android (`8mo8...AG23`). El pedido salio de `pedidos_para_reparto`, quedo en `pedidos_en_camino`, actualizo `pedido_activo` y no contiene coordenadas operativas.

P0 queda reproducido en **4 de 4 pedidos aceptados durante B2**. El archivo de evidencia repite bloques historicos, incluido el mismo `initial_metrics` de T0 con `generated_at=1784048899740`; no existe un `initial_metrics` con tiempo posterior a T0, ni aparecen `stopped` o `listener_error`. B2 conserva continuidad metodologica.

## Cohorte 5 - Alta oficial

El pedido anonimizado `PED_1784060924761` ingreso oficialmente como Cohorte 5 a las `2026-07-14 14:28:44.762 -06:00`.

Criterios de ingreso comprobados:

- `observation_id=B2-2026-07`
- `event=order_validation`
- `source=child_added`
- evento posterior a T0
- productor habitual `panel_admin`

Resultado del Shadow Validator:

- `contract_version=null`
- `valid=false`
- cumplimiento V2 acumulado: `0 / 5` (`0%`)
- cohorte acumulada: `5 / 25`
- failure codes: `CAMPO_REQUERIDO`, `PRODUCTOR_INVALIDO`, `VERSION_INVALIDA`, `COORDENADAS_INVALIDAS`, `ITEM_INVALIDO`, `PAGO_INVALIDO`, `TIPO_INVALIDO`, `ESTADO_INVALIDO`, `FASE_INVALIDA`, `ASIGNACION_INVALIDA`
- aliases: `id_pedido`, `pedido_id`, `shortId`, `origen`, `createdAt`, `created_at`, `cliente_nombre`, `telefono`, `monto`, `total`, `monto_total`, `estado_pedido`, `fase_panel`, `logistica.estado`

Las metricas posteriores al alta quedaron en 90 pedidos totales, 0 V2, 0 validos V2, 90 invalidos, 89 pedidos con aliases, 98 corridas de validacion y 4 eventos historicos de transicion invalida. `panel_admin` aumento de 16 a 17 pedidos.

La captura operativa confirma que el pedido llego a Cocina en estado `PENDIENTE`. El fragmento Shadow compartido no contiene `initial_metrics` posterior a T0, `stopped` ni `listener_error`; con el alcance de la evidencia revisada, B2 conserva continuidad metodologica. P0 permanece en `4/4` hasta completar la aceptacion y comparar la identidad asignada.

### Cohorte 5 - Transicion 1: despacho desde Cocina

A las `2026-07-14 14:32:43.319 -06:00`, Cocina genero un `child_changed`. `ESTADO_INVALIDO` dejo de aparecer, se agrego `fuente_origen` y aparecio `TRANSICION_INVALIDA`, elevando a 5 los eventos historicos de esa clase.

Las metricas quedaron en 90 pedidos totales y 99 corridas de validacion. La cohorte permanece en `5 / 25`.

### Cohorte 5 - Transicion 2: aceptacion y quinta comprobacion de P0

A las `2026-07-14 14:34:03.463 -06:00`, el modulo web Repartidores acepto el pedido. El Shadow registro otro `child_changed`; el pedido quedo `EN_CURSO`, se agregaron `repartidor_id` y `conductorId`, y `TRANSICION_INVALIDA` dejo de aparecer en la validacion actual.

Las metricas quedaron en 90 pedidos totales, 100 corridas de validacion, 89 pedidos con aliases y 5 eventos historicos de transicion invalida. La cohorte permanece en `5 / 25` y el cumplimiento V2 en `0 / 5`.

La inspeccion read-only confirmo que la identidad asignada (`42aU...FZY2`) no coincide con Android (`8mo8...AG23`). `conductorId` y `repartidor_id` son coherentes entre si; el pedido salio de `pedidos_para_reparto`, quedo en `pedidos_en_camino`, actualizo `pedido_activo` y carece de coordenadas operativas.

P0 queda reproducido en **5 de 5 pedidos aceptados durante B2**, sin excepciones observadas. Los archivos contienen bloques historicos duplicados, pero el unico `initial_metrics` unico conserva `generated_at=1784048899740`, correspondiente a T0. No aparecen `stopped` ni `listener_error`; B2 conserva continuidad metodologica.

## Cohorte 6 - Alta oficial

El pedido anonimizado `PED_1784061787925` ingreso oficialmente como Cohorte 6 a las `2026-07-14 14:43:07.926 -06:00`.

Criterios de ingreso comprobados:

- `observation_id=B2-2026-07`
- `event=order_validation`
- `source=child_added`
- evento posterior a T0
- productor habitual `panel_admin`

Resultado del Shadow Validator:

- `contract_version=null`
- `valid=false`
- cumplimiento V2 acumulado: `0 / 6` (`0%`)
- cohorte acumulada: `6 / 25`
- failure codes: `CAMPO_REQUERIDO`, `PRODUCTOR_INVALIDO`, `VERSION_INVALIDA`, `COORDENADAS_INVALIDAS`, `ITEM_INVALIDO`, `PAGO_INVALIDO`, `TIPO_INVALIDO`, `ESTADO_INVALIDO`, `FASE_INVALIDA`, `ASIGNACION_INVALIDA`
- aliases: `id_pedido`, `pedido_id`, `shortId`, `origen`, `createdAt`, `created_at`, `cliente_nombre`, `telefono`, `monto`, `total`, `monto_total`, `estado_pedido`, `fase_panel`, `logistica.estado`

Las metricas posteriores al alta quedaron en 91 pedidos totales, 0 V2, 0 validos V2, 91 invalidos, 90 pedidos con aliases, 101 corridas de validacion y 5 eventos historicos de transicion invalida. `panel_admin` aumento de 17 a 18 pedidos.

La captura operativa confirma que el pedido llego a Cocina en estado `PENDIENTE`. El archivo revisado solo contiene el `initial_metrics` original de T0 y no contiene `stopped` ni `listener_error`; B2 conserva continuidad metodologica. P0 permanece en `5/5` hasta completar la aceptacion y comparar la identidad asignada.

### Cohorte 6 - Transicion 1: despacho desde Cocina

A las `2026-07-14 14:45:51.933 -06:00`, Cocina genero un `child_changed`. `ESTADO_INVALIDO` dejo de aparecer, se agrego `fuente_origen` y aparecio `TRANSICION_INVALIDA`, elevando a 6 los eventos historicos de esa clase.

Las metricas quedaron en 91 pedidos totales y 102 corridas de validacion. La cohorte permanece en `6 / 25`.

### Cohorte 6 - Transicion 2: aceptacion y sexta comprobacion de P0

A las `2026-07-14 14:46:58.885 -06:00`, el modulo web Repartidores acepto el pedido. El Shadow registro otro `child_changed`; el pedido quedo `EN_CURSO`, se agregaron `repartidor_id` y `conductorId`, y `TRANSICION_INVALIDA` dejo de aparecer en la validacion actual.

Las metricas quedaron en 91 pedidos totales, 103 corridas de validacion, 90 pedidos con aliases y 6 eventos historicos de transicion invalida. La cohorte permanece en `6 / 25` y el cumplimiento V2 en `0 / 6`.

La inspeccion read-only confirmo nuevamente que la identidad asignada (`42aU...FZY2`) no coincide con Android (`8mo8...AG23`). Los campos de asignacion son coherentes entre si; el pedido salio de `pedidos_para_reparto`, quedo en `pedidos_en_camino`, actualizo `pedido_activo` y carece de coordenadas operativas.

P0 queda reproducido en **6 de 6 pedidos aceptados durante B2**, sin excepciones. El unico `initial_metrics` revisado corresponde a T0 y no aparecen `stopped` ni `listener_error`; B2 conserva continuidad metodologica.

## Cohorte 7 - Alta oficial

El pedido anonimizado `PED_1784062872737` ingreso oficialmente como Cohorte 7 a las `2026-07-14 15:01:12.738 -06:00`.

Criterios de ingreso comprobados:

- `observation_id=B2-2026-07`
- `event=order_validation`
- `source=child_added`
- evento posterior a T0
- productor habitual `panel_admin`

Resultado del Shadow Validator:

- `contract_version=null`
- `valid=false`
- cumplimiento V2 acumulado: `0 / 7` (`0%`)
- cohorte acumulada vigente: `7 / 12`
- failure codes: `CAMPO_REQUERIDO`, `PRODUCTOR_INVALIDO`, `VERSION_INVALIDA`, `COORDENADAS_INVALIDAS`, `ITEM_INVALIDO`, `PAGO_INVALIDO`, `TIPO_INVALIDO`, `ESTADO_INVALIDO`, `FASE_INVALIDA`, `ASIGNACION_INVALIDA`
- aliases: `id_pedido`, `pedido_id`, `shortId`, `origen`, `createdAt`, `created_at`, `cliente_nombre`, `telefono`, `monto`, `total`, `monto_total`, `estado_pedido`, `fase_panel`, `logistica.estado`

Las metricas posteriores al alta quedaron en 92 pedidos totales, 0 V2, 0 validos V2, 92 invalidos, 91 pedidos con aliases, 104 corridas de validacion y 6 eventos historicos de transicion invalida. `panel_admin` aumento de 18 a 19 pedidos.

La captura operativa confirma que el pedido llego a Cocina en estado `PENDIENTE`. El archivo revisado solo contiene el `initial_metrics` original de T0 y no contiene `stopped` ni `listener_error`; B2 conserva continuidad metodologica. P0 permanece en `6/6` hasta completar la aceptacion y comparar la identidad asignada.

### Cohorte 7 - Transicion 1: despacho desde Cocina

A las `2026-07-14 15:04:26.919 -06:00`, Cocina genero un `child_changed`. `ESTADO_INVALIDO` dejo de aparecer, se agrego `fuente_origen` y aparecio `TRANSICION_INVALIDA`, elevando a 7 los eventos historicos de esa clase.

Las metricas quedaron en 92 pedidos totales y 105 corridas de validacion. La cohorte vigente permanece en `7 / 12`.

### Cohorte 7 - Transicion 2: aceptacion y septima comprobacion de P0

A las `2026-07-14 15:04:40.051 -06:00`, el modulo web Repartidores acepto el pedido. El Shadow registro otro `child_changed`; el pedido quedo `EN_CURSO`, se agregaron `repartidor_id` y `conductorId`, y `TRANSICION_INVALIDA` dejo de aparecer en la validacion actual.

Las metricas quedaron en 92 pedidos totales, 106 corridas de validacion, 91 pedidos con aliases y 7 eventos historicos de transicion invalida. La cohorte permanece en `7 / 12` y el cumplimiento V2 en `0 / 7`.

La inspeccion read-only confirmo nuevamente que la identidad asignada (`42aU...FZY2`) no coincide con Android (`8mo8...AG23`). Los campos de asignacion son coherentes entre si; el pedido salio de `pedidos_para_reparto`, quedo en `pedidos_en_camino`, actualizo `pedido_activo` y carece de coordenadas operativas.

P0 queda reproducido en **7 de 7 pedidos aceptados durante B2**, sin excepciones. El unico `initial_metrics` revisado corresponde a T0 y no aparecen `stopped` ni `listener_error`; B2 conserva continuidad metodologica.

## Cohorte 8 - Alta oficial

El pedido anonimizado `PED_1784063311877` ingreso oficialmente como Cohorte 8 a las `2026-07-14 15:08:31.877 -06:00`.

Criterios de ingreso comprobados:

- `observation_id=B2-2026-07`
- `event=order_validation`
- `source=child_added`
- evento posterior a T0
- productor habitual `panel_admin`

Resultado del Shadow Validator:

- `contract_version=null`
- `valid=false`
- cumplimiento V2 acumulado: `0 / 8` (`0%`)
- cohorte acumulada vigente: `8 / 12`
- failure codes: `CAMPO_REQUERIDO`, `PRODUCTOR_INVALIDO`, `VERSION_INVALIDA`, `COORDENADAS_INVALIDAS`, `ITEM_INVALIDO`, `PAGO_INVALIDO`, `TIPO_INVALIDO`, `ESTADO_INVALIDO`, `FASE_INVALIDA`, `ASIGNACION_INVALIDA`
- aliases: `id_pedido`, `pedido_id`, `shortId`, `origen`, `createdAt`, `created_at`, `cliente_nombre`, `telefono`, `monto`, `total`, `monto_total`, `estado_pedido`, `fase_panel`, `logistica.estado`

Las metricas posteriores al alta quedaron en 93 pedidos totales, 0 V2, 0 validos V2, 93 invalidos, 92 pedidos con aliases, 107 corridas de validacion y 7 eventos historicos de transicion invalida. `panel_admin` aumento de 19 a 20 pedidos.

El fragmento Shadow revisado no contiene `initial_metrics`, `stopped` ni `listener_error` nuevos. Con el alcance de la evidencia compartida, B2 conserva continuidad metodologica. P0 permanece en `7/7` hasta completar la aceptacion y comparar la identidad asignada.

### Cohorte 8 - Transicion 1: despacho desde Cocina

A las `2026-07-14 15:12:14.280 -06:00`, Cocina genero un `child_changed`. `ESTADO_INVALIDO` dejo de aparecer, se agrego `fuente_origen` y aparecio `TRANSICION_INVALIDA`, elevando a 8 los eventos historicos de esa clase.

Las metricas quedaron en 93 pedidos totales y 108 corridas de validacion. La cohorte vigente permanece en `8 / 12`.

### Cohorte 8 - Transicion 2: aceptacion y octava comprobacion de P0

A las `2026-07-14 15:12:27.595 -06:00`, el modulo web Repartidores acepto el pedido. El Shadow registro otro `child_changed`; el pedido quedo `EN_CURSO`, se agregaron `repartidor_id` y `conductorId`, y `TRANSICION_INVALIDA` dejo de aparecer en la validacion actual.

Las metricas quedaron en 93 pedidos totales, 109 corridas de validacion, 92 pedidos con aliases y 8 eventos historicos de transicion invalida. La cohorte permanece en `8 / 12` y el cumplimiento V2 en `0 / 8`.

La inspeccion read-only confirmo que la identidad asignada (`42aU...FZY2`) no coincide con Android (`8mo8...AG23`). Los campos de asignacion son coherentes entre si; el pedido salio de `pedidos_para_reparto`, quedo en `pedidos_en_camino`, actualizo `pedido_activo` y carece de coordenadas operativas.

P0 queda reproducido en **8 de 8 pedidos aceptados durante B2**, sin excepciones. En la evidencia nueva no aparecen `initial_metrics`, `stopped` ni `listener_error`; B2 conserva continuidad metodologica.

## Cohorte 9 - Alta oficial

El pedido anonimizado `PED_1784063834206` ingreso oficialmente como Cohorte 9 a las `2026-07-14 15:17:14.211 -06:00`.

Criterios de ingreso comprobados:

- `observation_id=B2-2026-07`
- `event=order_validation`
- `source=child_added`
- evento posterior a T0
- productor habitual `panel_admin`

Resultado del Shadow Validator:

- `contract_version=null`
- `valid=false`
- cumplimiento V2 acumulado: `0 / 9` (`0%`)
- cohorte acumulada vigente: `9 / 12`
- failure codes: `CAMPO_REQUERIDO`, `PRODUCTOR_INVALIDO`, `VERSION_INVALIDA`, `COORDENADAS_INVALIDAS`, `ITEM_INVALIDO`, `PAGO_INVALIDO`, `TIPO_INVALIDO`, `ESTADO_INVALIDO`, `FASE_INVALIDA`, `ASIGNACION_INVALIDA`
- aliases: `id_pedido`, `pedido_id`, `shortId`, `origen`, `createdAt`, `created_at`, `cliente_nombre`, `telefono`, `monto`, `total`, `monto_total`, `estado_pedido`, `fase_panel`, `logistica.estado`

Las metricas posteriores al alta quedaron en 94 pedidos totales, 0 V2, 0 validos V2, 94 invalidos, 93 pedidos con aliases, 110 corridas de validacion y 8 eventos historicos de transicion invalida. `panel_admin` aumento de 20 a 21 pedidos.

La captura operativa confirma que el pedido llego a Cocina en estado `PENDIENTE`. El fragmento revisado no contiene `initial_metrics`, `stopped` ni `listener_error` nuevos; B2 conserva continuidad metodologica. P0 permanece en `8/8` hasta completar la aceptacion y comparar la identidad asignada.

### Cohorte 9 - Transicion 1: despacho desde Cocina

A las `2026-07-14 15:20:02.631 -06:00`, Cocina genero un `child_changed`. `ESTADO_INVALIDO` dejo de aparecer, se agrego `fuente_origen` y aparecio `TRANSICION_INVALIDA`, elevando a 9 los eventos historicos de esa clase.

Las metricas quedaron en 94 pedidos totales y 111 corridas de validacion. La cohorte vigente permanece en `9 / 12`.

### Cohorte 9 - Transicion 2: aceptacion y novena comprobacion de P0

A las `2026-07-14 15:20:16.003 -06:00`, el modulo web Repartidores acepto el pedido. El Shadow registro otro `child_changed`; el pedido quedo `EN_CURSO`, se agregaron `repartidor_id` y `conductorId`, y `TRANSICION_INVALIDA` dejo de aparecer en la validacion actual.

Las metricas quedaron en 94 pedidos totales, 112 corridas de validacion, 93 pedidos con aliases y 9 eventos historicos de transicion invalida. La cohorte permanece en `9 / 12` y el cumplimiento V2 en `0 / 9`.

La inspeccion read-only confirmo que la identidad asignada (`42aU...FZY2`) no coincide con Android (`8mo8...AG23`). Los campos de asignacion son coherentes entre si; el pedido salio de `pedidos_para_reparto`, quedo en `pedidos_en_camino`, actualizo `pedido_activo` y carece de coordenadas operativas.

P0 queda reproducido en **9 de 9 pedidos aceptados durante B2**, sin excepciones. En la evidencia nueva no aparecen `initial_metrics`, `stopped` ni `listener_error`; B2 conserva continuidad metodologica.

## Cohorte 10 - Alta oficial

El pedido anonimizado `PED_1784064352167` ingreso oficialmente como Cohorte 10 a las `2026-07-14 15:25:52.168 -06:00`.

Criterios de ingreso comprobados:

- `observation_id=B2-2026-07`
- `event=order_validation`
- `source=child_added`
- evento posterior a T0
- productor habitual `panel_admin`

Resultado del Shadow Validator:

- `contract_version=null`
- `valid=false`
- cumplimiento V2 acumulado: `0 / 10` (`0%`)
- cohorte acumulada vigente: `10 / 12`
- failure codes: `CAMPO_REQUERIDO`, `PRODUCTOR_INVALIDO`, `VERSION_INVALIDA`, `COORDENADAS_INVALIDAS`, `ITEM_INVALIDO`, `PAGO_INVALIDO`, `TIPO_INVALIDO`, `ESTADO_INVALIDO`, `FASE_INVALIDA`, `ASIGNACION_INVALIDA`
- aliases: `id_pedido`, `pedido_id`, `shortId`, `origen`, `createdAt`, `created_at`, `cliente_nombre`, `telefono`, `monto`, `total`, `monto_total`, `estado_pedido`, `fase_panel`, `logistica.estado`

Las metricas posteriores al alta quedaron en 95 pedidos totales, 0 V2, 0 validos V2, 95 invalidos, 94 pedidos con aliases, 113 corridas de validacion y 9 eventos historicos de transicion invalida. `panel_admin` aumento de 21 a 22 pedidos.

El fragmento revisado no contiene `initial_metrics`, `stopped` ni `listener_error` nuevos; B2 conserva continuidad metodologica. P0 permanece en `9/9` hasta completar la aceptacion y comparar la identidad asignada.

### Cohorte 10 - Transicion 1: despacho desde Cocina

A las `2026-07-14 15:30:03.269 -06:00`, Cocina genero un `child_changed`. `ESTADO_INVALIDO` dejo de aparecer, se agrego `fuente_origen` y aparecio `TRANSICION_INVALIDA`, elevando a 10 los eventos historicos de esa clase.

Las metricas quedaron en 95 pedidos totales y 114 corridas de validacion. La cohorte vigente permanece en `10 / 12`.

### Cohorte 10 - Transicion 2: aceptacion y decima comprobacion de P0

A las `2026-07-14 15:32:47.978 -06:00`, el modulo web Repartidores acepto el pedido. El Shadow registro otro `child_changed`; el pedido quedo `EN_CURSO`, se agregaron `repartidor_id` y `conductorId`, y `TRANSICION_INVALIDA` dejo de aparecer en la validacion actual.

Las metricas quedaron en 95 pedidos totales, 115 corridas de validacion, 94 pedidos con aliases y 10 eventos historicos de transicion invalida. La cohorte permanece en `10 / 12` y el cumplimiento V2 en `0 / 10`.

La inspeccion read-only confirmo que la identidad asignada (`42aU...FZY2`) no coincide con Android (`8mo8...AG23`). Los campos de asignacion son coherentes entre si; el pedido salio de `pedidos_para_reparto`, quedo en `pedidos_en_camino`, actualizo `pedido_activo` y carece de coordenadas operativas.

P0 queda reproducido en **10 de 10 pedidos aceptados durante B2**, sin excepciones. En la evidencia nueva no aparecen `initial_metrics`, `stopped` ni `listener_error`; B2 conserva continuidad metodologica.

## Cohorte 11 - Alta oficial

El pedido anonimizado `PED_1784064943459` ingreso oficialmente como Cohorte 11 a las `2026-07-14 15:35:43.460 -06:00`.

Criterios de ingreso comprobados:

- `observation_id=B2-2026-07`
- `event=order_validation`
- `source=child_added`
- evento posterior a T0
- productor habitual `panel_admin`

Resultado del Shadow Validator:

- `contract_version=null`
- `valid=false`
- cumplimiento V2 acumulado: `0 / 11` (`0%`)
- cohorte acumulada vigente: `11 / 12`
- failure codes: `CAMPO_REQUERIDO`, `PRODUCTOR_INVALIDO`, `VERSION_INVALIDA`, `COORDENADAS_INVALIDAS`, `ITEM_INVALIDO`, `PAGO_INVALIDO`, `TIPO_INVALIDO`, `ESTADO_INVALIDO`, `FASE_INVALIDA`, `ASIGNACION_INVALIDA`
- aliases: `id_pedido`, `pedido_id`, `shortId`, `origen`, `createdAt`, `created_at`, `cliente_nombre`, `telefono`, `monto`, `total`, `monto_total`, `estado_pedido`, `fase_panel`, `logistica.estado`

Las metricas posteriores al alta quedaron en 96 pedidos totales, 0 V2, 0 validos V2, 96 invalidos, 95 pedidos con aliases, 116 corridas de validacion y 10 eventos historicos de transicion invalida. `panel_admin` aumento de 22 a 23 pedidos.

El fragmento revisado no contiene `initial_metrics`, `stopped` ni `listener_error` nuevos; B2 conserva continuidad metodologica. P0 permanece en `10/10` hasta completar la aceptacion y comparar la identidad asignada.

### Cohorte 11 - Transiciones y variacion controlada de identidad

A las `2026-07-14 15:38:34.518 -06:00`, Cocina despacho el pedido y el Shadow registro un `child_changed` con `TRANSICION_INVALIDA`. A las `2026-07-14 15:39:49.719 -06:00`, el modulo web lo acepto; el pedido quedo `EN_CURSO`, se agregaron `repartidor_id` y `conductorId`, y la validacion actual dejo de incluir `TRANSICION_INVALIDA`.

Las metricas quedaron en 96 pedidos totales, 118 corridas de validacion, 95 pedidos con aliases y 11 eventos historicos de transicion invalida. La cohorte permanecio en `11 / 12` y el cumplimiento V2 en `0 / 11`.

La identidad `DRIVER_TUXTLA_001` fue seleccionada manual e intencionalmente por el operador para esta comprobacion. La inspeccion read-only confirmo que ambos campos de asignacion conservaron ese valor, que el pedido salio de `pedidos_para_reparto`, quedo en `pedidos_en_camino` y actualizo `pedido_activo`. Android permanecia autenticado como `8mo8...AG23`, por lo que era esperado que no recuperara un pedido destinado a `DRIVER_TUXTLA_001`.

Este resultado demuestra que el backend respeta la identidad manual elegida, pero **no se contabiliza como una undecima reproduccion causal de P0**. P0 conserva su evidencia previa de `10/10`. La visualizacion en `Mis Pedidos` corresponde a la identidad web seleccionada y no constituye evidencia de recepcion Android. Tampoco aparecen `initial_metrics`, `stopped` ni `listener_error` nuevos; B2 conserva continuidad metodologica.

## Cohorte 12 - Alta oficial y meta de muestra alcanzada

El pedido anonimizado `PED_1784065652654` ingreso oficialmente como Cohorte 12 a las `2026-07-14 15:47:32.655 -06:00`.

Criterios de ingreso comprobados:

- `observation_id=B2-2026-07`
- `event=order_validation`
- `source=child_added`
- evento posterior a T0
- productor habitual `panel_admin`

Resultado del Shadow Validator:

- `contract_version=null`
- `valid=false`
- cumplimiento V2 acumulado: `0 / 12` (`0%`)
- cohorte acumulada vigente: `12 / 12`
- failure codes: `CAMPO_REQUERIDO`, `PRODUCTOR_INVALIDO`, `VERSION_INVALIDA`, `COORDENADAS_INVALIDAS`, `ITEM_INVALIDO`, `PAGO_INVALIDO`, `TIPO_INVALIDO`, `ESTADO_INVALIDO`, `FASE_INVALIDA`, `ASIGNACION_INVALIDA`
- aliases: `id_pedido`, `pedido_id`, `shortId`, `origen`, `createdAt`, `created_at`, `cliente_nombre`, `telefono`, `monto`, `total`, `monto_total`, `estado_pedido`, `fase_panel`, `logistica.estado`

Las metricas posteriores al alta quedaron en 97 pedidos totales, 0 V2, 0 validos V2, 97 invalidos, 96 pedidos con aliases, 119 corridas de validacion y 11 eventos historicos de transicion invalida. `panel_admin` aumento de 23 a 24 pedidos.

En ese momento se alcanzo la meta de B2-E1 (`12 pedidos`), aunque B2 no podia cerrarse porque faltaban las 72 horas. Posteriormente B2-E2 amplio el objetivo a 15 pedidos. La hora minima de cierre permanece en `2026-07-17 11:08:19.740 -06:00`, siempre que hasta entonces no aparezcan reinicios, `initial_metrics` posteriores a T0, `stopped` ni `listener_error`. El alta no certificaba por si sola despacho, aceptacion ni recepcion Android del Pedido 12.

### Cohorte 12 - Transicion 1: despacho

A las `2026-07-14 15:54:19.762 -06:00`, Cocina despacho el pedido. El Shadow registro `child_changed`, agrego `fuente_origen` y marco `TRANSICION_INVALIDA` en esa observacion intermedia.

Las metricas quedaron en 97 pedidos totales, 120 corridas de validacion, 96 pedidos con aliases y 12 eventos historicos de transicion invalida. La cohorte se mantuvo en `12 / 12` y el cumplimiento V2 en `0 / 12`.

### Cohorte 12 - Transicion 2: aceptacion con identidad alineada

A las `2026-07-14 15:55:04.282 -06:00`, el modulo web acepto el pedido despues de que el operador guardara deliberadamente el UID autenticado del telefono. El Shadow registro otro `child_changed`; el pedido quedo `EN_CURSO`, se agregaron `repartidor_id` y `conductorId`, y `TRANSICION_INVALIDA` dejo de aparecer en la validacion actual.

Las metricas quedaron en 97 pedidos totales, 121 corridas de validacion, 96 pedidos con aliases y 12 eventos historicos de transicion invalida. La cohorte permanece en `12 / 12` y el cumplimiento V2 en `0 / 12`.

La inspeccion read-only confirmo:

- `conductorId=8mo8...AG23`
- `repartidor_id=8mo8...AG23`
- ambos campos coinciden entre si y con la sesion Android
- el pedido salio de `pedidos_para_reparto`
- existe en `pedidos_en_camino` con la misma asignacion
- `repartidores/{uid}/pedido_activo` apunta al pedido
- el pedido permanece sin coordenadas de cliente ni tienda

Esta es la primera comprobacion controlada de B2 con identidad Web/Android alineada. Demuestra que el backend conserva correctamente la identidad introducida y que la discrepancia observada en los pedidos anteriores no se produce cuando ambos lados usan el mismo UID. No elimina P0: la captura manual sigue permitiendo seleccionar identidades distintas y sigue siendo el defecto de integracion que debe corregirse despues de B2.

Las capturas de `Mis Pedidos` demuestran visibilidad para la identidad web seleccionada. No se encontro una linea correlacionable del pedido en el `logcat` disponible, por lo que la recepcion dentro de la aplicacion Android no se declara certificada solo con esas capturas. La asignacion persistida y todos sus indices si quedan certificados. En los fragmentos revisados no aparecen `initial_metrics`, `stopped` ni `listener_error` nuevos; B2 conserva continuidad metodologica.

### Cohorte 12 - Diagnostico del pedido atascado en Android

Con la aplicacion Android conectada y en primer plano se comprobo read-only que el pedido seguia `EN_CURSO` y que la identidad efectiva estaba completamente alineada:

- sesion Android: `8mo8...AG23`
- `idConductor`: ausente
- `conductorId`: `8mo8...AG23`
- `repartidor_id`: `8mo8...AG23`
- identidad que evalua Android: `8mo8...AG23`
- `pedido_activo`, `pedidos_en_camino` y pedido canonico: coherentes

La inspeccion del consumidor Android identifico el punto exacto de descarte. `escucharPedidosEntrantes()` consulta `pedidos` mediante `orderByChild("conductorId").equalTo(uid)`, pero despues `esPedidoActivoOperativoPara(uid)` exige simultaneamente estado operativo, identidad coincidente y `tieneCoordenadasOperativas()`. Esta ultima validacion requiere coordenadas no nulas, finitas, dentro de rango y distintas de cero tanto para tienda como para cliente.

El Pedido 12 no contiene ninguna de las dos parejas geograficas. El analisis estatico indica que, si el snapshot alcanza `esPedidoActivoOperativoPara(uid)`, esa condicion devuelve falso y excluye el pedido de `_pedidoActual`. Sin embargo, la captura pasiva completa de `logcat` no mostro `ACTIVE_ORDER_REJECTED`, el ID del pedido, el inicio del listener, `pedidosQuery onDataChange` ni una cancelacion de esa consulta. Por tanto, **no queda demostrado en runtime que este pedido haya alcanzado esa rama**. El filtro geografico permanece como hipotesis principal, fuertemente respaldada por el codigo y los datos, pero no como causa directa certificada.

La version instalada informa `versionCode=5` y `versionName=5.0.0-PRO`, iguales a la configuracion del proyecto inspeccionado. Esa coincidencia de metadatos no sustituye el rastro de ejecucion. Permanecen abiertas, hasta contar con evidencia del consumidor, estas alternativas previas: entrega del evento al listener, ejecucion de la consulta asignada, sincronizacion/cache del cliente o alguna condicion adicional de la compilacion instalada.

El `Permission denied` recurrente sobre `repartidores_activos/{uid}` permanece como incidente independiente de presencia. No explica este descarte, porque la consulta del pedido, la asignacion y los indices usan rutas distintas y la condicion geografica del consumidor es suficiente para reproducir el resultado.

Este hallazgo no autoriza una correccion durante B2. Debe alimentar la investigacion post-B2 de P2 y del consumidor antes de B3. Tras la enmienda B2-E2, B2 mantiene su cohorte `12 / 15`, continuidad valida y cierre temporal pendiente.
