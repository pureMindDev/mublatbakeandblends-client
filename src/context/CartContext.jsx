import React, {
  createContext,
  useState,
  useEffect
} from "react";

export const CartContext = createContext();

// ─── localStorage persistence (slim — no base64 images) ─────────────────────

const FIELDS_TO_SAVE = ["id", "name", "optionName", "price", "quantity", "image"];

const slimItem = (item) => {
  const slim = {};
  for (const key of FIELDS_TO_SAVE) {
    if (item[key] !== undefined) slim[key] = item[key];
  }
  if (slim.image && slim.image.startsWith("data:")) {
    slim.image = "";
  }
  return slim;
};

// ─── sessionStorage image cache ──────────────────────────────────────────────
// Keeps a { "id__optionName" -> url } map in sessionStorage so the Success
// page can recover images even after they're stripped from localStorage.
// sessionStorage is per-tab and cleared on close — no quota sharing issue.

const IMAGE_CACHE_KEY = "cartImageCache";

const getImageCache = () => {
  try { return JSON.parse(sessionStorage.getItem(IMAGE_CACHE_KEY) || "{}"); }
  catch { return {}; }
};

const saveImageCache = (cache) => {
  try { sessionStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache)); }
  catch { /* private browsing — silently skip */ }
};

export const cacheItemImage = (id, optionName, imageUrl) => {
  if (!imageUrl) return;
  const cache = getImageCache();
  cache[`${id}__${optionName || "Standard"}`] = imageUrl;
  saveImageCache(cache);
};

export const getCachedImage = (id, optionName) => {
  const cache = getImageCache();
  return cache[`${id}__${optionName || "Standard"}`] || "";
};

// ─── safe localStorage write ─────────────────────────────────────────────────

const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn("localStorage quota exceeded, clearing cart backup.", e);
    try {
      localStorage.removeItem(key);
      localStorage.setItem(key, value);
    } catch { /* silent — cart still works in memory */ }
  }
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const CartProvider = ({ children }) => {

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("cartItems");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    safeSetItem("cartItems", JSON.stringify(cartItems.map(slimItem)));
  }, [cartItems]);

  const clearCart = () => setCartItems([]);

  const addToCart = (product) => {
    // Cache image before it might get stripped from localStorage
    if (product.image) {
      cacheItemImage(product.id, product.optionName, product.image);
    }

    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i.id === product.id && i.optionName === product.optionName
      );
      if (existing) {
        return prev.map((i) =>
          i.id === product.id && i.optionName === product.optionName
            ? { ...i, quantity: i.quantity + (product.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  };

  const removeFromCart = (id, optionName) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.id === id && i.optionName === optionName))
    );
  };

  const increaseQty = (id, optionName) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === id && i.optionName === optionName
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    );
  };

  const decreaseQty = (id, optionName) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === id && i.optionName === optionName
          ? { ...i, quantity: i.quantity > 1 ? i.quantity - 1 : 1 }
          : i
      )
    );
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, increaseQty, decreaseQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};