# MATRIX - PANEL DEPENDENCIES KITCHEN PREMIUM V1

## Propósito
Trazar las dependencias reales de `public/panel.html` para ejecutar la migración B1 con riesgo mínimo.

## Criterio
Esta matriz no cambia comportamiento.
Solo organiza el panel actual en módulos destino para una extracción controlada.

## Lectura rapida
- `state/`: estado compartido y banderas de control.
- `render/`: DOM, tarjetas, KPIs y refrescos visuales.
- `orders/`: acciones operativas sobre pedidos.
- `sync/`: listeners, snapshots y reconciliación.
- `metrics/`: contadores, temporizadores y salud.
- `alerts/`: notificaciones, toasts y umbrales.
- `auth/`: autenticación y obtención de token.
- `audit/`: registro de eventos y trazabilidad.
- `ui/`: utilidades visuales reutilizables.
- `api/`: llamadas al backend.
- `firebase/`: inicialización y acceso a SDK.

## Variables de Estado

| Variable | Uso principal | Lecturas aprox. | Escrituras aprox. | Módulo destino |
| --- | --- | ---: | ---: | --- |
| `sincronizacionIniciada` | evita doble arranque de sync | 1 | 1 | `state/` |
| `authRequestInFlight` | evita auth concurrente | 2 | 2 | `auth/` |
| `primeraCargaPendientes` | distingue snapshot inicial | 2 | 2 | `state/` |
| `notificacionesHabilitadas` | control de permisos de toast/Notification | 3 | 2 | `state/` |
| `RENDER_DEBOUNCE_MS` | retardo de render | 1 | 0 | `state/` |
| `METRICAS_REFRESH_MS` | refresco periodico de KPIs | 1 | 0 | `metrics/` |
| `eficienciaMinimaPct` | umbral salud debounce | 4 | 3 | `metrics/` |
| `alertaMinIntervalMs` | cooldown de alertas | 3 | 3 | `alerts/` |
| `alertaMinEventos` | umbral minimo para alerta | 3 | 3 | `alerts/` |
| `alertasDebounceSilenciadas` | mute temporal de alertas | 3 | 2 | `alerts/` |
| `renderDebounceTimer` | timer de render | 3 | 2 | `render/` |
| `metricasTickerId` | timer de KPI | 3 | 3 | `metrics/` |
| `ultimaAlertaDebounceMs` | timestamp de alerta | 2 | 2 | `alerts/` |
| `pedidosPendientes` | pedidos en cocina / despacho | 22 | 12 | `state/` |
| `pedidosReparto` | pedidos listos / esperando repartidor | 14 | 8 | `state/` |
| `pedidosEnCamino` | pedidos en reparto / entregados | 13 | 7 | `state/` |
| `liquidacionesAuditProcesadas` | dedupe de auditoria | 4 | 2 | `audit/` |
| `metricasEventos` | contadores operativos | 18 | 12 | `metrics/` |
| `metricasInicioMs` | reloj base de salud | 6 | 4 | `metrics/` |

## Conectividad y listeners

| Elemento | Uso principal | Lecturas aprox. | Escrituras aprox. | Módulo destino |
| --- | --- | ---: | ---: | --- |
| `pedidosListenerRef` | listener principal de pedidos | 2 | 2 | `sync/` |
| `pedidosListenerCallback` | callback principal de pedidos | 2 | 2 | `sync/` |
| `listenersActivos` | limpieza de listeners | 2 | 2 | `sync/` |

## Funciones por modulo

### auth/
- `obtenerIdTokenPanel`
- `autenticarPanelConBackend`

Dependencias actuales:
- `auth`
- `PANEL_TOKEN_ENDPOINTS`
- `API_BASE_URL`
- `signInWithCustomToken`

### sync/
- `iniciarSincronizacion`
- `sincronizarPedidosOperativosDesdeSnapshot`
- `sincronizarPendientesDesdeSnapshot`
- `limpiarListeners`
- `window.ejecutarProtocoloRescate`

