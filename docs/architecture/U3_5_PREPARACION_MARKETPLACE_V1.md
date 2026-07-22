# U3.5 - PREPARACION PARA MARKETPLACE V1

## Fecha
2026-07-22

## Proposito
Preparar la plataforma para operar como base multi-vertical de marketplace sin romper el nucleo universal ni la compatibilidad ya certificada.

## Alcance
U3.5 no implementa un marketplace completo. Su objetivo es dejar listos los contratos, capacidades y criterios de extensibilidad para soportar vendedores, comercios y flujos de fulfillment distribuidos.

## Capacidades objetivo

- multiples vendedores;
- multiples nodos de cumplimiento;
- pedidos divididos;
- liquidaciones independientes;
- reglas de comision configurables;
- publicaciones y catalogos externos;
- devoluciones y reembolsos por vendedor o por orden;
- trazabilidad por origen de pedido.

## Base de referencia

U3.5 se apoya en:
- `U2` como nucleo universal;
- `U3.2` como evidencia de extensibilidad de nodos;
- `U3.3` como base de integraciones;
- `U3.4` como marco de certificacion universal.

Referencias:
- [`U3_4_CERTIFICACION_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U3_4_CERTIFICACION_UNIVERSAL_V1.md)
- [`U3_3_CIERRE_INTEGRACIONES_BASE_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U3_3_CIERRE_INTEGRACIONES_BASE_V1.md)
- [`U3_2_MATRIZ_COBERTURA_FULFILLMENT_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U3_2_MATRIZ_COBERTURA_FULFILLMENT_V1.md)

## Criterios de preparacion

1. El modelo soporta multiples vendedores sin redefinir contratos canonicos.
2. Un pedido puede asociarse a distintos nodos o vendedores sin perder trazabilidad.
3. Las comisiones y liquidaciones pueden derivarse del ledger.
4. Las integraciones de marketplace consumen eventos y no alteran el nucleo.
5. El doctor sigue verde salvo la limitacion externa conocida.

## Matriz de preparacion

| Area | Requisito | Estado | Evidencia |
| --- | --- | --- | --- |
| Vendedores multiples | Modelo soporta multi-origen | Preparado | Contratos U2 |
| Pedidos divididos | Split orders representables | Preparado | Fulfillment U2 |
| Liquidaciones | Settlement derivable | Preparado | Ledger U2 |
| Comisiones | Reglas configurables | Preparado | U3.6 habilitara esto |
| Integracion marketplace | Adaptador alineado | Preparado | U3.3 |
| Trazabilidad | Origen identificable | Preparado | Event Bus U2 |

## Limitacion conocida

U3.5 no se considera un marketplace operativo completo hasta que existan reglas de negocio concretas y validacion funcional completa en un entorno con Firebase operativo.

## Conclusiones

1. U3.5 deja la plataforma lista para evolucionar hacia marketplace.
2. No introduce deuda adicional en contratos o estado.
3. La siguiente capa natural es U3.6, donde las reglas variables pasan a un motor formal.
