# PILOTO_001_BASELINE

## Propósito
Establecer un punto de partida oficial y no negociable para arrancar el piloto.

## Regla de oro
Todo inicio de prueba debe pasar por este baseline, sin excepciones.

- 1 conductor piloto
- 1 Motorola
- 1 restaurante
- 1 pedido por ciclo
- RTDB limpia de pedidos anteriores
- No cambiar código durante la prueba
- Registrar cada ciclo exitoso
- Documentar cada incidente reproducible

## Elementos certificados (no tocar)

- Backend `dispatch-order`, `accept-order`, `complete-order`
- RTDB como fuente de verdad: `pedidos/{id}`
- Flujo Cocina → Reparto → Entrega
- Panel de cocina ya no permite finalizar pedidos en `LISTO`
- Driver durante pedido aceptado: `YA ESTOY EN LA TIENDA`, `PEDIDO ABORDO`, `FINALIZAR`, regreso a espera

## Problemas pendientes

### Problema 1: pedidos históricos

- Hay basura histórica mezclada con pedidos reales.
- Esto contamina auditorías y diagnósticos.
- Antes del piloto debe crearse un entorno limpio.

### Problema 2: variabilidad de conductor

- No puede haber múltiples UIDs/confusiones de cuenta.
- Solo un conductor piloto debe operar: `DR-001`.
- No cambiar de cuenta durante el piloto.

## Configuración inicial del piloto

### RTDB esperada

```
pedidos
  PED_TEST_001

pedidos_para_reparto
  PED_TEST_001
```

Sin otros pedidos en `pedidos`, `pedidos_para_reparto`, `pedidos_en_camino` o `repartidores/*/pedido_activo`.

### Conductor piloto

```
repartidores/8mo8182LJsgV7vKMSpiCekFKAG23/codigo = DR-001
```

### Resultado operativo esperado

- El panel muestra `DR-001`
- El backend sigue usando `8mo8182LJsgV7vKMSpiCekFKAG23`
- El pedido LISTO debe aparecer como misión disponible en el teléfono

## Ciclo de prueba único

1. Admin crea pedido
2. Cocina pone pedido en `LISTO`
3. Motorala recibe nueva misión
4. Acepta pedido
5. Pedido pasa a `EN_CURSO`
6. Tracking se activa
7. Pedido se entrega
8. Repartidor vuelve a estado de espera

## Criterios de éxito

- Repetir el ciclo cinco veces seguidas sin intervención de código
- Si falla, abrir incidente con:
  1. descripción del síntoma
  2. evidencia en RTDB
  3. nota de qué se probó
  4. commit pequeño si el código cambia

## Reglas en caso de incidente

- No comenzar un nuevo ciclo hasta entender por qué falló el anterior.
- No mezclar pedidos históricos con el pedido de prueba.
- No agregar estados o filtros nuevos de emergencia.

## Nota de estabilización

Este baseline es la única forma autorizada de arrancar el piloto. Si alguien quiere empezar, debe hacerlo desde aquí y no desde un conjunto de condiciones diferentes.
