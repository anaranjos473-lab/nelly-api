import { validateOrder } from '../domain/contracts/order.js';

function normalizeMarketplaceListing(listing = {}) {
  return {
    ...listing,
    price: Number(listing.price ?? 0),
    active: listing.active !== false
  };
}

function buildMarketplaceProjection({ listings = [], orders = [] } = {}) {
  const normalizedListings = listings.map(normalizeMarketplaceListing);
  const listingValidation = normalizedListings.map((listing) => ({
    id: listing.id,
    ok: Boolean(listing.id && listing.seller_id && listing.sku)
  }));
  const orderValidation = orders.map((order) => ({
    id: order.id,
    validation: validateOrder({
      id: order.id,
      cliente: order.cliente || { id: order.cliente_id || 'unknown' },
      lineas: Array.isArray(order.lineas) ? order.lineas : [],
      estado: order.estado || 'CREADO',
      created_at: order.created_at || Date.now(),
      updated_at: order.updated_at || Date.now(),
      metadata: order.metadata || {}
    })
  }));

  const ok = listingValidation.every((entry) => entry.ok) && orderValidation.every((entry) => entry.validation.ok);

  return {
    ok,
    listings: normalizedListings,
    orders,
    validation: {
      listings: listingValidation,
      orders: orderValidation
    }
  };
}

export {
  normalizeMarketplaceListing,
  buildMarketplaceProjection
};
