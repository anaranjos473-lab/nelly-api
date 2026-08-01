# GO / NO-GO PILOTO CONTROLADO 001

## Identificacion

| Campo | Valor |
| --- | --- |
| Codigo | `GO_NO_GO_PILOTO_CONTROLADO_001` |
| Documento | `Decision ejecutiva de arranque del piloto controlado` |
| Version | `1.0` |
| Estado | `GO RECOMENDADO` |
| Proyecto | `Nelly Delivery` |
| Fecha | `2026-08-01` |
| Baseline | `PANEL_VISUAL_001`, `DOMAIN_CERT_001`, `ATOMIC_ASSIGNMENT_001`, `ECOSYSTEM_CERT_001` |
| Prepiloto | `PREPILOTO: APROBADO` |
| RC2 | `APROBADO COMO BASE DE EJECUCION` |

## Proposito

Confirmar si existen condiciones suficientes para abrir el piloto controlado sobre la linea base ya certificada.

## Criterios revisados

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| Baseline certificado intacto | Cumplido | Certificaciones cerradas y subidas |
| Prepiloto operacional ejecutado | Cumplido | 3/3 ciclos en verde |
| Backend operativo | Cumplido | `doctor:operational` y validacion de puerto |
| Dashboard operativo | Cumplido | Snapshot consistente |
| Finanzas saludables | Cumplido | `financeOk = true` en corrida prepiloto |
| Flujo pedido completo | Cumplido | `dispatch -> accept -> complete` |
| Plan de contingencia disponible | Cumplido | Paquete de preparacion y runbooks |
| Evidencia trazable | Cumplido | Actas, checklist y hoja de corrida |

## Riesgos residuales

| Riesgo | Estado | Mitigacion |
| --- | --- | --- |
| Dependencia de autenticacion externa en el runner oficial | Controlado | Usar evidencia local validada y mantener `validate:operational-port` |
| Errores de jornada reales | Esperados | Q1, soporte y runbook activos |
| Cambios fuera de baseline | Bloqueados | No abrir nuevos cambios salvo incidente critico |

## Decision

**GO** para iniciar el Piloto Controlado con alcance limitado, evidencia por jornada y criterio fail-fast.

## Condiciones

- mantener el baseline congelado;
- usar `RC2` como estructura de corrida;
- ejecutar doctor antes y despues de cada jornada;
- registrar incidencias en el expediente;
- detener la jornada ante cualquier bloqueo funcional reproducible.

## Firma

| Rol | Nombre | Firma | Fecha |
| --- | --- | --- | --- |
| Responsable tecnico | Codex |  | 2026-08-01 |
| Responsable operativo |  |  |  |
| Revisor de calidad |  |  |  |

