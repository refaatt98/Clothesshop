import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, X } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { products } from "../data/products";
import { FREE_SHIPPING_FROM } from "../lib/api";
import { useLockBody } from "../lib/hooks";
import { useShop } from "../lib/store";
import { GarmentFlat, Hanger } from "./GarmentFlat";
import { RailIcon } from "./Header";

/** "Stitched" progress towards free shipping: a running stitch that fills in. */
export function StitchProgress({ value }: { value: number }) {
  const pct = Math.min(1, value);
  return (
    <div className="relative h-3" aria-hidden>
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 border-t border-dashed border-ink/25" />
      <motion.div
        className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2"
        style={{ backgroundImage: "repeating-linear-gradient(to right, #c2432e 0 7px, transparent 7px 11px)" }}
        initial={{ width: 0 }}
        animate={{ width: `${pct * 100}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.span
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-thread bg-paper"
        initial={{ left: 0 }}
        animate={{ left: `${pct * 100}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export function useRailTotals() {
  const { rail } = useShop();
  const lines = rail
    .map((l) => ({ line: l, product: products.find((p) => p.slug === l.slug)! }))
    .filter((x) => x.product);
  const subtotal = lines.reduce((s, x) => s + x.product.price * x.line.qty, 0);
  const hours = lines.reduce((s, x) => s + x.product.makingHours * x.line.qty, 0);
  return { lines, subtotal, hours, toFree: Math.max(0, FREE_SHIPPING_FROM - subtotal) };
}

export function RailDrawer() {
  const { railOpen, setRailOpen, setQty, removeFromRail, money, railCount } = useShop();
  const { lines, subtotal, hours, toFree } = useRailTotals();
  const navigate = useNavigate();
  useLockBody(railOpen);

  return (
    <AnimatePresence>
      {railOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-ink/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRailOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your rail"
            className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-[460px] flex-col bg-paper shadow-[-30px_0_60px_-30px_#1e1c1966]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="label text-ink-3">Your rail</p>
                <p className="font-display text-2xl">
                  {railCount} {railCount === 1 ? "piece" : "pieces"} hanging
                </p>
              </div>
              <button onClick={() => setRailOpen(false)} className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-line hover:bg-paper-2" aria-label="Close rail">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* the brass rail itself */}
            <div className="relative h-3 shrink-0 bg-paper-2">
              <div className="absolute inset-x-4 top-1 h-[5px] rounded-full bg-brass shadow-[inset_0_-1px_0_#0003]" />
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <RailIcon className="h-14 w-14 text-ink-3" />
                <p className="mt-4 font-display text-2xl">An empty rail.</p>
                <p className="mt-2 text-ink-2">Every piece here is numbered and made in small runs. Hang something you'll wear for years.</p>
                <div className="mt-6 flex gap-3">
                  <Link to="/shop" onClick={() => setRailOpen(false)} className="rounded-full bg-ink px-5 py-2.5 text-sm text-paper">
                    Browse the shop
                  </Link>
                  <Link to="/dressing-table" onClick={() => setRailOpen(false)} className="rounded-full px-5 py-2.5 text-sm ring-1 ring-ink/20">
                    Compose a look
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="px-5 pt-4">
                  <p className="text-sm text-ink-2">
                    {toFree > 0 ? (
                      <>
                        <span className="font-semibold text-ink">{money(toFree)}</span> more and we'll ship it free, duties included.
                      </>
                    ) : (
                      <>Shipping is on us. Duties too.</>
                    )}
                  </p>
                  <div className="mt-2">
                    <StitchProgress value={subtotal / FREE_SHIPPING_FROM} />
                  </div>
                </div>
                <ul className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                  <AnimatePresence initial={false}>
                    {lines.map(({ line, product }) => {
                      const c = product.colorways.find((x) => x.name === line.colorway) ?? product.colorways[0];
                      return (
                        <motion.li
                          key={line.key}
                          layout
                          initial={{ opacity: 0, y: -20, rotate: -3 }}
                          animate={{ opacity: 1, y: 0, rotate: 0 }}
                          exit={{ opacity: 0, x: 60 }}
                          className="flex gap-4 rounded-md bg-tissue p-3 ring-1 ring-line"
                        >
                          <Link to={`/piece/${product.slug}`} onClick={() => setRailOpen(false)} className="flex w-20 shrink-0 flex-col items-center rounded bg-mat p-1.5">
                            <Hanger className="-mb-2 w-9" />
                            <GarmentFlat kind={product.garment} {...c} className="w-full" shadow={false} />
                          </Link>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <Link to={`/piece/${product.slug}`} onClick={() => setRailOpen(false)} className="font-display text-lg leading-tight hover:text-thread">
                                {product.name}
                              </Link>
                              <button onClick={() => removeFromRail(line.key)} className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-paper-2 hover:text-ink" aria-label={`Remove ${product.name}`}>
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="label mt-1 text-ink-3">
                              {line.colorway} · size {line.size}
                            </p>
                            <div className="mt-auto flex items-center justify-between pt-3">
                              <div className="flex items-center rounded-full ring-1 ring-line">
                                <button onClick={() => setQty(line.key, line.qty - 1)} className="grid h-8 w-8 place-items-center" aria-label="One fewer">
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-6 text-center font-mono text-sm">{line.qty}</span>
                                <button onClick={() => setQty(line.key, line.qty + 1)} className="grid h-8 w-8 place-items-center" aria-label="One more">
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <span className="font-mono text-sm font-bold">{money(product.price * line.qty)}</span>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
                <div className="border-t border-line bg-tissue px-5 pb-6 pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-ink-2">Subtotal</span>
                    <span className="font-mono text-xl font-bold">{money(subtotal)}</span>
                  </div>
                  <p className="mt-1 font-hand text-xl text-chalk">≈ {hours} hours of somebody's careful work</p>
                  <button
                    onClick={() => {
                      setRailOpen(false);
                      navigate("/checkout");
                    }}
                    className="mt-4 w-full rounded-full bg-ink py-3.5 font-medium text-paper transition hover:bg-ink-2"
                  >
                    Go to the fitting room — checkout
                  </button>
                  <Link to="/rail" onClick={() => setRailOpen(false)} className="mt-3 block text-center text-sm underline decoration-dashed underline-offset-4 hover:text-thread">
                    View full rail
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
