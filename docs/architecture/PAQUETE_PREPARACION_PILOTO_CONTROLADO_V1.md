# PAQUETE DE PREPARACION DEL PILOTO CONTROLADO V1

## Estado

Preparado para revision operativa previa al inicio del piloto controlado.

## Proposito

Consolidar en una sola pieza la preparacion previa al piloto controlado de Nelly:

- infraestructura;
- monitoreo;
- procedimientos de operacion;
- plan de contingencia;
- metricas;
- criterios de aceptacion.

Este documento no abre nuevas capacidades ni modifica el baseline certificado.

## 1. Baseline de entrada

La preparacion parte del estado ya certificado:

- `PANEL_VISUAL_001` cerrado;
- `PANEL_VALIDATOR_001` cerrado;
- `DOMAIN_CERT_001` cerrado;
- `ATOMIC_ASSIGNMENT_001` cerrado;
- `ECOSYSTEM_CERT_001` cerrado.

Condicion obligatoria:

- no cambiar codigo certificado durante la preparacion;
- no reinterpretar contratos ya validados;
- no usar datos de certificacion como datos reales de operacion.

## 2. Infraestructura

### 2.1 Componentes que deben estar operativos

- Backend Nelly.
- Firebase RTDB.
- Panel Comercial.
- Panel Operativo.
- Panel Administrativo.
- Cocina.
- NellyDriver.
- CRM.
- Finanzas.
- Analytics.

### 2.2 Verificaciones minimas

Antes de iniciar la primera jornada del piloto, confirmar:

- el backend responde en el puerto oficial;
- la autenticacion funciona en panel y driver;
- RTDB lee y escribe pedidos sin errores;
- el dashboard operativo muestra snapshot consistente;
- Cocina muestra `LISTO` cuando corresponde;
- Driver puede aceptar, transicionar y completar pedidos;
- Finanzas refleja el cierre de pedidos entregados;
- no hay errores bloqueantes en consola del navegador ni del backend.

### 2.3 Dependencias criticas

- SSOT operativo: `Backend -> Firebase RTDB -> Android`.
- Contrato de cierre: `ENTREGADO`, `pedido_activo = null`, `pedidos_en_camino = null`, `pedidos_para_reparto = null`.
- Disponibilidad del puerto operativo y de credenciales de prueba.

## 3. Monitoreo

### 3.1 Monitoreo minimo durante el piloto

- salud del backend;
- latencia de creacion y cierre de pedido;
- estado de Cocina;
- estado de Driver;
- estado de Dashboard Operativo;
- errores HTTP;
- errores de consola;
- incidencias Q1;
- estados de `pedido_activo` y `pedidos_en_camino`.

### 3.2 Fuentes de observacion

- `npm run doctor:operational`;
- `npm run validate:operational-port`;
- snapshot del backend;
- logs de consola;
- paneles operativos;
- RTDB;
- evidencia de jornada.

### 3.3 Reglas de alarma

Abrir incidencia si aparece cualquiera de estos:

- `500` en flujo de pedido;
- `403` o `409` fuera del caso esperado;
- pedido atorado;
- divergencia entre panel y RTDB;
- driver desconectado aceptando pedidos;
- pedido entregado sin limpieza de nodos auxiliares;
- dashboard inconsistente;
- error repetible en consola.

## 4. Procedimientos de operacion

### 4.1 Inicio de jornada

1. Ejecutar `npm run doctor:operational`.
2. Confirmar dictamen `OPERABLE`.
3. Verificar participantes del dia.
4. Confirmar que la base de datos de operacion es la correcta.
5. Abrir paneles necesarios.
6. Registrar hora de inicio y responsables.

### 4.2 Durante la jornada

1. Crear pedidos solo con el flujo oficial.
2. Confirmar despacho desde Cocina.
3. Validar aceptacion desde NellyDriver.
4. Completar entregas con la cadena certificada.
5. Vigilar que los paneles reflejen el mismo estado.
6. Registrar cualquier incidencia de inmediato.

### 4.3 Cierre de jornada

1. Ejecutar `npm run doctor:operational`.
2. Ejecutar `npm run validate:operational-port`.
3. Confirmar que los nodos operativos quedaron limpios.
4. Registrar resumen de la jornada.
5. Guardar evidencias y observaciones.
6. Emitir dictamen diario.

## 5. Plan de contingencia

### 5.1 Si falla un comercio

- detener nuevas altas de ese comercio;
- contener el pedido activo;
- informar solo el estado real;
- registrar causa y hora;
- reanudar solo con evidencia de correccion.

### 5.2 Si falla un repartidor

- verificar si el pedido sigue viable;
- reasignar solo si el estado lo permite;
- no aceptar pedidos con repartidor no elegible;
- registrar el evento y la salida del flujo.

### 5.3 Si falla el backend

- pausar nuevas operaciones;
- conservar evidencia;
- ejecutar diagnostico;
- no modificar contratos sin causa reproducible.

### 5.4 Si falla el monitoreo

- registrar la ausencia de datos;
- no asumir que el flujo esta bien;
- contener la operacion hasta recuperar visibilidad.

## 6. Metricas

### 6.1 Metricas basicas de la jornada

- pedidos creados;
- pedidos aceptados;
- pedidos entregados;
- tiempo medio de asignacion;
- tiempo medio de entrega;
- pedidos cancelados;
- incidencias por estado;
- rechazos por deuda;
- rechazos por estado invalido;
- rechazos por repartidor desconectado.

### 6.2 Metricas de consistencia

- coincidencia entre panel y RTDB;
- limpieza de nodos auxiliares al cierre;
- ausencia de duplicados;
- ausencia de pedidos fantasmas;
- trazabilidad de `traceId` y `pedidoId`.

### 6.3 Metricas de observabilidad

- errores HTTP por jornada;
- errores de consola;
- warnings del sistema;
- tiempo de recuperacion tras incidencia;
- numero de reintentos necesarios.

## 7. Criterios de aceptacion

El piloto controlado puede iniciar solo si:

- el baseline certificado permanece intacto;
- los paneles pre piloto siguen en estado apto;
- `npm run doctor:operational` devuelve `OPERABLE`;
- no hay errores bloqueantes en backend, panel o driver;
- la evidencia operativa minima esta disponible;
- el plan de contingencia esta vigente;
- los responsables estan asignados;
- los criterios de salida estan claros.

## 8. Criterios de no inicio

No iniciar el piloto si:

- falta un panel critico;
- hay regresiones abiertas;
- el backend no responde;
- el estado de los pedidos no es consistente;
- la evidencia no esta completa;
- la autenticacion de prueba falla;
- existe una incidencia sin contener.

## 9. Paquete documental minimo

Antes de la primera jornada deben estar disponibles:

- `RUNBOOK_OPERATIVO_PILOTO_V1.md`
- `VALIDACION_PANELES_PRE_PILOTO_V1.md`
- `RC2_PILOTO_CONTROLADO_V1.md`
- `PLAN_EVIDENCIA_PILOTO_MAQUINA_ESTADOS_V1.md`
- `ACTA_BASE_ECOSYSTEM_CERT_001.md`
- `ACTA_ECOSYSTEM_CERT_001_FINAL.md`

## 10. Resultado esperado

Si la preparacion cumple los criterios anteriores, el piloto controlado puede iniciarse sin reabrir certificaciones ni tocar el baseline.

## 11. Historial

- 2026-08-01: se consolida el paquete de preparacion del piloto controlado a partir del baseline certificado y los runbooks existentes.
