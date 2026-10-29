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
  newryFee: 3.5,
});

const toCount = (n) => {
  const v = Math.floor(Number(n));
  return Number.isFinite(v) && v > 0 ? v : 0;
};

/**
 * Pieces/bottles one unit of an option contains (mirror of the server's
 * optionUnits). Stored `units` > 1 wins; otherwise a pack size stated in the
 * label ("Trio Collection", "Box of 12", "6 pieces") is used.
 */
export const optionUnits = (option, category) => {
  const stored = toCount(option && option.units);
  if (stored > 1) return stored;
  if (category !== "Pastries" && category !== "Drinks") return Math.max(1, stored);
  const label = String((option && (option.label || option.name || option.optionName)) || "").toLowerCase();
  const m = label.match(/(?:box|pack|set|tray)\s+of\s+(\d+)/) || label.match(/(\d+)\s*[- ]?\s*(?:pieces?|pcs|pc|pack|box|bottles?)\b/);
  if (m) { const n = toCount(m[1]); if (n > 0 && n <= 500) return n; }
  if (/half[\s-]*dozen/.test(label)) return 6;
  if (/dozen/.test(label)) return 12;
  if (/trio/.test(label)) return 3;
  return Math.max(1, stored);
};


/* Newry special delivery area — exact mirror of server/utils/delivery.js.
 * Flat £3.50 when the town is Newry AND the postcode is BT34/BT35. The
 * server decides; this only drives the on-screen estimate. */
const NEWRY_POSTCODE = /^BT3[45]\d[A-Z]{2}$/;
const normalise = (s) =>
  String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

export function isNewryAddress(address) {
  const parts = String(address || "").split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return false;
  const postcode = parts[parts.length - 1].toUpperCase().replace(/\s+/g, "");
  if (!NEWRY_POSTCODE.test(postcode)) return false;
  const towns = parts.length === 2 ? [parts[0]] : parts.slice(1, -1);
  return towns.some((t) => ["newry", "newry city"].includes(normalise(t)));
}

/** @returns {{fee:number, tier:"none"|"pickup"|"newry"|"standard"|"large"}} */
export function calculateDelivery({ method, pastryCount, drinkCount, hasItems = true, address }) {
  if (!hasItems) return { fee: 0, tier: "none" };
  if (String(method || "").toLowerCase() !== "delivery") return { fee: 0, tier: "pickup" };

  if (isNewryAddress(address)) return { fee: DELIVERY_RULES.newryFee, tier: "newry" };

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
    const pieces = toCount(i.quantity) * optionUnits({ units: i.units, label: i.optionName }, i.category);
    if (i.category === "Pastries") pastryUnits += pieces;
    else if (i.category === "Drinks") drinkUnits += pieces;
  }
  return { pastryUnits, drinkUnits };
}

/** Local (instant) estimate of a basket; the server quote confirms it. */
export function estimateBasket(cartItems, method, address) {
  const { pastryUnits, drinkUnits } = countCartUnits(cartItems);
  const subtotalPence = cartItems.reduce(
    (t, i) => t + Math.round(Number(i.price) * 100) * toCount(i.quantity), 0
  );
  const d = calculateDelivery({
    method, pastryCount: pastryUnits, drinkCount: drinkUnits, hasItems: cartItems.length > 0, address,
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
  newry: "Newry Delivery",
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
  newry: {
    heading: "Newry Delivery — £3.50",
    lead: "For delivery addresses in Newry (postcodes BT34 and BT35).",
    points: [],
  },
  note: "Delivery charges depend on the total quantity of products ordered. We will confirm the applicable delivery charge at checkout.",
  thanks: "Thank you for choosing Mublat Bakes & Blends!",
};
