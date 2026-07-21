# ADR: Pool de pedidos en el Radar de NellyDriver

Estado: **APROBADA COMO ARQUITECTURA OBJETIVO**

Esta decision documenta el destino del modulo temporal `Web Repartidores` usado durante las campanas B1/B2. No autoriza modificar produccion ni alterar una campana de certificacion activa.

## Estado de la decision

| Dimension | Estado |
| --- | --- |
| Arquitectura | **APROBADA** |
| Implementacion | **PENDIENTE DE EJECUCION** |
| Certificacion | **PENDIENTE** |
| Produccion | **NO MIGRADA** |
| ADR | **ACTIVO** |

`PENDIENTE DE EJECUCION` significa que la direccion y sus criterios estan aprobados, pero no existe todavia una intervencion funcional formal que permita declarar la migracion en progreso. Este estado solo podra cambiar con evidencia de inicio posterior al cierre y autorizacion correspondientes.

## Politica de control de cambios

Este ADR queda establecido como punto de control arquitectonico y referencia estable para la migracion al Radar.

1. No se agregaran, retiraran ni reinterpretaran decisiones arquitectonicas mediante actualizaciones ordinarias de avance.
2. Las tareas nuevas o ajustes de implementacion se registraran en el backlog correspondiente, no en este ADR.
3. Los resultados de pruebas se registraran en informes de certificacion y se vincularan desde la matriz de trazabilidad.
4. Las actualizaciones ordinarias de este documento quedan limitadas al estado de los criterios `RAD`, fecha, responsable, identificador de corrida y ubicacion de evidencia.
5. Una modificacion de arquitectura requiere una necesidad excepcional documentada, analisis de impacto, aprobacion explicita y una enmienda identificable; no puede introducirse como cambio incidental durante B2, B3 o una correccion tecnica.
6. Ninguna evidencia parcial permite alterar retrospectivamente el alcance de un criterio para declararlo cumplido.

La implementacion debe ajustarse al ADR aprobado. Si una evidencia demuestra que la arquitectura necesita cambiar, primero se tramitara la enmienda y despues se modificaran backlog, codigo y gates afectados.

## Decision de cierre de analisis

La evidencia reunida durante B2 es suficiente para concluir que el mecanismo temporal de aceptacion no representa el diseno definitivo de Nelly Delivery. Esa evidencia permite aprobar la direccion arquitectonica, pero no demuestra por si sola el punto exacto donde se interrumpe el consumidor Android.

### Cambios arquitectonicos aprobados

1. **Pool en Radar:** el pool de pedidos disponibles se migrara al Radar de `NellyDriver`.
2. **Backend como autoridad:** toda aceptacion sera una solicitud al backend y la adjudicacion sera atomica, con un unico ganador.
3. **Identidad autenticada:** se eliminara la captura manual de UID; la identidad efectiva procedera exclusivamente de Firebase Authentication.
4. **Cocina independiente:** Cocina termina su responsabilidad al confirmar `LISTO` y no participa en la aceptacion.
5. **Retiro de Web Repartidores:** el modulo permanecera mientras sea necesario para cerrar B2 y despues sera retirado progresivamente como dependencia operativa.

Estos puntos estan aprobados como direccion tecnologica. Su implementacion y despliegue permanecen pendientes y sujetos a los gates de certificacion.

### Correcciones condicionadas a evidencia adicional

Antes de modificar la logica especifica del consumidor Android debe existir trazabilidad correlacionable de:

1. creacion y estado del listener;
2. recepcion o cancelacion del snapshot;
3. mapeo del pedido;
4. comparacion de identidad autenticada y asignada;
5. validacion de estado;
6. presencia y validez de coordenadas;
7. decision de publicar o rechazar `_pedidoActual`.

Solo se corregira el componente que la evidencia identifique como causa del bloqueo. La aprobacion del Radar, del backend atomico o del retiro del modulo web no debe utilizarse para inferir anticipadamente un defecto de listener, identidad, contrato, estado o coordenadas.

