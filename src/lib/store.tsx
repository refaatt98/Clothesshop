import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type { CartItem, ColorOption, Product } from "../types";

const CART_KEY = "banan:cart";
const WISH_KEY = "banan:wishlist";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* التخزين غير متاح */
  }
}

export interface Flight {
  id: number;
  from: DOMRect;
  color: string;
}

interface AddOptions {
  color: ColorOption;
  size?: string;
  note?: string;
  qty?: number;
  /** العنصر الذي يطير منه المنتج إلى السلة */
  from?: Element | null;
}

interface ShopState {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (product: Product, opts: AddOptions) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;

  wishlist: string[];
  toggleWish: (id: string) => void;
  isWished: (id: string) => boolean;

  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;

  cartIconRef: RefObject<HTMLButtonElement | null>;
  flights: Flight[];
  landFlight: (id: number) => void;
  bump: number;
}

const ShopContext = createContext<ShopState | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  // بنشيل أي قطع قديمة من النسخة التجريبية (معرّفها مش uuid)
  const [items, setItems] = useState<CartItem[]>(() => load<CartItem[]>(CART_KEY, []).filter((i) => /^[0-9a-f-]{36}$/i.test(i.productId)));
  const [wishlist, setWishlist] = useState<string[]>(() => load<string[]>(WISH_KEY, []).filter((id) => /^[0-9a-f-]{36}$/i.test(id)));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [bump, setBump] = useState(0);
  const cartIconRef = useRef<HTMLButtonElement | null>(null);
  const flightId = useRef(0);

  useEffect(() => save(CART_KEY, items), [items]);
  useEffect(() => save(WISH_KEY, wishlist), [wishlist]);

  const add = useCallback((product: Product, opts: AddOptions) => {
    const qty = opts.qty ?? 1;
    const note = opts.note?.trim() || undefined;
    const key = [product.id, opts.color.name, opts.size ?? "", note ?? ""].join("|");
    setItems((prev) => {
      const found = prev.find((i) => i.key === key);
      if (found) {
        return prev.map((i) => (i.key === key ? { ...i, qty: Math.min(i.qty + qty, 20) } : i));
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          art: product.art,
          image: product.images[0],
          color: opts.color,
          size: opts.size,
          note,
          qty,
        },
      ];
    });

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (opts.from && !reduce) {
      const id = ++flightId.current;
      setFlights((f) => [...f, { id, from: opts.from!.getBoundingClientRect(), color: opts.color.hex }]);
    } else {
      setBump((b) => b + 1);
    }
  }, []);

  const landFlight = useCallback((id: number) => {
    setFlights((f) => f.filter((x) => x.id !== id));
    setBump((b) => b + 1);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, qty: Math.min(qty, 20) } : i)),
    );
  }, []);
  const remove = useCallback((key: string) => setItems((prev) => prev.filter((i) => i.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const toggleWish = useCallback(
    (id: string) => setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id])),
    [],
  );
  const isWished = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  const value = useMemo<ShopState>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal: items.reduce((s, i) => s + i.qty * i.price, 0),
      add,
      setQty,
      remove,
      clear,
      wishlist,
      toggleWish,
      isWished,
      drawerOpen,
      setDrawerOpen,
      cartIconRef,
      flights,
      landFlight,
      bump,
    }),
    [items, add, setQty, remove, clear, wishlist, toggleWish, isWished, drawerOpen, flights, landFlight, bump],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useShop(): ShopState {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
