# C5.1 - Matriz de aprobación arquitectónica

Fecha: 2026-07-13

Estado general: **C5.1, C5.2-A Y C5.2-B APROBADAS; B.1 AUTORIZADA Y PENDIENTE; C5.2-C BLOQUEADA**

Se autoriza únicamente C5.2-A como auditoría estática sin código. C5.2-B, el validador y cualquier migración permanecen bloqueados hasta nueva decisión explícita.

| Tema | Documento | Estado |
|---|---|---|
| Contrato Canónico V2 | `CONTRATO_CANONICO_V2.md` | 🟢 Validado documentalmente |
| Máquina de Estados | `MAQUINA_ESTADOS_V2.md` | 🟢 Validada documentalmente |
| Fases Operativas | `FASES_OPERATIVAS_V2.md` | 🟢 Validadas documentalmente |
| Eventos e historial | `EVENTOS_V2.md` | 🟢 Validados documentalmente |
| Alias heredados | `CONTRATO_CANONICO_V2.md` | 🟢 Política validada |
| Índices derivados | `CONTRATO_CANONICO_V2.md` | 🟢 Principio validado |
| Productores identificados | `C5_1_INVENTARIO_ECOSISTEMA.md` | 🟢 Inventario validado |
| Consumidores identificados | `C5_2_A_COMPATIBILIDAD_V2.md` | 🟡 Identificados; 0/9 compatibles integralmente |
| Plan de migración | `PLAN_MIGRACION_V2.md` | 🟢 Validado documentalmente |
| Estrategia de rollback | `PLAN_MIGRACION_V2.md` | 🟢 Validada documentalmente |

## Decisiones ratificadas y control de cambios

La revisión arquitectónica ratificó documentalmente estas nueve decisiones:

1. Un único Contrato Canónico.
2. `pedidos/{id}` como única fuente de verdad.
3. Índices reconstruibles.
4. Un único `logistica.repartidor_uid`.
5. Alias temporales solo durante la migración.
6. Coordenadas obligatorias desde la creación.
7. Estados comerciales separados de fases.
8. Historial de eventos inmutable.
9. Importes enteros en centavos.

Se incorporaron `contract_version`, `producer` e historial explícito de transiciones. Las siguientes decisiones quedan congeladas como parte de la arquitectura documental y solo cambiarán mediante revisión explícita:

- convención canónica `snake_case`;
- moneda inicial `MXN`;
- seis estados y seis fases exactos;
- cancelación de `EN_CURSO` mediante política reforzada;
- catálogo inicial de eventos.

El periodo de convivencia y el umbral temporal de cero uso para retirar aliases siguen siendo parámetros operativos pendientes. No bloquean la auditoría ni el validador en sombra, pero deben aprobarse antes de C5.2-E.

## Puerta de entrada a C5.2

C5.2-A puede ejecutarse como auditoría. C5.2-B o cualquier implementación podrá diseñarse solamente cuando:

- exista autorización explícita posterior a la auditoría C5.2-A;
- los consumidores críticos tengan un plan de adaptación y pruebas aceptado;
- las decisiones sensibles tengan respuesta explícita;
- cualquier observación haya sido incorporada en los documentos C5.1 correspondientes;
- exista un commit documental de aprobación;
- continúe vigente la prohibición de modificar datos históricos sin plan de respaldo y migración.

C5.2-B ya implementó pruebas y validador en sombra bajo flag apagado. Su activación productiva requiere una ventana controlada. Ningún productor V2 se habilitará hasta que los consumidores críticos pasen sus pruebas V1/V2.

## Estado C5.2-B

| Control | Estado |
|---|---|
| No rechaza ni transforma pedidos | 🟢 Probado por diseño puro |
| No escribe RTDB | 🟢 Prueba con dobles de Firebase |
| Apagado por defecto | 🟢 `ENABLE_C5_SHADOW_VALIDATOR` debe ser `true` explícito |
| Métricas agregadas y desviaciones | 🟢 Implementadas en memoria/log estructurado |
| Desactivación y limpieza de listeners | 🟢 Implementadas |
| Observación controlada B.1 | 🟡 Autorizada; no activada |

La cohorte, duración, abortos, desactivación e informe se rigen por `C5_2_B_1_VENTANA_OBSERVACION.md`.
