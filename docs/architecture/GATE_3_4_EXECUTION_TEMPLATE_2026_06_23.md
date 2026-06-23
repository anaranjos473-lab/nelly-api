# GATE_3_4_EXECUTION_TEMPLATE_2026_06_23.md

## Propósito
Registrar evidencia operativa del ciclo completo pedido -> Android -> entrega -> finanzas.

## Plantilla de ejecución

### Prueba 1 - Gate 3 Android

- Pedido ID:
- Hora de creación:
- Hora de despacho:
- Aparece en Android: Sí / No
- Tiempo hasta aparición:
- Estado RTDB tras despacho:
- Estado RTDB tras aceptar:
- Texto visible en Android:
- Resultado aceptado: Sí / No

### Prueba 2 - Gate 4 Finanzas

- Pedido ID:
- Hora de entrega:
- Estado final RTDB:
- Movimiento financiero registrado: Sí / No
- Cantidad registrada:
- Duplicados: Sí / No
- Observaciones:

## Resultado esperado

### Gate 3
- Pedido aparece en Android tras despacho.
- Al aceptar, el pedido cambia a estado de curso.
- La UI muestra un estado consistente con la operación activa.

### Gate 4
- Al entregar, se registra exactamente un movimiento financiero.
- No hay duplicados ni estados inconsistentes.

## Criterio de éxito

- Gate 3: PASS si aparece el pedido y cambia al estado esperado tras aceptar.
- Gate 4: PASS si la entrega genera un único registro financiero consistente.
