# OPEN INVESTIGATIONS

Registro maestro de frentes abiertos y bloqueos de ejecucion.

## Estado actual

| Frente | Estado | Bloqueador | Proxima accion |
| --- | --- | --- | --- |
| `KITCHEN_SYNC_001` | `OPEN` | Sincronizacion de memoria del panel | Ejecutar `CONTRACT_AUDIT_001` |
| `PILOT_DATASET_001` | `OPEN` | Dataset historico del piloto | Ejecutar `CONTRACT_AUDIT_001` |
| `CONTRACT_AUDIT_EXECUTION_001` | `BLOCKED` | Entorno sin acceso OAuth | Ejecutar `npm run contract:audit` en un entorno con acceso a Firebase |

## Notas

- Este registro separa incidencias del sistema y limitaciones del entorno.
- No debe confundirse la imposibilidad de ejecucion con un defecto funcional del baseline certificado.

