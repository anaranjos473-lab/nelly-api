# C5.2-B.1 - Ventana controlada de observación

Estado: **CERRADA - INTERRUMPIDA POR SUSPENSIÓN DE INSTANCIA GRATUITA**

Fecha de diseño: 2026-07-13

Commit observado: `f0436b3 Add disabled C5 V2 shadow validator`

## Objetivo

Medir el contrato actual con el Shadow Validator sin cambiar código, rechazar pedidos, modificar RTDB ni adaptar consumidores. La salida será un único informe agregado que permita priorizar C5.2-C.

## Frontera congelada

Durante la ventana queda prohibido:

- introducir productores V2;
- modificar Android, Cocina, Admin, Delivery, Tracking o Cloud Functions;
- corregir pedidos a partir de los hallazgos;
- eliminar aliases;
- migrar o limpiar históricos;
- reanudar C4;
- escribir métricas dentro de Firebase.

El único cambio operativo permitido es activar y después desactivar `ENABLE_C5_SHADOW_VALIDATOR` en una instancia controlada.

## Prerrequisitos de activación

1. El servicio de prueba/piloto debe tener exactamente una instancia activa, o debe existir una instancia de observación aislada. Si el flag se propaga a varias réplicas, no se inicia la ventana.
2. Debe estar desplegado exactamente el commit `f0436b3` o un commit posterior sin cambios funcionales al observador.
3. No debe existir un despliegue paralelo o pendiente durante la activación.
4. El reloj del servidor debe comprobarse contra una fuente horaria confiable antes de registrar T0.
5. Debe existir una línea base de las últimas 24 horas para pedidos, errores HTTP, latencia, memoria y volumen de logs.
6. Debe estar identificado quién puede retirar el flag y reiniciar la instancia.
7. Las credenciales y cambios de configuración los realiza personalmente el usuario; no se comparten con Codex.
8. C5.2-C y productores V2 permanecen bloqueados aunque la activación sea exitosa.

## Checklist previo

### Infraestructura

- [ ] Existe exactamente una instancia observadora.
- [ ] El despliegue contiene el commit del Shadow Validator esperado.
- [ ] No hay despliegues paralelos ni pendientes.
- [ ] El reloj del servidor está sincronizado.

### Línea base de 24 horas

- [ ] Número de pedidos registrado.
- [ ] Latencia media y p95 registradas.
- [ ] Número y tasa de errores backend registrados.
- [ ] Memoria media y máxima registradas.
- [ ] Volumen normal de logs registrado.

### Estado sombra apagado

- [ ] `ENABLE_C5_SHADOW_VALIDATOR` está ausente/`UNSET`.
- [ ] No aparecen líneas `[C5_SHADOW]`.
- [ ] No aparecen métricas sombra.
- [ ] No hay efectos secundarios atribuibles al observador.

No se activa el flag con una sola casilla pendiente.

## Cohortes

La observación separa dos universos:

### Línea base histórica

El evento `initial_metrics` resume todos los registros presentes en `pedidos` al iniciar. Sirve para medir deriva acumulada, pero no se contabiliza como pedido nuevo del piloto.

### Cohorte de ventana

Incluye únicamente ids únicos registrados con:

```text
event=order_validation
source=child_added
```

después de T0. Los eventos `child_changed` sirven para detectar cambios, aliases y transiciones, pero no aumentan el número de pedidos de la cohorte.

## Duración y cierre

- Inicio T0: primera línea `initial_metrics` seguida de confirmación del observador habilitado.
- Duración mínima: 72 horas continuas.
- Tamaño objetivo: 25 pedidos nuevos únicos.
- Cierre normal: cuando se cumplan simultáneamente 72 horas y 25 pedidos.
- Límite máximo: 7 días naturales.
- Si al día 7 hay menos de 25 pedidos, se cierra con la muestra real y el informe se marca `MUESTRA INSUFICIENTE`; no se extiende automáticamente.
- No se crean pedidos artificiales para alcanzar la cuota.

