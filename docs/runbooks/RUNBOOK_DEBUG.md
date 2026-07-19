# RUNBOOK_DEBUG.md

## Objetivo

Depurar incidencias sin abrir nuevas hipótesis innecesarias.

## Flujo

1. Reproducir el problema.
2. Identificar el componente responsable.
3. Revisar logs y trazas.
4. Comparar contra contrato y ADR.
5. Instrumentar solo lo necesario.
6. Corregir una sola fuente.
7. Validar.
8. Certificar o documentar la investigación.

## Reglas

- No cambiar varios componentes a la vez.
- No tocar componentes certificados sin evidencia.
- No asumir que el problema está en el último cambio.
- No retirar logs mientras la incidencia siga abierta.

## Android

Si el problema ocurre en Android:

- revisar `PedidoRepository`
- revisar autenticación
- revisar ciclo de vida de la Activity
- revisar si el estado viene de `repartidores/{uid}` o de una fuente legada

## Backend

Si el problema ocurre en backend:

- revisar el contrato del endpoint
- revisar el nodo RTDB afectado
- revisar validaciones y permisos

## Resultado Esperado

El resultado debe terminar en una de estas tres salidas:

- problema certificado
- problema corregido
- problema documentado como investigación abierta

