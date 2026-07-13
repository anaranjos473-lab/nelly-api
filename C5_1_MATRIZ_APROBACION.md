# C5.1 - Matriz de aprobación arquitectónica

Fecha: 2026-07-13

Estado general: **PENDIENTE DE APROBACIÓN**

No se inicia C5.2 hasta que todas las filas estén aprobadas explícitamente. Marcar una fila exige revisar el documento asociado; crear el archivo no equivale a aprobarlo.

| Tema | Documento | Estado |
|---|---|---|
| Contrato Canónico V2 | `CONTRATO_CANONICO_V2.md` | ⬜ Pendiente |
| Máquina de Estados | `MAQUINA_ESTADOS_V2.md` | ⬜ Pendiente |
| Fases Operativas | `FASES_OPERATIVAS_V2.md` | ⬜ Pendiente |
| Eventos | `EVENTOS_V2.md` | ⬜ Pendiente |
| Alias heredados | `CONTRATO_CANONICO_V2.md` | ⬜ Pendiente |
| Índices derivados | `CONTRATO_CANONICO_V2.md` | ⬜ Pendiente |
| Productores identificados | `C5_AUDITORIA_CONTRATO_DATOS.md` | ⬜ Pendiente |
| Consumidores identificados | `C5_AUDITORIA_CONTRATO_DATOS.md` | ⬜ Pendiente |

## Decisiones sensibles que requieren confirmación

1. Convención canónica `snake_case`.
2. Importes enteros en centavos y moneda `MXN`.
3. Coordenadas obligatorias y verificables al crear.
4. Seis estados exactos y terminales irreversibles.
5. Seis fases operativas exactas.
6. Cancelación de `EN_CURSO` solo mediante política reforzada.
7. Eventos append-only con idempotencia.
8. Escritura V2 exclusiva; alias limitados al adaptador de migración.
9. `pedidos/{id}` como única fuente de verdad y proyecciones reconstruibles.

## Puerta de entrada a C5.2

C5.2 podrá diseñarse solamente cuando:

- las ocho filas estén en verde;
- las decisiones sensibles tengan respuesta explícita;
- cualquier observación haya sido incorporada en los cuatro documentos;
- exista un commit documental de aprobación;
- continúe vigente la prohibición de modificar datos históricos sin plan de respaldo y migración.

La primera actividad de C5.2 será diseñar pruebas del contrato y del validador. La implementación vendrá después de esas pruebas y no antes.
