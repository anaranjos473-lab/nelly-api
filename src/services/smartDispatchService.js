function toNumberSafe(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function firstNumber(...values) {
  for (const value of values) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function firstFiniteNumber(...values) {
  for (const value of values) {
    if (value === undefined || value === null || value === '') continue;
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function firstPositiveNumber(...values) {
  for (const value of values) {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

function firstBoolean(...values) {
  for (const value of values) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', 'si', 'sí', '1', 'yes'].includes(normalized)) return true;
      if (['false', 'no', '0'].includes(normalized)) return false;
    }
    if (typeof value === 'number') return value > 0;
  }
  return false;
}

export function obtenerMontoPedido(pedido = {}) {
  return firstNumber(
    pedido.monto,
    pedido.monto_total,
    pedido.total,
    pedido.total_pedido,
    pedido.cobro_efectivo,
    pedido.monto_cliente
  );
}

export function obtenerBilleteraGuerra(driver = {}) {
  const capitalDisponible = firstFiniteNumber(
    driver.billetera?.capital_disponible,
    driver.billetera?.efectivo_disponible,
    driver.finanzas?.capital_disponible,
    driver.finanzas?.efectivo_disponible
  );
  if (capitalDisponible !== null) return capitalDisponible;

  const billeteraTotal = firstNumber(
    driver.billetera_guerra,
    driver.billetera?.billetera_guerra,
    driver.finanzas?.billetera_guerra,
    driver.perfil?.billetera_guerra
  );
  const capitalReservado = firstFiniteNumber(
    driver.capital_reservado,
    driver.billetera?.capital_reservado,
    driver.finanzas?.capital_reservado
  ) || 0;

  return Math.max(0, billeteraTotal - capitalReservado);
}

export function obtenerCapitalReservado(driver = {}) {
  return firstNumber(
    driver.capital_reservado,
    driver.billetera?.capital_reservado,
    driver.finanzas?.capital_reservado
  );
}

export function obtenerEquipamiento(driver = {}) {
  const equipamiento = driver.equipamiento || driver.perfil?.equipamiento || {};
  const perfil = driver.perfil || {};
  return {
    caja_grande: firstBoolean(equipamiento.caja_grande, perfil.caja_grande, driver.caja_grande),
    tensor: firstBoolean(equipamiento.tensor, perfil.tensor, driver.tensor),
    mochila_termica: firstBoolean(equipamiento.mochila_termica, perfil.mochila_termica, driver.mochila_termica)
  };
}

export function obtenerRequisitosPedido(pedido = {}) {
  const requisitos = pedido.requisitos || pedido.requisitos_logisticos || {};
  return {
    caja_grande: firstBoolean(requisitos.caja_grande, pedido.requiere_caja_grande),
    tensor: firstBoolean(requisitos.tensor, pedido.requiere_tensor),
    mochila_termica: firstBoolean(requisitos.mochila_termica, pedido.requiere_mochila_termica)
  };
}

function obtenerPunto(...candidatos) {
  for (const candidato of candidatos) {
    if (!candidato || typeof candidato !== 'object') continue;

    const lat = firstNumber(
      candidato.lat,
      candidato.latitude,
      candidato.latitud,
      candidato.lat_cliente,
      candidato.cliente_lat,
      candidato.latTienda,
      candidato.lat_tienda
    );
    const lng = firstNumber(
      candidato.lng,
      candidato.lon,
      candidato.longitude,
      candidato.longitud,
      candidato.lng_cliente,
      candidato.cliente_lng,
      candidato.lon_cliente,
      candidato.lngTienda,
      candidato.lng_tienda,
      candidato.lonTienda,
      candidato.lon_tienda
    );

    if (Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)) {
      return { lat, lng };
    }
  }
  return null;
}

export function obtenerUbicacionPedido(pedido = {}) {
  return obtenerPunto(
    pedido.origen,
    pedido.recoleccion,
    pedido.tienda,
    pedido.restaurante,
    pedido.comercio,
    pedido.logistica?.origen,
    pedido.logistica?.recoleccion,
    pedido.cliente?.coords,
    pedido.cliente?.ubicacion,
    pedido.destino,
    pedido
  );
}

export function obtenerUbicacionDriver(driver = {}) {
  return obtenerPunto(
    driver.ubicacion,
    driver.currentLocation,
    driver.location,
    driver.posicion,
    driver.perfil?.ubicacion,
    driver
  );
}

export function obtenerRadioMaximoKm(pedido = {}) {
  const requisitos = pedido.requisitos || pedido.requisitos_logisticos || {};
  return firstPositiveNumber(
    pedido.maxDistanceKm,
    pedido.max_distance_km,
    pedido.radio_km,
    pedido.radioKm,
    pedido.logistica?.maxDistanceKm,
    pedido.logistica?.max_distance_km,
    pedido.logistica?.radio_km,
    pedido.logistica?.radioKm,
    requisitos.maxDistanceKm,
    requisitos.max_distance_km,
    requisitos.radio_km,
    requisitos.radioKm
  );
}

export function calcularDistanciaKm(origen, destino) {
  if (!origen || !destino) return null;

  const radioTierraKm = 6371;
  const lat1 = origen.lat * Math.PI / 180;
  const lat2 = destino.lat * Math.PI / 180;
  const deltaLat = (destino.lat - origen.lat) * Math.PI / 180;
  const deltaLng = (destino.lng - origen.lng) * Math.PI / 180;
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return radioTierraKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function evaluarElegibilidadPedido(pedido = {}, driver = {}) {
  const montoPedido = obtenerMontoPedido(pedido);
  const billeteraGuerra = obtenerBilleteraGuerra(driver);
  const requisitos = obtenerRequisitosPedido(pedido);
  const equipamiento = obtenerEquipamiento(driver);
  const maxDistanceKm = obtenerRadioMaximoKm(pedido);
  const ubicacionPedido = obtenerUbicacionPedido(pedido);
  const ubicacionDriver = obtenerUbicacionDriver(driver);
  const distanciaKm = maxDistanceKm > 0 ? calcularDistanciaKm(ubicacionPedido, ubicacionDriver) : null;
  const faltantes = [];

  if (montoPedido > 0 && billeteraGuerra < montoPedido) {
    faltantes.push('billetera_guerra');
  }

  Object.entries(requisitos).forEach(([campo, requerido]) => {
    if (requerido && !equipamiento[campo]) {
      faltantes.push(campo);
    }
  });

  if (maxDistanceKm > 0) {
    if (distanciaKm == null) {
      faltantes.push('ubicacion');
    } else if (distanciaKm > maxDistanceKm) {
      faltantes.push('radio_km');
    }
  }

  const equipamientoRequerido = Object.values(requisitos).filter(Boolean).length;
  const equipamientoCubierto = Object.entries(requisitos)
    .filter(([, requerido]) => requerido)
    .filter(([campo]) => equipamiento[campo]).length;
  const scoreCapital = montoPedido <= 0 || billeteraGuerra >= montoPedido ? 40 : 0;
  const scoreDistancia = maxDistanceKm <= 0 || distanciaKm == null
    ? 0
    : (distanciaKm < 2 ? 30 : (distanciaKm <= maxDistanceKm ? 15 : 0));
  const scoreEquipamiento = equipamientoRequerido === 0
    ? 20
    : Math.round((equipamientoCubierto / equipamientoRequerido) * 20);
  const scoreRechazos = firstNumber(driver.rechazos_recientes, driver.metricas?.rechazos_recientes) > 0 ? 0 : 10;
  const dispatchScore = Math.max(0, Math.min(100, scoreCapital + scoreDistancia + scoreEquipamiento + scoreRechazos));

  return {
    ok: faltantes.length === 0,
    faltantes,
    dispatchScore,
    montoPedido: toNumberSafe(montoPedido),
    billeteraGuerra: toNumberSafe(billeteraGuerra),
    capitalReservado: toNumberSafe(obtenerCapitalReservado(driver)),
    maxDistanceKm: toNumberSafe(maxDistanceKm),
    distanciaKm: distanciaKm == null ? null : toNumberSafe(Number(distanciaKm.toFixed(3))),
    requisitos,
    equipamiento
  };
}
