# RC2.6 Certificacion Operacional

Objetivo: demostrar una vez, sin intervencion manual en base de datos durante la prueba, el ciclo:

Pedido -> Asignacion -> Aceptacion -> GPS -> Entrega -> Cobro -> Evidencia financiera.

## Requisitos

- Backend local arriba en `LOCAL_BASE` o `http://localhost:3001`.
- Credenciales Firebase Admin disponibles por variables o `nelly-admin.json`.
- `FIREBASE_API_KEY` o `FIREBASE_WEB_API_KEY` configurada.

## Ejecucion

```bash
npm run cert:rc26
```

En PowerShell con ejecucion de scripts restringida, usar:

```powershell
npm.cmd run cert:rc26
```

Variables utiles:

```bash
LOCAL_BASE=http://localhost:3001
RC26_DRIVER_UID=driver_cert_rc26
RC26_MONTO=129
RC26_CLEANUP=true
RC26_EVIDENCE_DIR=logs_pruebas
```

## Que certifica

- `GET /api/health` responde antes de tocar RTDB.
- Se crea un repartidor elegible con billetera, deuda y equipo validos.
- Se inyecta un pedido pendiente y se marca `LISTO`.
- `POST /api/delivery/accept-order` mueve el pedido a `EN_CAMINO`.
- `POST /api/delivery/update-location` escribe GPS en `conductores_activos` y pedido.
- `POST /api/delivery/complete-order` mueve el pedido a `ENTREGADO`.
- `POST /api/delivery/finanzas/registrar-cobro-efectivo` registra la deuda/cobro del repartidor.
- Se genera evidencia en `logs_pruebas/RC2_6_<pedidoId>.md`.

## Criterio Go / No-Go

Go si el script termina con `RC2.6 PASS` y el reporte muestra todos los pasos `[OK]`.

No-Go si falla healthcheck, autenticacion, transicion de estado, GPS, entrega o cobro. En ese caso el reporte queda escrito con el ultimo estado observado para diagnostico.
