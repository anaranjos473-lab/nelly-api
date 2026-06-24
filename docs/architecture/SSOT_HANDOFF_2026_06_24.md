# SSOT_HANDOFF_2026_06_24

## Decision confirmada

La fuente unica de verdad operativa de pedidos es:

```text
pedidos/{id}
```

Los nodos `pedidos_para_reparto`, `pedidos_en_camino`, `pedidos_asignados`, `pedidos_completados` y `dashboard_metrics` quedan como derivados, historicos o vistas. No son contrato oficial.

## Cambio aplicado

Antes, cada modulo podia observar un arbol distinto:

```text
Admin -> pedidos
Cocina -> pedidos_para_reparto
Driver -> pedidos_en_camino
Dashboard -> metricas/finanzas
```

Ahora el flujo operativo converge en el mismo registro:

```text
Admin -> pedidos/{id}
Cocina -> pedidos/{id}
Driver -> pedidos/{id}
Entrega -> pedidos/{id}
```

## Contrato vigente

Estados oficiales:

- `PENDIENTE`
- `LISTO`
- `EN_CURSO`
- `ENTREGADO`
- `CANCELADO`

Flujo oficial:

```text
PENDIENTE -> LISTO -> EN_CURSO -> ENTREGADO
```

## Compatibilidad de migracion

Los estados antiguos no son contrato, pero se aceptan como entrada heredada:

| Estado antiguo | Estado oficial |
| --- | --- |
| `PREPARANDO`, `COCINA` | `PENDIENTE` |
| `PENDIENTE_ACEPTACION`, `LISTO_PARA_REPARTO`, `ESPERANDO_REPARTIDOR`, `DESPACHO` | `LISTO` |
| `EN_CAMINO`, `EN_REPARTO`, `REPARTO`, `PEDIDO_ABORDO` | `EN_CURSO` |
| `FINALIZADO` | `ENTREGADO` |

## Archivos tocados para SSOT

- `routes/delivery.js`: transiciones principales leen/escriben `pedidos/{id}`.
- `app/src/main/java/com/nelly/driver/di/PedidoSyncModule.kt`: Android escucha `pedidos`.
- `app/src/main/java/com/nelly/driver/data/repository/PedidoRepository.kt`: Android normaliza estados heredados.
- `public/panel.html`: panel clasifica vistas desde `pedidos`.
- `public/repartidor.html`: repartidor web lee `pedidos`.
- `docs/architecture/CONTRATO_ESTADOS_V1.md`: contrato actualizado.
- `tests/delivery_panel.test.js`: pruebas alineadas a `pedidos/{id}`.

## Certificado hasta ahora

Validado en codigo:

```text
node --check routes\delivery.js
node --experimental-vm-modules node_modules/jest/bin/jest.js tests/delivery_panel.test.js --runInBand
```

Resultado esperado de la prueba backend actual:

```text
14 tests passed
```

No certificado todavia:

```text
Pedido real -> LISTO -> Android lo ve -> EN_CURSO -> ENTREGADO
```

Tampoco se certifico build Android en este checkout porque no existe `gradlew` ni `gradlew.bat`.

## Siguientes acciones

1. Commit exclusivo de cambios SSOT.
2. Push a rama especifica.
3. Deploy backend.
4. Generar un pedido real.
5. Abrir Android.
6. Verificar el ciclo:

```text
PENDIENTE -> LISTO -> visible en Android -> EN_CURSO -> ENTREGADO
```

7. Repetir tres ciclos consecutivos.

## Regla de congelamiento

No abrir nuevos frentes hasta pasar tres ciclos reales:

- No finanzas nuevas.
- No dashboards nuevos.
- No tienda Android.
- No `pedidos_asignados`.
- No IA.
- No optimizacion de rutas.

La meta inmediata es operativa:

```text
10 pedidos reales entregados
1 restaurante usando Nelly
1 semana operando
```
