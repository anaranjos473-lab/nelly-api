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

## Impacto por componente

### Android (NellyDriver)

- Debe leer y reflejar la secuencia oficial de estados sin inventar transiciones.
- Si se adopta la version enriquecida, el repositorio y la UI del driver deberan reconocer hitos intermedios como `LLEGUE_A_TIENDA`, `PEDIDO_ABORDO` y `LLEGUE_DESTINO`.
- Si se mantiene la version actual, Android debe seguir normalizando los estados intermedios no soportados hacia el contrato oficial vigente.

### Backend

- Es el punto que valida el contrato de estados.
- Si se adopta la version enriquecida, el backend debe ampliar `canTransition`, los contratos canonicos y los flujos de persistencia sincronizada.
- Debe mantenerse la regla de que `complete-order` termina en `ENTREGADO` y limpia indices auxiliares.

### Panel Operativo

- Puede beneficiarse de una mayor granularidad para seguimiento y diagnostico.
- Debe mapear los hitos intermedios sin romper los estados certificados actuales.

### Dashboard Comercial

- Se beneficia indirectamente al mejorar la lectura de tiempos, conversion y SLA.
- No debe depender de estados no canonicos para calcular sus metricas base.

### CRM

- Puede consumir mejores eventos de contexto para observaciones y trazabilidad.
- No debe usar estados intermedios para alterar la identidad del cliente o la historia comercial.

### Metricas y tiempos

- El valor principal de una maquina enriquecida es la medicion de:
  - llegada al comercio;
  - espera;
  - recoleccion;
  - trayecto;
  - llegada al cliente.
- Esto mejora ETA, cuellos de botella y calidad operativa.

### Compatibilidad con el piloto

- La adopcion debe ser compatible hacia atras con el piloto actual.
- No se debe introducir un contrato enriquecido sin una fase de coexistencia o migracion controlada.
- La version oficial del piloto debe seguir cerrando en `ENTREGADO` aunque existan hitos intermedios.

## Decision provisional

Mantener `LLEGUE_A_TIENDA` como observacion de diseno hasta que se tome una decision de producto/arquitectura sobre la maquina de estados logistica enriquecida.

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
- Compatibilidad con el piloto

## Criterio de aprobacion

La version enriquecida solo debe aprobarse si:

- no rompe el cierre `ENTREGADO`;
- no altera el contrato base de `complete-order`;
- mantiene compatibilidad con los paneles actuales;
- agrega valor real a trazabilidad, SLA y analitica operativa.
