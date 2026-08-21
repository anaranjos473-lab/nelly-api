# CONTRATO_ESTADOS_V1

## Verdad del sistema

La fuente unica de verdad operativa es:

```text
pedidos/{id}
```

Los nodos `pedidos_para_reparto`, `pedidos_en_camino`, `pedidos_asignados`, `pedidos_completados` y `dashboard_metrics` son derivados o historicos. Ningun modulo debe tratarlos como contrato oficial.

## Flujo oficial

```text
ADMIN -> PENDIENTE
COCINA -> LISTO
REPARTIDOR -> EN_CURSO -> LLEGUE_A_TIENDA -> PEDIDO_ABORDO -> LLEGUE_A_CLIENTE -> ENTREGADO
```

`CANCELADO` puede cerrar el ciclo desde backend cuando aplique.

## Estados oficiales

- `PENDIENTE`
- `LISTO`
- `EN_CURSO`
- `LLEGUE_A_TIENDA`
- `PEDIDO_ABORDO`
- `LLEGUE_A_CLIENTE`
- `ENTREGADO`
- `CANCELADO`

## Compatibilidad de migracion

Los estados antiguos se aceptan solo como entrada heredada y deben traducirse:

| Estado antiguo | Estado oficial |
| --- | --- |
| `PREPARANDO`, `COCINA` | `PENDIENTE` |
| `PENDIENTE_ACEPTACION`, `LISTO_PARA_REPARTO`, `ESPERANDO_REPARTIDOR`, `DESPACHO` | `LISTO` |
| `EN_CAMINO`, `EN_REPARTO`, `REPARTO` | `EN_CURSO` |
| `LLEGUE_A_TIENDA` | `LLEGUE_A_TIENDA` |
| `PEDIDO_ABORDO` | `PEDIDO_ABORDO` |
| `LLEGUE_A_CLIENTE` | `LLEGUE_A_CLIENTE` |
| `FINALIZADO` | `ENTREGADO` |

## Regla de ejecucion

El backend es el unico responsable de cambiar estados. Las apps leen `pedidos/{id}` y solicitan transiciones por API.

## Gate operativo

El sistema pasa cuando completa tres ciclos consecutivos sin scripts ni manipulacion manual:

```text
PENDIENTE -> LISTO -> EN_CURSO -> LLEGUE_A_TIENDA -> PEDIDO_ABORDO -> LLEGUE_A_CLIENTE -> ENTREGADO
```
