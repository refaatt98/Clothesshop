import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { searchProducts } from "../lib/api";
import { useDebounced, useLockBody } from "../lib/hooks";
import { useShop } from "../lib/store";
import type { Product } from "../types";
import { GarmentFlat } from "./GarmentFlat";

const prompts = ["كتّان", "معطف", "نيلي", "تريكو", "مقلّم", "فستان", "جملي", "طيّة"];

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, money } = useShop();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const dq = useDebounced(q, 180);
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  useLockBody(searchOpen);

  useEffect(() => {
    if (searchOpen) setTimeout(() => input.current?.focus(), 80);
    else setQ("");
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  useEffect(() => {
    let live = true;
    setLoading(true);
    searchProducts(dq).then((r) => {
      if (live) {
        setResults(r);
        setLoading(false);
      }
    });
    return () => {
      live = false;
    };
  }, [dq]);

  const close = () => setSearchOpen(false);

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          className="fixed inset-0 z-[95] overflow-y-auto bg-paper/97 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="بحث"
        >
          <div className="wrap py-6 md:py-10">
            <div className="flex justify-end">
              <button onClick={close} className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-line hover:bg-paper-2" aria-label="إغلاق البحث">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                close();
                navigate(`/shop?q=${encodeURIComponent(q)}`);
              }}
              className="mx-auto mt-6 max-w-3xl"
            >
              <label htmlFor="search" className="label text-ink-3">
                ابحث في الراف
              </label>
              <div className="mt-2 flex items-center gap-3 border-b-2 border-ink pb-2">
                <Search className="h-6 w-6 shrink-0 text-ink-3" />
                <input
                  ref={input}
                  id="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="جرّب «كتّان» أو «طيّتين»"
                  className="min-w-0 flex-1 bg-transparent font-display text-[1.8rem] outline-none placeholder:text-ink-3/50 md:text-[2.6rem]"
                  autoComplete="off"
                />
                {q && (
                  <button type="submit" className="hidden shrink-0 items-center gap-1 rounded-full bg-ink px-4 py-2 text-sm text-paper sm:flex">
                    عرض الكل <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {prompts.map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setQ(p)}
                    className="rounded-full px-3 py-1 font-mono text-xs ring-1 ring-line transition hover:bg-ink hover:text-paper"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </form>

            <div className="mx-auto mt-10 max-w-3xl">
              {dq && !loading && results.length === 0 && (
                <p className="font-hand text-3xl text-chalk">لا شيء على الراف بهذا الاسم — جرّب «صوف» أو «قميص».</p>
              )}
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {results.map((p, i) => (
                  <motion.li key={p.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Link to={`/piece/${p.slug}`} onClick={close} className="group block rounded-md bg-tissue p-3 ring-1 ring-line hover:ring-ink/30">
                      <div className="bg-mat rounded p-3">
                        <GarmentFlat kind={p.garment} {...p.colorways[0]} className="mx-auto w-3/4 transition group-hover:scale-105" />
                      </div>
                      <p className="mt-2 font-display leading-tight">{p.name}</p>
                      <p className="font-mono text-xs text-ink-3">{money(p.price)}</p>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
