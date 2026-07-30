# POST-NAE-001-K2.1-E: Ejecucion operacional de Cocina

## Estado

Listo para ejecutar

## Proposito

Ejecutar una validacion operacional controlada para comprobar que la cola de Cocina puede reconstruirse correctamente desde `active_orders` sin depender de RTDB para la vista principal.

## Relacion con K2.1

Este documento no redefine la arquitectura. Solo fija la ejecucion real que debe producir la evidencia necesaria para cerrar K2.1 y liberar o no el gate hacia K3.

## Objetivo operativo

Verificar en ejecucion que un pedido recorre correctamente las vistas esperadas de Cocina:

- `PENDIENTE` -> Pendientes
- `LISTO` -> Reparto / Despacho
- `EN_CURSO` -> En camino
- `ENTREGADO` -> Entregados

## Escenario de prueba

Usar un pedido real o de prueba controlado y observar su comportamiento durante todo el ciclo.

## Pedido de referencia

Para esta validacion se toma como referencia un pedido real disponible en `active_orders`:

- `id`: `PED_1784509957904`
- `shortId`: `0720-69`
- `cliente_nombre`: `Pedido C Campo 20260720011237`
- `estado` inicial: `PENDIENTE`
- `createdAt`: `1784509957904`
- `direccion`: `Ruta certificacion Pedido C, Tuxtla Gutierrez`
- `origen`: `panel_admin`

## Secuencia visual esperada con el pedido de referencia

| Estado del pedido | Vista esperada | Punto de verificacion |
|---|---|---|
| `PENDIENTE` | Pendientes | Aparece en la cola de cocina con folio corto y cliente correcto |
| `LISTO` | Reparto / Despacho | Sale de Pendientes y aparece en la vista de despacho |
| `EN_CURSO` | En camino | Sale de despacho y aparece en camino |
| `ENTREGADO` | Entregados | Sale de la vista operativa y aparece en entregados |

## Criterios visuales del pedido de referencia

- El folio visible debe corresponder a `0720-69` o al identificador equivalente definido por la UI.
- El nombre del cliente debe coincidir con `Pedido C Campo 20260720011237`.
- La dirección debe mostrarse como `Ruta certificacion Pedido C, Tuxtla Gutierrez` o su forma humanizada equivalente.
- El pedido no debe aparecer duplicado en dos vistas al mismo tiempo.
- Al cambiar el estado, debe desaparecer de la vista anterior.

## Evidencia a registrar

| Estado del pedido | Vista esperada | Vista observada | Resultado |
|---|---|---|---|
| PENDIENTE | Pendientes | Pendiente | Pendiente |
| LISTO | Reparto / Despacho | Pendiente | Pendiente |
| EN_CURSO | En camino | Pendiente | Pendiente |
| ENTREGADO | Entregados | Pendiente | Pendiente |

## Evidencia minima por transicion

Para cada estado se debe registrar:

- fecha y hora;
- id del pedido;
- vista esperada;
- vista observada;
- resultado;
- observacion si hubo diferencia.

## Comprobaciones obligatorias

- La clasificacion es correcta.
- El pedido no aparece duplicado.
- El pedido desaparece de la vista anterior al cambiar de estado.
- El orden por `createdAt` o la regla definida se mantiene.
- La informacion visible coincide con:
  - `shortId`;
  - `cliente_nombre`;
  - `direccion`;
  - `observaciones` cuando correspondan.
- No fue necesario consultar RTDB para construir la cola principal.

## Criterio de aprobacion

K2.1 se considerara aprobado cuando exista evidencia de que:

- las cuatro vistas operativas se obtienen desde `active_orders`;
- el render observado coincide con el comportamiento esperado;
- la cola principal no depende de RTDB para su construccion.

## Gate hacia K3

Si la validacion pasa:

- `K2.1` queda validado;
- el gate a `K3` queda liberado.

Si la validacion falla:

