import { motion } from "motion/react";
import { ArrowLeft, Minus, Plus, X } from "lucide-react";
import { Link } from "react-router";
import { GarmentFlat, Hanger } from "../components/GarmentFlat";
import { StitchProgress, useRailTotals } from "../components/RailDrawer";
import { Button, EmptyState, HandNote, PageHeader } from "../components/ui";
import { FREE_SHIPPING_FROM } from "../lib/api";
import { useDocumentTitle } from "../lib/hooks";
import { useShop } from "../lib/store";

export default function Rail() {
  useDocumentTitle("الراف");
  const { setQty, removeFromRail, money, clearRail, togglePin, isPinned, toast } = useShop();
  const { lines, subtotal, hours, toFree, ready } = useRailTotals();

  return (
    <>
      <PageHeader
        trail={[{ label: "الرئيسية", to: "/" }, { label: "الراف" }]}
        kicker="غرفة القياس · الخطوة 0 من 3"
        title={
          <>
            الراف <em className="text-thread not-italic">الخاص بك</em>
          </>
        }
        intro="كل ما علّقته، جاهز لتجرّبه في خيالك مرة أخيرة. لا شيء محجوز حتى تُتمّ الطلب."
      />

      {!ready ? (
        <div className="py-24 text-center font-hand text-3xl text-chalk">نفرد قطعك…</div>
      ) : lines.length === 0 ? (
        <EmptyState
          title="لا شيء معلّق بعد."
          text="تصفّح المتجر أو نسّق إطلالة على طاولة التنسيق، ثم علّق القطع هنا."
          action={
            <div className="flex gap-3">
              <Button to="/shop">تصفّح المتجر</Button>
              <Button to="/pinned" variant="paper">
                لوحتك المثبّتة
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
                        {line.colorway} · مقاس {line.size} · رقم {String(product.edition.made + 1).padStart(3, "0")} (تقديري)
                      </p>
                      <button
                        onClick={() => {
                          if (!isPinned(product.slug)) togglePin(product.slug);
                          removeFromRail(line.key);
                          toast("نُقلت إلى لوحتك المثبّتة", product.name);
                        }}
                        className="mt-2 text-xs underline decoration-dashed underline-offset-4 hover:text-thread"
                      >
                        ليس الآن — ثبّتها لوقت لاحق
                      </button>
                    </div>
                    <div className="flex items-center rounded-full ring-1 ring-line">
                      <button onClick={() => setQty(line.key, line.qty - 1)} className="grid h-9 w-9 place-items-center" aria-label="أنقص واحدة">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center font-mono">{line.qty}</span>
                      <button onClick={() => setQty(line.key, line.qty + 1)} className="grid h-9 w-9 place-items-center" aria-label="زِد واحدة">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="w-24 text-left font-mono font-bold">{money(product.price * line.qty)}</span>
                    <button onClick={() => removeFromRail(line.key)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-paper-2" aria-label={`إزالة ${product.name}`}>
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
            <button onClick={clearRail} className="mt-4 text-sm text-ink-3 underline decoration-dashed underline-offset-4 hover:text-thread">
              أنزل كل شيء عن الراف
            </button>
          </div>

          <aside className="h-fit rounded-md bg-tissue p-6 ring-1 ring-line lg:sticky lg:top-28">
            <p className="label text-ink-3">الملخّص</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>المجموع</dt>
                <dd className="font-mono">{money(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>الشحن</dt>
                <dd className="font-mono">{toFree > 0 ? "من " + money(20) : "مجاني"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>الدفع عند الاستلام</dt>
                <dd>متاح</dd>
              </div>
            </dl>
            <div className="mt-4">
              <StitchProgress value={subtotal / FREE_SHIPPING_FROM} />
              <p className="mt-2 text-xs text-ink-2">{toFree > 0 ? `بقي ${money(toFree)} للشحن المجاني` : "الشحن المجاني مفعّل"}</p>
            </div>
            <div className="mt-5 flex items-baseline justify-between border-t border-dashed border-ink/20 pt-4">
              <span className="font-display text-xl">الإجمالي</span>
              <span className="font-mono text-2xl font-bold">{money(subtotal)}</span>
            </div>
            <HandNote className="mt-3 text-xl">{hours} ساعة من العمل اليدوي ←</HandNote>
            <Button to="/checkout" className="mt-5 w-full">
              إتمام الطلب <ArrowLeft className="h-4 w-4" />
            </Button>
            <p className="mt-4 text-xs leading-relaxed text-ink-3">
              كل قطعة تصل مطويّة بورق الباترون مع بطاقة بخط اليد، ويشملها الرفو المجاني مدى الحياة. <Link to="/shipping" className="underline">الشحن والإرجاع</Link>
            </p>
          </aside>
        </div>
      )}
    </>
  );
}
