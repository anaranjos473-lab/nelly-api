# U1.5 - INTEGRACIONES V1

## Fecha
2026-07-22

## Proposito
Definir la capa de integraciones del dominio universal como un conjunto de contratos estables y desacoplados, capaces de conectar la plataforma con ERP, POS, WMS, pasarelas de pago, APIs de comercios e IA sin romper el modelo central.

## Alcance
Este documento define el enfoque arquitectonico de integraciones para U1. No implementa conectores concretos ni altera la baseline certificada de Kitchen Premium.

## Objetivos

- desacoplar dependencias externas del dominio principal;
- mantener contratos estables y versionables;
- permitir integraciones por adaptador;
- registrar errores y estados de integracion de forma trazable;
- facilitar evolucion sin modificar el nucleo del negocio.

## Principios

1. El dominio central no debe depender del proveedor externo.
2. Ninguna integracion debe acoplarse al render o al panel.
3. Cada contrato debe ser versionable.
4. Los errores de integracion deben ser observables y recuperables.
5. Las integraciones deben poder añadirse o retirarse con impacto controlado.

## Tipos de integracion

### ERP
Responsabilidad:

- sincronizar pedidos, facturacion, cortes y conciliaciones.

### POS
Responsabilidad:

- conectar ventas en tienda o punto de servicio con el dominio universal.

### WMS
Responsabilidad:

- coordinar stock, reservas, almacenes y movimiento logístico.

### Pasarelas de pago
Responsabilidad:

- confirmar, rechazar o reembolsar transacciones;
- registrar referencias externas.

### APIs de comercios
Responsabilidad:

- publicar o recibir pedidos, catalogos, estados y actualizaciones.

### IA
Responsabilidad:

- asistir en clasificacion, prediccion, validacion o recomendacion;
- nunca sustituir la verdad del dominio.

## Contrato de integracion canonico

Cada integracion debe poder describir, como minimo:

- `id`
- `tipo`
- `version`
- `estado`
- `origen`
- `destino`
- `evento_disparador`
- `entrada`
- `salida`
- `error`
- `reintentos`
- `timestamp`
- `metadata`

## Reglas de diseño

1. El dominio no llama directamente al proveedor sin un contrato intermedio.
2. El contrato debe poder evolucionar por version.
3. Un fallo externo no debe romper la semantica del pedido.
4. Las integraciones deben reportar estados reproducibles.
5. Cualquier adaptador debe poder desactivarse sin destruir el dominio central.

## Estados sugeridos

- `pendiente`
- `conectada`
- `en_proceso`
- `reintentando`
- `completada`
- `fallida`
- `deshabilitada`

## Eventos sugeridos

- `integracion.registrada`
- `integracion.conectada`
- `integracion.error`
- `integracion.reintento`
- `integracion.completada`
- `integracion.deshabilitada`

## Casos de uso

### Sincronizacion de pedido
Un pedido aprobado puede salir a un ERP o a un comercio externo mediante un contrato versionado.

### Conciliacion de pago
Una pasarela confirma una transaccion y el dominio registra el impacto economico via ledger.

### Actualizacion de stock
Un WMS informa disponibilidad o reserva y el inventario se actualiza sin tocar la UI.

### Asistencia con IA
La IA puede sugerir o clasificar, pero la decision final debe seguir anclada al dominio.

## Relacion con U1.1, U1.2, U1.3 y U1.4

- `Pedido` define el contexto que se integra.
- `Fulfillment Engine` produce eventos de ejecucion.
- `Ledger` absorbe el impacto financiero.
- `Inventario` expone disponibilidad y reservas.
- `Integraciones` conecta todo lo anterior con sistemas externos.

## Criterios de aceptacion

- las integraciones quedan fuera del nucleo del dominio;
- cada contrato es versionable;
- los fallos externos son observables;
- Kitchen y otros nodos pueden integrarse por el mismo mecanismo;
- el sistema puede evolucionar proveedor por proveedor sin rediseñar el core.

## Criterio de cierre
U1.5 se considerara estable cuando el sistema pueda conectar y desconectar integraciones sin alterar el dominio central ni la baseline funcional certificada.

## Referencias
- [`docs/architecture/U1_PLAN_FORMAL_PLATAFORMA_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_PLAN_FORMAL_PLATAFORMA_UNIVERSAL_V1.md)
- [`docs/architecture/U1_1_MODELO_DOMINIO_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_1_MODELO_DOMINIO_UNIVERSAL_V1.md)
- [`docs/architecture/U1_2_FULFILLMENT_ENGINE_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_2_FULFILLMENT_ENGINE_V1.md)
- [`docs/architecture/U1_3_LEDGER_FINANCIERO_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_3_LEDGER_FINANCIERO_V1.md)
- [`docs/architecture/U1_4_INVENTARIO_DESACOPLADO_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_4_INVENTARIO_DESACOPLADO_V1.md)
