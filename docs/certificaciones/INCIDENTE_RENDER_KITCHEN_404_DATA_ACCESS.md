# Incidente Render Kitchen 404 Data Access

## Resumen

Durante la validacion de Cocina se detecto que el panel recibia un `404` al consultar:

`/api/data-architecture/data-access`

La evidencia mostro que el problema no estaba en el render principal ni en el contrato local, sino en el despliegue activo de Render, que estaba sirviendo un commit distinto al publicado en el repositorio local.

## Evidencia recopilada

- El panel mostraba fallback local al no resolver el contrato remoto.
- La consola del panel reportaba:
  - `GET /api/data-architecture/data-access 404 (Not Found)`
  - `fallback local para Cocina`
- El repositorio local contenia la ruta:
  - `routes/dataArchitecture.js`
- El backend montaba la ruta:
  - `app.use('/api/data-architecture', dataArchitectureRouter)`
- Render estaba desplegando un commit anterior:
  - `fdfc270`
- Tras alinear la rama `main`, Render quedo apuntando a:
  - `ea14346`

## Correccion aplicada

1. Se confirmo que el repo local si contenia el endpoint `data-access`.
2. Se identifico que Render estaba sirviendo un deploy desalineado.
3. Se subio el commit correcto a `main`.
4. Se confirmo en logs de Render que el nuevo deploy tomo el commit `ea14346`.

## Resultado

Despues de la alineacion del despliegue:

- `api/health` responde correctamente.
- `api/data-architecture/status` responde correctamente.
- `api/data-architecture/data-access` responde con datos reales.
- Cocina deja de caer en fallback por `404`.

## Clasificacion

- Tipo: incidente de despliegue / desalineacion de rama
- Severidad: media
- Impacto: afectaba la fuente de datos visible en Cocina, pero no el contrato local ni el motor NAE

## Estado

**Cerrado**

## Observacion

La evidencia indica que este incidente no era un fallo de arquitectura del NAE ni un defecto del render principal. Fue una diferencia entre el estado local del repositorio y el despliegue activo en Render.
