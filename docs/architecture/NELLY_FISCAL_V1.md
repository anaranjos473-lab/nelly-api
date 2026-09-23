# NELLY-FISCAL V1

## Alcance

NELLY-FISCAL es una capa de control financiero y fiscal sobre la fuente de verdad existente. En V1 analiza pedidos y movimientos del ledger; no cambia estados operativos, saldos, contratos fiscales ni datos del SAT.

## Contrato

- `pedidos` sigue siendo la fuente de verdad operativa.
- `ledger` sigue siendo la fuente de verdad de movimientos financieros.
- NELLY-FISCAL produce una revisión derivada y auditable.
- `GMV` no se interpreta automáticamente como ingreso de Nelly.
- `nelly_revenue`, `third_party_amount` e impuestos permanecen en `null` hasta confirmar contrato y criterio profesional.
- Una operación con información insuficiente queda en `FISCAL_PENDING` o `EXCEPTION`, nunca en `CERTIFIED`.

## Endpoint

`GET /api/panel/fiscal/orders/:orderId/review`

Requiere el mismo token del panel. Lee `pedidos/:orderId` y `ledger`, y devuelve hechos, clasificación preliminar, faltantes, riesgos, CFDI, contabilidad y conciliación.

## No alcance

- Cálculo definitivo de IVA o ISR.
- Emisión, cancelación o validación directa de CFDI.
- Conciliación bancaria automática.
- Escritura de movimientos financieros desde la revisión.
- Decisiones que requieran contador o abogado.

## Siguiente fase

Definir, con evidencia contractual y revisión profesional mexicana, el catálogo de cuentas, propietarios económicos, reglas de comisiones, eventos de cierre y matriz CFDI antes de automatizar asientos o impuestos.