### Estado metodologico

| Area | Estado |
| --- | --- |
| Arquitectura objetivo | Validada |
| Direccion tecnologica | Aprobada |
| Implementacion | Pendiente de ejecucion |
| Diagnostico del consumidor Android | Pendiente de trazabilidad concluyente |
| B2 | Continua hasta cumplir sus criterios de cierre |
| B3 | Bloqueada hasta implementar y certificar los gates obligatorios |

## Decision

`Web Repartidores` es una herramienta temporal de observacion y certificacion. No forma parte del flujo operativo definitivo.

En el producto final, el pool de pedidos disponibles debe mostrarse exclusivamente en el area **Radar** de `NellyDriver`. Cocina no acepta pedidos en nombre de un repartidor ni administra el pool.

Flujo objetivo:

```text
Cliente -> Backend -> Cocina -> LISTO -> Pool Radar de NellyDriver
                                            |
                                            v
                                 aceptacion de un repartidor
                                            |
                                            v
                                 asignacion atomica en Backend
                                            |
                                            v
                                  navegacion y finalizacion
```

## Responsabilidades

### Cocina

- Recibe y prepara el pedido.
- Actualiza el pedido hasta `LISTO`.
- Al confirmar `LISTO`, termina su participacion en la asignacion.
- No elige repartidor, no acepta ofertas y no conserva una consola operativa de repartidores.

### Radar de NellyDriver

- Publica en la interfaz las ofertas elegibles recibidas en tiempo real.
- Mantiene una vista compartida y consistente del pool entre todos los repartidores conectados que tengan la misma elegibilidad.
- Permite al repartidor autenticado aceptar o rechazar una oferta.
- Retira una oferta cuando el backend informa que ya fue tomada.
- Gestiona la mision asignada hasta su finalizacion.
- Podra filtrar por zona y elegibilidad cuando esos contratos esten certificados.

## Consistencia del Radar

Todos los repartidores conectados con iguales condiciones de zona, disponibilidad y estado deben visualizar el mismo conjunto de pedidos elegibles. Las diferencias entre dispositivos solo pueden proceder de filtros canonicos evaluados con los mismos datos de backend.

Toda publicacion, expiracion, cancelacion o adjudicacion debe propagarse en tiempo real. Cuando el backend adjudique un pedido, la oferta debe desaparecer de los dispositivos no ganadores dentro del umbral definido por la certificacion, sin requerir recarga manual ni reinicio de la aplicacion.

### Backend

- Es la unica autoridad de publicacion y asignacion.
- Valida identidad autenticada, disponibilidad y elegibilidad.
- Resuelve aceptaciones concurrentes mediante una operacion atomica.
- Garantiza que un solo repartidor obtenga el pedido.
- Notifica el resultado y retira la oferta para los demas dispositivos.

## Regla de concurrencia

La visualizacion del pool es competitiva, pero la adjudicacion no ocurre en el cliente. Una aceptacion desde Android es una solicitud; solo la confirmacion del backend convierte el pedido en asignado. Quedan prohibidos los flujos cliente `get -> set` para reclamar pedidos.

## Interpretacion de B1/B2

- B1/B2 pueden certificar backend, identidad, sincronizacion y transiciones observadas mediante `Web Repartidores`.
- Esa evidencia no certifica la experiencia operativa final del repartidor.
- La evidencia valida la direccion arquitectonica, pero no localiza automaticamente el bloqueo del consumidor Android.
- El modulo temporal debe conservarse mientras sea necesario para reproducir y cerrar la campana vigente.
- Su retiro solo procede despues de migrar el flujo al Radar y certificar una prueba integral Backend/NellyDriver.

## Criterios de aceptacion de la arquitectura

La migracion al Radar se considerara completada unicamente cuando todos los criterios siguientes tengan evidencia aprobada:

