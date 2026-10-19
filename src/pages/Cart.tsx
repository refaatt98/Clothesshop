import { AnimatePresence } from "motion/react";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Link } from "react-router";
import { FreeDeliveryMeter } from "../components/CartDrawer";
import { CartLine } from "../components/CartLine";
import { EmptyState, PageHero } from "../components/ui";
import { formatPrice, piecesLabel } from "../lib/format";
import { useTitle } from "../lib/hooks";
import { useShop } from "../lib/store";

export default function Cart() {
  useTitle("السلة");
  const { items, subtotal, count, clear } = useShop();

  return (
    <>
      <PageHero eyebrow="سلّتك" title="القطع اللي اخترتيها" text={items.length ? `عندك ${piecesLabel(count)} بالسلة` : undefined} />
      <section className="container-b py-10 md:py-14">
        {items.length === 0 ? (
          <EmptyState icon={<ShoppingBag className="size-14 text-sand" strokeWidth={1.2} />} title="سلّتك لسا فاضية" text="تصفّحي القطع واختاري اللي بيشبهك.">
            <Link to="/shop" className="btn btn-primary mt-2">تصفّحي المتجر</Link>
          </EmptyState>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            <div>
              <ul>
                <AnimatePresence initial={false}>
                  {items.map((i) => <CartLine key={i.key} item={i} />)}
                </AnimatePresence>
              </ul>
              <div className="mt-4 flex flex-wrap justify-between gap-3">
                <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-cocoa-2 hover:text-cocoa">
                  → كمّلي التسوق
                </Link>
                <button onClick={clear} className="text-sm text-cocoa-3 underline-offset-4 hover:text-rose hover:underline">إفراغ السلة</button>
              </div>
            </div>
            <aside className="h-fit space-y-4 rounded-[2rem] border border-dashed border-line bg-linen p-6 lg:sticky lg:top-28">
              <h2 className="font-display text-2xl">ملخّص الطلب</h2>
              <FreeDeliveryMeter subtotal={subtotal} />
              <div className="flex justify-between"><span>مجموع القطع</span><b className="tabular-nums">{formatPrice(subtotal)}</b></div>
              <div className="flex justify-between text-sm text-cocoa-3"><span>التوصيل</span><span>بيتحسب حسب المنطقة</span></div>
              <Link to="/checkout" className="btn btn-primary w-full">
                إتمام الطلب <ArrowLeft className="size-4" />
              </Link>
              <p className="text-center text-xs text-cocoa-3">الدفع عند الاستلام · بدون أي رسوم إضافية</p>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
