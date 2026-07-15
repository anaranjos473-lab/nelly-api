# Criterios de entrada a B3

Estado: **BLOQUEADA**

Este documento es una puerta de certificacion. No autoriza cambios durante `B2-2026-07`. B3 solo podra iniciar cuando B2 haya cerrado y todas las condiciones obligatorias siguientes cuenten con evidencia verificable.

La arquitectura objetivo del pool en Radar, la autoridad atomica del backend, la identidad exclusiva de Firebase Authentication, la independencia de Cocina y el retiro operativo de `Web Repartidores` estan aprobados. Esta aprobacion no sustituye la trazabilidad causal ni la certificacion de su implementacion.

## Regla de apertura

B3 permanece bloqueada si una sola condicion obligatoria esta pendiente, si existe una excepcion sin decision formal o si la evidencia exige modificar produccion durante B2.

## 1. Cierre de B2

- [ ] Se cumplieron al menos 72 horas continuas de observacion.
- [ ] Se alcanzaron 15 pedidos nuevos conforme a las enmiendas `B2-E1` y `B2-E2`.
- [ ] B2 cerro como cierre normal exitoso; llegar al dia 7 sin cumplir 72 horas y 15 pedidos se registra como cierre incompleto.
- [ ] No existieron reinicios inesperados, `stopped` ni `listener_error` que invaliden la ventana.
- [ ] La cohorte se construyo exclusivamente con `order_validation`, `source=child_added`, posteriores a T0 y con `observation_id=B2-2026-07`.
- [ ] Se genero y aprobo el informe final de B2.
- [ ] Los incidentes observados quedaron clasificados sin corregir retrospectivamente la evidencia.

Evidencia minima: T0, T1, duracion, total de cohorte, metricas finales, eventos de continuidad e informe firmado o aprobado.

## 2. Trazabilidad diagnostica del consumidor Android

- [ ] Existe una traza correlacionable para `suscripcion -> snapshot -> mapeo -> identidad -> estado -> coordenadas -> publicacion`.
- [ ] Cada rechazo o error emite un codigo de motivo verificable sin datos personales ni coordenadas reales.
- [ ] Una prueba controlada con identidad Web/Android coincidente identifica el punto exacto donde el Pedido 12 dejo de avanzar o demuestra que el comportamiento ya no se reproduce.
- [ ] La correccion aplicada responde al bloqueo demostrado y cuenta con prueba de regresion.

Evidencia minima: logs anonimizados correlacionados por pedido, resultado antes/despues y prueba automatizada o integral reproducible.

## 3. P0 - Identidad efectiva del repartidor

- [ ] El modulo Web ya no permite capturar manualmente un UID para aceptar pedidos.
- [ ] La identidad utilizada por `/accept-order` procede exclusivamente del token Firebase autenticado.
- [ ] La interfaz muestra de forma inequívoca la cuenta efectiva, sin confundirla con una identidad escrita o almacenada localmente.
- [ ] Una prueba integral demuestra que Web y Android con el mismo UID recuperan el pedido.
- [ ] Una prueba negativa demuestra que un UID distinto no puede aceptar ni recuperar el pedido de otro conductor.

Evidencia minima: pruebas automatizadas, trazas anonimizadas de los UID comparados y resultado integral Web-Backend-Android.

## 4. P1 - Contrato canonico de identidad

- [ ] `repartidor_uid` es el unico campo canonico de asignacion en V2.
- [ ] `conductorId`, `repartidorId`, `repartidor_id`, `driverUid`, `uid_repartidor` y variantes estan inventariados como aliases temporales.
- [ ] Existe una estrategia de lectura, escritura, migracion y retiro de aliases.
- [ ] Productores y consumidores relevantes superan las pruebas de compatibilidad V2.

Evidencia minima: contrato aprobado, inventario de aliases, pruebas de adaptadores y plan de retiro.

## 5. P2 - Productor oficial certificado

- [ ] Todo pedido nuevo contiene coordenadas validas de tienda.
- [ ] Todo pedido nuevo contiene coordenadas validas de cliente.
- [ ] El backend rechaza pares ausentes, parciales, cero, no numericos o fuera de rango.
- [ ] El productor emite `contract_version`, `producer`, estado, fase, historial, importes e items canonicos.
- [ ] Los calculos de subtotal, envio, propina y total son consistentes en frontend y backend.
- [ ] La casilla permanente **Productores certificados** esta en verde para cada productor habilitado en B3.

