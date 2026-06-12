# NELLY_OS_CERTIFICATION_MATRIX

## Objetivo

Mapa de certificación de módulos críticos y su estado actual.

| Módulo | Estado | Observaciones | Prioridad |
| --- | --- | --- | --- |
| Auth | 🟢 Certificado | Firebase Auth funcionando | Baja |
| RTDB | 🟢 Certificado | Lecturas y escrituras presentes | Baja |
| Recepción de pedidos Android | 🟢 Certificado | Cliente existente | Baja |
| Offline básico | 🟢 Certificado | Funcionalidad establecida | Baja |
| Custodia | 🟡 Parcial | `billetera_guerra` necesita normalizarse | Alta |
| Riesgo | 🟡 Parcial | Deuda y bloqueo activos pero no certificados | Alta |
| Equipamiento | 🟡 Parcial | Evaluaciones de smart dispatch parciales | Media |
| Billetera de Guerra | 🟡 Parcial | Campos duplicados en RTDB | Alta |
| Financial Ledger | 🔴 Bloqueante | No existe ledger inmutable | Crítica |
| Liquidaciones | 🔴 Bloqueante | Endpoints legacy, no montados | Crítica |
| Auditoría Financiera | 🔴 Bloqueante | No hay flujo E2E certificado | Crítica |
| Conciliación | 🔴 Bloqueante | No hay flujo de registro contable | Crítica |

## Criterios de certificación

- Un módulo es `Certificado` cuando su flujo se puede probar completo sin ambigüedades.
- Un módulo es `Parcial` si existe lógica pero faltan contratos o pruebas.
- Un módulo es `Bloqueante` si su ausencia impide avanzar en desarrollo financiero.

## Recomendación

Avanzar primero en los cuatro módulos `Bloqueante` antes de volver a codificar nuevas funciones financieras.
