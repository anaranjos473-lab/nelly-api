# Protocolo de Prueba de Campo - Tuxtla

Fecha: ____
Conductor: ____
Dispositivo: ____
Build app: ____
Panel URL: ____
Responsable QA: ____

## Objetivo
Validar en campo real que el flujo Pedido -> Notificacion -> Aceptacion -> Transicion de estado funciona sin cuellos de botella para operacion diaria.

## Criterio de Aprobacion Rapida
- APROBADO: todos los criticos en Pass (P1, P2, P3, P4, P5, P6)
- CONDICIONAL: criticos en Pass, pero hay degradacion de latencia o UX en 1 punto no critico
- RECHAZADO: falla cualquier critico

## Matriz Pass/Fail
| ID | Prueba | Critico | Resultado (Pass/Fail) | Evidencia | Observacion tecnica |
|---|---|---|---|---|---|
| P1 | Panel carga correctamente en Hosting y muestra estado ONLINE | Si |  | Captura panel |  |
| P2 | Se genera pedido de prueba y aparece en cola del panel | Si |  | Captura cola |  |
| P3 | Telefono recibe notificacion push con pantalla activa | Si |  | Captura notificacion |  |
| P4 | Telefono recibe notificacion push con pantalla bloqueada | Si |  | Foto/captura lockscreen |  |
| P5 | Al aceptar pedido en app, desaparece de cola en panel | Si |  | Captura antes/despues |  |
| P6 | Pedido pasa a En Camino sin inconsistencias de estado | Si |  | Captura panel + app |  |
| P7 | Contador GANANCIAS HOY se actualiza automaticamente | No |  | Captura valor inicial/final |  |
| P8 | Logs sin errores recurrentes en Monitor Firebase | No |  | Captura monitor |  |
| P9 | Latencia percibida de actualizacion menor a 2s | No |  | Video corto o cronometro |  |

## Secuencia Ejecutiva (5 minutos)
1. Abrir panel y confirmar estado ONLINE.
2. Insertar/crear pedido de prueba desde flujo operativo.
3. Verificar aparicion en cola de cocina.
4. Confirmar push en telefono desbloqueado.
5. Repetir push con pantalla bloqueada.
6. Aceptar pedido desde app.
7. Confirmar en panel: sale de cola y pasa a En Camino.
8. Verificar cambio en GANANCIAS HOY.
9. Revisar Monitor de Firebase por errores de reglas o reconexiones.

## Registro de Latencia
- t0 pedido creado: ____
- t1 visible en panel: ____
- Delta t1-t0: ____ ms
- t2 push recibido: ____
- Delta t2-t0: ____ ms
- t3 aceptacion reflejada en panel: ____
- Delta t3-t2: ____ ms

## Hallazgos
- Bloqueadores:
  - ____
- Riesgos:
  - ____
- Recomendaciones inmediatas:
  - ____

## Dictamen Final
- Estado: APROBADO / CONDICIONAL / RECHAZADO
- Justificacion (maximo 3 lineas):
  - ____