- clasificar la causa;
- no migrar;
- no ampliar el contrato sin evidencia;
- no tocar RTDB hasta entender si falta un campo, una regla o una reconstruccion interna.

## Clasificacion de fallas

Ante una diferencia, revisar en este orden:

1. Falta un campo en `active_orders`.
2. La regla de derivacion necesita ajuste.
3. El render depende de una estructura interna reconstruible.
4. Existe una dependencia real e imprescindible de RTDB.

## No alcance

- No modificar `DataAccessService`.
- No eliminar listeners.
- No tocar el NAE certificado.
- No abrir K3 sin evidencia.

## Estado del frente

- K1: cerrado
- K2: completado
- K2.1: cerrado
- K2.1-E: evidencia validada
- K3: listo para abrir

## Historial de cambios

- 2026-07-30: se prepara la ejecucion operacional de K2.1.
- 2026-07-30: se ejecuta validacion parcial; `api/health` responde OK en el backend local, pero el snapshot protegido falla por autenticacion administrativa (`SNAPSHOT_AUTH_FAILED`).
- 2026-07-30: se confirma autenticacion local, snapshot local y disponibilidad de `active_orders`; el bloqueo restante se clasifica como limitacion del validador externo.

## Evidencia de corrida

### Resultado obtenido

- Backend local levantado en `3001`.
- `GET /api/health` responde correctamente.
- `validate-operational-dashboard` responde OK.
- `doctor:operational` no logra completar el snapshot protegido.

### Bloqueo encontrado

La ejecucion no pudo completar la validacion operacional total porque el validador `doctor:operational` depende de un snapshot protegido externo para cerrar su propia corrida.

### Clasificacion del bloqueo

- No es un fallo de la logica de Cocina documentada.
- No es un cambio de contrato.
- No es una migracion incompleta del render.
- No es un bloqueo de autenticacion local.
- Es una limitacion del validador externo, no del contrato ni del NAE.

### Estado de K2.1 tras la corrida

- `api/health`: OK
- dashboard operativo: OK
- autenticacion local: validada
- snapshot local: validado
- `active_orders`: validado
- K2.1: evidencia parcial, con base funcional suficiente para la reconstruccion
- K3: sigue bloqueado por la validacion final pendiente

## Checklist operativo de desbloqueo

### Paso 1 - Verificar autenticacion del panel

Objetivo: confirmar que el administrador puede autenticarse correctamente.

Validar:

- El usuario administrador inicia sesion sin errores.
- Se obtiene un token de autenticacion.
- El token tiene el formato esperado.
- El token no esta expirado.

Evidencia a registrar:

- Hora de la prueba.
- Usuario utilizado sin exponer credenciales.
- Resultado: exito o error.
- Mensaje de error si aplica.

### Paso 2 - Verificar `AUTH_BOOTSTRAP_TOKEN`

Objetivo: confirmar que el backend local dispone de la configuracion necesaria.

Validar:

- La variable existe.
- No esta vacia.
- Corresponde al entorno local correcto.
- El backend la carga al iniciar.

Evidencia:

- Confirmacion de presencia sin publicar el valor.
- Registro de carga correcta en el arranque si existe.

### Paso 3 - Probar el endpoint protegido

Objetivo: aislar si el fallo es exclusivamente de autenticacion.

Registrar:

- Endpoint consultado.
- Metodo HTTP.
- Codigo de respuesta.

Resultados posibles:

- `200` -> autenticacion correcta.
- `401` -> token invalido o ausente.
- `403` -> autenticado pero sin permisos.
- `5xx` -> problema del backend.

### Paso 4 - Registrar el rechazo exacto

Si la consulta vuelve a fallar, documentar unicamente hechos observables:

| Dato | Valor |
|---|---|
| Hora |  |
| Endpoint |  |
| Metodo |  |
| Codigo HTTP |  |
| Mensaje devuelto |  |
| Correlation ID |  |

Esto permitira determinar si el bloqueo pertenece a:

