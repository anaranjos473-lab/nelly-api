# Roadmap de Gates de Certificacion - Piloto V1

## Objetivo

Certificar modulo por modulo el ecosistema Nelly a partir del baseline funcional ya validado en `GO_LIVE_CERTIFICATION_001`.

## Baseline de referencia

- `pilot-support`
- `GO_LIVE_CERTIFICATION_001`
- `Gate E2E-001` aprobado
- `pilot-certified-v1` como referencia documental del estado actual

## Orden recomendado de ejecucion

### G2 - Panel Administrativo

- Objetivo: certificar operaciones administrativas, alta, consulta y control.
- Estado: `PASS funcional`
- Resultado: panel consistente con el contrato, comercio real unico y alta manual persistente.

### G3 - Panel de Cocina

- Objetivo: certificar preparacion, cambios de estado, tiempos y experiencia operativa.
- Estado: `PASS funcional`
- Resultado: `MARCAR LISTO` publica el pedido en `pedidos_para_reparto` y la vista pasa a `ESPERANDO REPARTIDOR`.

### G4 - Panel de Repartidores

- Objetivo: certificar asignacion, aceptacion, navegacion y cierre operativo.
- Estado: `PASS funcional`
- Resultado: el pedido `P1_1784843558599_5` paso de `LISTO` a `EN_CURSO`, se creo `pedidos_en_camino/{pedidoId}` y `repartidores/{uid}/pedido_activo`, y se limpio `pedidos_para_reparto/{pedidoId}`.

### G5 - Nelly Driver

- Objetivo: certificar la aplicacion Android en operacion real.
- Estado: `PENDIENTE`
- Resultado esperado: consumo correcto del flujo, estados y acciones del repartidor.

### G6 - Dashboard Comercial

- Objetivo: certificar CRM e Inteligencia Comercial.
- Estado: `PENDIENTE`
- Resultado esperado: proyecciones y metricas alineadas con la fuente oficial.

### G7 - Monitoreo y Operacion

- Objetivo: certificar observabilidad, metricas y alertas.
- Estado: `PENDIENTE`
- Resultado esperado: indicadores operativos confiables y reproducibles.

### G8 - Integracion del Ecosistema

- Objetivo: certificar el funcionamiento conjunto de todos los modulos.
- Estado: `PENDIENTE`
- Resultado esperado: coherencia total entre paneles, driver y backend.

## Regla de ejecucion

- Abrir un solo gate por vez.
- No mezclar alcances.
- No modificar mas de una capa por iteracion.
- No cerrar un gate sin evidencia verificable.

## Criterio de avance

Cada gate debe producir:

- objetivo;
- evidencia;
- resultado;
- decision;
- referencia de commit;
- actualizacion del baseline documental.

## Relacion con el piloto

Este roadmap no altera el baseline certificado del flujo manual. Solo organiza la siguiente etapa de certificacion por dominios.
