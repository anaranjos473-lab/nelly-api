# Branch Flow Nelly v1

Fecha: 2026-07-26

## Objetivo

Mantener el piloto estable y separar claramente el desarrollo nuevo del estado liberable.

## Ramas

### `main`

- Solo para releases consolidadas.
- No debe recibir desarrollo experimental.
- Solo debe actualizarse cuando exista una versión validada y lista para publicación.

### `release/pilot-1.0`

- Rama congelada del piloto.
- No se toca salvo correcciones críticas justificadas por evidencia.
- Sirve como referencia estable para validación y piloto controlado.

### `develop`

- Rama de desarrollo activo.
- Todo cambio nuevo debe entrar aquí.
- Las mejoras futuras, refactors y nuevas capacidades se trabajan en esta rama, no en `release/pilot-1.0`.

## Regla Operativa

- `release/pilot-1.0` queda congelada.
- `develop` concentra el trabajo nuevo.
- `main` solo recibe consolidaciones formales de release.

## Criterio de Promoción

Solo se promueve a `main` cuando:

- el piloto esté validado
- la release esté documentada
- exista evidencia de estabilidad

