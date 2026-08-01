# Index de Investigaciones

Tabla maestra de investigaciones, frentes y decisiones RCA en Nelly OS.

## Estado

| ID | Estado | Severidad | Responsable | Ultima actualizacion |
|---|---|---|---|---|
| KITCHEN_SYNC_001 | Abierto | S2 | Pendiente | 2026-08-01 |
| PILOT_DATASET_001 | Cerrado | S2 | Nelly OS | 2026-08-01 |
| DATASET_FINALIZATION_001 | Cerrado | S2 | Nelly OS | 2026-08-01 |
| CONTRACT_AUDIT_001 | Abierto | S1 | Pendiente | 2026-08-01 |
| CONTRACT_AUDIT_EXECUTION_001 | Bloqueado | S1 | Pendiente | 2026-08-01 |
| ICV-01 | Cerrado por limite de evidencia | S2 | Nelly OS | 2026-08-01 |
| RC-03-INC-001 | Cerrado | S3 | Equipo operativo | 2026-07-20 |
| CICP-01 | Cerrado | S2 | Nelly OS | 2026-07-18 |

## Uso

- Mantener esta tabla actualizada cuando una investigacion cambie de estado.
- Vincular cada frente con su documento de evidencia y, cuando aplique, con su ADR ligero.
- Si existe duda de estado, preferir `Abierto` hasta tener cierre documental.
- Distinguir defectos del sistema de bloqueos de entorno o ejecucion.
- Para abrir un frente nuevo, usar [`FRONT_TEMPLATE.md`](./FRONT_TEMPLATE.md).
- Ver frente detallado: [`PILOT_DATASET_001.md`](./PILOT_DATASET_001.md).
- Ver frente detallado: [`DATASET_FINALIZATION_001.md`](./DATASET_FINALIZATION_001.md).
- Ver frente detallado: [`KITCHEN_SYNC_001.md`](./KITCHEN_SYNC_001.md).
- Ver frente detallado: [`CONTRACT_AUDIT_001.md`](./CONTRACT_AUDIT_001.md).

## Campos obligatorios por frente

- `INCIDENT_ID`
- `SEVERITY`
- `STATUS`
- `OWNER`
- `BASELINE`
- `RELATED_CERTIFICATIONS`
- `RELATED_COMMITS`
- `LAST_UPDATE`
- `CURRENT_HYPOTHESIS`
- `NEXT_ACTION`

## Frentes activos

### KITCHEN_SYNC_001

- Estado: `OPEN`
- Bloqueador: sincronizacion de memoria del panel
- Proxima accion: ejecutar `CONTRACT_AUDIT_001`
- Fuente: [`docs/architecture/OPEN_INVESTIGATIONS.md`](./../architecture/OPEN_INVESTIGATIONS.md)
- Documento: [`KITCHEN_SYNC_001.md`](./KITCHEN_SYNC_001.md)

### DATASET_FINALIZATION_001

- Estado: `CLOSED`
- Bloqueador: familias de certificacion aun vivas en RTDB
- Proxima accion: recertificacion final y archivo documental
- Fuente: [`docs/architecture/OPEN_INVESTIGATIONS.md`](./../architecture/OPEN_INVESTIGATIONS.md)
- Documento: [`DATASET_FINALIZATION_001.md`](./DATASET_FINALIZATION_001.md)

### PILOT_DATASET_001

- Estado: `CLOSED`
- Bloqueador: dataset historico del piloto
- Proxima accion: archivado documental
- Fuente: [`docs/architecture/OPEN_INVESTIGATIONS.md`](./../architecture/OPEN_INVESTIGATIONS.md)
- Documento: [`PILOT_DATASET_001.md`](./PILOT_DATASET_001.md)

### CONTRACT_AUDIT_001

- Estado: `OPEN`
- Bloqueador: falta trazabilidad completa y corrida en entorno con acceso a Firebase
- Proxima accion: ejecutar `CONTRACT_AUDIT_EXECUTION_001`
- Fuente: [`docs/architecture/PILOTO_CONTROLADO/CONTRACT_AUDIT_001_MATRIZ.md`](./../architecture/PILOTO_CONTROLADO/CONTRACT_AUDIT_001_MATRIZ.md)
- Documento: [`CONTRACT_AUDIT_001.md`](./CONTRACT_AUDIT_001.md)

### CONTRACT_AUDIT_EXECUTION_001

- Estado: `BLOCKED`
- Bloqueador: entorno sin acceso OAuth
- Proxima accion: ejecutar `npm run contract:audit` en un entorno con acceso a Firebase
- Fuente: [`docs/architecture/OPEN_INVESTIGATIONS.md`](./../architecture/OPEN_INVESTIGATIONS.md)
