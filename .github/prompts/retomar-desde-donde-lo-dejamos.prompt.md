---
mode: agent
description: Retoma una tarea en curso sin perder contexto y llévala a cierre con validación.
---

# Retomar desde donde lo dejamos

Continua exactamente la tarea en curso usando el contexto real del workspace, sin reiniciar el analisis.

## Argumento opcional
Usa el texto que pase el usuario como prioridad de reanudacion (por ejemplo: "tests", "error en app.js", "terminar deploy"). Si no hay argumento, retoma el ultimo objetivo pendiente detectado.

## Entradas implicitas a considerar
- Ultimos mensajes de la conversacion
- Estado de archivos modificados y pendientes
- Errores activos de compilacion/lint/tests
- Ultimas salidas de terminal relevantes
- Cambios sin commit y su impacto

## Instrucciones
1. Resume en 3 a 5 lineas el punto exacto donde se quedo el trabajo.
2. Lista bloqueos reales (si existen) y asunciones minimas.
3. Propone un plan corto y accionable para cerrar la tarea.
4. Ejecuta los pasos necesarios de inmediato (editar, validar, probar), sin pedir confirmaciones innecesarias.
5. Si falta contexto critico, haz solo las preguntas minimas para desbloquear.
6. Termina con un reporte de:
   - que se completo
   - que queda pendiente
   - evidencia de validacion (errores, tests o checks)

## Formato de respuesta esperado
- Estado retomado
- Siguiente accion ejecutada
- Resultado y validacion
- Pendientes

## Criterios de calidad
- No duplicar trabajo ya hecho
- No inventar contexto
- Priorizar cerrar el objetivo principal antes de tareas secundarias
- Mantener cambios pequenos, seguros y verificables
