# U1.9 - ARQUITECTURA DE EXTENSIONES V1

## Fecha
2026-07-22

## Proposito
Definir como se incorporaran nuevas capacidades a la plataforma universal sin modificar el nucleo del dominio, preservando estabilidad, versionado y desacoplamiento.

## Alcance
Este documento define los puntos de extension de U1. No implementa plugins ni altera la baseline certificada de Kitchen Premium.

## Objetivos

- soportar crecimiento sin redisenar el core;
- permitir extensiones por vertical o capacidad;
- separar el nucleo de las funcionalidades adicionales;
- definir interfaces para marketplace, IA, ERP, POS, facturacion, analitica, notificaciones y fidelidad;
- mantener el dominio base estable mientras crece el ecosistema.

## Principios

1. El core debe permanecer pequeño y estable.
2. Una extension no debe romper el contrato del dominio.
3. Cada extension debe poder activarse o desactivarse.
4. Las capacidades nuevas deben acoplarse por contrato, no por atajo.
5. El sistema debe crecer por modulos, no por mutaciones desordenadas.

## Zonas de extension

### Marketplace
- catalogo;
- carrito;
- multiples vendedores;
- fulfillment por vendedor o por nodo.

### IA
- clasificacion;
- prediccion;
- asistencia operativa;
- recomendaciones;
- deteccion de anomalías.

### ERP
- pedidos;
- facturacion;
- conciliacion;
- corte;
- reportes contables.

### POS
- ventas fisicas;
- caja;
- cierre de turno;
- sincronizacion de tickets.

### Facturacion
- CFDI o equivalentes;
- folios;
- timbrado;
- reversiones.

### Analitica
- KPIs;
- embudos;
- tiempos;
- rentabilidad;
- trazabilidad.

### Notificaciones
- email;
- push;
- SMS;
- webhooks;
- eventos internos.

### Fidelidad
- puntos;
- niveles;
- beneficios;
- cupones;
- recompensas.

## Contrato de extension

Cada extension debe definir:

- `id`
- `nombre`
- `version`
- `estado`
- `entradas`
- `salidas`
- `dependencias`
- `eventos_consumidos`
- `eventos_emitidos`
- `configuracion`

## Reglas de extension

1. Ninguna extension puede redefinir el significado del core.
2. Las dependencias deben ir del core hacia la extension, no al revés.
3. Una extension debe poder reemplazarse sin romper el dominio base.
4. La activacion de una extension debe ser trazable.
5. Los eventos son el puente preferido entre core y extensiones.

## Puntos de extension sugeridos

- adapters;
- handlers de eventos;
- servicios de integracion;
- proyecciones de lectura;
- tareas programadas;
- validadores de entrada/salida.

## Casos de uso

### Nuevo canal de venta
Se agrega sin tocar `Pedido` ni `Ledger`, usando contratos y eventos existentes.

### Nueva pasarela de pago
Se conecta como extension de integracion y publica eventos financieros al ledger.

### Nuevo almacén o nodo
Se incorpora como `FulfillmentNode` sin alterar el core.

### Nueva regla analitica
Se suscribe a eventos y genera una proyeccion sin tocar el flujo principal.

## Criterios de aceptacion

- el core sigue siendo estable mientras crece el ecosistema;
- las nuevas capacidades se agregan por extension;
- las integraciones y verticales no reescriben el dominio base;
- los eventos permiten desacoplar crecimiento y reaccion;
- la arquitectura soporta evolucion ordenada.

## Criterio de cierre
U1.9 se considerara estable cuando nuevas capacidades puedan incorporarse mediante puntos de extension documentados sin modificar el significado del nucleo universal.

## Referencias
- [`docs/architecture/U1_1_MODELO_DOMINIO_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_1_MODELO_DOMINIO_UNIVERSAL_V1.md)
- [`docs/architecture/U1_6_EVENTOS_DOMINIO_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_6_EVENTOS_DOMINIO_V1.md)
- [`docs/architecture/U1_7_CONTRATOS_CANONICOS_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_7_CONTRATOS_CANONICOS_V1.md)
- [`docs/architecture/U1_8_MAQUINA_ESTADOS_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_8_MAQUINA_ESTADOS_V1.md)
