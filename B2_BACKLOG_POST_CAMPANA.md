# Backlog posterior a B2

Este documento registra hallazgos durante la campana `B2-2026-07`. No autoriza implementar, desplegar ni cambiar configuracion mientras B2 permanezca activa.

## Admin - productor oficial

1. Calcular automaticamente el subtotal a partir de cantidad y precio de los items.
2. Mantener validacion frontend y backend de subtotal, envio, propina y total.
3. Agregar seleccion e identificacion canonica de la tienda.
4. Capturar direccion y coordenadas validas de la tienda.
5. Capturar direccion y coordenadas validas del cliente.
6. Incorporar geocodificacion y confirmacion visual en mapa, con manejo explicito de resultados ambiguos.
7. Impedir la creacion cuando falten coordenadas o esten fuera de rango.
8. Emitir `contract_version` y `producer` canonicos.
9. Crear `cliente`, `tienda`, `logistica`, `pago` e historial inicial conforme al contrato V2.
10. Unificar la identidad del repartidor en el campo canonico aprobado.

## Backend y pruebas

1. Validar el mismo contrato en `POST /api/admin/pedidos`; no confiar solo en controles del navegador.
2. Rechazar coordenadas ausentes, no numericas, fuera de rango o pares incompletos.
3. Verificar consistencia monetaria con pruebas de frontera y decimales.
4. Ampliar `tests/admin-order-contract.test.js` para exigir tienda, coordenadas, version, productor, historial, estado y fase canonicos.
5. Agregar pruebas negativas que demuestren que un pedido incompleto no se persiste.
6. Certificar compatibilidad con Cocina, Driver, tracking, evidencia y geonavegacion antes de abrir B3.

## Identidad y entrega a Driver

1. **P0 - Identidad efectiva (defecto confirmado, 10/10 comprobaciones comparables):** eliminar completamente la captura manual de UID en el modulo web Repartidores. La aceptacion debe usar y mostrar de forma inequivoca la identidad efectiva de `FirebaseAuth.currentUser.uid`, y Web y Android deben operar con la misma cuenta autenticada cuando representen al mismo repartidor. La Cohorte 11 uso deliberadamente `DRIVER_TUXTLA_001` como control manual y, por tanto, no incrementa el numerador de reproducciones causales de P0.
2. **P1 - Contrato de identidad:** usar unicamente `repartidor_uid` como campo canonico en Web, Backend y Android. `conductorId`, `repartidorId`, `repartidor_id` y otros nombres quedan solo como aliases temporales, controlados durante la migracion V2.
3. Mostrar de forma segura en cada cliente la identidad autenticada efectiva para diagnostico operativo, sin exponerla en capturas publicas.
4. Impedir que una cuenta web acepte pedidos destinados a otra sesion Android.
5. **P4 - Presencia (incidente independiente):** revisar las reglas RTDB para que el repartidor autenticado pueda publicar exclusivamente su propia presencia en `repartidores_activos/{uid}` y determinar por separado el impacto del `Permission denied`.
6. Hacer explicito en Android el motivo de rechazo de una oferta o pedido activo, especialmente UID distinto y coordenadas ausentes; evitar el descarte silencioso.
7. Agregar una prueba integral Web/Backend/Android que demuestre que un pedido aceptado se recupera con la misma identidad y que una identidad distinta no lo recibe.
8. Agregar pruebas del filtro geografico para ofertas y pedidos activos con coordenadas validas, ausentes, parciales, cero y fuera de rango.
9. Conservar como caso positivo la Cohorte 12: cuando el UID manual coincidio exactamente con la sesion Android, `conductorId`, `repartidor_id`, `pedidos_en_camino` y `pedido_activo` quedaron alineados. Este control acota P0 al mecanismo de seleccion de identidad y no al procesamiento de asignacion del backend.
10. **P2 - Hipotesis principal pendiente de certificacion runtime en Cohorte 12:** el codigo del consumidor consulta por `conductorId` y `esPedidoActivoOperativoPara()` excluye de `_pedidoActual` los pedidos sin coordenadas operativas. El pedido tiene identidad correcta y carece de ambas parejas geograficas, pero `logcat` no mostro que el snapshot alcanzara esa rama. Antes de corregir, instrumentar o ejecutar una prueba controlada post-B2 que distinga: evento no recibido, consulta cancelada, fallo de sincronizacion y rechazo explicito por coordenadas. Definir ademas como deben tratarse los pedidos V1 incompletos durante la compatibilidad transitoria, sin permitir navegacion con destinos invalidos.

