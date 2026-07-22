import { normalizeState } from '../domain/stateMachine.js';
import { ORDER_CONTRACT, validateOrder } from '../domain/contracts/order.js';
import { ORDER_STATES } from '../domain/index.js';

const ESTADOS = new Set([
  ORDER_STATES.PENDIENTE,
  'COCINA',
  ORDER_STATES.LISTO,
  ORDER_STATES.EN_CURSO,
  ORDER_STATES.ENTREGADO,
  ORDER_STATES.CANCELADO
]);
const FASES = new Set(['ASIGNADO', 'EN_RUTA_TIENDA', 'EN_TIENDA', 'COMPRA_EN_CURSO', 'EN_RUTA_CLIENTE', 'EN_CLIENTE']);
const PRODUCTORES = new Set(['admin_dashboard', 'api_ordenes', 'panel_cocina', 'api_import', 'cloud_function', 'script_interno']);
const METODOS_PAGO = new Set(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO']);
const ESTADOS_PAGO = new Set(['PENDIENTE', 'PAGADO', 'REEMBOLSADO', 'FALLIDO']);
const EVENTOS = new Set([
  'PEDIDO_CREADO', 'COCINA_ACEPTO', 'PEDIDO_LISTO', 'REPARTIDOR_ACEPTO',
  'RUTA_TIENDA_INICIADA', 'LLEGADA_TIENDA', 'COMPRA_INICIADA', 'PEDIDO_ABORDO',
  'LLEGADA_CLIENTE', 'EVIDENCIA_CAPTURADA', 'PEDIDO_ENTREGADO',
  'CANCELACION_SOLICITADA', 'PEDIDO_CANCELADO'
]);

const TRANSICIONES = new Map([
  [null, new Set([ORDER_STATES.PENDIENTE])],
  [ORDER_STATES.PENDIENTE, new Set(['COCINA', ORDER_STATES.CANCELADO])],
  ['COCINA', new Set(['LISTO', 'CANCELADO'])],
  [ORDER_STATES.LISTO, new Set([ORDER_STATES.EN_CURSO, ORDER_STATES.CANCELADO])],
  [ORDER_STATES.EN_CURSO, new Set([ORDER_STATES.ENTREGADO, ORDER_STATES.CANCELADO])],
  [ORDER_STATES.ENTREGADO, new Set()],
  [ORDER_STATES.CANCELADO, new Set()]
]);

const ALIASES = new Map([
  ['id_pedido', 'id'],
  ['pedido_id', 'id'],
  ['shortId', 'short_id'],
  ['version_contrato', 'contract_version'],
  ['versionContrato', 'contract_version'],
  ['origen', 'producer'],
  ['fuente_origen', 'producer'],
  ['createdAt', 'fecha_creacion'],
  ['created_at', 'fecha_creacion'],
  ['timestampCreacion', 'fecha_creacion'],
  ['cliente_nombre', 'cliente.nombre'],
  ['cliente_direccion', 'cliente.direccion'],
  ['telefono', 'cliente.telefono'],
  ['latCliente', 'cliente.ubicacion.lat'],
  ['lngCliente', 'cliente.ubicacion.lng'],
  ['cliente_lat', 'cliente.ubicacion.lat'],
  ['cliente_lng', 'cliente.ubicacion.lng'],
  ['lat_cliente', 'cliente.ubicacion.lat'],
  ['lng_cliente', 'cliente.ubicacion.lng'],
  ['cliente.coords', 'cliente.ubicacion'],
  ['tienda_nombre', 'tienda.nombre'],
  ['tienda_direccion', 'tienda.direccion'],
  ['latTienda', 'tienda.ubicacion.lat'],
  ['lngTienda', 'tienda.ubicacion.lng'],
  ['tienda_lat', 'tienda.ubicacion.lat'],
  ['tienda_lng', 'tienda.ubicacion.lng'],
  ['lat_tienda', 'tienda.ubicacion.lat'],
  ['lng_tienda', 'tienda.ubicacion.lng'],
  ['tienda.coords', 'tienda.ubicacion'],
  ['monto', 'pago.total_centavos'],
  ['total', 'pago.total_centavos'],
  ['monto_total', 'pago.total_centavos'],
  ['estado_pedido', 'estado'],
  ['fase_panel', 'logistica.fase_operativa'],
  ['repartidor_id', 'logistica.repartidor_uid'],
  ['repartidorId', 'logistica.repartidor_uid'],
  ['conductorId', 'logistica.repartidor_uid'],
  ['driverUid', 'logistica.repartidor_uid'],
  ['uid_repartidor', 'logistica.repartidor_uid'],
  ['idConductor', 'logistica.repartidor_uid'],
  ['logistica.estado', 'estado'],
  ['logistica.repartidor_id', 'logistica.repartidor_uid'],
  ['evidencia_url', 'evidencia.url'],
  ['evidencia_tipo', 'evidencia.tipo'],
  ['evidencia_fallback', 'evidencia.fallback'],
  ['fotoEvidencia', 'evidencia.url']
]);

function esObjeto(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function tieneRuta(value, path) {
  const parts = String(path).split('.');
  let current = value;
  for (const part of parts) {
    if (!esObjeto(current) || !Object.prototype.hasOwnProperty.call(current, part)) return false;
    current = current[part];
  }
  return true;
}

function valorRuta(value, path) {
  return String(path).split('.').reduce((current, part) => (
    esObjeto(current) || Array.isArray(current) ? current?.[part] : undefined
  ), value);
}

function cadenaValida(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function enteroNoNegativo(value) {
  return Number.isInteger(value) && value >= 0;
}

function coordenadaValida(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng)
    && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
    && !(lat === 0 && lng === 0);
}

function transicionValida(desde, hacia) {
  if (desde === hacia) return true;
  return TRANSICIONES.get(desde ?? null)?.has(hacia) === true;
}

function pushError(errors, code, path, message) {
  errors.push({ code, path, message });
}

function validarClaves(value, allowed, path, errors) {
  if (!esObjeto(value)) return;
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) pushError(errors, 'CAMPO_DESCONOCIDO', path ? `${path}.${key}` : key, 'campo no definido por V2');
  }
}

