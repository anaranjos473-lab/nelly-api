function normalizeOrderUpdateInput(input = {}) {
  const allowed = {};
  const maybeCopy = (key, mapper = (value) => value) => {
    if (Object.prototype.hasOwnProperty.call(input, key) && input[key] !== undefined) {
      allowed[key] = mapper(input[key]);
    }
  };

  maybeCopy('estado', (value) => String(value || '').trim().toUpperCase());
  maybeCopy('estado_pedido', (value) => String(value || '').trim().toUpperCase());
  maybeCopy('comision', (value) => Number(value));
  maybeCopy('tarifa_entrega', (value) => Number(value));
  maybeCopy('completion_type', (value) => String(value || '').trim().toLowerCase());
  maybeCopy('motivo_cierre', (value) => String(value || '').trim());
  maybeCopy('evidencia_url', (value) => String(value || '').trim());
  maybeCopy('evidencia_fallback', (value) => value === true);
  maybeCopy('evidencia_tipo', (value) => String(value || '').trim());
  maybeCopy('evidencia_mime', (value) => String(value || '').trim());
  maybeCopy('timestampActualizacion', (value) => Number(value));

  return allowed;
}

function buildOrderUpdateRecord(input = {}) {
  const normalized = normalizeOrderUpdateInput(input);
  return {
    ...normalized,
    updatedAt: Date.now()
  };
}

export {
  normalizeOrderUpdateInput,
  buildOrderUpdateRecord
};
