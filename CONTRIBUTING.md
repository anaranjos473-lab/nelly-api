# CONTRIBUTING.md
# Cómo Trabajar en Nelly Delivery

## Principios

- No modificar componentes certificados sin evidencia nueva.
- Toda incidencia debe ser reproducible.
- Toda corrección debe tener una prueba.
- Toda prueba debe tener documentación.
- Toda decisión importante debe quedar trazada en ADR o certificación.

## Flujo Recomendado

1. Leer `AGENTS.md`.
2. Revisar `SYSTEM_STATE.md`.
3. Revisar el ADR o contrato correspondiente.
4. Reproducir el problema.
5. Instrumentar solo lo necesario.
6. Corregir el componente exacto.
7. Compilar y probar.
8. Documentar el resultado.

## Reglas de Cambio

- Un cambio debe tocar una sola fuente de verdad.
- Evitar duplicar lógica entre backend, panel y Android.
- No eliminar logs de investigación mientras la incidencia siga abierta.
- No cambiar contratos de API sin actualizar `docs/contracts`.

## Checklist Antes de Hacer Commit

- ¿Qué evidencia motivó el cambio?
- ¿Qué archivos modifica?
- ¿Qué comportamiento cambia?
- ¿Qué prueba lo valida?
- ¿Qué documentación actualiza?

## Buenas Prácticas

- Preferir cambios pequeños y verificables.
- Preferir backend como autoridad de negocio.
- Mantener la nomenclatura y rutas canónicas.
- No reabrir Cocina, Radar o backend certificados sin evidencia.

