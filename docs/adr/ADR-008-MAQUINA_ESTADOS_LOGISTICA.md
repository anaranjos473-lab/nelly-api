# ADR-008: Maquina de estados logistica de ultima milla

## Estado

Propuesta

## Contexto

La maquina de estados actual del dominio pedido acepta un flujo reducido para el ciclo operativo:

- `LISTO`
- `ASIGNADO`
- `EN_TRANSITO`
- `ENTREGADO`

Durante RC2 aparecieron transiciones que representan hitos logistico-operativos mas finos, en particular `LLEGUE_A_TIENDA`.

Las corridas mostraron que:

- `LLEGUE_A_TIENDA` es rechazado por la maquina actual.
- `EN_TRANSITO` solo es aceptado bajo el contrato actual si forma parte del flujo valido de estado, no como sustituto arbitrario.
- El flujo extremo a extremo completa correctamente la entrega aun cuando esas transiciones se rechazan.

## Problema

Nelly debe decidir si el sistema modela solo el resultado final de la entrega o tambien los hitos intermedios de la logistica de ultima milla.

## Opciones

### Opcion A: mantener la maquina actual simplificada

Ventajas:

- Menor complejidad.
- Menor superficie de cambio.
- Menor impacto en Android y paneles.

Desventajas:

- Menor visibilidad operativa.
- Menor granularidad para tiempos de espera, recoleccion y trayecto.
- Las transiciones intermedias quedan fuera del contrato oficial.

### Opcion B: enriquecer la maquina de estados logistica

Ventajas:

- Mejor trazabilidad operativa.
- Mejor analitica de tiempos y retrasos.
- Mejor alineacion con un flujo real de ultima milla.

Desventajas:

- Requiere coordinar backend, Android, panel operativo, CRM y metricas.
- Aumenta la complejidad de la maquina y las pruebas.
- Puede requerir migracion de datos o compatibilidad hacia atras.

## Decision provisional

Mantener `LLEGUE_A_TIENDA` como observacion de diseno hasta que se tome una decision de producto/arquitectura sobre la maquina de estados logistica.

## Consecuencias

- No tratar `LLEGUE_A_TIENDA` como bug confirmado.
- No modificar el flujo de produccion sin una decision explicita.
- Abrir una decision arquitectonica si se quiere enriquecer la trazabilidad de la ultima milla.

## Siguiente paso

Comparar la maquina actual con una propuesta de flujo logistico enriquecido y evaluar impacto en:

- Android (NellyDriver)
- Backend
- Panel Operativo
- Dashboard Comercial
- CRM
- Metricas y tiempos