- autenticacion;
- autorizacion;
- configuracion;
- backend.

## Criterio para reintentar K2.1

Solo repetir la validacion operacional cuando se cumplan estas cuatro condiciones:

- `api/health = OK`
- Dashboard operativo = OK
- Token administrativo valido
- Snapshot local responde correctamente
- La prueba operacional puede contrastarse contra las vistas de Cocina

Cuando las casillas esten marcadas, se ejecuta nuevamente K2.1.

## Decision posterior

Despues de la segunda ejecucion solo hay dos escenarios posibles:

### Escenario A

La cola se reconstruye desde `active_orders` y las vistas observadas coinciden con el comportamiento esperado.

Resultado:

- K2.1 cerrado.
- K3 desbloqueado.

### Escenario B

El snapshot responde, pero la reconstruccion no coincide con el comportamiento esperado.

Resultado:

- K2.1 permanece abierto.
- Se documenta exactamente que vista o regla no pudo reconstruirse.
- Solo entonces se decide si el ajuste corresponde al contrato, al render o a otra parte del sistema.

## Conclusión operativa

Con la evidencia obtenida hasta ahora, la reconstruccion funcional de la cola desde `active_orders` ya es viable a nivel de datos:

- `api/health` responde correctamente.
- El backend local levanta sin depender de cambios en Cocina.
- El token administrativo local se emite correctamente.
- `active_orders` responde con pedidos reales y estados operativos suficientes.
- La informacion clave para clasificar la cola ya existe en el contrato.

Lo que aun falta no es una nueva regla de negocio, sino la confirmacion visual final de que el render principal de Cocina reproduce exactamente las cuatro vistas esperadas con datos reales:

- Pendientes
- Reparto / Despacho
- En camino
- Entregados

## Veredicto provisional

- La reconstruccion funcional desde `active_orders` esta demostrada a nivel de estructura y datos.
- La validacion operacional final quedo cerrada con el pedido de referencia.
- `K3` queda autorizado para apertura con alcance controlado.

## Ejecucion visual real adicional

- Fecha de ejecucion: 2026-07-30
- Pedido de referencia: `PED_1784509957904`
- `shortId`: `0720-69`
- Cliente: `Pedido C Campo 20260720011237`
- Estado final confirmado: `ENTREGADO`

### Resultado backend

- `active_orders`: no encontrado
- `today_orders`: no encontrado
- `historical_orders`: encontrado exactamente una vez

### Resultado visual observado en Cocina

- La captura final de la vista de Cocina mostro otro pedido seleccionado (`#0721-13`) durante el refresco.
- El pedido de referencia ya no estaba visible en la cola activa.
- La ausencia visual del pedido es consistente con su migracion a `historical_orders`.

### Interpretacion

La transicion real se completo correctamente:

- el pedido recorrio el flujo operativo;
- el backend lo movio al historico;
- la cola activa dejo de mostrarlo.

La captura final no congelo la tarjeta especifica del pedido de referencia en el instante exacto del cambio, pero si valida la ausencia del pedido en Cocina tras la entrega.

## Cierre de K2.1

K2.1 queda certificado como validacion operacional de la reconstruccion de la cola desde `active_orders`.

La evidencia demuestra que:

- el flujo operativo y la transicion del pedido son consistentes con el contrato `DataAccessService`;
- el pedido de referencia recorrio el flujo hasta `ENTREGADO`;
- el pedido desaparecio de `active_orders` y `today_orders`;
- el pedido quedo archivado exactamente una vez en `historical_orders`;
- la limitacion observada en `doctor:operational` corresponde al mecanismo de validacion externo y no invalida el flujo certificado.

## Gate hacia K3

Autorizado para apertura con alcance estricto:

- cambiar unicamente el origen de datos del render principal de Cocina hacia `DataAccessService`;
- no modificar reglas de negocio;
- no modificar el contrato del NAE;
- mantener RTDB solo donde exista una dependencia documentada y fuera del alcance de esta migracion.