Dependencias actuales:
- `ref`
- `onValue`
- `rtdb`
- `pedidosPendientes`
- `pedidosReparto`
- `pedidosEnCamino`
- `liquidacionesAuditProcesadas`
- `primeraCargaPendientes`

### render/
- `solicitarRenderPanel`
- `actualizarPanel`
- `generarHTMLTarjeta`
- `eliminarFilaVisual`
- `agregarPedidoATablaVisual`

Dependencias actuales:
- DOM
- `pedidosPendientes`
- `pedidosReparto`
- `pedidosEnCamino`
- `metricasEventos`
- `RENDER_DEBOUNCE_MS`
- `renderDebounceTimer`

### orders/
- `moverAReparto`
- `finalizarPedido`
- `limpiarPedido`
- `construirPayloadReparto`
- `resolverKeyPedido`
- `normalizarEstado`
- `obtenerFasePanel`

Dependencias actuales:
- `obtenerIdTokenPanel`
- `DISPATCH_ORDER_ENDPOINTS`
- `COMPLETE_ORDER_ENDPOINTS`
- `pedidosPendientes`
- `pedidosReparto`
- `pedidosEnCamino`

### metrics/
- `refrescarMetricasDebug`
- `iniciarMonitorMetricas`
- `detenerMonitorMetricas`
- `window.verMetricasSync`
- `window.resetMetricasSync`
- `window.configurarAlertasDebounce`
- `window.simularRafagaEventos`

Dependencias actuales:
- `metricasEventos`
- `metricasInicioMs`
- `METRICAS_REFRESH_MS`
- `metricasTickerId`
- `eficienciaMinimaPct`
- `alertaMinIntervalMs`
- `alertaMinEventos`
- `alertasDebounceSilenciadas`

### alerts/
- `showToast`
- `logDebug`
- `esErrorPermisoFirebase`
- `reportarErrorListener`
- `evaluarAlertaDebounce`
- `solicitarPermisoNotificaciones`
- `notificarNuevoPedido`
- `reproducirSonido`

Dependencias actuales:
- DOM
- `notificacionesHabilitadas`
- `alertaMinIntervalMs`
- `alertaMinEventos`
- `alertasDebounceSilenciadas`
- `ultimaAlertaDebounceMs`

### audit/
- `registrarEvento`
- `liquidacionesAuditProcesadas`

Dependencias actuales:
- `metricasEventos`

### ui/
- `window.renderizarTopProductos`
- `window.renderizarComparativoSemanal`
- `window.descargarCSV`
- listeners de DOM para modal, historial y mapa

Dependencias actuales:
- DOM
- `window.filtrarVentas`
- `window.verMetricasSync`

### api/
- `window.enviarSnapshotDiscord`
- `window.dispararAlertaManual`

Dependencias actuales:
- `API_BASE_URL`
- `window.verMetricasSync`

### firebase/
- carga inicial de `firebaseConfig`
- `window.nellyDb`
- `window.dispatchEvent(new Event('firebase-ready'))`

Dependencias actuales:
- `fetchFirebaseConfig`
- `initializeApp`
- `getDatabase`

## Mapa de dependencia sugerido

### Fase de extracción B1
1. `state/`
2. `render/`
3. `orders/`
4. `sync/`
5. `metrics/`
6. `alerts/`
7. `auth/`

### Regla de corte
No mover un modulo hasta que:
- su matriz de lecturas/escrituras este inventariada,
- el modulo destino este claro,
- no exista dependencia circular nueva.

## Observaciones de riesgo

### Riesgo alto
- `pedidosPendientes`, `pedidosReparto`, `pedidosEnCamino`
- `metricasEventos`
- `iniciarSincronizacion`
- `autenticarPanelConBackend`

### Riesgo medio
- `actualizarPanel`
- `generarHTMLTarjeta`
- `refrescarMetricasDebug`
- `solicitarRenderPanel`

### Riesgo bajo
- utilidades puras como `normalizarEstado`
- `obtenerFasePanel`
- `numeroSeguro`
- `limpiarPedido`

## Resultado esperado
Esta matriz debe servir como checklist para que cada commit de B1 sea pequeño, reversible y verificable sin alterar la experiencia operativa del panel certificado.