1. B2 esta cerrada formalmente antes de iniciar la migracion operativa.
2. El Radar de `NellyDriver` muestra en tiempo real los pedidos publicados por el backend mediante el contrato canonico de ofertas.
3. La aceptacion se realiza exclusivamente desde `NellyDriver`, usando la identidad autenticada; no existe captura manual de UID.
4. El backend valida y adjudica cada aceptacion mediante una operacion atomica.
5. Una prueba de concurrencia demuestra que solo un repartidor obtiene la asignacion.
6. Una prueba multidispositivo demuestra que repartidores con igual elegibilidad observan el mismo pool.
7. Los filtros de zona, disponibilidad y estado producen resultados explicables y reproducibles.
8. Tras la adjudicacion, la oferta desaparece de los dispositivos no ganadores dentro del umbral de propagacion aprobado.
9. Rechazo, expiracion, cancelacion, reasignacion y liberacion por percance tienen comportamiento y pruebas aprobados.
10. Cocina confirma `LISTO` y opera sin intervenir en la aceptacion ni depender del modulo temporal.
11. `Web Repartidores` deja de ser una dependencia operativa y puede retirarse sin afectar el flujo de negocio.
12. La prueba integral demuestra el ciclo `publicacion -> oferta -> aceptacion -> adjudicacion -> retiro del pool -> mision activa` sin intervencion manual externa.

El cumplimiento parcial no cierra la migracion. La aprobacion arquitectonica permanece vigente, pero el estado de implementacion continuara como pendiente hasta certificar todos los criterios.

## Matriz de trazabilidad de certificacion

Esta matriz es el registro oficial para certificar la migracion. Cada fila debe enlazar o identificar evidencia reproducible antes de cambiar su estado a `CERTIFICADO`.

| ID | Criterio | Evidencia requerida | Estado |
| --- | --- | --- | --- |
| RAD-01 | B2 cerrada antes de migrar | Informe final y acta de cierre aprobados | PENDIENTE |
| RAD-02 | Radar recibe ofertas canonicas en tiempo real | Prueba funcional multidispositivo con IDs y versiones correlacionados | PENDIENTE |
| RAD-03 | Aceptacion exclusiva desde NellyDriver con Firebase Auth | Trazas Android/backend anonimizadas y prueba negativa sin UID manual | PENDIENTE |
| RAD-04 | Adjudicacion atomica en backend | Prueba automatizada e integral de la operacion atomica | PENDIENTE |
| RAD-05 | Un unico ganador | Prueba concurrente con dos o mas sesiones y logs correlacionados | PENDIENTE |
| RAD-06 | Pool consistente entre sesiones equivalentes | Comparacion simultanea de ofertas con igual elegibilidad | PENDIENTE |
| RAD-07 | Filtros canonicos reproducibles | Casos incluidos y excluidos por zona, disponibilidad y estado | PENDIENTE |
| RAD-08 | Retiro oportuno de la oferta | Medicion del tiempo de propagacion en dispositivos no ganadores | PENDIENTE |
| RAD-09 | Flujos alternos controlados | Pruebas de rechazo, expiracion, cancelacion, reasignacion y percance | PENDIENTE |
| RAD-10 | Cocina independiente | Flujo certificado donde Cocina termina en `LISTO` y no acepta | PENDIENTE |
| RAD-11 | Web Repartidores no es dependencia operativa | Prueba funcional con el modulo aislado o retirado | PENDIENTE |
| RAD-12 | Ciclo integral completo | Evidencia E2E de publicacion a mision activa sin intervencion manual externa | PENDIENTE |

Estados permitidos por criterio: `PENDIENTE`, `EN PRUEBA`, `CERTIFICADO` o `BLOQUEADO`. Todo cambio debe registrar fecha, responsable, identificador de corrida y ubicacion de la evidencia. La migracion solo puede declararse completada cuando `RAD-01` a `RAD-12` esten en `CERTIFICADO`.

Las actualizaciones de esta matriz no modifican la decision arquitectonica: registran exclusivamente el avance de su implementacion y certificacion conforme a la politica de control de cambios.
