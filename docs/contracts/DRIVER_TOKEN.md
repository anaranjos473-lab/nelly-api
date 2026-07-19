# DRIVER_TOKEN.md

## Objetivo

Emitir un token de autenticación para el repartidor.

## Endpoint

`GET /api/auth/driver-token?uid=...`

## Método HTTP

`GET`

## Request

Query params:

```text
uid=8mo8182LJsgV7vKMSpiCekFKAG23
```

## Response

```json
{
  "ok": true,
  "token": "custom-token"
}
```

## Validaciones

- `uid` es obligatorio.
- Si existe bootstrap de auth, debe validarse.
- El token emitido debe poder intercambiarse por sesión Firebase.

## Códigos de Error

- `400` uid faltante.
- `403` bootstrap no autorizado.
- `500` error al crear token.

## Invariantes

- El token representa al UID solicitado.
- Android y panel de pruebas deben usar la misma identidad efectiva cuando corresponda.

## Dependencias

- Firebase Admin
- Configuración de bootstrap de auth
- UID del repartidor

## Casos de Prueba

- emitir token para UID válido
- rechazar bootstrap no autorizado
- intercambiar custom token por sesión Firebase en Android

## Historial de Cambios

- 2026-07-19: documento base creado.

