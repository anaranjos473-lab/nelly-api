# H3 Zona v1 - Informe de certificacion pre-commit

## Estado

| Campo | Resultado |
|---|---|
| Frente | H3 - Zona v1 |
| Fase | IMPLEMENTAR completada; CERTIFICAR pendiente |
| Baseline | `fca2ed9` |
| Commit | No realizado |
| Push / deploy | No realizados |
| Firestore real | Intacto |
| RTDB / `zonas_calor` | Intacto |
| Android | Intacto |
| Stage | Vacio |

## Alcance implementado

El bloque implementado define el contrato `zona-v1` y mantiene separada la
ruta existente `GET /api/zonas`, cuyo contrato de `zonas_calor` no fue
modificado.

La fuente de persistencia prevista es:

```text
configuracion/zonas/items/{zonaId}
```

La distribucion territorial es:

```text
GET /api/zonas-territoriales
```

La administracion es:

```text
POST   /api/admin/zonas
GET    /api/admin/zonas
GET    /api/admin/zonas/:id
PUT    /api/admin/zonas/:id
DELETE /api/admin/zonas/:id
```

## Archivos del bloque

Archivos nuevos:

- `src/services/zonaService.js`
- `routes/zonasAdmin.js`
- `routes/zonasTerritoriales.js`
- `tests/zonaService.test.js`
- `tests/zonas-api.test.js`

Integracion minima:

- `app.js`: monta las dos rutas nuevas.
- `routes/admin.js`: exporta nominalmente el middleware existente
  `requirePanelAdminEmailAuth`, sin cambiar su logica.

No forman parte del bloque Android, RTDB, Firestore real, `/api/zonas`,
`zonas_calor`, Firebase Rules ni despliegue.

## Validaciones implementadas

`Zona v1` valida antes de escribir:

- `id` obligatorio, estable, normalizado y unico.
- `nombre` obligatorio.
- `colorHex` con formato `#RRGGBB`.
- minimo de tres vertices.
- latitud y longitud finitas y dentro de rango.
- vertices duplicados rechazados.
- poligonos degenerados rechazados.
- autointersecciones rechazadas.
- campos desconocidos rechazados.
- identidad de `PUT` protegida por el parametro de URL.

Los payloads invalidos producen `400 ZONE_INVALID` antes de cualquier write.
Las colisiones producen `409 ZONE_ID_EXISTS`.
Las lecturas territoriales publican solamente zonas validas y devuelven
`contract_version: zona-v1`.

## Evidencia ejecutada

### Pruebas H3 aisladas

```text
Suites: 2 passed
Tests: 16 passed
```

Incluye validacion pura y pruebas HTTP con Firestore simulado para:

- autenticacion `401` y autorizacion `403`;
- creacion y distribucion desde la misma fuente simulada;
- cero escrituras para payload invalido;
- colision de identificador;
- identidad inmutable en `PUT`;
- actualizacion y eliminacion;
- `404` para eliminacion inexistente.

### Checks estaticos

```text
node --check: correcto
git diff --check: correcto
```

## Suite global

La suite global no queda certificada en este punto:

```text
66 suites passed
5 suites failed
6 tests failed
```

Los fallos observados corresponden a componentes ajenos al bloque H3:

- expectativas antiguas sobre `buildDispatchAssignmentPayload`;
- mock incompleto de `sequenceRef.transaction`;
- suites duplicadas descubiertas bajo `.codex-tmp-main*`.

No se modifican ni limpian esos componentes como parte de H3.

## Dictamen

```text
ANALIZAR       OK
DISENAR        OK
IMPLEMENTAR   OK
CERTIFICAR     PENDIENTE
```

H3 esta listo para una auditoria de staging selectivo, pero no esta
certificado globalmente y no esta autorizado todavia el commit, push o
deploy.

El siguiente paso es revisar el stage exclusivamente con los archivos del
bloque H3 y tomar una decision explicita sobre el commit.