Evidencia minima: pruebas contractuales positivas y negativas, pedidos de certificacion anonimizados y matriz de productores.

## 6. Consumidores V2

- [ ] Admin, Cocina, Web Repartidores temporal, Android Driver, Backend y Cloud Functions leen el contrato V2 aprobado durante la transicion.
- [ ] Los adaptadores temporales estan documentados y cubiertos por pruebas.
- [ ] No existen consumidores criticos dependientes exclusivamente de un alias cuya retirada este prevista durante B3.
- [ ] Shadow Validator no reporta incidencias criticas en la corrida previa a B3.

Evidencia minima: matriz productor-consumidor, resultados de pruebas y metricas del Shadow Validator.

## 6.1 P5 - Pool definitivo en Radar de NellyDriver

- [ ] El Radar de NellyDriver muestra en tiempo real unicamente ofertas elegibles del contrato canonico.
- [ ] Dos o mas sesiones conectadas con igual zona, disponibilidad y estado visualizan el mismo conjunto de pedidos disponibles, con los mismos identificadores y versiones.
- [ ] Toda diferencia entre sesiones queda explicada exclusivamente por filtros canonicos de zona, disponibilidad, estado o elegibilidad, evaluados con datos vigentes del backend.
- [ ] La aceptacion usa la identidad de `FirebaseAuth.currentUser.uid`; no admite UID manual.
- [ ] Android solicita la aceptacion al backend y no adjudica mediante escritura directa `get -> set`.
- [ ] Una prueba concurrente con al menos dos sesiones demuestra que solo un repartidor obtiene el pedido.
- [ ] Publicacion, cancelacion, expiracion y adjudicacion se propagan sin recarga manual; tras la adjudicacion, la oferta desaparece de los dispositivos no ganadores dentro del umbral aprobado para B3.
- [ ] Rechazo, expiracion, reasignacion y liberacion por percance cuentan con comportamiento y pruebas aprobados.
- [ ] Cocina termina su responsabilidad al confirmar `LISTO` y no participa en la aceptacion.
- [ ] `Web Repartidores` ya no es una dependencia del flujo operativo; si se conserva, queda aislado como arnes de diagnostico no productivo.

Evidencia minima: prueba integral Backend/NellyDriver, prueba multidispositivo del mismo pool antes de aceptar, prueba de filtros con casos incluidos y excluidos, medicion de propagacion, prueba de concurrencia, trazas anonimizadas de identidad y asignacion, y verificacion de Cocina sin dependencia del modulo temporal.

## 7. P3 - C4 y geonavegacion

- [ ] C4 fue reactivada formalmente despues de certificar identidad, productor y consumidores.
- [ ] Ruta a tienda y ruta a cliente usan coordenadas canonicas.
- [ ] ETA, llegada y geocercas tienen criterios medibles y pruebas aprobadas.
- [ ] El flujo completo acepta, navega, llega y entrega sin depender de datos manuales en RTDB.

Evidencia minima: certificacion C4, trazas de navegacion anonimizadas y resultados de geocercas/ETA.

## 8. P4 - Presencia RTDB

- [ ] Se determino la causa del `Permission denied` en `repartidores_activos/{uid}`.
- [ ] Las reglas permiten a cada repartidor escribir exclusivamente su propia presencia.
- [ ] Se probo conexion, desconexion y `onDisconnect` con una sesion Android real.
- [ ] Se documento si la presencia es requisito bloqueante o auxiliar para B3.

Evidencia minima: pruebas de reglas, trazas anonimizadas y decision de arquitectura.

## 9. Evidencia fotografica

- [ ] Firebase Storage esta operativo y certificado; o
- [ ] Existe una decision formal, con riesgos y limites documentados, que autoriza mantener temporalmente el fallback durante B3.

Evidencia minima: prueba de carga/lectura y control de acceso, o acta de excepcion aprobada.

## Acta de decision

| Campo | Valor |
| --- | --- |
| Fecha de evaluacion | Pendiente |
| Informe final B2 | Pendiente |
| Condiciones aprobadas | 0 |
| Excepciones formales | Ninguna |
| Decision | B3 BLOQUEADA |
| Responsable de autorizar apertura | Pendiente |

La apertura de B3 debe registrar un nuevo `observation_id`, un T0 propio, configuracion verificada y una sola puesta en marcha controlada. Ninguna evidencia de B2 se reutiliza como cohorte de B3.
