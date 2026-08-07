# G5-P0 - Preparacion del ambiente Android

## Objetivo

Verificar que el ambiente de certificacion de `Nelly Driver` esta limpio antes de iniciar el Gate G5.

## Baseline de referencia

- `pilot-certified-v1`
- `GO_LIVE_CERTIFICATION_001`
- `G4` validado como cliente provisional de asignacion
- `Nelly Driver` como cliente operativo definitivo a certificar

## Alcance

Este gate previo valida exclusivamente la preparacion del ambiente:

- conductor de prueba limpio;
- sin `pedido_activo`;
- sin misiones residuales;
- sin pedidos en ruta de pruebas anteriores;
- GPS activo;
- Storage disponible;
- Maps funcional;
- RTDB sin referencias operativas pendientes.

## Lista ultracorta de campo

- [ ] El conductor de prueba inicia sin `pedido_activo`.
- [ ] No existen `pedidos_en_camino` del conductor de prueba.
- [ ] No existen `pedidos_para_reparto` residuales de pruebas anteriores.
- [ ] No hay misiones pendientes en la app.
- [ ] El GPS esta activo y reportando.
- [ ] Storage / evidencias estan disponibles.
- [ ] Maps carga correctamente.
- [ ] El conductor autenticado corresponde al de prueba.

## Evidencia minima

- captura de la app en estado limpio;
- snapshot RTDB del conductor de prueba;
- snapshot de `pedidos_para_reparto`;
- snapshot de `pedidos_en_camino`;
- `requestId` si aplica;
- `traceId` si aplica.

## Criterio de aprobacion

El `G5-P0` solo se aprueba si el ambiente queda limpio y apto para iniciar `G5` sin residuos operativos de pruebas previas.

## Criterio de rechazo

El gate se rechaza si aparece cualquiera de estos casos:

- `pedido_activo` presente;
- pedidos residuales del conductor de prueba;
- misiones viejas visibles en la app;
- GPS desactivado;
- Storage no disponible;
- Maps sin cargar.

## Estado actual

**Estado del gate G5-P0:** `OPEN`

## Siguiente paso

Si `G5-P0` pasa, iniciar `G5 - Nelly Driver` con un pedido nuevo y unicamente como evidencia valida.
