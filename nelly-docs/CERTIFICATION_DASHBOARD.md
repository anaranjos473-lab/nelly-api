# CERTIFICATION_DASHBOARD

## Estado actual de certificación

| Componente | Estado | Observaciones |
| --- | --- | --- |
| Auth | 🟢 | Firebase Auth funcionando |
| RTDB | 🟢 | Lecturas y escrituras presentes |
| Recepción de pedidos Android | 🟢 | Cliente existente |
| Offline básico | 🟢 | Funcionalidad establecida |
| Custodia | 🟡 | `billetera_guerra` necesita normalizarse |
| Riesgo | 🟡 | Deuda y bloqueo activos pero no certificados |
| Equipamiento | 🟡 | Evaluaciones de smart dispatch parciales |
| Billetera de Guerra | 🟡 | Campos duplicados en RTDB |
| Financial Ledger | 🔴 | No existe ledger inmutable |
| Liquidaciones | 🔴 | Endpoints legacy, no montados |
| Auditoría Financiera | 🔴 | No hay flujo E2E certificado |
| Conciliación | 🔴 | No hay flujo de registro contable |

## Objetivo de certificación

Convertir los cuatro módulos en ROJO a verdes con:
- Contrato único de comisión
- Billetera oficial unificada
- Liquidaciones oficiales montadas en el runtime principal
- Ledger inmutable y trazabilidad por pedido

## Plan inmediato

1. Documentar políticas rectoras en `nelly-docs/`.
2. Definir arquitectura del ledger en `architecture/FINANCIAL_LEDGER_ARCHITECTURE.md`.
3. Simular un flujo de pedido de $100 sin tocar producción.
4. Certificar el ciclo completo antes de programar.
