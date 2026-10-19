import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag, X } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useSite } from "../lib/site";
import { formatPrice, piecesLabel } from "../lib/format";
import { useShop } from "../lib/store";
import { CartLine } from "./CartLine";
import { YarnBall } from "./Craft";

export function FreeDeliveryMeter({ subtotal }: { subtotal: number }) {
  const { site } = useSite();
  const goal = site.freeDeliveryOver;
  if (goal == null || goal <= 0) return null;
  const pct = Math.min(subtotal / goal, 1);
  const left = goal - subtotal;
  return (
    <div className="rounded-2xl bg-cream-2 p-3.5">
      <p className="mb-2 text-sm">
        {left > 0 ? (
          <>باقي <b className="tabular-nums">{formatPrice(left)}</b> وبصير التوصيل مجاني 🚚</>
        ) : (
          <>مبروك! التوصيل عليكِ مجاني 🎉</>
        )}
      </p>
      <div className="relative h-2 rounded-full bg-sand">
        <motion.div className="absolute inset-y-0 right-0 rounded-full bg-rose" initial={false} animate={{ width: `${pct * 100}%` }} transition={{ type: "spring", damping: 20 }} />
        <motion.div className="absolute top-1/2 -translate-y-1/2" initial={false} animate={{ right: `calc(${pct * 100}% - 10px)` }} transition={{ type: "spring", damping: 20 }}>
          <YarnBall className="size-5" color="#c98f86" />
        </motion.div>
      </div>
    </div>
  );
}

export function CartDrawer() {
  const { drawerOpen, setDrawerOpen, items, subtotal, count } = useShop();
  const location = useLocation();
  const close = () => setDrawerOpen(false);

  useEffect(() => close(), [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, setDrawerOpen]);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="سلة التسوق">
          <motion.div className="absolute inset-0 bg-cocoa/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="absolute inset-y-0 left-0 flex w-full max-w-md flex-col bg-cream shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-dashed border-line px-5 py-4">
              <h2 className="font-display text-2xl">
                سلّتك <span className="text-base font-sans text-cocoa-3">({piecesLabel(count)})</span>
              </h2>
              <button onClick={close} className="grid size-10 place-items-center rounded-full hover:bg-cream-2" aria-label="إغلاق السلة">
                <X className="size-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                  <ShoppingBag className="size-16 text-sand" strokeWidth={1.2} />
                </motion.div>
                <p className="font-serif text-xl">سلّتك لسا فاضية</p>
                <p className="text-sm text-cocoa-3">في قطع كتير حلوة بتستناكِ</p>
                <Link to="/shop" onClick={close} className="btn btn-primary mt-2">تصفّحي المتجر</Link>
              </div>
            ) : (
              <>
                <div className="px-5 pt-4">
                  <FreeDeliveryMeter subtotal={subtotal} />
                </div>
                <ul className="flex-1 overflow-y-auto px-5">
                  <AnimatePresence initial={false}>
                    {items.map((i) => (
                      <CartLine key={i.key} item={i} onNavigate={close} />
                    ))}
                  </AnimatePresence>
                </ul>
                <div className="space-y-3 border-t border-dashed border-line bg-linen px-5 py-5">
                  <div className="flex items-center justify-between text-lg">
                    <span>المجموع</span>
                    <b className="tabular-nums">{formatPrice(subtotal)}</b>
                  </div>
                  <p className="text-xs text-cocoa-3">التوصيل بيتحسب بالخطوة الجاية. الدفع عند الاستلام.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/cart" onClick={close} className="btn btn-ghost">عرض السلة</Link>
                    <Link to="/checkout" onClick={close} className="btn btn-primary">إتمام الطلب</Link>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
