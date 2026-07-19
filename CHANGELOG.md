# CHANGELOG.md
# Historial Funcional de Nelly OS

Este changelog no sustituye a Git. Registra hitos funcionales y certificaciones.

## 2026-07-16

- P17 certificado como baseline.
- Se validó el cierre funcional relacionado con ganancias del repartidor.
- El backend quedó como referencia estable para el flujo base.

## 2026-07-18

- Se instrumentó ICV-02 para observar la cadena Android de cierre.
- Se detectó que la sesión del repartidor era una precondición necesaria.
- Se restauró autenticación de prueba para continuar la investigación.

## 2026-07-19

- Se consolidó `AGENTS.md` como guía operativa.
- Se añadió `DATA_MODEL.md` para fijar rutas canónicas.
- Se creó el índice de ADR.
- Se documentó la separación entre `bloqueo_manual`, `bloqueo_por_deuda` y `total_no_elegible`.
- Se alineó el endpoint de diagnóstico con la terminología del panel.
- Se certificó el cierre técnico de Android con ICV-02.
- Se ajustó la navegación post-`complete-order` con reinicio controlado hacia Radar.
- Se validó la navegación post-`complete-order` sin caída al launcher en RC-02.
- Se limpió el pedido contaminado `RC26_1781785625899` para reanudar RC-01 con un caso limpio.
- Se aprobó la corrida RC-01 con `PED_1784485230438`: aceptar, tracking, `complete-order`, limpieza local y regreso al Radar.
- Se aprobó RC-02 con `PED_1784486749978` y `PED_1784487166526`: estabilidad de Radar tras `complete-order` en corridas consecutivas.

## Regla

Antes de agregar una nueva entrada, confirmar que existe evidencia reproducible y, cuando aplique, vínculo a certificación o commit.
