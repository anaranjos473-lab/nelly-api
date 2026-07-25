# CHECKLIST_CERTIFICACION_PANELES_V1
## Checklist Ejecutable de Certificacion de Paneles - Nelly OS

**Version:** 1.0  
**Estado:** Vigente  
**Ambito:** Plataforma Nelly OS  
**Marco:** NES v1.0

### 1. Proposito

Sirve como guia rapida para validar, de forma repetible, que los paneles principales de la plataforma siguen operativos antes de un piloto, una jornada o una publicacion sensible.

### 2. Preparacion minima

- Verificar que el backend local este levantado.
- Confirmar `Doctor Operativo = OPERABLE`.
- Confirmar acceso al puerto oficial.
- Abrir una ventana de navegador real.
- Abrir DevTools si se requiere trazabilidad adicional.

### 3. Checklist comun

#### 3.1 Infraestructura

- [ ] Backend responde en `3001`.
- [ ] `GET /api/health` responde `200`.
- [ ] `market_v1` esta accesible.
- [ ] `pedidos` contiene registros reales.

#### 3.2 Autenticacion

- [ ] El login del panel funciona.
- [ ] El token de sesion es valido.
- [ ] No aparece `401`.
- [ ] No aparece `403`.
- [ ] No aparece `Token invalido o expirado`.

#### 3.3 UI / Navegacion

- [ ] El panel abre sin recarga manual adicional.
- [ ] El boton `Refrescar` responde.
- [ ] No quedan secciones permanentes en `Cargando...`.
- [ ] No quedan errores JS visibles en consola.

### 4. Checklist por panel

#### 4.1 CRM Basico

- [ ] `Clientes totales` es mayor que `0`.
- [ ] `Clientes recurrentes` refleja historial real.
- [ ] `Comercios totales` es mayor que `0`.
- [ ] Las fichas de cliente muestran datos reales.
- [ ] Las fichas de comercio muestran datos reales.
- [ ] `Estado CRM` termina en `SSOT VALIDADA` o equivalente estable.

#### 4.2 Dashboard Operativo

- [ ] El snapshot responde `200`.
- [ ] `audit`, `metrics`, `finance` y `marketplace` se cargan.
- [ ] El estado general no queda en pendiente.
- [ ] La lectura operativa muestra valores coherentes.

#### 4.3 Dashboard Comercial

- [ ] `C4` visible.
- [ ] `C5` visible.
- [ ] KPIs cargados.
- [ ] No hay discrepancias con la SSOT.

#### 4.4 Panel Admin

- [ ] Acceso valido.
- [ ] Repartidores visibles.
- [ ] Pedidos visibles.
- [ ] Formularios operativos.
- [ ] Sin errores de autenticacion.

### 5. Criterio de aprobacion

La certificacion se considera aprobada cuando:

- todos los paneles abren;
- la autenticacion funciona;
- los endpoints responden `200`;
- los datos visibles coinciden con la SSOT;
- no existen bloqueos permanentes de carga;
- no hay errores criticos en consola.

### 6. Criterio de rechazo

La certificacion se rechaza si cualquiera de estas condiciones persiste:

- `Pending` indefinido;
- `401/403` recurrente;
- `AbortController` involuntario;
- contadores en cero cuando la SSOT tiene datos;
- consola con errores bloqueantes;
- panel en estado `Cargando...` permanente.

### 7. Uso recomendado

Ejecutar esta checklist:

- antes de iniciar la Jornada 001;
- antes de un despliegue sensible;
- despues de tocar autenticacion, backend o proyecciones;
- despues de actualizar la SSOT o la semilla de datos.

