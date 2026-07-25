# OV1 PRE PILOTO GATE V1

**Estado:** Gate operativo previo al piloto  
**Ambito:** Validacion tecnica, operativa y comercial antes de invitar comercios  
**Referencia:** `VALIDACION_OPERATIVA_C4_C5_Q1_V1.md`

## 1. Proposito

Confirmar que Nelly entra al piloto comercial controlado con una base seria, medible y repetible, evitando abrir nuevas capacidades antes de demostrar valor operativo con el ecosistema actual.

Este gate no crea nuevos dominios. Solo valida:

- operacion real;
- estabilidad de OV1;
- linea base de indicadores;
- preparacion operativa;
- criterios de salida del piloto.

## 2. Regla de alcance

Durante este gate no se debe abrir:

- `Q2`;
- `C6`;
- IA predictiva;
- nuevos modulos grandes;
- nuevas fuentes de verdad;
- automatizaciones comerciales avanzadas.

Todo ajuste debe responder a una evidencia de OV1, conservar la SSOT certificada y respetar RC2/G1.

## 3. Frente 1 - Validacion tecnica completa

Antes del piloto se debe verificar en operacion real:

| Verificacion | Resultado esperado | Estado |
| --- | --- | --- |
| Flujo completo del pedido | Creado -> publicado -> aceptado -> entregado | Pendiente por serie |
| Inicio y fin de entrega | Estados consistentes y cierre correcto | Pendiente por serie |
| Actualizacion en tiempo real | Admin, cocina, dashboards y flujo operativo alineados | Pendiente por serie |
| Dashboard Comercial | Carga datos de SSOT y muestra C4/C5 | Pendiente por serie |
| Dashboard Operativo | Estado saludable y proyecciones visibles | Pendiente por serie |
| C4 | Recomendaciones visibles y revisables | Pendiente por serie |
| C5 | Promociones sugeridas y medibles | Pendiente por serie |
| Q1 | Incidencias, causa raiz y acciones visibles | Pendiente por serie |
| Errores bloqueantes | Cero errores bloqueantes abiertos | Pendiente por serie |

**Criterio de salida:** cero errores bloqueantes durante las corridas previas al piloto.

## 4. Frente 2 - Corridas OV1

OV1 debe ejecutarse en varias corridas antes de invitar comercios reales.

### 4.1 Volumen objetivo

| Tipo | Objetivo |
| --- | --- |
| Corridas minimas | 20 |
| Corridas recomendadas | 20 a 50 |
| Comercios | Diferentes tipos cuando sea posible |
| Repartidores | Diferentes repartidores o perfiles de prueba |
| Horarios | Diferentes horarios operativos |

### 4.2 Registro por corrida

Cada corrida debe registrar:

- checklist operativa completada;
- incidencias;
- patrones detectados;
- dictamen;
- evidencia asociada.

La plantilla base es `OV1_CHECKLIST_OPERATIVA_V1.md`.

## 5. Frente 3 - Linea base de indicadores

Antes del piloto se debe conservar una linea base minima para comparar resultados posteriores.

| Categoria | Indicador |
| --- | --- |
| Operacion | Tiempo promedio de entrega |
| Operacion | Pedidos completados |
| Operacion | Pedidos cancelados |
| Calidad | Incidencias |
| Calidad | Mermas |
| Calidad | Danos |
| Comercial | Clientes recurrentes |
| Comercial | Comercios activos |
| Comercial | Promociones utilizadas |
| Inteligencia | Recomendaciones emitidas |
| Inteligencia | Recomendaciones aplicadas |

La linea base vigente se documenta en `OV1_BASELINE_METRICAS_PRE_PILOTO_V1.md`.

## 6. Frente 4 - Preparacion operativa

Antes de invitar comercios se deben tener listos:

| Preparacion | Documento |
| --- | --- |
| Manual rapido para comercios | `PILOTO_MANUAL_COMERCIOS_V1.md` |
| Manual rapido para repartidores | `PILOTO_MANUAL_REPARTIDORES_V1.md` |
| Procedimiento de soporte | `PILOTO_PROCEDIMIENTO_SOPORTE_V1.md` |
| Procedimiento para reportar incidencias | `PILOTO_PROCEDIMIENTO_INCIDENCIAS_V1.md` |

## 7. Frente 5 - Criterio de salida del piloto

El piloto no debe cerrarse por fecha. Debe cerrarse por objetivos medibles.

| Criterio | Resultado esperado |
| --- | --- |
| Flujo completo consistente | Sin errores bloqueantes |
| Usuarios operan sin ayuda constante | Comercios y repartidores completan tareas basicas |
| C4 genera recomendaciones utiles | Al menos una recomendacion aplicada con resultado observado |
| C5 genera promociones medibles | Al menos una promocion con resultado cuantificable |
| Q1 clasifica incidencias | Incidencia -> causa raiz -> accion -> nueva medicion |
| Q1 muestra mejora o aprendizaje | Variacion documentada, positiva o negativa |
| Errores criticos abiertos | Cero |

## 8. Vigilancia adicional

Durante varias corridas consecutivas se debe vigilar:

| Senal | Condicion esperada |
| --- | --- |
| Tiempo promedio de entrega | Estable y sin contaminacion historica |
| Q1 | Proyeccion visible, incidencias clasificables y acciones trazables |
| C5 | Promociones sugeridas, activables y con resultado medible |

Si cualquiera de estas senales se vuelve inestable, no se debe abrir el piloto hasta registrar causa y dictamen.

## 9. Dictamen

El piloto comercial controlado podra iniciar cuando:

- las corridas OV1 acumulen evidencia suficiente;
- los indicadores base esten definidos;
- los manuales operativos esten listos;
- C4, C5 y Q1 demuestren valor inicial o aprendizaje medible;
- no existan errores criticos abiertos.

## 10. Historial

- 2026-07-25: Se crea el gate pre piloto OV1 para ordenar validacion tecnica, corridas, metricas, preparacion operativa y criterios de salida.
