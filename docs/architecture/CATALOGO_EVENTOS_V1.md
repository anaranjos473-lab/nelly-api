# CATALOGO_EVENTOS_V1
## Catalogo Oficial de Eventos Operativos - Nelly OS

**Version:** 1.0  
**Estado:** Vigente  
**Ambito:** Plataforma Nelly OS  
**Goal asociado:** `GOAL-S3-001`

### 1. Proposito

Definir el catalogo oficial de eventos operativos para la plataforma Nelly, con un lenguaje comun y estable que permita trazabilidad, observabilidad, automatizacion y desacoplamiento sin depender de una implementacion especifica.

### 2. Alcance

Este catalogo cubre el flujo inicial de pedidos y los eventos que ya aparecen como contrato conceptual o como estado canonico en la arquitectura vigente.

No pretende sustituir el codigo ni definir un broker concreto.

### 3. Criterios del catalogo

- Un evento representa un hecho que ya ocurrio.
- El nombre del evento debe ser estable y legible.
- Cada evento debe tener un proposito operativo claro.
- Cada evento debe poder vincularse con un agregado, un actor y una linea temporal.
- El catalogo debe poder evolucionar sin romper el significado de los eventos ya publicados.

### 4. Contrato comun del evento

Cada evento del catalogo debe poder describirse con estos elementos:

- nombre;
- descripcion;
- cuando se genera;
- quien lo produce;
- quien lo consume;
- datos minimos;
- impacto esperado;
- referencias.

### 5. Eventos base del flujo de pedidos

#### 5.1 `pedido.creado`

**Descripcion:** el pedido fue registrado en el sistema.

**Cuando se genera:** al crear un pedido nuevo en el backend o en el flujo operativo canonico.

**Productor:** servicio de creacion de pedido / backend.

**Consumidores tipicos:** fulfillment, sincronizacion, auditoria, observabilidad, paneles.

**Datos minimos:** `aggregate_id`, `correlation_id`, origen del pedido, monto base, contexto del cliente.

**Impacto esperado:** inicia la linea temporal del pedido y habilita el resto del flujo.

---

#### 5.2 `pedido.pagado`

**Descripcion:** el pedido quedo cubierto por un pago valido.

**Cuando se genera:** cuando el sistema confirma el pago o el cobro del pedido.

**Productor:** flujo de cobro / modulo financiero.

**Consumidores tipicos:** ledger, billing, fulfillment, auditoria.

**Datos minimos:** `aggregate_id`, monto, metodo de pago, referencia de pago.

**Impacto esperado:** habilita validacion y ejecucion posterior del pedido.

---

#### 5.3 `pedido.validado`

**Descripcion:** el pedido paso la validacion de negocio y puede continuar su ciclo.

**Cuando se genera:** despues de verificar reglas, disponibilidad o condiciones minimas.

**Productor:** motor de validacion / backend.

**Consumidores tipicos:** fulfillment, auditoria, observabilidad.

**Datos minimos:** `aggregate_id`, resultado de validacion, reglas evaluadas.

**Impacto esperado:** marca que el pedido puede avanzar sin violar contratos.

---

#### 5.4 `pedido.en_proceso`

**Descripcion:** el pedido entro en preparacion o procesamiento operativo.

**Cuando se genera:** cuando cocina, tienda o backend inician el flujo operativo.

**Productor:** fulfillment engine / flujo operativo.

**Consumidores tipicos:** panel de cocina, admin, auditoria, observabilidad.

**Datos minimos:** `aggregate_id`, origen operativo, fase previa y nueva.

**Impacto esperado:** refleja que el pedido ya esta siendo atendido.

---

#### 5.5 `pedido.listo`

**Descripcion:** el pedido termino preparacion y puede pasar al siguiente paso operativo.

**Cuando se genera:** al completar la preparacion o validacion de salida.

**Productor:** cocina / fulfillment engine.

**Consumidores tipicos:** driver, radar, admin, sincronizacion.

**Datos minimos:** `aggregate_id`, ubicacion operativa, fase previa y nueva.

**Impacto esperado:** habilita asignacion o salida a reparto.

---

#### 5.6 `pedido.asignado`

**Descripcion:** el pedido fue asignado a un repartidor.

**Cuando se genera:** al aceptar el pedido por un conductor elegible o al asignarlo de forma controlada.

**Productor:** modulo de asignacion / fulfillment engine.

**Consumidores tipicos:** driver, admin, sincronizacion, auditoria.

**Datos minimos:** `aggregate_id`, `repartidor_uid`, contexto de asignacion.

**Impacto esperado:** vincula el pedido con un ejecutor operativo.

---

#### 5.7 `pedido.en_transito`

**Descripcion:** el pedido salio a reparto y se encuentra en camino.

**Cuando se genera:** al iniciar el traslado hacia el destino.

**Productor:** driver / fulfillment engine.

**Consumidores tipicos:** tracking, admin, cocina, auditoria.

**Datos minimos:** `aggregate_id`, coordenadas o referencia de ruta, fase previa y nueva.

