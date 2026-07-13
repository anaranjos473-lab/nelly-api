# C5.1 - Matriz de aprobación arquitectónica

Fecha: 2026-07-13

Estado general: **APROBACIÓN DE PRINCIPIO REGISTRADA; RATIFICACIÓN FINAL PENDIENTE**

No se inicia C5.2 hasta que todas las filas estén aprobadas explícitamente. Marcar una fila exige revisar el documento asociado; crear el archivo no equivale a aprobarlo.

| Tema | Documento | Estado |
|---|---|---|
| Contrato Canónico V2 | `CONTRATO_CANONICO_V2.md` | 🟡 Aprobación de principio; ratificación pendiente |
| Máquina de Estados | `MAQUINA_ESTADOS_V2.md` | 🟡 Aprobación de principio; ratificación pendiente |
| Fases Operativas | `FASES_OPERATIVAS_V2.md` | 🟡 Aprobación de principio; ratificación pendiente |
| Eventos e historial | `EVENTOS_V2.md` | 🟡 Aprobación de principio; ratificación pendiente |
| Alias heredados | `CONTRATO_CANONICO_V2.md` | 🟡 Aprobación de principio; ratificación pendiente |
| Índices derivados | `CONTRATO_CANONICO_V2.md` | 🟡 Aprobación de principio; ratificación pendiente |
| Productores identificados | `C5_1_INVENTARIO_ECOSISTEMA.md` | 🟡 Inventariado; ratificación pendiente |
| Consumidores identificados | `C5_1_INVENTARIO_ECOSISTEMA.md` | 🟡 Inventariado; ratificación pendiente |
| Plan de migración | `PLAN_MIGRACION_V2.md` | 🟡 Borrador; aprobación pendiente |
| Estrategia de rollback | `PLAN_MIGRACION_V2.md` | 🟡 Borrador; aprobación pendiente |

## Decisiones sensibles que requieren confirmación

La revisión arquitectónica registró aprobación de principio para estas nueve decisiones:

1. Un único Contrato Canónico.
2. `pedidos/{id}` como única fuente de verdad.
3. Índices reconstruibles.
4. Un único `logistica.repartidor_uid`.
5. Alias temporales solo durante la migración.
6. Coordenadas obligatorias desde la creación.
7. Estados comerciales separados de fases.
8. Historial de eventos inmutable.
9. Importes enteros en centavos.

Antes de ratificar se incorporaron `contract_version`, `producer` e historial explícito de transiciones. También quedan visibles decisiones de detalle que todavía requieren confirmación:

- convención canónica `snake_case`;
- moneda inicial `MXN`;
- seis estados y seis fases exactos;
- cancelación de `EN_CURSO` mediante política reforzada;
- catálogo inicial de eventos;
- periodo objetivo de convivencia y criterio temporal para retirar alias.

## Puerta de entrada a C5.2

C5.2 podrá diseñarse solamente cuando:

- las diez filas estén en verde;
- las decisiones sensibles tengan respuesta explícita;
- cualquier observación haya sido incorporada en los documentos C5.1 correspondientes;
- exista un commit documental de aprobación;
- continúe vigente la prohibición de modificar datos históricos sin plan de respaldo y migración.

La primera actividad de C5.2 será diseñar pruebas del contrato y del validador. La implementación vendrá después de esas pruebas y no antes.