function exigirCadena(order, errors, path) {
  if (!cadenaValida(valorRuta(order, path))) {
    pushError(errors, 'CAMPO_REQUERIDO', path, `${path} debe ser una cadena no vacía`);
  }
}

function exigirEntero(order, errors, path, { min = 0 } = {}) {
  const value = valorRuta(order, path);
  if (!Number.isInteger(value) || value < min) {
    pushError(errors, 'TIPO_INVALIDO', path, `${path} debe ser un entero mayor o igual a ${min}`);
  }
}

function validarHistorial(historial, estadoActual, errors) {
  if (!esObjeto(historial)) {
    pushError(errors, 'TIPO_INVALIDO', 'historial', 'historial debe ser un objeto append-only');
    return;
  }

  const eventos = Object.entries(historial);
  if (eventos.length === 0) {
    pushError(errors, 'HISTORIAL_VACIO', 'historial', 'un pedido V2 persistido debe incluir PEDIDO_CREADO');
    return;
  }

  const ordenados = eventos.sort(([, a], [, b]) => {
    const ta = Number(a?.registrado_en ?? a?.ocurrido_en ?? 0);
    const tb = Number(b?.registrado_en ?? b?.ocurrido_en ?? 0);
    return ta - tb;
  });

  let ultimoEstado = null;
  let ultimaFase = null;
  const idempotencyKeys = new Set();
  for (const [key, evento] of ordenados) {
    const basePath = `historial.${key}`;
    if (!esObjeto(evento)) {
      pushError(errors, 'EVENTO_INVALIDO', basePath, 'el evento debe ser un objeto');
      continue;
    }
    if (!cadenaValida(evento.id) || evento.id !== key) {
      pushError(errors, 'EVENTO_INVALIDO', `${basePath}.id`, 'el id del evento debe coincidir con su llave');
    }
    if (!EVENTOS.has(evento.tipo)) pushError(errors, 'EVENTO_INVALIDO', `${basePath}.tipo`, 'tipo de evento no permitido');
    if (!cadenaValida(evento.idempotency_key)) {
      pushError(errors, 'EVENTO_INVALIDO', `${basePath}.idempotency_key`, 'idempotency_key es obligatoria');
    } else if (idempotencyKeys.has(evento.idempotency_key)) {
      pushError(errors, 'IDEMPOTENCIA_DUPLICADA', `${basePath}.idempotency_key`, 'idempotency_key ya existe en el historial');
    } else {
      idempotencyKeys.add(evento.idempotency_key);
    }
    if (!Number.isInteger(evento.ocurrido_en)) pushError(errors, 'EVENTO_INVALIDO', `${basePath}.ocurrido_en`, 'ocurrido_en debe ser entero UTC');
    if (!Number.isInteger(evento.registrado_en)) pushError(errors, 'EVENTO_INVALIDO', `${basePath}.registrado_en`, 'registrado_en debe ser entero UTC');
    if (Number.isInteger(evento.ocurrido_en) && Number.isInteger(evento.registrado_en) && evento.ocurrido_en > evento.registrado_en) {
      pushError(errors, 'EVENTO_INVALIDO', `${basePath}.ocurrido_en`, 'ocurrido_en no puede ser posterior a registrado_en');
    }
    if (!esObjeto(evento.actor) || !cadenaValida(evento.actor.tipo) || !cadenaValida(evento.actor.uid)) {
      pushError(errors, 'EVENTO_INVALIDO', `${basePath}.actor`, 'actor tipo/uid es obligatorio');
    }

    const anterior = evento.estado_anterior ?? null;
    const nuevo = evento.estado_nuevo;
    if (anterior !== null && !ESTADOS.has(anterior)) pushError(errors, 'ESTADO_INVALIDO', `${basePath}.estado_anterior`, 'estado anterior no permitido');
    if (!ESTADOS.has(nuevo)) pushError(errors, 'ESTADO_INVALIDO', `${basePath}.estado_nuevo`, 'estado nuevo no permitido');
    if (ultimoEstado !== anterior) {
      pushError(errors, 'HISTORIAL_INCONSISTENTE', `${basePath}.estado_anterior`, 'no coincide con la transición anterior');
    }
    if (!transicionValida(anterior, nuevo)) {
      pushError(errors, 'TRANSICION_INVALIDA', `${basePath}.estado_nuevo`, `${anterior ?? 'INEXISTENTE'} -> ${nuevo} no está permitida`);
    }
    const faseAnterior = evento.fase_anterior ?? null;
    const faseNueva = evento.fase_nueva ?? null;
    if (faseAnterior !== null && !FASES.has(faseAnterior)) pushError(errors, 'FASE_INVALIDA', `${basePath}.fase_anterior`, 'fase anterior no permitida');
    if (faseNueva !== null && !FASES.has(faseNueva)) pushError(errors, 'FASE_INVALIDA', `${basePath}.fase_nueva`, 'fase nueva no permitida');
    if (ultimaFase !== faseAnterior) pushError(errors, 'HISTORIAL_INCONSISTENTE', `${basePath}.fase_anterior`, 'no coincide con la fase anterior del historial');
    ultimoEstado = nuevo;
    ultimaFase = faseNueva;
  }

  if (ultimoEstado !== estadoActual) {
    pushError(errors, 'HISTORIAL_INCONSISTENTE', 'estado', 'estado no coincide con la última transición del historial');
  }
  return ultimaFase;
}

