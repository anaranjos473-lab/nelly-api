function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateRestaurantCommission(orderTotal, margin, policy) {
  const total = Number(orderTotal);
  const m = Number(margin);

  if (!Number.isFinite(total) || total < 0) {
    throw new Error("order_total_invalido");
  }

  if (!policy || typeof policy.minMargin !== "number" || typeof policy.maxMargin !== "number") {
    throw new Error("policy_invalida");
  }

  if (m < policy.minMargin || m > policy.maxMargin) {
    throw new Error("margin_fuera_de_rango");
  }

  const commission = round2(total * m);
  return {
    orderTotal: round2(total),
    margin: m,
    commission
  };
}

export function calculateDriverSettlement(input, policy) {
  const orderTotal = Number(input?.orderTotal ?? 0);
  const restaurantMargin = Number(input?.restaurantMargin ?? 0);
  const driverBase = Number(input?.driverBase ?? 0);
  const adjustments = Number(input?.adjustments ?? 0);

  const commissionResult = calculateRestaurantCommission(orderTotal, restaurantMargin, policy);
  const platformNet = round2(orderTotal - commissionResult.commission);
  const driverSettlement = round2(platformNet + driverBase + adjustments);

  return {
    orderTotal: round2(orderTotal),
    restaurantCommission: commissionResult.commission,
    platformNet,
    driverSettlement
  };
}

export default {
  calculateRestaurantCommission,
  calculateDriverSettlement
};
