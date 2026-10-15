import { motion } from "motion/react";
import { ArrowRight, Minus, Plus, X } from "lucide-react";
import { Link } from "react-router";
import { GarmentFlat, Hanger } from "../components/GarmentFlat";
import { StitchProgress, useRailTotals } from "../components/RailDrawer";
import { Button, EmptyState, HandNote, PageHeader } from "../components/ui";
import { FREE_SHIPPING_FROM } from "../lib/api";
import { useDocumentTitle } from "../lib/hooks";
import { useShop } from "../lib/store";

export default function Rail() {
  useDocumentTitle("Your rail");
  const { setQty, removeFromRail, money, clearRail, togglePin, isPinned, toast } = useShop();
  const { lines, subtotal, hours, toFree, ready } = useRailTotals();

  return (
    <>
      <PageHeader
        trail={[{ label: "Home", to: "/" }, { label: "Your rail" }]}
        kicker="Fitting room · step 0 of 3"
        title={
          <>
            Your <em>rail</em>
          </>
        }
        intro="Everything you've hung up, ready to try on in your head one more time. Nothing is reserved until you check out."
      />

      {!ready ? (
        <div className="py-24 text-center font-hand text-3xl text-chalk">laying out your pieces…</div>
      ) : lines.length === 0 ? (
        <EmptyState
          title="Nothing hanging yet."
          text="Browse the shop or compose a look on the dressing table, then hang pieces here."
          action={
            <div className="flex gap-3">
              <Button to="/shop">Browse the shop</Button>
              <Button to="/pinned" variant="paper">
                Your pinboard
              </Button>
            </div>
          }
        />
      ) : (
        <div className="wrap grid gap-10 py-12 lg:grid-cols-[1fr_380px]">
          <div>
            {/* the physical rail */}
            <div className="relative">
              <div className="relative z-10 h-[7px] rounded-full bg-brass shadow-[inset_0_-2px_0_#0000002a]" />
              <div className="no-scrollbar -mt-1 flex gap-4 overflow-x-auto pb-4">
                {lines.map(({ line, product }, i) => {
                  const c = product.colorways.find((x) => x.name === line.colorway) ?? product.colorways[0];
                  return (
                    <motion.div
                      key={line.key}
                      className="w-36 shrink-0 origin-top md:w-44"
                      initial={{ rotate: -6, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 60, damping: 6, delay: i * 0.1 }}
                    >
                      <Link to={`/piece/${product.slug}`} className="flex flex-col items-center">
                        <Hanger className="relative z-10 -mb-3 w-16" />
                        <GarmentFlat kind={product.garment} {...c} className="w-full" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <ul className="mt-6 divide-y divide-dashed divide-ink/20 border-y border-dashed border-ink/20">
              {lines.map(({ line, product }) => {
                const c = product.colorways.find((x) => x.name === line.colorway) ?? product.colorways[0];
                return (
                  <li key={line.key} className="flex flex-wrap items-center gap-4 py-5 sm:flex-nowrap">
                    <div className="grid h-20 w-20 shrink-0 place-items-center rounded bg-mat">
                      <GarmentFlat kind={product.garment} {...c} className="h-16" shadow={false} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link to={`/piece/${product.slug}`} className="font-display text-xl hover:text-thread">
                        {product.name}
                      </Link>
                      <p className="label mt-1 text-ink-3">
                        {line.colorway} · size {line.size} · No.{String(product.edition.made + 1).padStart(3, "0")} (est.)
                      </p>
                      <button
                        onClick={() => {
                          if (!isPinned(product.slug)) togglePin(product.slug);
                          removeFromRail(line.key);
                          toast("Moved to your pinboard", product.name);
                        }}
                        className="mt-2 text-xs underline decoration-dashed underline-offset-4 hover:text-thread"
                      >
                        Not now — pin it for later
                      </button>
                    </div>
                    <div className="flex items-center rounded-full ring-1 ring-line">
                      <button onClick={() => setQty(line.key, line.qty - 1)} className="grid h-9 w-9 place-items-center" aria-label="One fewer">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center font-mono">{line.qty}</span>
                      <button onClick={() => setQty(line.key, line.qty + 1)} className="grid h-9 w-9 place-items-center" aria-label="One more">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="w-24 text-right font-mono font-bold">{money(product.price * line.qty)}</span>
                    <button onClick={() => removeFromRail(line.key)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-paper-2" aria-label={`Remove ${product.name}`}>
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
            <button onClick={clearRail} className="mt-4 text-sm text-ink-3 underline decoration-dashed underline-offset-4 hover:text-thread">
              Take everything off the rail
            </button>
          </div>

          <aside className="h-fit rounded-md bg-tissue p-6 ring-1 ring-line lg:sticky lg:top-28">
            <p className="label text-ink-3">Summary</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="font-mono">{money(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd className="font-mono">{toFree > 0 ? "from " + money(14) : "free"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Duties</dt>
                <dd className="font-mono">included</dd>
              </div>
            </dl>
            <div className="mt-4">
              <StitchProgress value={subtotal / FREE_SHIPPING_FROM} />
              <p className="mt-2 text-xs text-ink-2">{toFree > 0 ? `${money(toFree)} to free shipping` : "Free shipping unlocked"}</p>
            </div>
            <div className="mt-5 flex items-baseline justify-between border-t border-dashed border-ink/20 pt-4">
              <span className="font-display text-xl">Total</span>
              <span className="font-mono text-2xl font-bold">{money(subtotal)}</span>
            </div>
            <HandNote className="mt-3 text-xl">{hours} hours of handwork →</HandNote>
            <Button to="/checkout" className="mt-5 w-full">
              Checkout <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="mt-4 text-xs leading-relaxed text-ink-3">
              Every piece comes folded in pattern tissue with a handwritten card, and is covered by free mending for life. <Link to="/shipping" className="underline">Shipping & returns</Link>
            </p>
          </aside>
        </div>
      )}
    </>
  );
}
