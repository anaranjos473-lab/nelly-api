# NELLY-FISCAL V1.1 - Fiscal Control Layer

## Alcance implementado

V1.1 formaliza la capa de control sobre `pedidos` y `ledger` sin crear una segunda fuente de verdad. Incluye:

- contrato canónico `FinancialEvent` con idempotencia;
- reglas fiscales versionadas con estado `PENDING_VALIDATION` por defecto;
- expediente `FiscalCase` por pedido;
- ciclo de estados CFDI y comprobación read-only contra pedido, ledger y settlement;
- resumen del centro de control fiscal;
- revisión protegida por el acceso existente del panel.

## Endpoints

- `GET /api/panel/fiscal/orders/:orderId/review`
- `GET /api/panel/fiscal/summary`

Ambos son read-only. No crean movimientos, no actualizan pedidos y no cierran settlements.

## Reglas de seguridad

- Ninguna tasa de IVA, ISR o retención está codificada como verdad fiscal.
- Una regla solo es aplicable cuando `validationStatus=VALIDATED_RULE`.
- Un `FiscalCase` queda `NOT_CERTIFIED` mientras existan excepciones o falte validación profesional.
- `GMV` nunca se convierte automáticamente en `nelly_revenue`.
- CFDI, settlement y banco se relacionan por evidencia; no se fabrican referencias faltantes.

## Fuera de alcance

Emisión/cancelación real de CFDI, escritura de settlement, conciliación bancaria, cierre contable, pólizas y certificación profesional. Esos cambios requieren aprobación fiscal, jurídica, financiera y de arquitectura conforme a los documentos P0/P1 existentes.
