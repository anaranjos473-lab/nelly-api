function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value;
  }

  Object.freeze(value);
  for (const nested of Object.values(value)) {
    freezeDeep(nested);
  }
  return value;
}

function buildContract(name, version, entity, requiredFields, optionalFields = [], derivedFields = [], states = []) {
  return freezeDeep({
    name,
    version,
    entity,
    requiredFields: [...requiredFields],
    optionalFields: [...optionalFields],
    derivedFields: [...derivedFields],
    states: [...states]
  });
}

function validateRequiredFields(contract, value = {}) {
  const missing = contract.requiredFields.filter((field) => {
    const candidate = value[field];
    return candidate === undefined || candidate === null || candidate === '';
  });
  return {
    ok: missing.length === 0,
    missing
  };
}

export { buildContract, freezeDeep, validateRequiredFields };
