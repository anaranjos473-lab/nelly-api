# GATE UX-RELEASE V1

## Estado
Vigente como gate previo al piloto controlado.

## Objetivo
Formalizar la ultima revision operativa antes del piloto para confirmar que la experiencia visual, la navegacion y el flujo extremo a extremo siguen alineados con la SSOT certificada.

Este gate no introduce nuevas capacidades ni modifica contratos de negocio.

## Alcance
Aplica a:

- Dashboard Comercial
- Dashboard Operativo
- Panel Administrativo
- Flujos de navegacion entre paneles
- Validacion visual y tecnica previa al piloto

## No alcance

- Cambios de arquitectura
- Nuevos dominios
- Refactors del nucleo
- Reescritura de contratos certificados
- Ajustes cosméticos sin evidencia

## Criterios de entrada

Antes de ejecutar el gate deben existir:

- backend estable;
- paneles funcionales en el entorno objetivo;
- autenticacion operativa;
- evidencia previa de RC1-B o validacion visual equivalente;
- base de UI implementada sin regresiones conocidas.

## Checklist funcional

- Login.
- Logout.
- Navegacion entre Comercial, Operativo y Admin.
- Acceso a pedidos.
- Acceso a CRM.
- Acceso a Cocina.
- Acceso a Repartidor.

## Checklist visual

- Responsive en desktop.
- Responsive en tablet.
- Responsive en mobile.
- Iconografia consistente.
- Estados loading, empty, error y success visibles cuando corresponde.
- Contraste legible en texto, chips, estados y KPI.

## Checklist tecnica

- `node --check` sin errores en los activos modificados.
- Sin errores JavaScript bloqueantes en consola.
- Sin recursos faltantes.
- Sin respuestas `404` o `500` inesperadas.
- Sin bloqueo por dependencias externas en el render inicial.

## Checklist operativa

- Crear pedido.
- Ver el pedido reflejado en Cocina.
- Confirmar publicacion al pool.
- Ver aceptacion del repartidor.
- Ver seguimiento.
- Ver entrega.
- Confirmar actualizacion de finanzas.
- Confirmar actualizacion de CRM.
- Confirmar consistencia en Dashboard Operativo.
- Confirmar consistencia en Dashboard Comercial.
- Confirmar consistencia en Panel Administrativo.

## Criterio de salida

El gate se considera aprobado cuando:

- todos los puntos funcionales estan verificados;
- todos los puntos visuales estan verificados;
- todos los puntos tecnicos estan verificados;
- el recorrido extremo a extremo se completa sin regresiones;
- no se observan errores bloqueantes ni bloqueos por carga del entorno.

## Manejo de 429

Si aparece `429 Too Many Requests` durante la validacion automatizada:

1. registrar el contexto exacto;
2. distinguir si el fallo proviene del entorno o del cambio de UI;
3. reintentar en una corrida limpia antes de declarar regresion;
4. no cerrar el gate hasta confirmar la causa.

## Relacion con pre-piloto

Este gate complementa la certificacion visual pre-piloto:

- `VALIDACION_PANELES_PRE_PILOTO_V1.md`

La certificacion pre-piloto valida la base visual y de autenticacion.
El Gate UX-Release confirma que esa base sigue operable en una corrida mas cercana al uso real.

## Historial

- 2026-07-25: Se crea el Gate UX-Release como comprobacion final previa al piloto.
