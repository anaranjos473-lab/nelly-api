# INC-PANEL-BOOTSTRAP-001

## Estado

RESUELTO EN EL ENTORNO LOCAL DEL PILOTO

## Titulo

Bootstrap local del panel no hidrata la sesion aunque el token y el data-access existen.

## Sintoma

- `bootstrapToken = true`
- `IS_LOCAL_PANEL = true`
- `active_orders > 0`
- `today_orders > 0`
- `historical_orders > 0`
- `authMode = null`
- `currentUser = false`
- `canonical = 0`
- `operationOrders = 0`
- `renderizados = 0`

## Primer quiebre

`AUTH -> BOOTSTRAP`

El runtime del panel no deja evidencia de haber entrado en la ruta local de autenticacion/hidratacion.

## Evidencia

- `npm run pilot:toolbox -- diagnose-panel PED_ID`
- `.codex-tmp/pilot-guard/<timestamp>-<pedidoId>/`
- `panel-trace.json`
- `diagnosis.json`
- Comparacion local/Guard: `panel.html` local y HTML servido no coinciden byte a byte.
- `servedUrl = http://127.0.0.1:60007/panel.html`
- `matchesLocal = false`
- `normalizedMatchesLocal = true`
- Inventario de scripts igual entre local y runtime (`scriptDiff = 0`, `runtimeScriptDiff = 0`).
- `localHash = 29bfc4fc7c421afe44fcb0c986e4c1c8e3013678ce324eb2ffdb8ede77d5eb0d`
- `servedHash = c4fbf05bd374ec28597b0bca175544fdb036d4acd7c970cc692c99d345b1c4c4`

## Componentes no sospechosos para este incidente

- RTDB
- data-access
- render-manager.js
- backend de pedidos
- Android

## Componentes a revisar

- `public/panel.html`
- `onAuthStateChanged(...)`
- `activarSesionPanelLocal(...)`
- `iniciarSincronizacion()`
- `cargarPedidosActivosDesdeContrato()`

## Hipotesis adicional confirmada

El Guard abre la pagina local y ejecuta el mismo conjunto de scripts que el archivo local. La diferencia entre `localHash` y `servedHash` es solo byte a byte; al normalizar saltos de linea el contenido coincide. Por lo tanto, el runtime mismatch no es la causa del incidente.

Antes de tocar el renderer o el backend, confirmar:

1. si `onAuthStateChanged(...)` se registra sobre esa misma instancia;
2. si `activarSesionPanelLocal(...)` llega a ejecutarse en esa misma pagina;
3. si el branch bootstrap local aborta antes de hidratar los globals.

## Regla de cierre

No aplicar parches al renderer ni al backend como respuesta a este incidente.
Primero confirmar si la sesion bootstrap:

1. no se ejecuta;
2. se ejecuta y falla;
3. se ejecuta y luego se sobrescribe.

## Diagnostico de auth

Para separar la carga del modulo Firebase de las señales observables de autenticacion:

```bash
npm run pilot:guard -- diagnose-auth PED_ID
```

El resultado guarda `auth-diagnosis.json`. El Guard no puede observar directamente el registro
de una funcion importada como ES module; por eso distingue esa limitacion de la evidencia
observable: token, `authMode`, errores, solicitudes relacionadas y entrada al bootstrap.

## Ultima evidencia instrumentada

Corrida: `2026-09-02T16-54-05-522Z-PED_1787866754609`

Artefacto: `.codex-tmp/pilot-guard/2026-09-02T16-54-05-522Z-PED_1787866754609/auth-trace.json`

| Evento | Resultado |
|---|---|
| `firebase: module:start` | Ocurrio |
| `firebase: auth:instance-ready` | Ocurrio, `currentUser = null` |
| `panel: main-module:start` | No ocurrio |
| `panel: auth-listener:register` | No ocurrio |
| `firebase: auth:listener-register` | No ocurrio |
| `panel: auth-callback:received` | No ocurrio |
| `pageErrors` | Ninguno |
| `requestFailures` | Ninguno |

