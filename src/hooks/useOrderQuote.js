import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { estimateBasket } from "../utils/delivery";

/**
 * Basket totals for the cart and checkout.
 *  - Shows an instant local estimate (utils/delivery.js).
 *  - Then asks the server (POST /orders/quote) and uses ITS numbers, so what
 *    the customer sees is exactly what createOrder will save.
 * `error` is set when the server rejects the basket (e.g. a product was
 * removed from the menu); network failures just keep the local estimate.
 */
export default function useOrderQuote(cartItems, method, address = "") {
  const estimate = useMemo(() => estimateBasket(cartItems, method, address), [cartItems, method, address]);
  const [server, setServer] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const key = JSON.stringify([
    method,
    method === "Delivery" ? address : "",
    cartItems.map((i) => [i.id, i.optionName, i.quantity]),
  ]);

  useEffect(() => {
    if (cartItems.length === 0) { setServer(null); setError(""); setLoading(false); return; }

    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await api.post("/orders/quote", {
          method,
          address: method === "Delivery" ? address : undefined,
          items: cartItems.map((i) => ({
            product: i.id, optionName: i.optionName, quantity: i.quantity, name: i.name,
          })),
        });
        if (!cancelled) { setServer(data.quote); setError(""); }
      } catch (e) {
        if (cancelled) return;
        setServer(null);
        setError(e.response?.status === 400 ? (e.response.data?.message || "Please check your cart.") : "");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const q = server || estimate;
  return {
    subtotal: q.subtotal,
    deliveryFee: q.deliveryFee,
    deliveryTier: q.deliveryTier,
    totalAmount: q.totalAmount,
    pastryUnits: q.pastryUnits,
    drinkUnits: q.drinkUnits,
    confirmed: !!server,
    loading,
    error,
  };
}