**Impacto esperado:** activa seguimiento en tiempo real.

---

#### 5.8 `pedido.entregado`

**Descripcion:** el pedido fue entregado y cerro su ciclo operativo principal.

**Cuando se genera:** al confirmar la entrega exitosa.

**Productor:** driver / backend de cierre / fulfillment engine.

**Consumidores tipicos:** ledger, billing, admin, cocina, auditoria, observabilidad.

**Datos minimos:** `aggregate_id`, evidencia de cierre, montos derivados, referencia del repartidor.

**Impacto esperado:** dispara cierre operativo, liquidacion y conciliacion asociada.

---

#### 5.9 `pedido.cancelado`

**Descripcion:** el pedido fue cancelado antes o durante su ejecucion.

**Cuando se genera:** ante una cancelacion valida segun reglas de negocio.

**Productor:** backend / modulo operativo autorizado.

**Consumidores tipicos:** ledger, admin, cocina, driver, auditoria.

**Datos minimos:** `aggregate_id`, motivo de cancelacion, fase actual, actor responsable.

**Impacto esperado:** cierra el flujo con trazabilidad de la causa.

### 6. Eventos de soporte asociados al dominio

#### 6.1 `ledger.movimiento.registrado`

**Descripcion:** se registro un movimiento financiero ligado a un evento o operacion del negocio.

**Cuando se genera:** al escribir un asiento valido en el ledger.

**Productor:** modulo financiero / ledger.

**Consumidores tipicos:** billing, conciliacion, auditoria, observabilidad.

**Datos minimos:** identificador del movimiento, referencia de origen, monto, tipo de movimiento.

**Impacto esperado:** deja trazabilidad financiera inmutable.

---

#### 6.2 `inventario.reserva.creada`

**Descripcion:** se creo una reserva de inventario para sostener el cumplimiento del pedido.

**Cuando se genera:** al apartar stock para una orden o una capacidad operativa.

**Productor:** inventario / fulfillment.

**Consumidores tipicos:** inventario, auditoria, observabilidad.

**Datos minimos:** `aggregate_id`, item reservado, cantidad, ubicacion o nodo.

**Impacto esperado:** habilita control de disponibilidad.

---

#### 6.3 `inventario.reserva.liberada`

**Descripcion:** una reserva de inventario fue liberada.

**Cuando se genera:** al cancelar, completar o invalidar la reserva.

**Productor:** inventario / fulfillment.

**Consumidores tipicos:** inventario, auditoria, observabilidad.

**Datos minimos:** `aggregate_id`, item liberado, cantidad, motivo.

**Impacto esperado:** devuelve disponibilidad al sistema.

---

#### 6.4 `fulfillment.nodo.asignado`

**Descripcion:** un nodo de cumplimiento fue asociado a la ejecucion del pedido.

**Cuando se genera:** al decidir el nodo operativo que atendera la capacidad.

**Productor:** fulfillment engine.

**Consumidores tipicos:** admin, tracking, auditoria, observabilidad.

**Datos minimos:** `aggregate_id`, `nodo_id`, tipo de nodo, fase de asignacion.

**Impacto esperado:** conecta el pedido con el nodo responsable.

---

#### 6.5 `integracion.error`

**Descripcion:** una integracion de soporte detecto una falla operativa.

**Cuando se genera:** al fallar una sincronizacion, consulta o adaptador.

**Productor:** adaptador o servicio de integracion.

**Consumidores tipicos:** observabilidad, auditoria, soporte, alertas.

**Datos minimos:** sistema origen, sistema destino, mensaje de error, severidad.

**Impacto esperado:** habilita diagnostico y seguimiento de incidentes.

### 7. Orden canonico sugerido del flujo

`pedido.creado -> pedido.pagado -> pedido.validado -> pedido.en_proceso -> pedido.listo -> pedido.asignado -> pedido.en_transito -> pedido.entregado`

Los caminos alternos como `pedido.cancelado` deben quedar gobernados por las reglas de negocio y la maquina de estados.

### 8. Relacion con el NES

- `GOAL-S3-001.md` define la capacidad de negocio.
- `MANIFIESTO_NES_V1.md` define la vision y principios.
- `POL_ARCH_001.md` define la seleccion tecnologica.
- `POL_DEV_001.md` define el flujo de desarrollo.
- `POL_DOC_001.md` define la gobernanza documental.
- `POL_IA_001.md` regula automatizaciones.
- `NES_MAD_V1.md` resume decisiones relevantes.
- `ARQ_HARNESS_ENGINEERING_V1.md` define la capa de ejecucion de capacidades.

### 9. Criterio de evolucion

Este catalogo se considerara util cuando:

- los eventos base esten alineados con el codigo;
- los consumidores del sistema reconozcan estos nombres;
- el catalogo permita auditoria y observabilidad;
- la incorporacion de nuevos eventos no rompa los ya definidos.

### 10. Cierre

Este documento funciona como la referencia oficial del lenguaje de eventos operativos para S3 y para futuras capacidades que se construyan sobre el NES.
