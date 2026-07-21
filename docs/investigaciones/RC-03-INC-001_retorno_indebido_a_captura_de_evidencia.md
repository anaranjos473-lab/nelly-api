# RC-03-INC-001 - Retorno indebido a captura de evidencia despues de FINALIZAR ENTREGA

## Estado

ABIERTA

## Proyecto

Nelly Driver

## Modulo

Android - Flujo de entrega

## Prioridad

ALTA

## Contexto

Durante la validacion de RC-03 se ejecutaron dos corridas completas del flujo de entrega.

En ambas ocasiones la aplicacion llego correctamente hasta el paso de captura de evidencia y permitio ejecutar `FINALIZAR ENTREGA`.

Despues del cierre, la aplicacion volvio nuevamente a la pantalla de captura de evidencia en lugar de finalizar el flujo.

## Evidencia confirmada

- Creacion del pedido.
- Asignacion respetando la prioridad del pedido mas antiguo.
- Navegacion hasta el punto de entrega.
- Captura de evidencia.
- Ejecucion de `FINALIZAR ENTREGA`.

## Comportamiento observado

Despues de ejecutar `FINALIZAR ENTREGA`:

- La aplicacion regreso a la pantalla de captura de evidencia.
- El comportamiento se reprodujo en dos corridas consecutivas.

## Impacto

La incidencia afecta el cierre completo del flujo de entrega y, por tanto, impide considerar RC-03 como completamente validado.

No existe evidencia de que la incidencia afecte:

- Creacion del pedido.
- Asignacion.
- Navegacion.
- Captura de evidencia.

El problema se limita, segun la evidencia disponible, al tramo posterior al cierre.

## Hipotesis

La causa aun no esta determinada.

Entre las posibilidades se encuentran:

- La interfaz no limpia correctamente el estado local despues de `complete-order`.
- La navegacion vuelve a abrir la pantalla de evidencia tras recibir la respuesta.
- Existe una dependencia pendiente en el flujo de evidencia/Storage posterior al cambio de plan.

Estas hipotesis deberan confirmarse mediante revision del codigo y de los registros de ejecucion.

## Estado de RC-03

- Creacion, asignacion y navegacion: Validadas.
- Captura de evidencia: Validada.
- Transicion posterior al cierre: Incidencia reproducida.
- Validacion financiera: Pendiente.
- Resultado global: RC-03 permanece `IN VALIDATION`.

## Acciones siguientes

- Investigar la transicion posterior a `FINALIZAR ENTREGA`.
- Corregir la incidencia.
- Ejecutar una nueva entrega para confirmar el cierre limpio del flujo.
- Realizar la segunda comparativa financiera (`Saldo`, `Proximo corte`, `ISR` e `IVA`).
- Revaluar la promocion de RC-03 a `APPROVED`.

## Regla operativa

La correccion de esta incidencia debe realizarse unicamente desde Android Studio y dentro del arbol fuente de Android.

No deben modificarse pantallas ni transiciones del flujo Android desde rutas web, docs o archivos ajenos a la aplicacion nativa, porque eso puede reintroducir el fallo o romper la trazabilidad del cierre.
