# Informe de cierre anticipado B2-2026-07

Estado: **CERRADA ANTICIPADAMENTE POR SUFICIENCIA DE MUESTRA**

Este informe certifica la terminacion controlada de B2 como excepcion metodologica. No declara cumplimiento del protocolo temporal original ni equivale a un cierre normal exitoso.

## Identificacion

| Campo | Valor |
| --- | --- |
| Campana | `B2-2026-07` |
| Observation ID | `B2-2026-07` |
| T0 | `2026-07-14 11:08:19.740 -06:00` |
| T1 tecnico | `2026-07-15 12:56:54.387 -06:00` |
| Duracion observada | `25:48:34.647` |
| Commit observado | `d78395f` |
| Instancia | Render `nelly-api`, plan Starter, una instancia |
| Cohorte final | `15 / 15` pedidos nuevos unicos |
| Decision | Cierre anticipado por suficiencia de muestra |

## Excepcion metodologica

La ventana original exigia simultaneamente 15 pedidos nuevos y 72 horas continuas. La cohorte se completo, pero la observacion se cerro antes de las 72 horas mediante decision explicita y documentada.

Por tanto:

- no es un cierre normal exitoso;
- no certifica continuidad durante 72 horas;
- no modifica retrospectivamente el protocolo original;
- no sustituye ese protocolo para campanas futuras;
- cualquier gate que exija cierre normal requiere una excepcion formal adicional o conservarse bloqueado.

## Evidencia de continuidad del intervalo auditado

La exportacion global `Last 2 days` con filtro `[C5_SHADOW]` mostro para B2:

- un `initial_metrics`;
- un `enabled`;
- cero `listener_error`;
- cero `stopped` antes del cierre;
- cero reinicios detectados del observador;
- un unico `observation_id=B2-2026-07`;
- un `stopped` final durante la retirada controlada.

La metrica inicial fue de 85 pedidos y 85 validaciones. La metrica final fue de 100 pedidos, 130 validaciones y 15 eventos historicos de transicion invalida.

El operador establecio `ENABLE_C5_SHADOW_VALIDATOR=false`. El backend reinicio: su uptime paso de `92836.35952955` a `121.592379857` segundos y `/api/health` respondio saludable en produccion. El inicio tecnico calculado del nuevo proceso, usado como T1, fue `2026-07-15 12:56:54.387 -06:00`.

## Resultado de la cohorte

| Indicador | Resultado |
| --- | ---: |
| Pedidos nuevos unicos | 15 |
| Pedidos V2 | 0 |
| Pedidos validos V2 | 0 |
| Cumplimiento V2 | 0 / 15 (0%) |
| Productor de la cohorte | `panel_admin` |
| Contrato observado | V1 / sin `contract_version=2` |

Los pedidos nuevos repitieron faltantes y aliases asociados a identidad, ubicacion, estado/fase, items, pago y asignacion. La campaña no corrigio esos datos; el Shadow se mantuvo pasivo.

## Conclusiones certificadas

### Shadow Validator

- Observo altas y cambios sin mutar pedidos.
- Emitio metricas, aliases y codigos de incumplimiento.
- Construyo una cohorte de 15 altas por `child_added`.
- Se retiro controladamente mediante `stopped` y flag apagado.

### Backend de asignacion

- En los casos observados, proceso las aceptaciones y persistio el estado `EN_CURSO`.
- En el control con UID manual coincidente con Android, persistio la misma identidad observada en `conductorId`, `repartidor_id`, `pedidos_en_camino` y `pedido_activo`.
- Estas conclusiones se limitan a los casos observados; no certifican todavia concurrencia ni todos los flujos alternos.

### Identidad P0

- Quedo confirmado el defecto de seleccion manual de UID en Web Repartidores.
- El control coincidente demuestra persistencia correcta del valor seleccionado, no que Web derive exclusivamente la identidad del token autenticado.

### Productor Admin/Cocina

- Permanece en contrato V1.
- No produce `contract_version=2` ni coordenadas canonicas obligatorias.
- Requiere migracion y pruebas contractuales antes de B3.

### Web Repartidores

- Mostro inicialmente un `permission_denied` en `/pedidos` y despues recupero una vista activa capaz de mostrar pedidos asignados.
- La causa de esa recuperacion no quedo demostrada.
- Es un modulo temporal y no forma parte del flujo objetivo.

### Consumidor Android

- No queda certificado.
- La inspeccion pasiva encontro un proceso recreado recientemente y ausencia de trazas correlacionables del listener en el buffer disponible.
- No esta demostrado que el listener se suscriba, reciba snapshots o alcance las validaciones de identidad, estado y coordenadas.
- El `Permission denied` de presencia en `repartidores_activos/{uid}` permanece como incidente independiente.

## No certificado

- continuidad de 72 horas;
- consumidor Android;
- contrato V2;
- coordenadas operativas de tienda y cliente;
- C4/geonavegacion;
- concurrencia de aceptacion y adjudicacion atomica definitiva del Radar;
- causa del `permission_denied` temporal en Web Repartidores;
- causa del `Permission denied` de presencia Android.

## Siguiente fase autorizable

B3 permanece bloqueada. La siguiente actividad debe ser una fase independiente:

**POST-B2 - Certificacion del consumidor Android**

Objetivo unico: instrumentar temporalmente, sin cambiar primero las decisiones funcionales, el recorrido:

```text
inicio -> autenticacion -> creacion del listener -> suscripcion
-> snapshot/cancelacion -> pedido_activo/pedido -> mapeo
-> identidad -> estado -> coordenadas -> publicacion/rechazo de _pedidoActual
```

Se ejecutara uno o dos pedidos controlados con identidad coincidente. Solo se corregira el primer bloqueo demostrado y se agregara una prueba de regresion antes de avanzar al productor V2, coordenadas, C4 y evaluacion formal de B3.

## Decision final

B2 queda cerrada como excepcion por suficiencia de muestra. La evidencia es suficiente para priorizar el diagnostico posterior, pero no para declarar cumplidos los gates pendientes de B3.
