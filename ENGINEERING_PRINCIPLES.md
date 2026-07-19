# ENGINEERING_PRINCIPLES.md
# Principios de Ingeniería de Nelly OS

## 1. Stability First

La estabilidad tiene prioridad sobre la velocidad.

## 2. Evidence First

Toda hipótesis requiere evidencia antes de cambiar código.

## 3. Certified Components Stay Stable

No modificar componentes certificados sin una justificación documentada y una prueba nueva.

## 4. Single Source Of Truth

Cada entidad tiene una única fuente de verdad.

## 5. Single Implementation Of Business Rules

Cada regla de negocio se implementa una sola vez.

## 6. Compatibility By Default

Las APIs evolucionan de forma compatible o mediante una migración explícita.

## 7. Separate Certification From Investigation

Las certificaciones describen comportamiento observado.
Las investigaciones describen hipótesis y resultados.
No deben mezclarse.

## 8. Small Changes

Preferir cambios pequeños, verificables y reversibles.

## 9. Backend As Authority

El backend decide estados de negocio y cierres.
Android refleja.

## 10. Document The Decision

Toda decisión importante debe dejar rastro en ADR, contrato, certificación o changelog.

## 11. Distinguish Administrative And Financial Blocking

No mezclar bloqueo manual con bloqueo por deuda.
Las métricas, endpoints y paneles deben exponer `bloqueo_manual`, `bloqueo_por_deuda` y `total_no_elegible` de forma separada.