Alcanzar 25 pedidos antes de 72 horas no cierra la ventana; se respeta el mínimo temporal. El aborto sí la cierra inmediatamente.

## Umbrales de abortar

Se retira inmediatamente el flag si ocurre cualquiera de estas condiciones:

| Señal | Umbral |
|---|---|
| Error del listener | 2 eventos `listener_error` en 10 minutos |
| Errores HTTP | Aumento de 1 punto porcentual o más durante 15 minutos frente a la línea base |
| Latencia API p95 | Aumento sostenido mayor al 20% durante 15 minutos |
| Memoria de instancia | Aumento sostenido mayor al 15% durante 15 minutos |
| Volumen de logs sombra | Más de 20 líneas por minuto durante 5 minutos |
| Incidente funcional | Cualquier correlación razonable con aceptación, tracking, evidencia o cierre |
| Escritura atribuible a sombra | Una sola evidencia implica aborto y revisión inmediata |

Abortar no borra logs ni pedidos. Se desactiva el flag, se reinicia la instancia y se documentan T0, hora del incidente, métrica y resultado. No se intenta corregir el incidente durante la ventana.

## Activación manual

La persona autorizada:

1. confirma una sola instancia;
2. configura `ENABLE_C5_SHADOW_VALIDATOR=true` sin cambiar otras variables;
3. reinicia/aplica la configuración sin desplegar código adicional;
4. verifica `Servidor de Nelly corriendo`;
5. verifica `[C5_SHADOW] ... initial_metrics`;
6. registra T0, instancia y commit;
7. comprueba que no existe `listener_error` inicial.

Si falta `initial_metrics`, la ventana no comenzó y el flag se retira.

## Registro formal T0

Al comenzar se completa y conserva esta tabla:

| Campo | Valor a registrar |
|---|---|
| Fecha/hora T0 con zona | `2026-07-13 17:18:27.810 -06:00` (Ciudad de México) |
| Fecha/hora de interrupción | `2026-07-13 17:34:31 -06:00` (Ciudad de México) |
| Duración observada | `00:16:03.190` |
| Motivo de cierre | Suspensión automática por inactividad de la instancia gratuita de Render |
| Instancia/entorno | Render producción, `nelly-api`, una instancia (`WEB_CONCURRENCY=1`) |
| Commit backend/web desplegado | `d78395f` (código Shadow base en `aaeb653`) |
| Commit Android instalado | `904cf2c` |
| Commit base del Shadow Validator | `aaeb653` |
| Estado del flag | `ENABLED` |
| Pedidos nuevos de la cohorte | `0` |
| Errores sombra | `0` |
| Resumen `initial_metrics` | 85 históricos; 0 V2; 0 válidos V2; 85 inválidos; 84 con aliases; 0 transiciones inválidas |
| Responsable de desactivación | Usuario/operador autorizado de Render |

La línea base histórica no se suma al contador inicial de la cohorte.

## Desactivación

Al cerrar o abortar:

1. cambiar el flag a `false` o eliminarlo;
2. reiniciar/aplicar configuración;
3. confirmar ausencia de nuevas líneas `[C5_SHADOW]`;
4. registrar T1;
5. conservar solo los logs necesarios para el informe y según la retención operativa vigente.

No se ejecuta rollback de datos porque el observador no escribe datos.

## Métricas del informe

### Línea base histórica

- `total_orders`;
- `v2_orders` y `v2_percentage`;
- `valid_v2_orders` y `valid_v2_percentage`;
- `invalid_orders`;
- `orders_with_aliases`;
- `failures_by_code`;
- `aliases_used`;
- `by_producer`.

### Cohorte de ventana

- pedidos nuevos únicos;
- distribución de `contract_version`;
- productor declarado/no declarado;
- válidos V2 sin modificación;
- pedidos con aliases;
- códigos de desviación por pedido;
- estados/transiciones inválidos;
- cambios de cumplimiento durante `child_changed`;
- incidentes y abortos.

