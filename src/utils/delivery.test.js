import { calculateDelivery, estimateBasket, countCartUnits, optionUnits, DELIVERY_RULES, DELIVERY_POLICY } from "./delivery";

// Parity: the storefront must agree with the backend helper for every basket.
// eslint-disable-next-line import/no-commonjs
const server = require("../../server/utils/delivery");

const fee = (p, d, method = "Delivery") => calculateDelivery({ method, pastryCount: p, drinkCount: d });

test("rules: 30 pastry pieces / 6 bottles, same as the backend", () => {
  expect(DELIVERY_RULES).toEqual(server.DELIVERY_RULES);
  expect(DELIVERY_RULES.maxPastriesStandard).toBe(30);
  expect(DELIVERY_RULES.maxDrinksStandard).toBe(6);
});

test("client's example baskets", () => {
  expect(fee(30, 0).fee).toBe(7.99);
  expect(fee(31, 0).fee).toBe(9.99);
  expect(fee(0, 6).fee).toBe(7.99);
  expect(fee(0, 7).fee).toBe(9.99);
  expect(fee(20, 4).fee).toBe(7.99);
  expect(fee(31, 2).fee).toBe(9.99);
  expect(fee(10, 7).fee).toBe(9.99);
});

test("exact thresholds and immediately above; never summed", () => {
  expect(fee(30, 6).tier).toBe("standard");
  expect(fee(31, 6).tier).toBe("large");
  expect(fee(30, 7).tier).toBe("large");
  expect(fee(31, 7).fee).toBe(9.99);
  expect(fee(16, 2).tier).toBe("standard"); // the old 15 limit is gone
});

test("frontend and backend agree for every combination 0..70 x 0..30", () => {
  for (let p = 0; p <= 70; p++) for (let d = 0; d <= 30; d++) {
    expect(fee(p, d)).toEqual(server.calculateDelivery({ method: "Delivery", pastryCount: p, drinkCount: d }));
  }
  expect(fee(5, 5, "Pickup")).toEqual({ fee: 0, tier: "pickup" });
});

test("cart estimate counts pack units and ignores 'Other'", () => {
  const cart = [
    { category: "Pastries", units: 12, quantity: 2, price: 66 },
    { category: "Pastries", units: 3, quantity: 1, price: 16.5 },
    { category: "Pastries", units: 1, quantity: 4, price: 5.5 },
    { category: "Other", units: 1, quantity: 50, price: 1 },
  ];
  expect(countCartUnits(cart)).toEqual({ pastryUnits: 31, drinkUnits: 0 });
  const e = estimateBasket(cart, "Delivery");
  expect(e.deliveryFee).toBe(9.99);
  expect(e.subtotal).toBe(220.5);
  expect(e.totalAmount).toBe(230.49);
});

test("empty cart has no charge", () => {
  expect(estimateBasket([], "Delivery").deliveryFee).toBe(0);
});

test("customer-facing policy text uses the 30-piece threshold", () => {
  const text = JSON.stringify(DELIVERY_POLICY);
  expect(text).toContain("Up to 30 pieces of pastries");
  expect(text).toContain("More than 30 pieces of pastries");
  expect(text).toContain("Up to 6 bottles of drinks");
  expect(text).toContain("More than 6 bottles of drinks");
  expect(text).not.toMatch(/\b15 pieces\b/);
});

// ---- optionUnits / countCartUnits with legacy cart lines (no units stored) ----

test("optionUnits reads pack size from stored units or the label", () => {
  expect(optionUnits({ label: "Trio Collection" }, "Pastries")).toBe(3);
  expect(optionUnits({ label: "Grand Dozen (Box of 12)" }, "Pastries")).toBe(12);
  expect(optionUnits({ label: "12 pieces" }, "Pastries")).toBe(12);
  expect(optionUnits({ label: "Single Pastry", units: 1 }, "Pastries")).toBe(1);
  expect(optionUnits({ label: "Anything", units: 6 }, "Pastries")).toBe(6);
  expect(optionUnits({ label: "Family Bottle" }, "Drinks")).toBe(1);
  expect(optionUnits({ label: "Box of 12" }, "Other")).toBe(1);
});

test("frontend and server optionUnits agree", () => {
  for (const label of ["Single Pastry", "Trio Collection", "Grand Dozen (Box of 12)", "3 pieces", "12 pieces", "Half dozen", "Regular Cup", "Family Bottle", "Standard"]) {
    for (const category of ["Pastries", "Drinks", "Other"]) {
      expect(optionUnits({ label }, category)).toBe(server.optionUnits({ label }, category));
    }
  }
});

test("cart counts actual pieces: 1x3=3, 1x12=12, 2x12=24, 5x3=15, even for stale lines", () => {
  const line = (optionName, quantity, extra = {}) => ({ id: "p", optionName, quantity, category: "Pastries", ...extra });
  expect(countCartUnits([line("Trio Collection", 1)]).pastryUnits).toBe(3);
  expect(countCartUnits([line("Grand Dozen (Box of 12)", 1)]).pastryUnits).toBe(12);
  expect(countCartUnits([line("Grand Dozen (Box of 12)", 2)]).pastryUnits).toBe(24);
  expect(countCartUnits([line("Trio Collection", 5, { units: 3 })]).pastryUnits).toBe(15);   // not counted twice
  expect(estimateBasket([line("Grand Dozen (Box of 12)", 2), { id: "d", optionName: "Regular Cup", quantity: 7, category: "Drinks" }], "Delivery").deliveryTier).toBe("large");
});
