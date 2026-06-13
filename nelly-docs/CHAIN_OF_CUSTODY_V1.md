# CHAIN_OF_CUSTODY_V1

## Proposito

Definir la cadena de custodia operativa para mandaditos y entregas donde exista transferencia fisica de producto, documento, paquete, efectivo o evidencia.

Este documento responde:

- Quien entrego.
- Quien recibio.
- En que estado se recibio.
- En que momento cambio la responsabilidad.
- Que evidencia demuestra cada transferencia.

## Alcance

Aplica al flujo:

`Remitente -> Repartidor -> Cliente Final`

Tambien aplica a compras realizadas por el repartidor cuando el comercio actua como remitente operativo.

## Principio rector

Sin evidencia de transferencia, no debe asignarse responsabilidad economica automatica.

Todo incidente debera poder reconstruirse con:

- Foto
- Hora
- Ubicacion
- Actor responsable
- Estado del producto
- Registro de aceptacion o rechazo

## Politica de Pedido Unico

### SINGLE ORDER FIRST POLICY (SOFP)

Nelly OS V1 no esta disenado para operacion multipedido.

La unidad basica de operacion es:

`1 repartidor = 1 pedido = 1 cadena de custodia`

### Regla general

Un repartidor solo podra transportar una orden activa a la vez.

### Objetivos

- Reducir errores.
- Reducir perdidas.
- Reducir fraude.
- Reducir cancelaciones.
- Reducir reclamos.
- Mantener trazabilidad.
- Proteger la cadena de custodia.

### Excepcion controlada

Se podra agregar una segunda orden unicamente cuando se cumplan simultaneamente todas las condiciones:

| Condicion | Requisito |
| --- | --- |
| Corredor de ruta | Mismo corredor operativo |
| Desviacion maxima | 500 metros |
| Incremento maximo | 5 minutos |
| Productos delicados | No permitidos |
| Efectivo | No superior a $400 |
| Medicamentos | No permitidos |
| Cliente nuevo de riesgo | No permitido |

### Prohibiciones absolutas

Nunca se deberan combinar pedidos que incluyan:

- Pasteles.
- Medicamentos.
- Productos fragiles.
- Efectivo mayor a $400.
- Validacion reforzada.
- Carga pesada.
- Residenciales complejos.

### Excepcion futura

Solo despues de certificar Cadena 3, FIN-006, Smart Dispatch, Ledger y Auditoria podra habilitarse Multi Order Dispatch V2.

Hasta entonces, la precision operativa tendra prioridad sobre el volumen de pedidos.

## Etapas de custodia

| Etapa | Actor que entrega | Actor que recibe | Evidencia obligatoria | Resultado |
| --- | --- | --- | --- | --- |
| Recepcion | Remitente o comercio | Repartidor | Foto producto, estado producto, cantidad, empaque, hora, ubicacion | Repartidor acepta o rechaza custodia |
| Salida | Repartidor | Nelly OS | Evidencia recepcion, evidencia salida, geolocalizacion | Custodia activa en traslado |
| Transporte | Repartidor | - | Ruta, timestamps, incidencias, fotos si hay dano o riesgo | Custodia en movimiento |
| Entrega | Repartidor | Cliente final | Foto, nombre receptor, hora, ubicacion, codigo si aplica | Cliente acepta o rechaza entrega |
| Rechazo | Repartidor o cliente | Nelly OS | Motivo, foto, responsable probable, hora, ubicacion | Caso pasa a Operacion o Auditoria |

## Recepcion

El repartidor no debe aceptar custodia si el producto presenta:

- Empaque abierto o roto.
- Producto incompleto.
- Producto distinto a la solicitud.
- Producto derramado, mojado o danado.
- Producto prohibido o restringido.
- Riesgo evidente de transporte.

Validaciones minimas:

- Foto del producto.
- Foto del empaque.
- Cantidad recibida.
- Estado visible.
- Hora de recepcion.
- Ubicacion de recepcion.
- Nombre o referencia del remitente si existe.

## Transporte

Durante el transporte deben registrarse incidencias cuando ocurra:

- Lluvia fuerte.
- Espera prolongada.
- Cambio de ruta.
- GPS incorrecto.
- Dano visible.
- Producto delicado.
- Carga pesada.
- Riesgo de seguridad.

Validaciones minimas:

- Evidencia de salida.
- Geolocalizacion.
- Timestamp de eventos relevantes.
- Foto si aparece dano, deterioro o riesgo.

## Entrega

La entrega debe registrar:

- Foto de entrega.
- Nombre del receptor.
- Hora de entrega.
- Ubicacion de entrega.
- Codigo de entrega cuando aplique.
- Firma digital futura cuando aplique.

Si el cliente rechaza el producto, debe registrarse:

- Motivo del rechazo.
- Foto del estado al momento de entrega.
- Responsable probable.
- Hora.
- Ubicacion.

## Rechazo de custodia

El repartidor debe rechazar custodia antes de salir cuando:

- El producto ya esta danado.
- El empaque no protege el producto.
- La cantidad no coincide.
- El producto no coincide con la solicitud.
- El comercio o remitente no permite evidencia minima.
- El articulo requiere condiciones imposibles de transporte.

El rechazo debe registrarse con:

- Motivo.
- Foto.
- Actor que entrega.
- Actor que rechaza.
- Hora.
- Ubicacion.

## Relacion con responsabilidad economica

ECONOMIC_LIABILITY_MATRIX_V1.md define quien absorbe el impacto economico.

CHAIN_OF_CUSTODY_V1.md define como se demuestra el cambio de responsabilidad.

Si no existe evidencia suficiente de custodia, el caso debe escalarse a Auditoria antes de asignar cargo definitivo.

## Estado

Estado: Pendiente de validacion operativa.

FIN-006: No iniciar automatizacion de custodia hasta completar SIMULATION_002_MANDADITOS.
