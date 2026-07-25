# RESUMEN DIRECCION MAQUINA DE ESTADOS LOGISTICA V1

## Estado actual

Verde para operar el piloto con el contrato actual.

## Decision

No adoptar todavia la maquina de estados logistica enriquecida como contrato oficial.

La baseline vigente sigue siendo:

```text
PENDIENTE -> LISTO -> EN_CURSO -> ENTREGADO -> CANCELADO
```

## Lectura ejecutiva

- El flujo actual funciona y permite cerrar pedidos correctamente.
- La version enriquecida aporta valor, pero aun no justifica el riesgo de cambio inmediato.
- Los hitos intermedios de ultima milla quedan documentados como evolucion futura.

## Lo que ya esta validado

- Cinco corridas RC2 completadas.
- Flujo extremo a extremo cerrado en `ENTREGADO`.
- Paneles y snapshots operativos estables.
- Robustez confirmada frente a acciones invalidas.

## Lo que sigue como evolucion

Una futura maquina logistica enriquecida con hitos como:

- `RUTA_A_TIENDA`
- `LLEGUE_A_TIENDA`
- `PEDIDO_ABORDO`
- `LLEGUE_DESTINO`

## Impacto de una futura adopcion

| Area | Impacto |
| --- | --- |
| Android | Mayor trazabilidad del repartidor |
| Backend | Coexistencia de estados y validacion mas rica |
| Panel Operativo | Seguimiento mas detallado |
| Dashboard Comercial | SLA y conversion mas precisos |
| CRM | Contexto operativo adicional |
| Metricas | Medicion de espera, recoleccion y trayecto |
| Piloto | Requiere coexistencia controlada |

## Riesgos de adoptar ahora

- Regresiones en cierres.
- Desalineacion Android/backend.
- Ruptura de paneles o metricas.
- Complejidad sin beneficio inmediato para el piloto.

## Recomendacion

1. Mantener el contrato actual para operar y liberar el piloto.
2. Conservar la version enriquecida como siguiente fase.
3. Migrar solo con coexistencia controlada y certificacion completa.

## Condicion para reabrir

Reabrir la adopcion solo si existe:

- necesidad clara de trazabilidad fina;
- plan de coexistencia;
- certificacion conjunta de Android, backend y paneles;
- evidencia de valor operativo medible.

## Referencias

- `ADR-010-DECISION_MAQUINA_ESTADOS_LOGISTICA.md`
- `ROADMAP_EJECUTIVO_MAQUINA_ESTADOS_LOGISTICA_V1.md`
- `PLAN_MIGRACION_MAQUINA_ESTADOS_LOGISTICA_V1.md`