## Orden de prioridad confirmado

1. **Trazabilidad diagnostica Android:** registrar sin ambiguedad `suscripcion -> snapshot -> mapeo -> identidad -> estado -> coordenadas -> publicacion`.
2. **Prueba controlada:** repetir el flujo con Web y Android usando la misma identidad autenticada y correlacionar cada etapa mediante el ID anonimizado del pedido.
3. **P0:** corregir de forma permanente la identidad efectiva del modulo web, eliminando la captura manual.
4. **Bloqueo demostrado:** corregir la condicion exacta que identifique la trazabilidad, con una prueba de regresion que falle antes y pase despues.
5. **P1:** unificar el contrato en `repartidor_uid` y administrar aliases de migracion.
6. **P2:** corregir el productor oficial para generar coordenadas obligatorias de tienda y cliente.
7. **P3:** reactivar y certificar C4 solo despues de certificar identidad, productor, consumidores y coordenadas.
8. **P4:** resolver y certificar por separado la escritura de presencia en `repartidores_activos/{uid}`.
9. **B3:** abrirla unicamente cuando todas las condiciones obligatorias de `B3_CRITERIOS_DE_ENTRADA.md` tengan evidencia aprobada.

## Trazabilidad obligatoria del consumidor Android

La primera intervencion tecnica despues del cierre formal de B2 debe agregar trazabilidad diagnostica correlacionable, sin cambiar inicialmente las decisiones funcionales del consumidor. Para cada pedido de prueba debe quedar evidencia de:

1. listener creado y suscrito, con ruta y consulta anonimizadas;
2. snapshot recibido, con pedido y fuente identificables;
3. resultado del mapeo del contrato;
4. UID de sesion y UID efectivo del pedido comparados de forma anonimizada;
5. estado recibido y resultado de su validacion;
6. presencia y validez de coordenadas de tienda y cliente, sin registrar las coordenadas reales;
7. decision final: publicado en `_pedidoActual` o rechazado;
8. codigo de motivo unico cuando exista rechazo o error.

La prueba controlada posterior debe mantener identidad coincidente. Solo despues de localizar la etapa exacta se autoriza corregir el bloqueo demostrado. La ausencia de una traza no debe interpretarse como rechazo por coordenadas ni como fallo de identidad.

## Clasificacion del incidente Pedido #1

| Area | Estado posterior a la evidencia |
| --- | --- |
| Backend de pedidos | Certificado para la aceptacion observada |
| Flujo Cocina a Backend | Certificado para la ejecucion observada |
| Aceptacion del pedido | Certificada |
| Driver Android | Su filtro por UID se comporto conforme al contrato actual |
| Identidad Web a Android | Incidente confirmado: UID visual distinto del UID efectivo del token |
| Contrato geografico | Pendiente para C4/B3; no causo este incidente |
| Presencia en `repartidores_activos` | Incidente independiente, pendiente de analizar impacto |

La causa directa de la no visualizacion fue la discrepancia entre el UID asignado por el token web y el UID autenticado en Android. El patron se reprodujo sin excepciones en los primeros 10 pedidos aceptados de B2. Android no descarto localmente esos pedidos: al consultar por su propio `conductorId`, nunca entraron en el conjunto recuperado. Las coordenadas ausentes constituyen el siguiente bloqueo previsible, pero no deben atribuirse como causa de estas ejecuciones.

## Gate propuesto

Agregar al manifiesto la casilla permanente **Productores certificados**. Debe permanecer roja o bloqueada hasta que todos los productores oficiales generen el contrato canonico completo y superen pruebas integrales.

La apertura de la futura campana B3 queda gobernada por `B3_CRITERIOS_DE_ENTRADA.md`. Mientras alguna condicion obligatoria permanezca pendiente, B3 conserva el estado **BLOQUEADA**.

## Regla de ejecucion

Estas mejoras se priorizan con el informe final de B2. Su implementacion corresponde a C5.2-C/migracion de productores y debe completarse antes de reactivar C4 y abrir la futura campana B3. El orden obligatorio es: trazabilidad, prueba controlada, correccion permanente de P0, correccion del bloqueo demostrado, coordenadas obligatorias, certificacion C4 y evaluacion formal de entrada a B3.
