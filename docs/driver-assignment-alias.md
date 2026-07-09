# Driver Alias and Assignment Contract

## Objetivo
Documentar el nuevo contrato mínimo para que el equipo operativo use un alias corto de conductor en lugar de depender del UID o del email.

## Cambios realizados

1. `routes/repartidores.js`
   - Se agregó un campo canónico `codigo` en `repartidores/{uid}`.
   - El campo también puede aceptarse desde `numero`, `alias` o `alias_conductor`.
   - Se actualizó el endpoint `PATCH /api/repartidores/estado` para aceptar `codigo`.
   - Se agregó `PATCH /api/repartidores/:uid/codigo` para establecer el alias del conductor.
   - Se agregó `GET /api/repartidores/available` para listar repartidores activos/disponibles con su alias.

2. `app.js`
   - Se montó el mismo router en `/api/drivers` como alias de `/api/repartidores`.

## Nuevos endpoints

- `GET /api/drivers/available`
  - Retorna repartidores activos y conductores activos con `uid`, `codigo`, `nombre`, `pedido_activo`, `ubicacion` y `ultima_conexion`.

- `PATCH /api/drivers/:uid/codigo`
  - Establece `repartidores/{uid}/codigo` solo una vez.
  - Si `codigo` ya existe y se envía un valor diferente, retorna error `409`.
  - Parámetros de body: `codigo`, `alias` o `numero`.

- `PATCH /api/drivers/estado`
  - Continúa actualizando disponibilidad y ubicación.
  - Ahora puede fijar el alias solo la primera vez que se encuentra en el perfil.
  - Si `codigo` ya existe y se intenta cambiar, retorna error `409`.

## Recomendación operativa

- Para pilotaje, asignar a cada conductor un alias corto legible como `DRIVER-01`, `TUXTLA-01`, `RC26`, etc.
- Guardar ese alias en `repartidores/{uid}/codigo`.
- Usar `GET /api/drivers/available` para generar vistas de panel y listados humanos.
- Dejar `uid`, `repartidor_id` y `conductorId` como internals del sistema.

## Nota técnica

- El alias es un campo de presentación; el contrato de asignación de pedidos sigue siendo `repartidores/{uid}/pedido_activo`.
- Esto evita que la operación dependa del UID/email y permite cruzar el estado activo con un identificador corto.