### Porcentaje de cumplimiento V2

Indicador principal:

```text
cumplimiento_v2_cohorte =
  pedidos nuevos que cumplen V2 completamente
  ------------------------------------------------ x 100
  total de pedidos nuevos únicos de la cohorte
```

El informe siempre mostrará numerador, denominador y porcentaje. Un pedido solo cuenta como cumplidor cuando `valid=true`; cumplir parcialmente o usar aliases no cuenta como válido V2.

También se calculará cumplimiento por familia:

```text
cumplimiento_familia = pedidos sin errores de esa familia / total cohorte x 100
```

Familias: ubicación, identidad/aliases, estado/fase, monetario, historial/eventos y evidencia.

Los códigos se agrupan para priorizar:

| Familia | Códigos principales | Frente probable |
|---|---|---|
| Ubicación | `COORDENADAS_INVALIDAS`, faltantes de cliente/tienda | Productores y captura geográfica |
| Identidad/alias | `ALIAS_PERSISTIDO`, `VERSION_INVALIDA`, `PRODUCTOR_INVALIDO` | Adaptadores y productores |
| Estado/fase | `ESTADO_INVALIDO`, `FASE_INVALIDA`, `TRANSICION_INVALIDA` | Android, Tracking y Delivery |
| Monetario | `PAGO_INVALIDO`, `TOTAL_INCONSISTENTE` | Productores, Delivery y reportes |
| Historial/eventos | `HISTORIAL_VACIO`, `HISTORIAL_INCONSISTENTE`, `EVENTO_INVALIDO` | Backend transaccional y consumidores |
| Evidencia | `EVIDENCIA_INVALIDA`, `EVIDENCIA_REQUERIDA` | Android, web y cierre Delivery |

## Privacidad

El informe no incluirá ids de pedido, nombres, teléfonos, direcciones, coordenadas, items, importes individuales ni contenido de evidencia. Solo agregados, porcentajes, códigos y nombres técnicos de aliases/productores.

## Informe único de cierre

El documento final tendrá:

1. T0, T1, duración, commit e instancia;
2. motivo de cierre normal/por límite/aborto;
3. tamaño y suficiencia de la muestra;
4. comparación histórica frente a cohorte nueva;
5. Pareto de desviaciones;
6. aliases más frecuentes;
7. distribución por productor;
8. impacto operativo observado;
9. prioridades propuestas para consumidores;
10. decisión recomendada `GO/NO-GO` para planificar C5.2-C.

El porcentaje de cumplimiento es una línea base objetiva, no un umbral mínimo automático. Exigir cumplimiento alto antes de adaptar consumidores crearía un bloqueo circular porque los productores V2 siguen apagados. La decisión se interpreta así:

- `GO` para **planificar** C5.2-C: ventana cerrada normalmente, muestra suficiente, sin impacto operativo y Pareto de brechas accionable;
- `NO-GO`: aborto, integridad dudosa o muestra insuficiente al día 7;
- un porcentaje bajo con muestra suficiente no es por sí solo NO-GO: indica qué adaptadores deben priorizarse.

El informe no autoriza automáticamente implementar C5.2-C. La adaptación de cada consumidor requiere una decisión posterior.

## Estado actual

La campaña `B1-2026-07` quedó cerrada como `INTERRUMPIDA`. Inició en T0 `2026-07-13 17:18:27.810 -06:00` y el observador emitió `event=stopped` a las `2026-07-13 17:34:31 -06:00` cuando Render suspendió la instancia gratuita por inactividad. Duración efectiva: `00:16:03.190`. Cohorte final: `0` pedidos nuevos. Los 85 pedidos de `initial_metrics` permanecen únicamente como línea base histórica. No reutilizar `B1-2026-07`; antes de abrir B2 debe existir una estrategia que evite suspensiones durante toda la ventana.
