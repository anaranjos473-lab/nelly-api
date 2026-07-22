# PLAN FORMAL U1 - PLATAFORMA UNIVERSAL V1

## Fecha
2026-07-22

## Proposito
Definir la siguiente etapa estrategica de la plataforma como un modelo de dominio universal capaz de soportar Kitchen, marketplace, inventario, integraciones y finanzas sobre una base comun, estable y extensible.

## Alcance
U1 no busca seguir extrayendo servicios por inercia. Su objetivo es elevar el nivel de abstraccion para modelar el negocio alrededor de entidades, eventos y movimientos inmutables que sirvan a multiples tipos de operacion.

## Prerrequisito
U1 solo debe iniciarse cuando el bloque actual de B4 quede cerrado, validado y con baseline estable. La base funcional de Kitchen Premium debe permanecer en `HEALTHY` antes de promover el nuevo modelo.

## Principios rectores

- Una unica fuente de verdad para el dominio.
- El fulfillment es un motor, no una aplicacion vertical.
- El ledger financiero debe ser inmutable y auditable.
- El inventario debe ser desacoplado desde el inicio.
- Las integraciones deben apoyarse en contratos estables.
- Los eventos de dominio deben ser observables y reutilizables.

## Objetivo de U1
Construir el nucleo universal que permita operar distintos tipos de negocio sin redisenar la plataforma cada vez que aparezca un nuevo canal, un nuevo servicio o un nuevo flujo logistico.

## Modelo de dominio objetivo

### U1.1 - Modelo de dominio universal
Entidades base:

- Pedido
- Linea de pedido
- Nodo de cumplimiento
- Inventario
- Pago
- Movimiento financiero
- Entrega
- Evidencia
- Evento

Responsabilidad:

- definir fronteras claras de datos;
- evitar mezclar estado operativo con contabilidad;
- preparar contratos reutilizables para multiples verticales.

### U1.2 - Fulfillment Engine
Responsabilidad:

- convertir Kitchen en un nodo de cumplimiento mas dentro del sistema;
- admitir otros nodos como tiendas, almacenes, farmacias o comercios;
- coordinar estados sin acoplar el dominio a una interfaz concreta.

### U1.3 - Ledger financiero
Responsabilidad:

- registrar cada evento financiero como movimiento inmutable;
- modelar comisiones, propinas, cupones, reembolsos, devoluciones y conciliaciones;
- evitar que el saldo acumulado sea la unica fuente de verdad.

### U1.4 - Inventario desacoplado
Responsabilidad:

- soportar reservas;
- disponibilidad;
- sustituciones;
- preparacion parcial;
- multiples almacenes.

### U1.5 - Integraciones
Responsabilidad:

- definir contratos estables para ERP, POS, WMS, pasarelas de pago, APIs de comercios e IA;
- impedir que las integraciones dependan de detalles internos inestables.

### U1.6 - Eventos de dominio
Responsabilidad:

- publicar eventos de negocio relevantes;
- permitir reacciones desacopladas sin modificar el flujo principal;
- preparar observabilidad y extensibilidad a futuro.

## Orden de ejecucion sugerido

1. Consolidar el alcance de dominio universal.
2. Diseñar el modelo de entidades y relaciones.
3. Definir el ledger financiero inmutable.
4. Aislar el inventario como subsistema.
5. Formalizar contratos de integracion.
6. Publicar eventos de dominio estables.
7. Validar que Kitchen sigue operando como un nodo mas del sistema.

## Dependencias objetivo

```text
Domain Core
  ↓
Fulfillment Engine
  ↓
Ledger / Inventory / Integrations
  ↓
Verticales (Kitchen, Marketplace, Others)
```

## Criterios de aceptacion

- el modelo deja de depender de supuestos verticales de Kitchen;
- los movimientos financieros son auditables e inmutables;
- el inventario puede evolucionar sin romper pedidos;
- las integraciones quedan separadas del flujo principal;
- los eventos de dominio permiten evolucionar sin reescrituras grandes.

## Criterio de cierre
U1 se considerara estable cuando exista evidencia de que el nuevo modelo puede soportar crecimiento funcional sin obligar a un rediseño estructural de la plataforma.

## Referencias
- [`docs/architecture/NOTA_CIERRE_PAQUETE_B2_B3_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/NOTA_CIERRE_PAQUETE_B2_B3_KITCHEN_PREMIUM_V1.md)
- [`docs/architecture/MIGRATION_PROGRESS_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/MIGRATION_PROGRESS_KITCHEN_PREMIUM_V1.md)
- [`docs/architecture/B3_PLAN_FORMAL_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/B3_PLAN_FORMAL_KITCHEN_PREMIUM_V1.md)
