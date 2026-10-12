import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useCallback,
  useRef,
} from "react";
import { getProductById } from "../data/products";

const StoreContext = createContext(null);

const STORAGE_KEY = "nexus-store-state-v1";

const defaultState = {
  cart: [], // { id, qty, color, size }
  wishlist: [], // [id]
  user: null, // { name, email }
  orders: [], // placed orders
  coupon: null, // { code, type, value }
  theme: "light",
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

function itemKey(id, color, size) {
  return `${id}::${color || ""}::${size || ""}`;
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { id, qty = 1, color = "", size = "" } = action.payload;
      const key = itemKey(id, color, size);
      const existing = state.cart.find((it) => itemKey(it.id, it.color, it.size) === key);
      let cart;
      if (existing) {
        cart = state.cart.map((it) =>
          itemKey(it.id, it.color, it.size) === key ? { ...it, qty: it.qty + qty } : it
        );
      } else {
        cart = [...state.cart, { id, qty, color, size }];
      }
      return { ...state, cart };
    }
    case "SET_QTY": {
      const { key, qty } = action.payload;
      if (qty <= 0) {
        return { ...state, cart: state.cart.filter((it) => itemKey(it.id, it.color, it.size) !== key) };
      }
      return {
        ...state,
        cart: state.cart.map((it) =>
          itemKey(it.id, it.color, it.size) === key ? { ...it, qty } : it
        ),
      };
    }
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((it) => itemKey(it.id, it.color, it.size) !== action.payload.key),
      };
    case "CLEAR_CART":
      return { ...state, cart: [], coupon: null };
    case "TOGGLE_WISHLIST": {
      const has = state.wishlist.includes(action.payload);
      return {
        ...state,
        wishlist: has
          ? state.wishlist.filter((w) => w !== action.payload)
          : [...state.wishlist, action.payload],
      };
    }
    case "LOGIN":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...state, user: null };
    case "APPLY_COUPON":
      return { ...state, coupon: action.payload };
    case "CLEAR_COUPON":
      return { ...state, coupon: null };
    case "PLACE_ORDER":
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        cart: [],
        coupon: null,
      };
    case "SET_THEME":
      return { ...state, theme: action.payload };
    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.theme);
  }, [state.theme]);

  const [toasts, setToasts] = useReducer((list, action) => {
    if (action.type === "add") return [...list, action.toast];
    if (action.type === "remove") return list.filter((t) => t.id !== action.id);
    return list;
  }, []);

  const toastTimers = useRef({});
  const notify = useCallback(
    (message, variant = "success") => {
      const id = Date.now() + Math.random();
      setToasts({ type: "add", toast: { id, message, variant } });
      toastTimers.current[id] = setTimeout(() => {
        setToasts({ type: "remove", id });
        delete toastTimers.current[id];
      }, 2600);
    },
    [setToasts]
  );

  useEffect(
    () => () => {
      Object.values(toastTimers.current).forEach(clearTimeout);
    },
    []
  );

  // ---- derived cart data -------------------------------------------------
  const cartDetailed = useMemo(() => {
    return state.cart
      .map((it) => {
        const product = getProductById(it.id);
        if (!product) return null;
        return {
          ...it,
          key: itemKey(it.id, it.color, it.size),
          product,
          lineTotal: product.price * it.qty,
        };
      })
      .filter(Boolean);
  }, [state.cart]);

  const cartCount = useMemo(() => state.cart.reduce((n, it) => n + it.qty, 0), [state.cart]);

  const subtotal = useMemo(
    () => cartDetailed.reduce((sum, it) => sum + it.lineTotal, 0),
    [cartDetailed]
  );

  const discount = useMemo(() => {
    if (!state.coupon) return 0;
    const { type, value } = state.coupon;
    return type === "percent" ? (subtotal * value) / 100 : Math.min(value, subtotal);
  }, [state.coupon, subtotal]);

  const shipping = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal - discount >= 100 ? 0 : 9.99;
  }, [subtotal, discount]);

  const tax = useMemo(() => (subtotal - discount) * 0.08, [subtotal, discount]);

  const total = useMemo(
    () => Math.max(0, subtotal - discount) + shipping + tax,
    [subtotal, discount, shipping, tax]
  );

  const value = {
    ...state,
    cartDetailed,
    cartCount,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    toasts,
    notify,
    addToCart: (id, opts = {}) => {
      dispatch({ type: "ADD_TO_CART", payload: { id, ...opts } });
      notify("Added to cart");
    },
    setQty: (key, qty) => dispatch({ type: "SET_QTY", payload: { key, qty } }),
    removeFromCart: (key) => dispatch({ type: "REMOVE_FROM_CART", payload: { key } }),
    clearCart: () => dispatch({ type: "CLEAR_CART" }),
    toggleWishlist: (id) => {
      const has = state.wishlist.includes(id);
      dispatch({ type: "TOGGLE_WISHLIST", payload: id });
      notify(has ? "Removed from wishlist" : "Saved to wishlist", has ? "info" : "success");
    },
    login: (payload) => {
      dispatch({ type: "LOGIN", payload });
      notify(`Welcome, ${payload.name.split(" ")[0]}!`);
    },
    logout: () => {
      dispatch({ type: "LOGOUT" });
      notify("Signed out", "info");
    },
    applyCoupon: (coupon) => dispatch({ type: "APPLY_COUPON", payload: coupon }),
    clearCoupon: () => dispatch({ type: "CLEAR_COUPON" }),
    placeOrder: (order) => dispatch({ type: "PLACE_ORDER", payload: order }),
    toggleTheme: () =>
      dispatch({ type: "SET_THEME", payload: state.theme === "light" ? "dark" : "light" }),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export { itemKey };
