# FINANCIAL_POLICY

## DOCUMENTOS RECTORES RELACIONADOS

Este documento define las políticas financieras oficiales de Nelly.

Las tarifas, recargos, retenciones y valores operativos vigentes se encuentran en:

- TARIFF_CATALOG_V1.md

Las simulaciones oficiales de certificación financiera se encuentran en:

- FINANCIAL_LEDGER_SIMULATION_001.md

En caso de conflicto:

1. FINANCIAL_POLICY.md
2. TARIFF_CATALOG_V1.md
3. FINANCIAL_LEDGER_SIMULATION_001.md

La política prevalece sobre las tarifas.
Las tarifas prevalecen sobre las simulaciones.

## Propósito

Cerrar el contrato financiero del ecosistema Nelly antes de agregar cualquier regla nueva de tarifas dinámicas, bonos o IA de despacho.

Esta política define:
- Comisión oficial
- Billetera oficial
- Liquidación oficial
- Ledger financiero
- Auditoría y trazabilidad

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

### Definición interna de servicios

El pedido se estructura como:

`Producto + Servicio Nelly`

Donde:

`Servicio Nelly = Envío + Tarifa Nelly + Fondos Internos + Recargos Operativos`

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

### Riesgo documental abierto

Existen referencias legacy al 18% en documentación histórica, scripts antiguos, prompts y rutas no certificadas.

La regla oficial vigente para V1 es:

`COMISION_OFICIAL = 15%`

FIN-006 ServicioNellyCalculator deberá leer únicamente:

- FINANCIAL_POLICY.md
- TARIFF_CATALOG_V1.md

FIN-006 no deberá derivar reglas financieras desde:

- README
- router.js
- scripts viejos
- prompts históricos
- protocolos de prueba anteriores a la certificación V1

### Política de Visualización al Cliente

El cliente visualizará únicamente:

- Producto
- Servicio Nelly
- Total

El cliente no visualizará:

- Tarifa Nelly
- Fondos Internos
- SAT
- Operación
- Equipamiento
- Riesgo
- Jurídico
- Tecnología
- Emergencias
- Soporte
- Auditoría
- Personal
- Seguros

Todos estos conceptos forman parte del cálculo interno del Servicio Nelly.

### Proteccion de Fondos Internos Estrategicos

Los fondos internos son reservas operativas trazables. No deberan mezclarse con gasto general ni usarse para fines distintos a su proposito.

#### Fondo de Riesgo

Monto vigente segun catalogo:

`$1.50 por pedido`

Uso permitido:

- Fraudes
- Perdidas certificadas
- Incidentes aprobados

Uso prohibido:

- Bonos
- Promociones
- Marketing
- Descuentos
- Campanas
- Desarrollo
- Operacion diaria

#### Fondo de Emergencias

Monto vigente segun catalogo:

`$1.25 por pedido`

Uso permitido:

- Accidentes
- Eventos climaticos severos
- Contingencias mayores

Uso prohibido:

- Flujo operativo normal
- Bonos
- Promociones
- Gasto general

#### Fondo Tecnologico

Monto vigente segun catalogo:

`$1.50 por pedido`

Uso permitido:

- Infraestructura
- Firebase
- Servidores
- Mapas
- IA futura
- Smart Dispatch
- Automatizacion

Uso prohibido:

- Gastos generales
- Bonos
- Promociones
- Operacion diaria no tecnologica

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

## 4. Ledger financiero

### Contrato único de ledger

El ledger financiero es la historia inmutable de movimientos financieros.

- No se edita.
- Solo se agregan registros.
- Cada movimiento queda trazado.

### Campos mínimos del ledger

- `ledger_id`
- `pedido_id`
- `actor`
- `tipo`
- `monto`
- `saldo_anterior`
- `saldo_nuevo`
- `fecha`

### Reglas

- Los movimientos deben recordarse en `ledger` o `financial_ledger`.
- Nunca se editan movimientos pasados.
- Solo se agrega un nuevo registro por evento.

## 5. Auditoría y trazabilidad

### Contrato de auditoría

La auditoría financiera debe cubrir:
- movimiento por pedido
- evento de aceptación
- evento de entrega
- evento de liquidación
- evento de cobro / pago de deuda

### Trazabilidad

La trazabilidad debe permitir reconstruir:

`pedido -> reserva -> entrega -> liquidación -> ledger`

### Estado actual

- `liquidaciones_auditoria` existe como flujo de auditoría legacy
- Debe integrarse con el ledger y las liquidaciones oficiales

## 6. Checklist de certificación

1. Elegir y documentar comisión única: `15%`.
2. Consolidar `repartidores/{uid}/billetera` como billetera oficial.
3. Definir `liquidaciones/` como ruta oficial de liquidación.
4. Crear ledger inmutable.
5. Verificar que `app.js` monta los endpoints financieros críticos.
6. Asegurar que `metricas/ganancias_hoy` se actualiza en `entregado`, no en `en reparto`.
7. Simular pedido $100 en entorno controlado.
8. No introducir IA, tarifas dinámicas, bonos o ranking hasta certificación.

## 7. Declaración de riesgo

El sistema financiero no está certificado hasta que el ledger, las liquidaciones y la auditoría funcionen juntos como un flujo verificable. El mayor riesgo actual es construir sobre una base financiera ambigua.
