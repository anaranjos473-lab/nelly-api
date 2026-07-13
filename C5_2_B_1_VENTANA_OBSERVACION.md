# C5.2-B.1 - Ventana controlada de observación

Estado: **AUTORIZADA CON CONDICIONES; PENDIENTE DE ACTIVACIÓN MANUAL**

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
3. Debe existir una línea base de las últimas 24 horas para errores HTTP, latencia p95 y memoria.
4. Debe estar identificado quién puede retirar el flag y reiniciar la instancia.
5. Las credenciales y cambios de configuración los realiza personalmente el usuario; no se comparten con Codex.
6. C5.2-C y productores V2 permanecen bloqueados aunque la activación sea exitosa.

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

El informe no autoriza automáticamente C5.2-C. La adaptación de cada consumidor requiere una decisión posterior.

## Estado actual

La ventana está autorizada documentalmente, pero no está activa. `ENABLE_C5_SHADOW_VALIDATOR` permanece `UNSET` hasta que el usuario aplique personalmente la configuración y confirme que la instancia controlada está lista.
