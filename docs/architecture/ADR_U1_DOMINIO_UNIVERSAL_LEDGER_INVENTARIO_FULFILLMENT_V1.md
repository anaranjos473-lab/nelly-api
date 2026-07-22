# ADR U1: Dominio universal, ledger, inventario y fulfillment

Estado: **APROBADA COMO DIRECCION DE ARQUITECTURA**

Esta decision define la base conceptual de U1. No autoriza una migracion inmediata de produccion ni modifica el comportamiento certificado de Kitchen Premium.

## Contexto

La plataforma ya cuenta con una base funcional certificada para Kitchen Premium y con una capa de sincronizacion mas limpia en B4. Seguir extrayendo piezas de forma incremental sin cambiar el modelo de fondo daria mejoria tactica, pero no resolveria la necesidad estrategica de soportar otros verticales como marketplace, inventario, integraciones o nuevos tipos de fulfillment.

La arquitectura necesita un nucleo comun que:

- modele el negocio en entidades estables;
- trate el fulfillment como un motor compartido;
- registre el componente financiero mediante movimientos inmutables;
- desacople inventario e integraciones del flujo principal;
- publique eventos relevantes del dominio.

## Decision

Se aprueba la orientacion arquitectonica de U1 con los siguientes criterios:

1. **Dominio universal**
   El sistema se modelara alrededor de entidades y eventos reutilizables, no de una unica vertical.

2. **Fulfillment como motor**
   Kitchen pasa a ser un nodo de cumplimiento dentro de un motor mas general, no el centro estructural de toda la plataforma.

3. **Ledger inmutable**
   La capa financiera se modelara como movimientos independientes y auditables. El saldo acumulado puede existir como vista derivada, pero no como unica fuente de verdad.

4. **Inventario desacoplado**
   El inventario se tratara como subsistema independiente desde el inicio, con soporte para reservas, disponibilidad, sustituciones y multiples almacenes.

5. **Integraciones por contrato**
   ERP, POS, WMS, pasarelas de pago, APIs de comercios e IA se conectaran mediante contratos estables y no por dependencias directas a detalles internos.

6. **Eventos de dominio**
   El sistema publicara eventos de negocio relevantes para permitir evolucion, auditoria y extensibilidad sin reescribir el flujo principal.

## Alcance aprobado

Quedan aprobados como direccion de arquitectura:

- `Pedido`
- `Linea de pedido`
- `Nodo de cumplimiento`
- `Inventario`
- `Pago`
- `Movimiento financiero`
- `Entrega`
- `Evidencia`
- `Evento`

## Consecuencias

- La evolucion futura no debera partir de Kitchen como unica forma de operar el negocio.
- Las decisiones financieras no dependeran solo de saldos acumulados.
- Las integraciones no deben acoplarse al panel o al render.
- El modelo debe permitir crecer sin redisenar cada vertical desde cero.

## Reglas de cambio

1. Ninguna implementacion de U1 debe alterar la baseline certificada de Kitchen Premium sin evidencia nueva.
2. Cualquier cambio que afecte a ledger, inventario o fulfillment debe venir con pruebas y documentacion.
3. El dominio universal debe preservar la trazabilidad de las operaciones existentes.
4. U1 no reemplaza B4; lo sucede como cambio de foco arquitectonico.

## Criterios de avance

Antes de implementar U1, debe existir:

- cierre estable de B4;
- doctor en `HEALTHY`;
- baseline funcional congelada y accesible;
- plan de U1 publicado y enlazado;
- trazabilidad clara entre U1 y los contratos heredados.

## Estado de implementacion

| Area | Estado |
| --- | --- |
| Direccion arquitectonica | Aprobada |
| Implementacion | Pendiente |
| Certificacion | Pendiente |
| Impacto en produccion | No aplicado |

## Referencias

- [`docs/architecture/U1_PLAN_FORMAL_PLATAFORMA_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_PLAN_FORMAL_PLATAFORMA_UNIVERSAL_V1.md)
- [`docs/architecture/INDEX_U1_PLATAFORMA_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/INDEX_U1_PLATAFORMA_UNIVERSAL_V1.md)
- [`docs/architecture/NOTA_CIERRE_PAQUETE_B2_B3_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/NOTA_CIERRE_PAQUETE_B2_B3_KITCHEN_PREMIUM_V1.md)
- [`docs/architecture/MIGRATION_PROGRESS_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/MIGRATION_PROGRESS_KITCHEN_PREMIUM_V1.md)
