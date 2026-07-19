# RUNBOOK_RELEASE.md

## Objetivo

Preparar una liberación ordenada y verificable.

## Checklist

1. Confirmar compilación.
2. Confirmar pruebas relevantes.
3. Confirmar contratos.
4. Confirmar reglas Firebase.
5. Confirmar estado documental.
6. Confirmar evidencia de certificación o investigación.

## Pasos

1. Correr `RELEASE_CHECKLIST.md`.
2. Verificar `SYSTEM_STATE.md`.
3. Verificar `DEPENDENCY_MAP.md`.
4. Revisar impactos en backend, panel y Android.
5. Validar staging.
6. Certificar si aplica.
7. Liberar producción si todo está estable.

## No liberar si

- Hay una investigación abierta que toca el mismo contrato.
- Un componente certificado cambió sin evidencia nueva.
- Un script de validación falló.
- Un ADR o contrato quedó desalineado.

