# G5 - Nelly Driver

## Objetivo

Certificar la aplicacion Android `Nelly Driver` como cliente operativo definitivo de repartidores, consumiendo correctamente el flujo de reparto ya validado por `G4` y reflejando sin ambiguedades el estado operativo desde `LISTO` hasta `ENTREGADO`.

## Baseline de referencia

- `pilot-certified-v1`
- `GO_LIVE_CERTIFICATION_001`
- `G2_PANEL_ADMINISTRATIVO` aprobado
- `G3_PANEL_DE_COCINA` aprobado
- `G4` validado como cliente provisional de asignacion
- `panel de repartidores` restringido a soporte / diagnostico tras G5

## Alcance

Este gate valida exclusivamente `Nelly Driver` como cliente oficial de reparto, organizado por capacidades operativas:

- inicio de operacion;
- radar de pedidos;
- aceptacion;
- pedido activo;
- evidencia;
- GPS;
- entrega y cierre.

## Campos y comportamientos a certificar

- `pedidoId`
- `shortId`
- `folio`
- `comercio_id`
- `comercio_codigo`
- `comercio_nombre`
- `estado`
- `estado_pedido`
- `logistica.estado`
- `repartidor_id`
- `driverUid`
- `requestId`
- `traceId`
- `pedido_activo`
- `pedidos_en_camino`

## Bloques de certificacion

### Bloque A - Inicio de operacion

Validar:

- inicio de sesion correcto;
- identidad del repartidor validada;
- perfil cargado;
- estado `Disponible` funciona.

### Bloque B - Radar

Validar:

- aparecen pedidos disponibles;
- solo aparecen pedidos validos;
- desaparecen cuando otro conductor los acepta;
- no existen duplicados;
- actualizacion en tiempo real.

### Bloque C - Aceptacion

Validar:

- `Radar -> Aceptar -> Backend -> Accept Order -> pedido_activo`;
- bloqueo atomico;
- un unico ganador;
- limpieza del radar.

### Bloque D - Pedido activo

Validar:

- informacion del comercio;
- informacion del cliente;
- notas;
- navegacion;
- llamada;
- WhatsApp, si aplica;
- mapa.

### Bloque E - Evidencia

Validar:

- fotografia;
- reglas de Storage;
- limite de tamano;
- asociacion correcta al pedido.

### Bloque F - GPS

Validar:

- envio periodico;
- actualizacion en RTDB;
- visualizacion en panel.

### Bloque G - Entrega

Validar:

- `EN_CURSO -> ENTREGADO`;
- limpieza de `pedido_activo`;
- limpieza de `pedidos_en_camino`;
- actualizacion financiera;
- persistencia en historico.

### Evidencia

Registrar:

- captura de la app;
- captura antes y despues de aceptar;
- snapshot RTDB;
- `pedido_activo`;
- `pedidos_en_camino`;
- `requestId`;
- `traceId`.

## Criterio de aprobacion

El `G5` solo se aprueba si:

- todos los bloques `A` a `G` estan en `PASS`;
- la app no depende del Panel de Repartidores para operar;
- no hay fallbacks temporales;
- no hay intervencion manual del backend;
- la app se recupera correctamente tras reinicio;
- existe evidencia documentada para cada bloque;
- no hay regresiones sobre `G1`, `G2`, `G3` ni `G4`.

## Criterios de salida

La aplicacion solo puede declararse cliente operativo oficial cuando:

- todos los bloques `A` a `G` estan en `PASS`;
- opera sin el Panel de Repartidores como dependencia funcional;
- no hay fallbacks temporales;
- no requiere intervencion manual del backend;
- recupera correctamente su estado tras reinicio o perdida de conexion;
- existe evidencia documentada para cada bloque;
- no introduce regresiones sobre `G1`, `G2`, `G3` o `G4`.

## Criterio de rechazo

El gate se rechaza si aparece cualquiera de estos casos:

- pedidos historicos mezclados con operacion real;
- pedido aceptado por dos conductores;
- `pedidos_en_camino` no refleja la transicion;
- `pedido_activo` no se crea o queda inconsistente;
- divergencia entre app, RTDB y backend;
- perdida de contrato durante la transicion.

## Evidencia requerida

- captura inicial de la app;
- captura despues de aceptar un pedido;
- snapshot RTDB del pedido;
- snapshot de `pedidos_en_camino`;
- snapshot de `pedido_activo`;
- logs relevantes del dispositivo;
- `requestId`;
- `traceId`.

## Estado actual

**Estado del gate G5:** `OPEN`

## Siguiente paso

Ejecutar una corrida controlada en `Nelly Driver` sobre un pedido listo y documentar el resultado.

## Referencias

- [`ROADMAP_GATES_CERTIFICACION_PILOTO_V1.md`](./ROADMAP_GATES_CERTIFICACION_PILOTO_V1.md)
- [`CHECKLIST_G5_NELLY_DRIVER.md`](./CHECKLIST_G5_NELLY_DRIVER.md)
