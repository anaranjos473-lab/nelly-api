# Go / No-Go Piloto Nelly v1

Fecha de corte: 2026-07-26
Estado: preliminar para inicio de piloto controlado

## Dictamen Ejecutivo

El ecosistema Nelly se encuentra listo para entrar a una fase de piloto controlado.

La evidencia disponible muestra:

- backend operativo y validado en flujos principales
- panel administrativo funcional con alta controlada de restaurantes
- dashboard operativo y comercial consistentes
- seguimiento de cliente validado por estados
- Nelly OS consolidado como punto único de entrada

Lo pendiente no es una nueva capacidad crítica, sino validación visual final y ejecución disciplinada de QA antes del uso con usuarios reales.

## Estado por Módulo

| Módulo | Estado | Observación |
|---|---|---|
| Backend | Listo | Flujo operativo validado |
| Panel Administrativo | Listo | Alta de restaurantes, filtros y acciones operativas implementadas |
| Dashboard Operativo | Listo | KPIs y snapshot consistentes |
| Dashboard Comercial | Listo | Navegación consistente y lectura ejecutiva alineada |
| Seguimiento Cliente | Listo | Tracking por estados validado |
| Driver | Listo para piloto | Flujo E2E validado |
| Nelly OS | Listo | Punto único de entrada consolidado |
| Arquitectura | Congelada | Baseline adecuada para piloto |
| Documentación | Muy completa | ADR, gates y validaciones disponibles |

## QA Pendiente

### QA-01 Navegación

Validar en navegador:

- `/`
- `/os`
- `/control`
- `/commerce`
- `/admin`
- `/crm`
- `/driver`
- `/analytics`
- `/developer`

Comprobar:

- carga correcta
- CSS correcto
- iconografía correcta
- consola limpia
- enlaces funcionales

### QA-02 Flujo Completo

Ejecutar un pedido real y verificar:

- Cliente
- Pedido
- Cocina
- Listo
- Asignado
- En camino
- Entregado

Confirmar que:

- Admin ve el cambio
- Driver ve el cambio
- Cliente ve el cambio

### QA-03 Restaurante

Validar:

- alta
- edición
- activación
- menú
- uso operativo real

### QA-04 Repartidor

Validar:

- aceptar
- rechazar
- ubicación
- finalizar

### QA-05 Cliente

Validar la línea de estado:

- Pedido recibido
- Preparando
- Repartidor asignado
- En camino
- Entregado

## Riesgos Residuales

- Validación visual no ejecutada en navegador en esta sesión por limitación de herramientas disponibles.
- Existe un documento paralelo de release candidate que sigue modificado fuera de este cierre.

## Resumen Final de Preparación

| Eje | Estado | Lectura operativa |
| --- | --- | --- |
| Arquitectura | Aprobada | Backend, contratos y máquina de estados congelados para piloto |
| Producto | Aprobado | Cliente, restaurante, repartidor y admin cubiertos |
| Integración | Aprobada | Flujo extremo a extremo cubierto en la base operativa |
| Escalabilidad | Aprobada | Se evitó ampliar alcance innecesario antes del piloto |
| Riesgo técnico | Bajo | No se observan bloqueos estructurales pendientes |
| Riesgo operativo | Medio | Depende de restaurantes, repartidores, clientes e internet |
| Soporte | Listo | Protocolo de soporte e incidencias ya definido |
| Documentación | Completa | ADR, runbook, checklist y protocolos operativos disponibles |
| Ramas | Ordenadas | `release/pilot-1.0` congelada, `develop` para trabajo nuevo |
| Backup | Pendiente de verificación final | Ya existe respaldo local y release preparada, falta cierre de evidencia si se desea certificar al 100% |

### Lectura de uso

- Si la validación manual de navegación y consola sigue limpia, el piloto puede arrancar.
- Si aparece un bloqueo funcional o un error de red crítico, el estado debe regresar a revisión.
- Si lo único que cambia son incidencias operativas reales, el protocolo ya permite contenerlas sin reabrir arquitectura.

## Recomendación

Si la navegación real pasa y no aparecen regresiones visuales o funcionales, el dictamen recomendado es:

- `GO` para piloto controlado
- `NO-GO` solo si aparece un bloqueo funcional en QA o un error de navegación crítico
