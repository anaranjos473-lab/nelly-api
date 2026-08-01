# CERTIFICACION_RUNNER_FAIL_FAST

## Estado

`CERRADA`

## Objetivo

Certificar que el runner diagnostico de `complete-order` se detiene en el primer fallo causal y no acumula errores derivados en cascada.

## Alcance

Aplica a:

- `scripts/diagnosticar-complete-order.mjs`
- flujo secuencial de `dispatch-order`
- flujo secuencial de `accept-order`
- validacion secuencial de `complete-order`

No aplica a:

- reglas de negocio
- backend de delivery
- panel de cocina
- Firebase Admin como causa de este incidente

## Comportamiento esperado

El runner debe:

1. Ejecutar `dispatch-order`.
2. Si `dispatch-order` falla, detener la corrida.
3. Si `dispatch-order` pasa, ejecutar `accept-order`.
4. Si `accept-order` falla, detener la corrida.
5. Solo ejecutar `complete-order` cuando los pasos previos hayan aprobado.
6. Emitir un reporte final que identifique el primer punto de fallo.

## Evidencia observada

En la corrida forense validada:

- `dispatch-order` paso con exito.
- `accept-order` retorno `403 Forbidden`.
- El runner se detuvo inmediatamente.
- `complete-order` no fue ejecutado.
- Los snapshots finales no fueron ejecutados.
- No se generaron errores secundarios derivados.

## Resultado

La corrida confirma que el runner trabaja en modo `fail-fast` y preserva la evidencia del primer error causal.

## Criterios de aceptacion

Se considera aprobado cuando:

- el primer fallo detiene la corrida;
- no se ejecutan pasos posteriores innecesarios;
- el reporte final conserva la causa raiz;
- no aparecen errores en cascada.

## Riesgo residual

- Mantener el runner alineado con las reglas del dominio cuando se ejecuten datasets positivos.
- Revalidar si se cambia el orden o la naturaleza de los pasos.

## Conclusiones

El runner queda certificado como herramienta forense para identificar el primer punto de ruptura del flujo.