### Conclusion provisional

El primer quiebre observable se adelanta a `onAuthStateChanged`: el modulo Firebase carga,
pero el modulo principal inline de `panel.html` no alcanza su primera instruccion observable.
No se modifica aun la logica de autenticacion ni se aplica un parche funcional.

### Siguiente accion

Auditar la evaluacion del modulo principal y sus imports (`getKitchenState`, `getRenderManager`,
`panel-state-utils` y Firebase) para identificar por que no llega a `main-module:start`.

## Evidencia HTTP y evaluacion del grafo

Corrida: `2026-09-02T17-06-12-686Z-PED_1787866754609`

Artefacto: `.codex-tmp/pilot-guard/2026-09-02T17-06-12-686Z-PED_1787866754609/module-http-trace.json`

Todas las dependencias observadas respondieron `HTTP 200`. La dependencia que rompe la
evaluacion es:

| Modulo | HTTP | Content-Type | Evaluacion |
|---|---:|---|---|
| `/js/premium-kitchen/panel-state-utils.mjs` | 200 | `application/octet-stream` | No observable |

Las demas dependencias JavaScript se sirvieron con `application/javascript`. La traza no
registro `window:error`, `unhandledrejection` ni `pageerror`, pero tampoco registro el inicio
del modulo principal. Por tanto, el resultado correcto es:

```text
FETCH OK
EVALUATION FAILURE REMAINS UNOBSERVED
FIRST BREAK = MIME de panel-state-utils.mjs
```

No se aplica aun ninguna correccion funcional. El siguiente paso autorizado es validar el
MIME servido por el servidor local y decidir una correccion minima de infraestructura del
servidor estatico, manteniendo intactos Auth, backend, RTDB y el flujo del panel.

## Accion conocida segura

Ejecutar el diagnostico formal:

```bash
npm run pilot:guard -- diagnose-panel PED_ID
```

Si el resultado sigue mostrando `authMode = null` con `bootstrapToken = true`, el incidente permanece abierto.

## Cierre tecnico

Las hipotesis anteriores quedan como evidencia historica del diagnostico. La causa final
del incidente local fueron dos problemas independientes en `scripts/lib/panel-local-server.mjs`:

1. Los archivos `.mjs` se servian como `application/octet-stream`, por lo que el navegador
   no evaluaba correctamente el modulo principal y la cadena Auth -> Bootstrap no comenzaba.
2. El proxy local reenviaba `content-encoding`, `content-length` y `transfer-encoding`
   incompatibles con el body ya materializado, provocando `ERR_CONTENT_DECODING_FAILED`
   durante la lectura de data-access.

Correcciones aplicadas:

- `.mjs` se sirve como `application/javascript; charset=utf-8`.
- El proxy elimina los headers de codificacion, longitud y transferencia que ya no describen
  el body reenviado.
- El payload, los endpoints, Auth, RTDB y la logica de negocio no fueron modificados.

## Validacion final

Corrida: `2026-09-02T17-15-28-513Z-PED_1787866754609`

Artefactos: `.codex-tmp/pilot-guard/2026-09-02T17-15-28-513Z-PED_1787866754609/`

| Validacion | Resultado |
|---|---|
| MIME `.mjs` | Correcto |
| Main module | Inicio observado |
| Listener Auth | Registrado |
| Callback Auth | Observado con `user = null` |
| Bootstrap local | Completado |
| Data-access | HTTP 200, sin error de decodificacion |
| `canonical` | 355 |
| `operationOrders` | 355 |
| Renderizados | 355 |
| `enCamino` | 8 |
| `entregados` | 347 |
| Total hidratado | 355 |

`PED_1787866754609` ya no pertenecia al conjunto activo durante la validacion final.
Su ausencia en la inspeccion dirigida no constituye una regresion de hidratacion; la
validacion valida fue la reconstruccion completa del conjunto operativo actual.

## Alcance

Este cierre certifica el servidor local usado por `pilot:guard`. No certifica una nueva
modificacion de produccion ni reabre los baselines Android, Panel, Toolbox o backend.
