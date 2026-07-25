# MATRIZ DE MIGRACION MAQUINA DE ESTADOS LOGISTICA V1

## Estado

Propuesto

## Objetivo

Traducir el plan de migracion en una matriz operativa por modulo, con orden de ejecucion, dependencias y entregables claros.

## Regla general

No ejecutar ninguna fase si la fase anterior no quedo certificada o, al menos, validada con evidencia suficiente para continuar sin riesgo alto.

## 1. Resumen de fases

| Fase | Nombre | Objetivo principal | Dependencia |
| --- | --- | --- | --- |
| 0 | Preparacion documental | Definir contrato, criterios y alcance | Ninguna |
| 1 | Compatibilidad de lectura | Leer estados enriquecidos sin escribirlos | Fase 0 |
| 2 | Backend en coexistencia | Aceptar la secuencia enriquecida en modo controlado | Fase 1 |
| 3 | Android operativo | Reflejar la secuencia enriquecida en NellyDriver | Fase 2 |
| 4 | Paneles y analitica | Exponer hitos y medir tiempos | Fase 2 y 3 |
| 5 | Piloto en coexistencia | Probar la ruta enriquecida con trafico limitado | Fase 4 |
| 6 | Certificacion final | Promover la nueva baseline oficial | Fase 5 |

## 2. Matriz por modulo

| Modulo | Fase 0 | Fase 1 | Fase 2 | Fase 3 | Fase 4 | Fase 5 | Fase 6 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Backend | Revisar contrato actual y ADRs | Exponer lectura compatibe de nuevos estados | Ampliar validacion y coexistencia | Mantener compatibilidad API | Emitir eventos/metricas enriquecidas | Aceptar piloto limitado | Certificar nuevo contrato |
| Android (NellyDriver) | Revisar contrato y mapeos | Leer hitos intermedios como contexto | Sin cambios de escritura | Adaptar UI y repositorio | Mostrar trayecto y recoleccion | Probar con rutas piloto | Promover nueva UX/estado |
| Panel Operativo | Documentar lectura actual | Mostrar hitos como detalle | No escribir estados | Reflejar estado enriquecido | Exponer tiempos y SLA | Operar con trafico controlado | Formalizar nueva vista |
| Dashboard Comercial | Definir metricas afectadas | Leer contexto sin alterar metricas base | No depender de estados nuevos | Ajustar calculos de tiempos | Usar SLA/ETA enriquecido | Medir impacto en negocio | Certificar metricas |
| CRM | Definir contexto operativo permitido | Asociar eventos sin cambiar identidad | No alterar historia comercial | Mostrar trazabilidad adicional | Registrar tiempo y observaciones | Validar valor comercial | Aprobar modelo final |
| Metricas y tiempos | Definir indicadores objetivo | Leer eventos de contexto | Emitir datos de coexistencia | Construir mediciones de tiempo | Alimentar paneles y reportes | Evaluar beneficios reales | Congelar nuevo estándar |
| Documentacion | ADR-008/009/010 | Guias de lectura | Contrato de coexistencia | Guías de Android/backend | Manuales operativos | Actas de piloto | ADR final de adopcion |
| Pruebas | Definir secuencias | Pruebas de lectura | Pruebas de coexistencia | Pruebas integradas Android | Pruebas de paneles y tiempos | Piloto controlado | Certificacion completa |

## 3. Dependencias criticas

| Dependencia | Debe existir antes de | Riesgo si falta |
| --- | --- | --- |
| ADR-010 | Todas las fases | No hay decision oficial de adopcion |
| Fase 1 validada | Fase 2 | El backend podria aceptar contratos que clientes no entienden |
| Fase 2 validada | Fase 3 y 4 | Android y paneles se desalinean |
| Fase 3 validada | Fase 4 y 5 | La experiencia del driver no queda cerrada |
| Fase 4 validada | Fase 5 | El piloto no tiene visibilidad completa |
| Fase 5 validada | Fase 6 | No existe evidencia suficiente para certificar |

## 4. Entregables por fase

| Fase | Entregables |
| --- | --- |
| 0 | ADRs, comparativo, decision, plan de migracion |
| 1 | Adaptadores de lectura, pruebas de normalizacion, snapshots de compatibilidad |
| 2 | Backend en coexistencia, pruebas de transicion, validaciones de contrato |
| 3 | Android actualizado, repositorio de pedidos, pruebas de UI y flujo |
| 4 | Paneles actualizados, metricas de tiempo, dashboards coherentes |
| 5 | Piloto limitado, acta de piloto, evidencia de operacion real |
| 6 | Nueva baseline certificada, actualizacion de contratos, cierre de migracion |

## 5. Orden de ejecucion recomendado

1. Congelar baseline actual.
2. Validar lectura de estados enriquecidos.
3. Habilitar coexistencia backend.
4. Adaptar Android.
5. Ajustar paneles y analitica.
6. Correr piloto limitado.
7. Certificar o descartar la adopcion.

## 6. Criterios de salida por fase

| Fase | Criterio de salida |
| --- | --- |
| 0 | Documento de decision completo y aceptado |
| 1 | Ningun consumidor rompe al leer estados enriquecidos |
| 2 | El backend acepta coexistencia sin afectar cierre |
| 3 | Android refleja la secuencia sin regresiones |
| 4 | Paneles y metricas muestran trazabilidad util |
| 5 | El piloto limitado funciona sin bloqueos criticos |
| 6 | La nueva baseline queda certificada |

## 7. Riesgos transversales

| Riesgo | Impacto | Mitigacion |
| --- | --- | --- |
| Mezclar contrato actual y enriquecido sin separacion | Alto | Coexistencia por fases y mapeos claros |
| Reabrir el contrato certificado por impulso | Alto | ADR-010 como unica puerta de adopcion |
| Romper paneles por estados nuevos | Medio/alto | Fase 1 de lectura antes de escritura |
| Alterar metricas sin control | Medio | Separar contexto operativo de contracto canonico |
| Expandir alcance antes de certificar | Alto | No saltarse fases |

## 8. Recomendacion operativa

La migracion debe ejecutarse solo si existe patrocinio de producto para una ultima milla enriquecida.

Si no hay necesidad clara de trazabilidad fina, conviene mantener el contrato actual y cerrar el piloto con estabilidad.

Si hay necesidad, la ruta correcta es:

- primero lectura;
- luego coexistencia;
- despues piloto limitado;
- finalmente certificacion.

