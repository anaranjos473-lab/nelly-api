# PILOT GUARD

`Pilot Guard` es el punto de arranque documental y operativo del piloto controlado de Nelly.

Su objetivo es evitar que futuras sesiones dependan de memoria, contexto oral o scripts sueltos.
En lugar de reiniciar la investigación desde cero, el Guard deja una ruta fija para:

- comprobar entorno;
- verificar auth/bootstrap;
- inspeccionar data-access;
- observar la hidratacion del panel;
- guardar evidencia;
- reconocer incidentes repetidos;
- volver al mismo punto de partida en cada sesion.

## Punto de arranque oficial

Antes de intervenir codigo, la sesion debe arrancar desde este orden:

1. `npm run pilot:guard -- doctor`
2. `npm run pilot:guard -- inspect-order PED_ID`
3. `npm run pilot:guard -- diagnose-panel PED_ID`
4. `npm run pilot:guard -- diagnose-panel-runtime PED_ID`
5. `npm run pilot:guard -- diagnose-auth PED_ID`

Si `diagnose-panel` reporta:

- `bootstrapToken = true`
- `authMode = null`
- `canonical = 0`
- `operationOrders = 0`
- `renderizados = 0`

entonces el primer quiebre esta en:

`AUTH -> BOOTSTRAP`

Si `diagnose-panel-runtime` reporta:

- `matchesLocal = false`
- `normalizedMatchesLocal = false`
- `authMode = null`

entonces antes de tocar el panel hay que resolver la discrepancia entre el HTML local y el runtime servido por el Guard.

Si `matchesLocal = false` pero `normalizedMatchesLocal = true`, el runtime esta sirviendo el mismo contenido y la diferencia es solo byte a byte; en ese caso el incidente sigue apuntando a bootstrap/hidratacion.

## Clasificacion del pedido inspeccionado

`diagnose-panel` separa la ubicacion del pedido de la salud de la hidratacion:

- `ACTIVE`: el pedido esta en `active_orders`; si no aparece en el panel, puede existir un fallo de bootstrap, hidratacion o render.
- `HISTORICAL` o `HISTORICAL_DELIVERED`: el pedido esta fuera de las colas activas; su ausencia en el render operativo no es un fallo del panel.
- `NOT_FOUND`: el pedido no aparece en las colecciones consultadas; no debe interpretarse como fallo de hidratacion sin evidencia adicional.

La salida incluye `orderPresence.status`, `orderPresence.source` y `orderPresence.state` para conservar esta distincion en los artefactos.

## Regla de proteccion

El Guard diagnostica; no se autoarregla.

Si encuentra un quiebre:

1. registra evidencia;
2. identifica el primer punto donde se pierde el estado;
3. propone la correccion minima;
4. espera aprobacion explicita antes de tocar codigo.

## Evidencia

Cada diagnostico debe guardar artefactos en:

`.codex-tmp/pilot-guard/<timestamp>-<pedidoId>/`

con, al menos:

- `manifest.json`
- `git.json`
- `backend.json`
- `auth.json`
- `data-access.json`
- `panel-trace.json`
- `diagnosis.json`
- `runtime.json`
- `auth-diagnosis.json`
- `auth-trace.json`

## Incidente conocido

### INC-PANEL-BOOTSTRAP-001

Documento de referencia: [`docs/investigaciones/INC-PANEL-BOOTSTRAP-001.md`](../../investigaciones/INC-PANEL-BOOTSTRAP-001.md)

**Sintoma**

- `bootstrapToken = true`
- `active_orders > 0`
- `authMode = null`
- `canonical = 0`
- `operationOrders = 0`
- `renderizados = 0`

**Primer quiebre**

- `AUTH -> BOOTSTRAP`

**Accion**

- no modificar `render-manager.js`;
- no modificar backend;
- no modificar RTDB;
- revisar `onAuthStateChanged()` y la hidratacion local del panel;
- usar `diagnose-panel` antes de cualquier parche.
- revisar la ejecucion del modulo principal si `firebase:instance-ready` aparece pero no aparece `panel:main-module:start`.

## Relacion con la toolbox

`pilot:guard` y `pilot:toolbox` comparten la misma entrada tecnica.

- `pilot:toolbox` publica el mapa, los validadores y las utilidades.
- `pilot:guard` fija el punto de reinicio, captura el incidente y conserva la evidencia.

La prioridad es que el siguiente operador no tenga que reconstruir el contexto a mano.
