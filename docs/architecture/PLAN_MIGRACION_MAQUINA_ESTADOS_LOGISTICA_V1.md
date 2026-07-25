# PLAN DE MIGRACION MAQUINA DE ESTADOS LOGISTICA V1

## Estado

Propuesto

## Proposito

Definir una ruta controlada para evolucionar la maquina de estados del piloto hacia una version logistica enriquecida sin romper el contrato actual certificado.

## Punto de partida

La decision vigente es mantener como baseline oficial:

```text
PENDIENTE -> LISTO -> EN_CURSO -> ENTREGADO -> CANCELADO
```

La version enriquecida queda documentada como evolucion futura y no debe activarse sin plan de coexistencia y certificacion completa.

## Objetivo de migracion

Introducir hitos de ultima milla, como:

- `RUTA_A_TIENDA`
- `LLEGUE_A_TIENDA`
- `PEDIDO_ABORDO`
- `LLEGUE_DESTINO`

sin romper:

- el cierre `ENTREGADO`;
- el contrato de `complete-order`;
- la compatibilidad con Android, paneles y metricas;
- el piloto actual.

## Alcance

La migracion incluye:

- backend;
- Android (NellyDriver);
- Panel Operativo;
- Dashboard Comercial;
- CRM;
- metricas y tiempos;
- documentacion y pruebas.

## Fuera de alcance

- cambiar el contrato oficial actual de forma abrupta;
- inventar nuevas fuentes de verdad;
- modificar RC2 como baseline certificado;
- abrir nuevos dominios de negocio.

## Fases

### Fase 0 - Preparacion documental

Objetivo:

- dejar definidos contrato actual, contrato enriquecido, ADR de decision y criterios de aprobacion.

Entregables:

- ADR-008;
- ADR-009;
- ADR-010;
- checklist de adopcion;
- matriz de impacto.

Exit criteria:

- el equipo puede explicar la diferencia entre baseline y evolucion sin ambiguedad.

### Fase 1 - Compatibilidad de lectura

Objetivo:

- permitir que todos los consumidores entiendan los estados enriquecidos sin cambiar aun el contrato oficial de escritura.

Acciones:

- Android reconoce estados nuevos como lectura.
- Paneles muestran hitos intermedios como observacion o detalle.
- CRM y metricas registran eventos enriquecidos como contexto.

Exit criteria:

- los estados enriquecidos pueden ser leidos sin romper vistas existentes.
- el piloto actual sigue cerrando igual.

### Fase 2 - Backend en coexistencia

Objetivo:

- ampliar la logica de validacion para aceptar la secuencia enriquecida en modo controlado.

Acciones:

- ampliar `canTransition`.
- crear mapeo entre estado enriquecido y estado oficial.
- conservar `complete-order` como cierre final unico.

Exit criteria:

- el backend acepta la nueva secuencia en modo controlado.
- la ruta de cierre no cambia.

### Fase 3 - Android operativo

Objetivo:

- reflejar la nueva maquina en NellyDriver sin romper el flujo actual.

Acciones:

- adaptar repositorio de pedidos.
- mostrar hitos de viaje y recoleccion.
- mantener compatibilidad con estados heredados.

Exit criteria:

- Android muestra la secuencia enriquecida correctamente.
- no hay regresion en aceptacion y cierre.

### Fase 4 - Paneles y analitica

Objetivo:

- usar los hitos enriquecidos para mejorar seguimiento, ETA, SLA y trazabilidad.

Acciones:

- Panel Operativo muestra hitos y tiempos.
- Dashboard Comercial agrega impacto de tiempos a métricas.
- CRM registra contexto operativo con cautela.

Exit criteria:

- los paneles siguen siendo coherentes.
- los datos no oficiales no contaminan el contrato base.

### Fase 5 - Piloto en coexistencia

Objetivo:

- ejecutar un piloto limitado con doble lectura o coexistencia controlada.

Acciones:

- habilitar un subconjunto de repartidores o rutas.
- comparar flujo actual vs enriquecido.
- medir tiempos, errores y adopcion.

Exit criteria:

- no existen bloqueos criticos.
- la version enriquecida aporta valor medible.
- el piloto puede decidir adopcion total o parcial.

### Fase 6 - Certificacion final

Objetivo:

- convertir la version enriquecida en contrato oficial solo si supera la validacion completa.

Acciones:

- certificar backend.
- certificar Android.
- certificar paneles.
- actualizar contrato oficial y ADRs relacionados.

Exit criteria:

- existe una nueva baseline certificada.

## Riesgos

| Riesgo | Impacto | Mitigacion |
| --- | --- | --- |
| Romper `ENTREGADO` | Alto | Mantener `complete-order` como cierre unico. |
| Desalinear Android y backend | Alto | Fase de coexistencia y pruebas integradas. |
| Contaminar metricas con estados no oficiales | Medio | Separar contexto operativo de contrato canonico. |
| Aumentar complejidad sin valor real | Medio | Medir trazabilidad y SLA antes de certificar. |
| Bloquear piloto por migracion incompleta | Alto | No activar la migracion hasta completar fases previas. |

## Indicadores de exito

- Se puede medir llegada al comercio.
- Se puede medir espera, recoleccion y trayecto.
- No se altera el cierre operativo.
- Los paneles siguen estables.
- Android refleja el flujo sin ambiguedad.

## Criterios de no adopcion

No se debe promover la version enriquecida si:

- introduce regresiones en cierres;
- rompe contratos certificados;
- obliga a cambiar el piloto actual sin beneficio claro;
- no mejora trazabilidad o SLA de forma demostrable.

## Recomendacion final

No ejecutar la migracion de inmediato.

Primero debe completarse:

- el diseño detallado por componente;
- la matriz de impacto;
- una prueba de coexistencia limitada;
- la certificacion de la nueva ruta.

Hasta entonces, el contrato actual sigue siendo la baseline oficial del piloto.

