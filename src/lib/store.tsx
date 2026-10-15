import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine, Chapter, Currency, Product } from "../types";
import { getChapters, getProducts } from "./api";

const rates: Record<Currency, number> = { USD: 1, EUR: 0.92, GBP: 0.79, JOD: 0.71, AED: 3.67 };
export const currencies = Object.keys(rates) as Currency[];

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
    /* private mode — the shop still works, it just forgets */
  }
}

export interface SavedLook {
  id: string;
  name: string;
  slugs: string[];
  createdAt: string;
}

interface Toast {
  id: number;
  text: string;
  sub?: string;
}

interface ShopState {
  /** Full catalogue, loaded once through api.ts */
  catalog: Product[] | null;
  chapters: Chapter[] | null;
  bySlug: (slug: string) => Product | undefined;
  rail: CartLine[];
  addToRail: (line: Omit<CartLine, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  removeFromRail: (key: string) => void;
  clearRail: () => void;
  railCount: number;
  railOpen: boolean;
  setRailOpen: (v: boolean) => void;

  pinned: string[];
  togglePin: (slug: string) => void;
  isPinned: (slug: string) => boolean;

  looks: SavedLook[];
  saveLook: (name: string, slugs: string[]) => void;
  deleteLook: (id: string) => void;

  currency: Currency;
  setCurrency: (c: Currency) => void;
  money: (usd: number, digits?: number) => string;

  toasts: Toast[];
  toast: (text: string, sub?: string) => void;

  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
}

const ShopContext = createContext<ShopState | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [rail, setRail] = useState<CartLine[]>(() => load("ourlet.rail", []));
  const [pinned, setPinned] = useState<string[]>(() => load("ourlet.pinned", []));
  const [looks, setLooks] = useState<SavedLook[]>(() => load("ourlet.looks", []));
  const [currency, setCurrency] = useState<Currency>(() => load("ourlet.currency", "USD"));
  const [railOpen, setRailOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [catalog, setCatalog] = useState<Product[] | null>(null);
  const [chapters, setChapters] = useState<Chapter[] | null>(null);

  useEffect(() => {
    getProducts().then(setCatalog);
    getChapters().then(setChapters);
  }, []);

  useEffect(() => save("ourlet.rail", rail), [rail]);
  useEffect(() => save("ourlet.pinned", pinned), [pinned]);
  useEffect(() => save("ourlet.looks", looks), [looks]);
  useEffect(() => save("ourlet.currency", currency), [currency]);

  const toast = useCallback((text: string, sub?: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, sub }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const addToRail = useCallback((line: Omit<CartLine, "key" | "qty">, qty = 1) => {
    const key = `${line.slug}|${line.colorway}|${line.size}`;
    setRail((r) => {
      const found = r.find((l) => l.key === key);
      if (found) return r.map((l) => (l.key === key ? { ...l, qty: Math.min(9, l.qty + qty) } : l));
      return [...r, { ...line, key, qty }];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setRail((r) => (qty <= 0 ? r.filter((l) => l.key !== key) : r.map((l) => (l.key === key ? { ...l, qty: Math.min(9, qty) } : l))));
  }, []);

  const value = useMemo<ShopState>(
    () => ({
      catalog,
      chapters,
      bySlug: (slug) => catalog?.find((p) => p.slug === slug),
      rail,
      addToRail,
      setQty,
      removeFromRail: (key) => setRail((r) => r.filter((l) => l.key !== key)),
      clearRail: () => setRail([]),
      railCount: rail.reduce((s, l) => s + l.qty, 0),
      railOpen,
      setRailOpen,
      pinned,
      togglePin: (slug) => setPinned((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug])),
      isPinned: (slug) => pinned.includes(slug),
      looks,
      saveLook: (name, slugs) =>
        setLooks((l) => [{ id: String(Date.now()), name, slugs, createdAt: new Date().toISOString() }, ...l].slice(0, 12)),
      deleteLook: (id) => setLooks((l) => l.filter((x) => x.id !== id)),
      currency,
      setCurrency,
      money: (usd, digits = 0) =>
        new Intl.NumberFormat("en", {
          style: "currency",
          currency,
          maximumFractionDigits: digits || (currency === "JOD" ? 1 : 0),
          minimumFractionDigits: digits,
        }).format(usd * rates[currency]),
      toasts,
      toast,
      searchOpen,
      setSearchOpen,
    }),
    [catalog, chapters, rail, addToRail, setQty, railOpen, pinned, looks, currency, toasts, toast, searchOpen],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside <ShopProvider>");
  return ctx;
}
