import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";

export interface CartLine {
  id: string;
  productSlug: string;
  title: string;
  image: string;
  price: number;
  variant?: string;
  quantity: number;
  /** Snapshot of the product's shipping parcel data at add-to-cart time (see lib/shipping). */
  shippingWeightOz?: number;
  shippingLengthIn?: number;
  shippingWidthIn?: number;
  shippingHeightIn?: number;
  /** Set when this line is fulfilled by Printful (not the atelier) — routes its shipping quote to lib/printful instead of Shippo. */
  printfulProductId?: number;
  printfulVariantId?: number;
}

interface CartState {
  lines: CartLine[];
  isDrawerOpen: boolean;
}

type CartAction =
  | { type: "ADD"; line: Omit<CartLine, "id">; openDrawer?: boolean }
  | { type: "REMOVE"; id: string }
  | { type: "INCREMENT"; id: string }
  | { type: "DECREMENT"; id: string }
  | { type: "CLEAR" }
  | { type: "OPEN_DRAWER" }
  | { type: "CLOSE_DRAWER" }
  | { type: "HYDRATE"; lines: CartLine[] };

const STORAGE_KEY = "ass:cart:v1";

function lineKey(productSlug: string, variant?: string): string {
  return variant ? `${productSlug}::${variant}` : productSlug;
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, lines: action.lines };
    case "ADD": {
      const id = lineKey(action.line.productSlug, action.line.variant);
      const existing = state.lines.find((l) => l.id === id);
      const lines = existing
        ? state.lines.map((l) =>
            l.id === id ? { ...l, quantity: l.quantity + action.line.quantity } : l,
          )
        : [...state.lines, { ...action.line, id }];
      return { ...state, lines, isDrawerOpen: action.openDrawer ?? state.isDrawerOpen };
    }
    case "REMOVE":
      return { ...state, lines: state.lines.filter((l) => l.id !== action.id) };
    case "INCREMENT":
      return {
        ...state,
        lines: state.lines.map((l) => (l.id === action.id ? { ...l, quantity: l.quantity + 1 } : l)),
      };
    case "DECREMENT":
      return {
        ...state,
        lines: state.lines
          .map((l) => (l.id === action.id ? { ...l, quantity: l.quantity - 1 } : l))
          .filter((l) => l.quantity > 0),
      };
    case "CLEAR":
      return { ...state, lines: [] };
    case "OPEN_DRAWER":
      return { ...state, isDrawerOpen: true };
    case "CLOSE_DRAWER":
      return { ...state, isDrawerOpen: false };
    default:
      return state;
  }
}

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  isDrawerOpen: boolean;
  addItem: (line: Omit<CartLine, "id">, options?: { openDrawer?: boolean }) => void;
  removeItem: (id: string) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [], isDrawerOpen: false });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", lines: JSON.parse(raw) as CartLine[] });
    } catch {
      // ignore malformed cart data
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
  }, [state.lines]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = state.lines.reduce((sum, l) => sum + l.quantity, 0);
    const subtotal = state.lines.reduce((sum, l) => sum + l.quantity * l.price, 0);
    return {
      lines: state.lines,
      itemCount,
      subtotal,
      isDrawerOpen: state.isDrawerOpen,
      addItem: (line, options) => dispatch({ type: "ADD", line, openDrawer: options?.openDrawer }),
      removeItem: (id) => dispatch({ type: "REMOVE", id }),
      increment: (id) => dispatch({ type: "INCREMENT", id }),
      decrement: (id) => dispatch({ type: "DECREMENT", id }),
      clear: () => dispatch({ type: "CLEAR" }),
      openDrawer: () => dispatch({ type: "OPEN_DRAWER" }),
      closeDrawer: () => dispatch({ type: "CLOSE_DRAWER" }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
