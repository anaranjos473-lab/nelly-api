# FINANCIAL_POLICY

## Propósito

Cerrar el contrato financiero del ecosistema Nelly antes de agregar cualquier regla nueva de tarifas dinámicas, bonos o IA de despacho.

Esta política define:
- Comisión oficial
- Billetera oficial
- Liquidación oficial

Y marca qué se considera declarado, activo, o legacy/deprecated.

## Alcance

Aplica a todos los flujos financieros de Cadena 3:
`Pedido -> Aceptado -> Entregado -> Liquidación -> Billetera -> Finanzas`.

No incluye todavía:
- Tarifa dinámica
- Bono lluvia
- Bono saturación
- IA de despacho
- Ranking inteligente

## 1. Comisión oficial

### Contrato único

`COMISION_OFICIAL = 15%`

### Regla

La comisión de plataforma se calcula siempre como:

`comision_plataforma = pedido.total * 0.15`

`monto_repartidor = pedido.total - comision_plataforma`

### Fuente oficial

Esta política debe ser implementada desde una única capa de cálculo central, preferiblemente:
- `scripts/commission-engine.js`
- `calculateRestaurantCommission(orderTotal, 0.15, policy)`
- `calculateDriverSettlement(...)` usando `0.15` como margen plataforma mínimo y default

### Fuentes legacy / deprecated

Hasta que la política se consolide, se declaran como legacy:
- `router.js` (18% fijo)
- `scripts/generarResumenSemanal.js` (18%)
- `README.md` y protocolos que mencionan 18%
- Cualquier cálculo que use `0.18` o `COMISION_PCT = 0.18`

### Nota

Si el producto decide cambiar la comisión en el futuro, deberá hacerse con una sola política oficial y actualizar todas estas referencias antes de desplegar.

## 2. Billetera oficial

### Contrato único de billetera

La billetera oficial del repartidor vive en:

`repartidores/{uid}/billetera`

Estructura oficial:

```json
{
  "capital_total": 1000,
  "capital_reservado": 300,
  "capital_disponible": 700,
  "deuda_comision": 0,
  "reservas_capital": {
    "pedidoId": {
      "monto": 100,
      "estado": "activa",
      "creado_en": 0,
      "actualizado_en": 0
    }
  }
}
```

### Definiciones

- `capital_total`: monto máximo asignado a este repartidor para operaciones de cobranza/entrega.
- `capital_reservado`: dinero actualmente reservado por pedidos aceptados.
- `capital_disponible`: dinero libre para aceptar nuevos pedidos.
- `deuda_comision`: deuda acumulada de comisiones pendientes.
- `reservas_capital`: reservas por pedido.

### Origen de cada cambio

- **Crea repartidor**: perfil inicial de `repartidores/{uid}/billetera`
- **Reserva capital**: `accept-order` / `routes/delivery.js`
- **Libera capital**: al entregar o cancelar pedido
- **Consume capital**: Smart Dispatch, lógica de aceptación, y bloqueos de deuda

### Alias existentes

Hay alias o campos parciales que deben ser consolidados:
- `billetera_guerra`
- `efectivo_disponible`
- `finanzas.capital_disponible`
- `finanzas.capital_reservado`

Estos deben normalizarse hacia la fuente oficial `repartidores/{uid}/billetera`.

## 3. Liquidación oficial

### Contrato único de liquidación

La ruta oficial de liquidaciones será:

- `liquidaciones/{liquidacionId}`
- `liquidaciones_auditoria/{auditId}`

### Estructura de liquidación oficial

Cada liquidación debe incluir al menos:

- `id`
- `repartidorUid`
- `pedidoId`
- `monto_total`
- `comision_plataforma`
- `ganancia_repartidor`
- `monto_efectivo` o `cobro_efectivo`
- `estado` (`PENDIENTE`, `AUTORIZADA`, `RECHAZADA`)
- `creadoEn`
- `actualizadoEn`
- `versionSistema`

### Lectores y consumidores

Debe ser la única ruta oficial de liquidaciones para:
- Admin Dashboard
- Panel de Cocina
- Auditoría financiera
- Validaciones de nómina

### Legacy / deprecated

Existentes, pero no oficiales hasta unificar el runtime:
- `run_server.js` `/api/liquidaciones`
- `app_fixed.js` `/api/liquidaciones`
- `app_test.js` `/api/liquidaciones`
- `public/js/admin-dashboard.js` que consume ese endpoint si no está montado en el runtime principal

Si `app.js` no monta los endpoints de `liquidaciones`, el código debe declararse legacy o integrarse claramente en el runtime certificado.

## 4. Datos oficiales y visibilidad

### Fuente de datos base

- `repartidores/{uid}/billetera` -> billetera oficial
- `repartidores/{uid}/finanzas` -> estado financiero oficial del conductor
- `liquidaciones/` -> liquidaciones oficiales
- `liquidaciones_auditoria/` -> historial de eventos y auditoría

### Conversión E2E

Para certificar, cada lectura debe coincidir en:
- `repartidores/{uid}/finanzas`
- `repartidores/{uid}/billetera`
- `liquidaciones`
- `historial_ventas` (si se mantiene)
- panel/dashboard activo

## 5. Checklist de certificación

1. Elegir y documentar comisión única: `15%`.
2. Definir y consolidar `repartidores/{uid}/billetera` como única billetera oficial.
3. Definir `liquidaciones/` como única ruta oficial de liquidación.
4. Confirmar que `app.js` monta los endpoints o declarar legacy los endpoints no usados.
5. Asegurar que `metricas/ganancias_hoy` se actualiza en `entregado`, no en `en reparto`.
6. Ejecutar prueba real:
   - Pedido $100
   - `capital_reservado = 100`
   - `capital_disponible` ajustado
   - entrega
   - `comision_plataforma = 15`
   - `ganancia_repartidor = 85`
   - verificar todas las vistas y nodos descritos
7. No activar tarifa dinámica, bonos ni IA de despacho antes de pasar Cadena 3.

## 6. Declaración de riesgo

Hasta que esta política se implemente y verifique, el sistema financiero no está certificado. La prioridad actual es cerrar este contrato mínimo antes de añadir cualquier lógica nueva.
