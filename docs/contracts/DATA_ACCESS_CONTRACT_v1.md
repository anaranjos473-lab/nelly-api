# DATA_ACCESS_CONTRACT_v1.md

## Objetivo

Definir el contrato de lectura del Nelly Archive Engine para que Cocina, Logistica, Centro Comercial, Historial, Finanzas, Analytics y Auditoria consuman la misma fuente de verdad sin leer directamente la estructura interna de almacenamiento.

## Version

`v1`

## Endpoint

`GET /api/data-architecture/data-access`

## Metodo HTTP

`GET`

## Respuesta

```json
{
  "ok": true,
  "contract_version": "v1",
  "generatedAt": "2026-07-30T08:37:24.839Z",
  "active_orders": [],
  "today_orders": [],
  "historical_orders": [],
  "monthly_summary": [],
  "annual_summary": [],
  "audit_index": {
    "history_index": {
      "comercio": {},
      "cliente": {},
      "driver": {},
      "forma_pago": {},
      "incidencia": {}
    }
  }
}
```

## Bloques

### `contract_version`

- Tipo: `string`
- Obligatorio: `si`
- Descripcion: version formal del contrato que consume el cliente.

### `generatedAt`

- Tipo: `string` ISO-8601
- Obligatorio: `si`
- Descripcion: momento en el que se genero la respuesta del contrato.

### `active_orders`

- Tipo: `array`
- Obligatorio: `si`
- Descripcion: pedidos vivos que aun pertenecen a la operacion activa.

### `today_orders`

- Tipo: `array`
- Obligatorio: `si`
- Descripcion: pedidos del dia en curso, incluyendo pedidos entregados hoy.

### `historical_orders`

- Tipo: `array`
- Obligatorio: `si`
- Descripcion: pedidos archivados que ya no deben aparecer en la operacion activa.

### `monthly_summary`

- Tipo: `array`
- Obligatorio: `si`
- Descripcion: resumen mensual derivado del Archive Engine.

### `annual_summary`

- Tipo: `array`
- Obligatorio: `si`
- Descripcion: resumen anual derivado del Archive Engine.

### `audit_index`

- Tipo: `object`
- Obligatorio: `si`
- Descripcion: indice para consultas rapidas de auditoria e inspeccion historica.

### `audit_index.history_index`

- Tipo: `object`
- Obligatorio: `si`
- Descripcion: indice principal para buscar por comercio, cliente, repartidor, metodo de pago, incidencia y fecha.

## Campos recomendados para pedidos

Los arreglos `active_orders`, `today_orders` y `historical_orders` pueden contener pedidos con campos distintos segun el momento del ciclo de vida, pero se recomienda conservar al menos:

- `id`
- `pedido_id`
- `shortId`
- `estado`
- `estado_pedido`
- `cliente_nombre`
- `comercio_nombre`
- `repartidor_id`
- `driverUid`
- `metodo_pago`
- `monto_total`
- `createdAt`
- `created_at`
- `timestampActualizacion`
- `finalizado_at`
- `entregado_en`

## Compatibilidad

- `v1` no debe romper consumidores existentes.
- Los nombres de los campos expuestos por `v1` deben permanecer estables.
- Cambios incompatibles requieren una nueva version, por ejemplo `v2`.
- Los consumidores deben leer primero `contract_version` antes de asumir la forma del payload.

## Reglas de uso

- Cocina debe leer `active_orders`.
- Logistica debe leer `today_orders`.
- Centro Comercial debe leer `today_orders`.
- Historial debe leer `historical_orders`, `monthly_summary`, `annual_summary` y `audit_index`.
- Finanzas debe leer `monthly_summary` y `annual_summary`.
- Analytics debe leer `historical_orders` e `history_index`.
- Auditoria debe leer `history_index`.

## Criterios de estabilidad

- No consultar `pedidos` directamente desde las pantallas consumidoras.
- No derivar estados operativos fuera del contrato.
- Mantener fallback temporal solo mientras se certifica cada consumidor.

## Ejemplo de uso

```text
GET /api/data-architecture/data-access
Authorization: Bearer <token>
```

```json
{
  "ok": true,
  "contract_version": "v1",
  "generatedAt": "2026-07-30T08:37:24.839Z",
  "active_orders": [
    {
      "id": "PED_1785013117948",
      "shortId": "0725-67",
      "estado": "LISTO",
      "cliente_nombre": "RC2 Piloto Controlado",
      "monto_total": 183,
      "createdAt": 1785013117948
    }
  ],
  "today_orders": [
    {
      "id": "ANDROID_QA_1782301947650",
      "shortId": "QA-001",
      "estado": "ENTREGADO",
      "cliente_nombre": "Prueba Android",
      "repartidor_id": "8mo8182LJsgV7vKMSpiCekFKAG23",
      "monto_total": 150,
      "finalizado_at": 1784477005606
    }
  ],
  "historical_orders": [],
  "monthly_summary": [
    {
      "period": "2026-07",
      "pedidos": 277,
      "entregados": 254,
      "cancelados": 0,
      "monto_total": 49881.45
    }
  ],
  "annual_summary": [
    {
      "year": 2026,
      "pedidos": 337,
      "entregados": 314,
      "cancelados": 0,
      "monto_total": 60873.35
    }
  ],
  "audit_index": {
    "history_index": {
      "comercio": {
        "Lidos Pizza": 12
      },
      "cliente": {
        "Cliente Prueba": 4
      },
      "driver": {
        "driver_piloto": 2
      },
      "forma_pago": {
        "efectivo": 10
      },
      "incidencia": {}
    }
  }
}
```

## Historial de cambios

- 2026-07-30: documento base creado para NAE v1.
