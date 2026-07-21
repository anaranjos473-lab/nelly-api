# B0 - MATRIZ DE DEPENDENCIAS KITCHEN PREMIUM V1

## Proposito
Inventariar dependencias antes de tocar `panel.html`, para que la refactorizacion de Kitchen Premium sea medible, reversible y segura.

## Alcance
Este documento define la matriz base para:
- variables globales,
- funciones,
- listeners,
- estados compartidos,
- puntos de lectura y escritura,
- modulo futuro responsable.

## Regla
No mover codigo hasta completar este inventario.

## Inventario Base

### Estado compartido

| Variable | Declaracion | Lecturas aproximadas | Escrituras aproximadas | Futuro modulo |
| --- | --- | ---: | ---: | --- |
| `sincronizacionIniciada` | `public/panel.html` | 1 | 1 | `state/` |
| `authRequestInFlight` | `public/panel.html` | 2 | 2 | `auth/` |
| `primeraCargaPendientes` | `public/panel.html` | 2 | 2 | `state/` |
| `notificacionesHabilitadas` | `public/panel.html` | 3 | 2 | `state/` |
| `RENDER_DEBOUNCE_MS` | `public/panel.html` | 1 | 0 | `state/` |
| `METRICAS_REFRESH_MS` | `public/panel.html` | 1 | 0 | `metrics/` |
| `eficienciaMinimaPct` | `public/panel.html` | 4 | 3 | `metrics/` |
| `alertaMinIntervalMs` | `public/panel.html` | 3 | 3 | `alerts/` |
| `alertaMinEventos` | `public/panel.html` | 3 | 3 | `alerts/` |
| `alertasDebounceSilenciadas` | `public/panel.html` | 3 | 2 | `alerts/` |
| `renderDebounceTimer` | `public/panel.html` | 3 | 2 | `render/` |
| `metricasTickerId` | `public/panel.html` | 3 | 3 | `metrics/` |
| `ultimaAlertaDebounceMs` | `public/panel.html` | 2 | 2 | `alerts/` |
| `pedidosPendientes` | `public/panel.html` | 22 | 12 | `state/` |
| `pedidosReparto` | `public/panel.html` | 14 | 8 | `state/` |
| `pedidosEnCamino` | `public/panel.html` | 13 | 7 | `state/` |
| `liquidacionesAuditProcesadas` | `public/panel.html` | 4 | 2 | `audit/` |
| `metricasEventos` | `public/panel.html` | 18 | 12 | `metrics/` |
| `metricasInicioMs` | `public/panel.html` | 6 | 4 | `metrics/` |

### Listener y conexion

| Elemento | Declaracion | Lecturas aproximadas | Escrituras aproximadas | Futuro modulo |
| --- | --- | ---: | ---: | --- |
| `pedidosListenerRef` | `public/panel.html` | 2 | 2 | `sync/` |
| `pedidosListenerCallback` | `public/panel.html` | 2 | 2 | `sync/` |

### Funciones de dominio candidatas

| Funcion | Uso actual | Futuro modulo |
| --- | --- | --- |
| `sincronizarPedidosOperativosDesdeSnapshot` | consolida pedidos desde RTDB | `sync/` |
| `actualizarPanel` | render principal | `render/` |
| `generarHTMLTarjeta` | arma tarjeta de pedido | `render/` |
| `moverAReparto` | accion operativa | `orders/` |
| `finalizarPedido` | accion operativa | `orders/` |
| `obtenerIdTokenPanel` | autenticacion panel | `auth/` |
| `autenticarPanelConBackend` | autenticacion panel | `auth/` |
| `refrescarMetricasDebug` | salud y KPIs | `metrics/` |
| `evaluarAlertaDebounce` | alertas de salud | `alerts/` |
| `iniciarMonitorMetricas` | temporizador KPI | `metrics/` |
| `detenerMonitorMetricas` | temporizador KPI | `metrics/` |
| `registrarEvento` | auditoria local | `audit/` |
| `solicitarRenderPanel` | orquestacion de render | `render/` |

## Dependencias a Vigilar

### No mover primero
- `sync/` antes de `state/`.
- `orders/` antes de `state/`.
- `render/` antes de `state/`.
- `auth/` antes de estabilizar el resto.

### Secuencia recomendada
1. `state/`
2. `render/`
3. `orders/`
4. `sync/`
5. `metrics/`
6. `alerts/`
7. `auth/`

## Criterio de Cierre de B0
B0 se considera listo cuando:
- todas las variables y funciones clave estan inventariadas,
- existe el modulo destino sugerido para cada una,
- la secuencia de migracion esta definida,
- no se ha modificado el comportamiento del panel.
