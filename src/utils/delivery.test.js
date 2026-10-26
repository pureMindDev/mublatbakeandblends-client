import { calculateDelivery, estimateBasket, countCartUnits } from "./delivery";

// Parity: the storefront must agree with the backend helper for every basket.
// eslint-disable-next-line import/no-commonjs
const server = require("../../server/utils/delivery");

const fee = (p, d, method = "Delivery") => calculateDelivery({ method, pastryCount: p, drinkCount: d });

test("client's example baskets", () => {
  expect(fee(10, 4).fee).toBe(7.99);
  expect(fee(15, 6).fee).toBe(7.99);
  expect(fee(16, 2).fee).toBe(9.99);
  expect(fee(5, 7).fee).toBe(9.99);
  expect(fee(16, 7).fee).toBe(9.99);
});

test("frontend and backend agree for every combination 0..40 x 0..20", () => {
  for (let p = 0; p <= 40; p++) for (let d = 0; d <= 20; d++) {
    expect(fee(p, d)).toEqual(server.calculateDelivery({ method: "Delivery", pastryCount: p, drinkCount: d }));
  }
  expect(fee(5, 5, "Pickup")).toEqual({ fee: 0, tier: "pickup" });
});

test("cart estimate counts pack units and ignores 'Other'", () => {
  const cart = [
    { category: "Pastries", units: 12, quantity: 1, price: 66 },
    { category: "Pastries", units: 3, quantity: 1, price: 16.5 },
    { category: "Pastries", units: 1, quantity: 1, price: 5.5 },
    { category: "Other", units: 1, quantity: 50, price: 1 },
  ];
  expect(countCartUnits(cart)).toEqual({ pastryUnits: 16, drinkUnits: 0 });
  const e = estimateBasket(cart, "Delivery");
  expect(e.deliveryFee).toBe(9.99);
  expect(e.subtotal).toBe(138);
  expect(e.totalAmount).toBe(147.99);
});

test("empty cart has no charge", () => {
  expect(estimateBasket([], "Delivery").deliveryFee).toBe(0);
});
