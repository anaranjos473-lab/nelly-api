---
name: auditoria-general-repositorio
description: 'Audita de forma general todas las carpetas y el repositorio, detecta errores de estructura, configuracion, codigo y dependencias, aplica correcciones seguras y valida que no queden errores de compilacion o ejecucion. Usar cuando pidas revisar, corregir y actualizar el proyecto completo.'
argument-hint: 'Define alcance, nivel de profundidad y tolerancia a cambios (solo diagnostico o corregir automatico).'
user-invocable: true
---

# Auditoria General Del Repositorio

## Resultado Esperado
- Entregar un diagnostico general del repositorio por severidad: bloqueantes, altos, medios y bajos.
- Corregir errores reproducibles con cambios minimos y seguros.
- Actualizar componentes puntuales necesarios para estabilidad sin romper funcionalidad existente.
- Verificar que, despues de los cambios, el proyecto no presente errores en chequeos basicos.

## Cuando Usar
- Cuando el usuario pida auditar todo el repositorio o varias carpetas.
- Cuando haya errores acumulados y se requiera correccion integral.
- Cuando se necesite reducir deuda tecnica operativa antes de despliegue.

## Entradas Minimas
- Objetivo del usuario (diagnostico, correccion, o ambos).
- Restriccion de cambios (conservador, balanceado, agresivo).
- Alcance (todo el repo o carpetas especificas).

## Configuracion Predeterminada
- Modo por defecto: completo.
- Actualizacion de dependencias y configuracion: permitida solo con cambios minimos y seguros.
- Archivos sensibles o sospechosos: solo reportar, no modificar ni eliminar.

## Flujo De Trabajo
1. Definir alcance y limites.
2. Inventariar estructura, tecnologias y puntos sensibles.
3. Ejecutar auditoria automatica y manual.
4. Priorizar hallazgos por severidad y riesgo de regresion.
5. Aplicar correcciones incrementales y verificables.
6. Re-ejecutar validaciones y confirmar cierre.
7. Reportar resultados, riesgos remanentes y siguientes pasos.

## Procedimiento Detallado

### 1) Definir alcance
- Confirmar si es solo diagnostico o diagnostico con correccion.
- Confirmar si se permiten cambios en configuracion, dependencias y refactor menor.
- Registrar restricciones: no cambios destructivos, no tocar secretos, no alterar reglas de negocio sin evidencia.

### 2) Inventario inicial
- Listar carpetas clave, archivos de configuracion y puntos de entrada.
- Identificar stack principal (Node, frontend, Android u otros modulos).
- Detectar archivos sensibles: secretos, credenciales, llaves o tokens expuestos.

### 3) Auditoria automatica
- Verificar integridad de dependencias (instalacion, lockfile, scripts rotos).
- Ejecutar chequeos disponibles del proyecto: lint, build, test, typecheck.
- Revisar errores de configuracion: variables de entorno, rutas, Firebase y reglas.
- Identificar archivos huerfanos, duplicados o inconsistentes.

### 4) Auditoria manual dirigida
- Revisar rutas criticas de negocio y arranque.
- Buscar anti-patrones de estabilidad: manejo deficiente de errores, null/undefined no controlado, codigo muerto en flujo critico.
- Validar coherencia entre frontend, backend y capa de datos.

### 5) Priorizacion y decision
- Bloqueante: impide ejecutar o rompe flujo principal. Corregir primero.
- Alta: riesgo alto de fallo en produccion o perdida de datos. Corregir en esta ronda.
- Media: afecta mantenibilidad o calidad. Corregir si es de bajo riesgo.
- Baja: mejoras cosmeticas o deuda no urgente. Documentar.

Regla de decision:
- Si una correccion requiere refactor amplio y no hay pruebas, preferir mitigacion minima y abrir recomendacion.
- Si un cambio toca seguridad o datos, exigir validacion extra antes de ampliar alcance.

### 6) Implementacion segura
- Hacer cambios pequenos por archivo y validar cada bloque.
- Evitar reformat global o cambios no relacionados.
- Mantener compatibilidad de APIs publicas salvo necesidad explicita.

### 7) Validacion de cierre
- Repetir lint/build/test o los chequeos equivalentes disponibles.
- Confirmar que no se introdujeron errores nuevos en archivos tocados.
- Verificar que los hallazgos bloqueantes y altos quedaron resueltos o justificados.

## Criterios De Completitud
- Se ejecuto auditoria sobre el alcance acordado.
- Se entrego lista de hallazgos priorizada por severidad.
- Se aplicaron correcciones seguras sobre hallazgos criticos.
- Se validaron los cambios con chequeos reproducibles.
- Se documentaron riesgos residuales y recomendaciones concretas.

## Formato De Entrega Sugerido
- Resumen ejecutivo de estado general.
- Hallazgos por severidad con archivo afectado, impacto y accion tomada.
- Cambios aplicados y validaciones ejecutadas.
- Riesgos pendientes y plan de seguimiento.

## Variantes De Ejecucion
- Modo rapido: detectar y corregir solo bloqueantes y altos.
- Modo completo: cubrir todo el flujo con validaciones extensivas.
- Modo diagnostico: no modificar codigo, solo informe y plan.

Si el usuario no especifica modo, ejecutar en modo completo.
