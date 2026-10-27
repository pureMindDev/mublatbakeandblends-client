/**
 * Frontend mirror of server/utils/delivery.js — the SINGLE place the
 * storefront decides which delivery charge applies and what the policy says.
 * The server recalculates every order independently, so this is for display;
 * if a rule or price changes, change BOTH files (and the tests).
 */

export const DELIVERY_RULES = Object.freeze({
  standardFee: 7.99,
  largeFee: 9.99,
  maxPastriesStandard: 30,
  maxDrinksStandard: 6,
});

const toCount = (n) => {
  const v = Math.floor(Number(n));
  return Number.isFinite(v) && v > 0 ? v : 0;
};

/** @returns {{fee:number, tier:"none"|"pickup"|"standard"|"large"}} */
export function calculateDelivery({ method, pastryCount, drinkCount, hasItems = true }) {
  if (!hasItems) return { fee: 0, tier: "none" };
  if (String(method || "").toLowerCase() !== "delivery") return { fee: 0, tier: "pickup" };

  const isLarge =
    toCount(pastryCount) > DELIVERY_RULES.maxPastriesStandard ||
    toCount(drinkCount) > DELIVERY_RULES.maxDrinksStandard;

  return isLarge
    ? { fee: DELIVERY_RULES.largeFee, tier: "large" }
    : { fee: DELIVERY_RULES.standardFee, tier: "standard" };
}

/** Pastry pieces / drink bottles in a cart (cart lines carry category + units). */
export function countCartUnits(cartItems = []) {
  let pastryUnits = 0;
  let drinkUnits = 0;
  for (const i of cartItems) {
    const pieces = toCount(i.quantity) * (toCount(i.units) || 1);
    if (i.category === "Pastries") pastryUnits += pieces;
    else if (i.category === "Drinks") drinkUnits += pieces;
  }
  return { pastryUnits, drinkUnits };
}

/** Local (instant) estimate of a basket; the server quote confirms it. */
export function estimateBasket(cartItems, method) {
  const { pastryUnits, drinkUnits } = countCartUnits(cartItems);
  const subtotalPence = cartItems.reduce(
    (t, i) => t + Math.round(Number(i.price) * 100) * toCount(i.quantity), 0
  );
  const d = calculateDelivery({
    method, pastryCount: pastryUnits, drinkCount: drinkUnits, hasItems: cartItems.length > 0,
  });
  return {
    subtotal: subtotalPence / 100,
    pastryUnits, drinkUnits,
    deliveryFee: d.fee,
    deliveryTier: d.tier,
    totalAmount: (subtotalPence + Math.round(d.fee * 100)) / 100,
  };
}

export const TIER_LABELS = {
  standard: "Standard Delivery",
  large: "Large Order Delivery",
  pickup: "Pickup",
  none: "",
};

export const tierLabel = (tier) => TIER_LABELS[tier] || "";

/* ── Client-provided policy wording (keep verbatim) ───────────────────────── */
export const DELIVERY_POLICY = {
  title: "Mublat Bakes & Blends — Delivery Charges",
  intro: "We deliver our delicious pastries and refreshing drinks across the UK!",
  standard: {
    heading: "Standard Delivery — £7.99",
    lead: "For orders containing:",
    points: [
      "Up to 30 pieces of pastries, such as meat pies, fish rolls, puff puff, spring rolls and samosas.",
      "Up to 6 bottles of drinks, including 500ml bottles.",
    ],
  },
  large: {
    heading: "Large Order Delivery — £9.99",
    lead: "For orders containing:",
    points: [
      "More than 30 pieces of pastries, for example, 40 meat pies.",
      "More than 6 bottles of drinks, for example, 12 bottles of 500ml drinks.",
    ],
  },
  note: "Delivery charges depend on the total quantity of products ordered. We will confirm the applicable delivery charge at checkout.",
  thanks: "Thank you for choosing Mublat Bakes & Blends!",
};