function validateCanonicalShadowOrder(order, { key = null, previousState = undefined } = {}) {
  const canonical = esObjeto(order)
    ? {
        ...order,
        estado: normalizeState(order.estado || order.estado_pedido),
        contract_version: order.contract_version || 1,
        lineas: Array.isArray(order.lineas) ? order.lineas : (Array.isArray(order.items) ? order.items : [])
      }
    : {};

  const validation = validateOrder({
    id: canonical.id || key || null,
    cliente: canonical.cliente || {
      id: canonical.userId || canonical.producer || 'unknown',
      uid: canonical.userId || canonical.producer || 'unknown'
    },
    lineas: canonical.lineas,
    estado: canonical.estado || 'CREADO',
    created_at: canonical.created_at || canonical.fecha_creacion || Date.now(),
    updated_at: canonical.updated_at || canonical.fecha_creacion || Date.now(),
    metadata: canonical.metadata || {}
  });

  return {
    ok: validation.ok,
    contract: ORDER_CONTRACT,
    missing: validation.missing || [],
    key,
    previousState,
    canonical
  };
}

export function validateOrderV2(order, { key = null, previousState = undefined } = {}) {
  const errors = [];
  const aliasesUsed = [];
  const value = esObjeto(order) ? order : {};
  const isV2 = value.contract_version === 2;

  if (isV2) {
    validarClaves(value, new Set(['id', 'short_id', 'producer', 'contract_version', 'fecha_creacion', 'cliente', 'tienda', 'items', 'pago', 'estado', 'logistica', 'evidencia', 'historial']), '', errors);
    validarClaves(value.cliente, new Set(['nombre', 'telefono', 'direccion', 'referencias', 'ubicacion']), 'cliente', errors);
    validarClaves(value.cliente?.ubicacion, new Set(['lat', 'lng']), 'cliente.ubicacion', errors);
    validarClaves(value.tienda, new Set(['id', 'nombre', 'direccion', 'ubicacion']), 'tienda', errors);
    validarClaves(value.tienda?.ubicacion, new Set(['lat', 'lng']), 'tienda.ubicacion', errors);
    validarClaves(value.pago, new Set(['moneda', 'subtotal_centavos', 'envio_centavos', 'propina_centavos', 'total_centavos', 'metodo', 'estado']), 'pago', errors);
    validarClaves(value.logistica, new Set(['fase_operativa', 'repartidor_uid', 'asignacion_activa']), 'logistica', errors);
    validarClaves(value.evidencia, new Set(['tipo', 'url', 'fallback', 'mime', 'timestamp']), 'evidencia', errors);
  }

  for (const [alias, canonical] of ALIASES) {
    if (tieneRuta(value, alias)) aliasesUsed.push({ alias, canonical });
  }

  exigirCadena(value, errors, 'id');
  if (key && value.id !== key) pushError(errors, 'ID_INCONSISTENTE', 'id', 'id debe coincidir con la llave RTDB');
  exigirCadena(value, errors, 'short_id');
  exigirCadena(value, errors, 'producer');
  if (!PRODUCTORES.has(value.producer)) pushError(errors, 'PRODUCTOR_INVALIDO', 'producer', 'producer no está registrado');
  if (value.contract_version !== 2) pushError(errors, 'VERSION_INVALIDA', 'contract_version', 'contract_version debe ser 2');
  exigirEntero(value, errors, 'fecha_creacion', { min: 1 });

  for (const path of [
    'cliente.nombre', 'cliente.telefono', 'cliente.direccion', 'cliente.referencias',
    'tienda.id', 'tienda.nombre', 'tienda.direccion'
  ]) exigirCadena(value, errors, path);

  const clienteLat = valorRuta(value, 'cliente.ubicacion.lat');
  const clienteLng = valorRuta(value, 'cliente.ubicacion.lng');
  if (!coordenadaValida(clienteLat, clienteLng)) pushError(errors, 'COORDENADAS_INVALIDAS', 'cliente.ubicacion', 'ubicación del cliente no es operativa');
  const tiendaLat = valorRuta(value, 'tienda.ubicacion.lat');
  const tiendaLng = valorRuta(value, 'tienda.ubicacion.lng');
  if (!coordenadaValida(tiendaLat, tiendaLng)) pushError(errors, 'COORDENADAS_INVALIDAS', 'tienda.ubicacion', 'ubicación de la tienda no es operativa');

  if (!Array.isArray(value.items) || value.items.length === 0) {
    pushError(errors, 'ITEMS_INVALIDOS', 'items', 'items debe contener al menos un elemento');
  } else {
    value.items.forEach((item, index) => {
      const path = `items.${index}`;
      if (!cadenaValida(item?.nombre)) pushError(errors, 'ITEM_INVALIDO', `${path}.nombre`, 'nombre es obligatorio');
      if (!Number.isInteger(item?.cantidad) || item.cantidad < 1) pushError(errors, 'ITEM_INVALIDO', `${path}.cantidad`, 'cantidad debe ser entero >= 1');
      if (!enteroNoNegativo(item?.precio_unitario_centavos)) pushError(errors, 'ITEM_INVALIDO', `${path}.precio_unitario_centavos`, 'precio debe ser entero no negativo');
      if (!Array.isArray(item?.extras)) pushError(errors, 'ITEM_INVALIDO', `${path}.extras`, 'extras debe ser un array');
    });
  }

  if (valorRuta(value, 'pago.moneda') !== 'MXN') pushError(errors, 'PAGO_INVALIDO', 'pago.moneda', 'moneda debe ser MXN');
  for (const path of ['pago.subtotal_centavos', 'pago.envio_centavos', 'pago.propina_centavos', 'pago.total_centavos']) {
    exigirEntero(value, errors, path);
  }
  if (!METODOS_PAGO.has(valorRuta(value, 'pago.metodo'))) pushError(errors, 'PAGO_INVALIDO', 'pago.metodo', 'método de pago no permitido');
  if (!ESTADOS_PAGO.has(valorRuta(value, 'pago.estado'))) pushError(errors, 'PAGO_INVALIDO', 'pago.estado', 'estado de pago no permitido');
  const subtotal = valorRuta(value, 'pago.subtotal_centavos');
  const envio = valorRuta(value, 'pago.envio_centavos');
  const propina = valorRuta(value, 'pago.propina_centavos');
  const total = valorRuta(value, 'pago.total_centavos');
  if ([subtotal, envio, propina, total].every(Number.isInteger) && subtotal + envio + propina !== total) {
    pushError(errors, 'TOTAL_INCONSISTENTE', 'pago.total_centavos', 'subtotal + envío + propina debe ser igual al total');
  }

  if (!ESTADOS.has(value.estado)) pushError(errors, 'ESTADO_INVALIDO', 'estado', 'estado comercial no permitido');
  if (!esObjeto(value.logistica)) pushError(errors, 'TIPO_INVALIDO', 'logistica', 'logistica debe ser un objeto');
  const fase = valorRuta(value, 'logistica.fase_operativa');
  const uid = valorRuta(value, 'logistica.repartidor_uid');
  const activa = valorRuta(value, 'logistica.asignacion_activa');
  if (value.estado === ORDER_STATES.EN_CURSO) {
    if (!FASES.has(fase)) pushError(errors, 'FASE_INVALIDA', 'logistica.fase_operativa', 'EN_CURSO requiere fase operativa válida');
    if (!cadenaValida(uid)) pushError(errors, 'ASIGNACION_INVALIDA', 'logistica.repartidor_uid', 'EN_CURSO requiere repartidor_uid');
    if (activa !== true) pushError(errors, 'ASIGNACION_INVALIDA', 'logistica.asignacion_activa', 'EN_CURSO requiere asignación activa');
  } else {
    if (fase !== null) pushError(errors, 'FASE_INVALIDA', 'logistica.fase_operativa', 'fuera de EN_CURSO la fase debe ser null');
    if (activa !== false) pushError(errors, 'ASIGNACION_INVALIDA', 'logistica.asignacion_activa', 'fuera de EN_CURSO la asignación debe ser false');
  }

  if (!esObjeto(value.evidencia)) {
    pushError(errors, 'TIPO_INVALIDO', 'evidencia', 'evidencia debe ser un objeto');
  } else {
    for (const field of ['tipo', 'url', 'fallback', 'mime', 'timestamp']) {
      if (!Object.prototype.hasOwnProperty.call(value.evidencia, field)) pushError(errors, 'CAMPO_REQUERIDO', `evidencia.${field}`, 'campo de evidencia obligatorio');
    }
    if (typeof value.evidencia.fallback !== 'boolean') pushError(errors, 'TIPO_INVALIDO', 'evidencia.fallback', 'fallback debe ser boolean');
    if (value.evidencia.tipo !== null && value.evidencia.tipo !== 'FOTO_ENTREGA') pushError(errors, 'EVIDENCIA_INVALIDA', 'evidencia.tipo', 'tipo de evidencia no permitido');
    if (value.evidencia.url !== null && !cadenaValida(value.evidencia.url)) pushError(errors, 'EVIDENCIA_INVALIDA', 'evidencia.url', 'url debe ser null o cadena no vacía');
    if (value.evidencia.mime !== null && !cadenaValida(value.evidencia.mime)) pushError(errors, 'EVIDENCIA_INVALIDA', 'evidencia.mime', 'mime debe ser null o cadena no vacía');
    if (value.evidencia.timestamp !== null && (!Number.isInteger(value.evidencia.timestamp) || value.evidencia.timestamp <= 0)) {
      pushError(errors, 'EVIDENCIA_INVALIDA', 'evidencia.timestamp', 'timestamp debe ser null o entero UTC positivo');
    }
    if (value.estado === ORDER_STATES.ENTREGADO) {
      if (value.evidencia.tipo !== 'FOTO_ENTREGA' || !cadenaValida(value.evidencia.url) || !cadenaValida(value.evidencia.mime) || !Number.isInteger(value.evidencia.timestamp)) {
        pushError(errors, 'EVIDENCIA_REQUERIDA', 'evidencia', 'ENTREGADO requiere evidencia completa');
      }
    }
  }

  const ultimaFaseHistorial = validarHistorial(value.historial, value.estado, errors);
  if (ultimaFaseHistorial !== undefined && ultimaFaseHistorial !== fase) {
    pushError(errors, 'HISTORIAL_INCONSISTENTE', 'logistica.fase_operativa', 'fase actual no coincide con el último evento');
  }

  if (previousState !== undefined && previousState !== value.estado && !transicionValida(previousState, value.estado)) {
    pushError(errors, 'TRANSICION_INVALIDA', 'estado', `${previousState ?? 'INEXISTENTE'} -> ${value.estado} no está permitida`);
  }

  if (isV2 && aliasesUsed.length > 0) {
    for (const alias of aliasesUsed) pushError(errors, 'ALIAS_PERSISTIDO', alias.alias, `usar ${alias.canonical} en V2`);
  }

  return {
    valid: errors.length === 0,
    isV2,
    errors,
    aliasesUsed
  };
}

