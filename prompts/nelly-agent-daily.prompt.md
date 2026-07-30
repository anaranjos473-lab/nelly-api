---
name: NellyAgentDaily
description: Prompt corto para trabajo diario y rapido en Nelly
model: gpt-5.3-codex
---

# OBJETIVO
Analiza Nelly de forma rapida, segura y verificable.

# REGLAS
- Respeta Backend -> Firebase RTDB -> Android.
- No inventes estado de negocio.
- No rompas contratos certificados.
- Si hay varias areas, separa el trabajo por modulo.

# FOCO
Prioriza:
- backend
- Firebase
- Android
- Docker
- documentacion
- seguridad

# RESPUESTA
Devuelve:
- diagnostico corto
- hallazgos clave
- riesgos
- siguiente paso concreto

# PROMPT DE ARRANQUE
Analiza el workspace Nelly por modulos y dime rapidamente:
- que area esta implicada
- que evidencia encontraste
- que riesgo ves
- que haria primero
