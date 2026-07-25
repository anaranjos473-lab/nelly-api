# ROADMAP EJECUTIVO MAQUINA DE ESTADOS LOGISTICA V1

## Estado

Propuesto

## Objetivo

Dejar en una sola pagina la decision actual, la ruta futura y el orden recomendado para evolucionar la maquina de estados de Nelly sin romper el piloto.

## Decision actual

No se adopta todavia la maquina de estados logistica enriquecida como contrato oficial.

La baseline vigente sigue siendo:

```text
PENDIENTE -> LISTO -> EN_CURSO -> ENTREGADO -> CANCELADO
```

## Por que

- El flujo actual ya cierra entregas de forma correcta.
- La version enriquecida aporta valor, pero incrementa riesgo en una fase de estabilizacion.
- RC2 mostro que los hitos intermedios son utiles como evolucion, no como condicion para operar el piloto.

## Ruta futura

La evolucion deseable es una maquina logistica enriquecida con hitos como:

- `RUTA_A_TIENDA`
- `LLEGUE_A_TIENDA`
- `PEDIDO_ABORDO`
- `LLEGUE_DESTINO`

## Secuencia recomendada

1. Congelar la baseline actual.
2. Validar lectura de estados enriquecidos.
3. Habilitar coexistencia en backend.
4. Adaptar Android (NellyDriver).
5. Ajustar paneles, CRM y metricas.
6. Correr piloto limitado.
7. Certificar o descartar la adopcion.

## Impacto por modulo

| Modulo | Cambio esperado | Riesgo |
| --- | --- | --- |
| Android | Leer y mostrar hitos intermedios sin inventar negocio | Desalineacion con backend |
| Backend | Validar coexistencia y conservar `complete-order` | Regresiones en estados y cierres |
| Panel Operativo | Exponer seguimiento y tiempos | Inconsistencia visual |
| Dashboard Comercial | Incorporar SLA y conversion con contexto real | Metricas afectadas por estados no canonicos |
| CRM | Agregar trazabilidad operativa | Mezcla de contexto y contrato |
| Metricas y tiempos | Medir espera, recoleccion y trayecto | Medicion sin contrato estable |
| Piloto | Probar ruta enriquecida con trafico limitado | Bloqueo por migracion incompleta |

## Criterios de adopcion

Adoptar la version enriquecida solo si:

- no rompe `ENTREGADO`;
- no altera `complete-order`;
- mantiene compatibilidad con el piloto;
- agrega valor real a trazabilidad y SLA;
- cuenta con coexistencia controlada y certificacion completa.

## Recomendacion ejecutiva

Mantener el contrato actual como baseline para operar el piloto.

Usar la version enriquecida como siguiente fase de producto, no como cambio inmediato.

## Referencias

- `ADR-010-DECISION_MAQUINA_ESTADOS_LOGISTICA.md`
- `ADR-009-COMPARATIVO_MAQUINA_ESTADOS_LOGISTICA.md`
- `PLAN_MIGRACION_MAQUINA_ESTADOS_LOGISTICA_V1.md`
- `MATRIZ_MIGRACION_MAQUINA_ESTADOS_LOGISTICA_V1.md`

