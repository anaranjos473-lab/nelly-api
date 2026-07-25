# ADR-009: Comparativo entre maquina de estados actual y version logistica enriquecida

## Estado

Propuesta

## Contexto

RC2 dejo una observacion clara: el contrato actual de estados resuelve el cierre operativo, pero no modela con precision todos los hitos de la ultima milla.

La decision ya no es sobre una transicion aislada, sino sobre el diseño completo del ecosistema.

## 1. Contrato actual

### Fuente de verdad

```text
pedidos/{id}
```

### Flujo oficial vigente

```text
ADMIN -> PENDIENTE
COCINA -> LISTO
REPARTIDOR -> EN_CURSO
REPARTIDOR -> ENTREGADO
```

### Estados oficiales

- `PENDIENTE`
- `LISTO`
- `EN_CURSO`
- `ENTREGADO`
- `CANCELADO`

### Compatibilidad actual

Los estados heredados se normalizan hacia el contrato oficial:

| Estado heredado | Estado oficial |
| --- | --- |
| `PREPARANDO`, `COCINA` | `PENDIENTE` |
| `PENDIENTE_ACEPTACION`, `LISTO_PARA_REPARTO`, `ESPERANDO_REPARTIDOR`, `DESPACHO` | `LISTO` |
| `EN_CAMINO`, `EN_REPARTO`, `REPARTO`, `PEDIDO_ABORDO` | `EN_CURSO` |
| `FINALIZADO` | `ENTREGADO` |

### Ventajas

- Contrato simple y estable.
- Menor riesgo de regresiones.
- Menor costo de mantenimiento.
- Compatible con el piloto actual.

### Limitaciones

- No modela con precision llegada al comercio o al cliente.
- Reduce la visibilidad de espera, recoleccion y trayecto.
- Fuerza a que algunos hitos reales queden fuera del contrato oficial.

## 2. Contrato logistico enriquecido

### Secuencia propuesta

```text
CREADO
  -> LISTO
  -> ASIGNADO
  -> RUTA_A_TIENDA
  -> LLEGUE_A_TIENDA
  -> PEDIDO_ABORDO
  -> EN_TRANSITO
  -> LLEGUE_DESTINO
  -> ENTREGADO
```

### Variantes compatibles

- `CREADO`
- `PAGADO`
- `VALIDADO`
- `EN_PROCESO`
- `LISTO`
- `ASIGNADO`
- `RUTA_A_TIENDA`
- `LLEGUE_A_TIENDA`
- `PEDIDO_ABORDO`
- `EN_TRANSITO`
- `LLEGUE_DESTINO`
- `ENTREGADO`
- `CANCELADO`

### Ventajas

- Mayor trazabilidad de ultima milla.
- Mejor analitica de tiempos y cuellos de botella.
- Mejor soporte para ETA y monitoreo operativo.
- Mejor alineacion con la experiencia real del repartidor.

### Riesgos

- Mayor complejidad de backend, Android y paneles.
- Requiere migracion o coexistencia controlada.
- Exige pruebas mas finas de secuencia y estados invalidos.
- Puede romper supuestos ya certificados si se adopta sin plan.

## 3. Impacto y riesgo por modulo

| Componente | Impacto si se mantiene el contrato actual | Impacto si se adopta el contrato enriquecido | Riesgo principal |
| --- | --- | --- | --- |
| Android (NellyDriver) | Bajo: sigue normalizando estados heredados. | Alto: debe reconocer hitos intermedios y reflejarlos sin inventar negocio. | Desalineacion entre UI y backend. |
| Backend | Bajo: se preserva la logica actual. | Alto: debe ampliar transiciones, persistencia y validaciones. | Regresiones en estados y cierres. |
| Panel Operativo | Bajo: mantiene lectura simple. | Medio/alto: gana detalle operativo. | Mostrar estados no canonicos de forma inconsistente. |
| Dashboard Comercial | Bajo: consume cierre ya consolidado. | Medio: puede enriquecer SLA y conversion. | Calcular metricas con estados no oficiales. |
| CRM | Bajo: usa el resultado final. | Medio: puede ganar contexto historico. | Mezclar contexto operativo con identidad comercial. |
| Metricas y tiempos | Medio: metricas mas simples. | Alto: mejor analitica de tiempos y retrasos. | Introducir medicion sin contrato estable. |
| Compatibilidad con el piloto | Alta: conserva lo certificado. | Media: requiere coexistencia y validacion. | Interrumpir el piloto por cambios de contrato. |

## 4. Evaluacion de riesgo

### Mantener el contrato actual

Riesgo:

- Bajo para estabilidad.
- Medio para visibilidad operativa a futuro.

### Adoptar el contrato enriquecido

Riesgo:

- Medio/alto para implementacion.
- Bajo/medio para valor de negocio, si se adopta bien.

## 5. Recomendacion

La recomendacion es adoptar la version enriquecida solo si el objetivo de Nelly es modelar ultima milla profesional con trazabilidad real de cada hito logistico.

Si el objetivo inmediato es proteger el piloto y mantener la plataforma estable, conviene conservar el contrato actual como baseline y abrir una migracion controlada posterior.

## 6. Decision sugerida

### Opcion preferida para el corto plazo

- Mantener el contrato actual como oficial para el piloto.
- Registrar `LLEGUE_A_TIENDA` y otros hitos como propuesta de evolucion.
- No cambiar la baseline certificada sin ADR adicional de migracion.

### Opcion preferida para la siguiente fase

- Definir una maquina logistica enriquecida con coexistencia controlada.
- Actualizar Android, backend y paneles en un mismo paquete.
- Certificar la nueva secuencia antes de promoverla a contrato oficial.

## 7. Criterio de aprobacion

La adopcion de la version enriquecida solo debe aprobarse si:

- no rompe `ENTREGADO`;
- no altera `complete-order`;
- conserva compatibilidad con el piloto;
- mejora trazabilidad y metricas de forma medible.