export { validateCanonicalShadowOrder };

function increment(target, key, amount = 1) {
  target[key] = (target[key] || 0) + amount;
}

export function buildShadowMetrics(results, {
  validationRuns = 0,
  invalidTransitionEvents = 0,
  generatedAt = Date.now(),
  observationId = null
} = {}) {
  const values = results instanceof Map ? [...results.values()] : Object.values(results || {});
  const metrics = {
    observation_id: observationId,
    generated_at: generatedAt,
    total_orders: values.length,
    v2_orders: 0,
    valid_v2_orders: 0,
    invalid_orders: 0,
    orders_with_aliases: 0,
    validation_runs: validationRuns,
    invalid_transition_events: invalidTransitionEvents,
    by_producer: {},
    failures_by_code: {},
    aliases_used: {}
  };

  for (const entry of values) {
    const result = entry?.result || entry;
    const producer = entry?.producer || 'NO_DECLARADO';
    if (result?.isV2) metrics.v2_orders += 1;
    if (result?.isV2 && result?.valid) metrics.valid_v2_orders += 1;
    if (!result?.valid) metrics.invalid_orders += 1;
    if (result?.aliasesUsed?.length) metrics.orders_with_aliases += 1;
    increment(metrics.by_producer, producer);
    for (const error of result?.errors || []) increment(metrics.failures_by_code, error.code);
    for (const alias of result?.aliasesUsed || []) increment(metrics.aliases_used, alias.alias);
  }

  metrics.v2_percentage = metrics.total_orders > 0
    ? Number(((metrics.v2_orders / metrics.total_orders) * 100).toFixed(2))
    : 0;
  metrics.valid_v2_percentage = metrics.total_orders > 0
    ? Number(((metrics.valid_v2_orders / metrics.total_orders) * 100).toFixed(2))
    : 0;
  return metrics;
}

export const C5_V2_ALLOWED_STATES = Object.freeze([...ESTADOS]);
