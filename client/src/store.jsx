import { createContext, useContext, useEffect, useRef, useState } from "react";

const Store = createContext();
const API_BASE_URL = import.meta.env.DEV ? "" : "https://voltkart-ecommerce.onrender.com";
export const useStore = () => useContext(Store);

const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

export function StoreProvider({ children }) {
  const [auth, setAuth] = useState(() => load("auth", null)); // { token, user }
  const [cart, setCart] = useState(() => load("cart", [])); // [{ id, name, price, emoji, image, qty }]
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => localStorage.setItem("auth", JSON.stringify(auth)), [auth]);
  useEffect(() => localStorage.setItem("cart", JSON.stringify(cart)), [cart]);

  // Dismiss the "Added to cart" alert after 2.5 seconds.
  const showToast = (text) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text });
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  // Use one helper for API calls and attach the session token automatically.
  const api = async (path, options = {}) => {
    const res = await fetch(`${API_BASE_URL}/api${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(auth && { Authorization: `Bearer ${auth.token}` }),
      },
      body: options.body && JSON.stringify(options.body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401 && auth) setAuth(null); // Clear an expired session.
      throw new Error(data.message || "Something went wrong");
    }
    return data;
  };

  const addToCart = (p) => {
    setCart((c) =>
      c.find((i) => i.id === p.id)
        ? c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
        : [...c, { id: p.id, name: p.name, price: p.price, emoji: p.emoji, image: p.image, qty: 1 }]
    );
    showToast(p.name);
  };
  const changeQty = (id, d) =>
    setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: i.qty + d } : i)).filter((i) => i.qty > 0));
  const removeItem = (id) => setCart((c) => c.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);
  const logout = () => setAuth(null);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <Store.Provider
      value={{ auth, setAuth, logout, api, cart, addToCart, changeQty, removeItem, clearCart, cartCount, cartTotal, toast }}
    >
      {children}
    </Store.Provider>
  );
}
