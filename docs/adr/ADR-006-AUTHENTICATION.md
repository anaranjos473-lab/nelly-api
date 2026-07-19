# ADR-006: Authentication Contract

## Estado

Activo

## Contexto

Android y panel necesitan una identidad válida para operar sobre el backend sin sesiones ambiguas.

## Decisión

- El repartidor se autentica con Firebase Auth.
- `driver-token` emite un custom token para bootstrap controlado.
- El panel usa sesión autorizada con correo permitido.

## Consecuencias

- La identidad debe ser trazable.
- Las acciones protegidas requieren token válido.

