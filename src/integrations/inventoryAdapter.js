import { validateInventoryItem } from '../domain/contracts/inventoryItem.js';

function normalizeInventoryItem(item = {}) {
  const total = Number(item.total ?? 0);
  const disponible = Number(item.disponible ?? 0);
  const reservado = Number(item.reservado ?? 0);

  return {
    ...item,
    total,
    disponible,
    reservado
  };
}

function buildInventoryProjection(items = []) {
  const normalizedItems = items.map(normalizeInventoryItem);
  const validation = normalizedItems.map((item) => ({
    id: item.id,
    validation: validateInventoryItem(item)
  }));
  const valid = validation.every((entry) => entry.validation.ok);

  const summary = normalizedItems.reduce((acc, item) => {
    acc.total += item.total;
    acc.disponible += item.disponible;
    acc.reservado += item.reservado;
    return acc;
  }, { total: 0, disponible: 0, reservado: 0 });

  return {
    ok: valid,
    summary,
    items: normalizedItems,
    validation
  };
}

export {
  normalizeInventoryItem,
  buildInventoryProjection
};
