# FINANCIAL_LEDGER_ARCHITECTURE

## Propósito

Definir la arquitectura del ledger financiero que soporta el flujo de `Pedido -> Aceptación -> Entrega -> Liquidación -> Fondos -> Auditoría`.

## ¿Qué se guarda?

Cada registro en el ledger debe almacenar al menos:

- `ledger_id`
- `pedido_id`
- `actor`
- `tipo`
- `monto`
- `saldo_anterior`
- `saldo_nuevo`
- `fecha`
- `moneda`
- `descripcion`
- `referencia`

### Estructura recomendada

```json
{
  "ledger_id": "ledger_20260612_0001",
  "pedido_id": "pedido_12345",
  "actor": "repartidor|plataforma|restaurante|admin",
  "tipo": "reserva|entrega|liquidacion|pago_deuda|ajuste|reversion",
  "monto": 85.00,
  "saldo_anterior": 200.00,
  "saldo_nuevo": 285.00,
  "fecha": 1718200000000,
  "moneda": "MXN",
  "descripcion": "Liquidación de pedido 12345",
  "referencia": "liquidacion_67890"
}
```

## ¿Quién escribe?

Backend

## ¿Quién lee?

- Dashboard
- Auditoría
- Liquidaciones

## Vistas

### Vista Cliente

- Producto
- Servicio Nelly
- Total

### Vista Repartidor

- Servicio generado
- Retención operativa
- Ganancia neta

### Vista Administrativa

- Servicio generado
- Tarifa Nelly
- Fondos
- Utilidad
- Ledger

## ¿Quién modifica?

Nadie.

Solo se agregan movimientos.
Nunca se editan.

## Principios

- El ledger es inmutable.
- Cada evento financiero genera un movimiento nuevo.
- Cualquier correlación debe ser por `pedido_id` y `referencia`.
- No se permite update parcial de movimientos.
- Si se requiere corrección, se registra un nuevo movimiento de reversión o ajuste.

## Flujo recomendado

1. Pedido creado
2. Pedido aceptado
3. Reserva de capital registrada
4. Pedido entregado
5. Liquidación generada
6. Fondos distribuidos
7. Movimiento ledger registrado

## Ejemplo de movimientos

- `pedido_12345` aceptado: reserva capital $100
- `pedido_12345` entregado: libera capital reservado, calcula comisión $15, saldo para repartidor $85
- `pedido_12345` liquidado: registra movimiento ledger `liquidacion` y actualiza contabilidad eventual

## Notas

- El ledger no reemplaza `billetera` ni `finanzas`, pero debe ser la fuente de verdad para trazabilidad.
- La conciliación debe poder reconstruirse con `ledger` + `liquidaciones` + `repartidores/{uid}/billetera`.
