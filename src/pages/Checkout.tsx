import { AnimatePresence, motion } from "motion/react";
import { Check, Gift, LoaderCircle, Lock, ShoppingBag, Tag, X } from "lucide-react";
import { useEffect, useState, type FormEvent, type InputHTMLAttributes } from "react";
import { Link, useNavigate } from "react-router";
import { ProductMedia } from "../components/ProductMedia";
import { EmptyState, PageHero } from "../components/ui";
import { calcDelivery, createOrder, getZones, validatePromo } from "../lib/api";
import { formatPrice } from "../lib/format";
import { useAsync, useTitle } from "../lib/hooks";
import { useSite } from "../lib/site";
import { useShop } from "../lib/store";
import type { PromoResult } from "../types";

type Errors = Partial<Record<"name" | "phone" | "city" | "address", string>>;

const phoneOk = (p: string) => /^(\+?970|\+?972|0)5\d{8}$/.test(p.replace(/[\s-]/g, ""));

export default function Checkout() {
  useTitle("إتمام الطلب");
  const { items, subtotal, clear } = useShop();
  const { site } = useSite();
  const navigate = useNavigate();
  const { data: zones, error: zonesError } = useAsync(getZones, []);

  const [form, setForm] = useState({ name: "", phone: "", zoneId: "", city: "", address: "", notes: "", giftWrap: false, giftMessage: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);

  // أول منطقة توصيل (مش استلام) كاختيار افتراضي
  useEffect(() => {
    if (zones?.length && !form.zoneId) {
      const def = zones.find((z) => !z.isPickup) ?? zones[0];
      setForm((f) => ({ ...f, zoneId: def.id }));
    }
  }, [zones, form.zoneId]);

  const zone = zones?.find((z) => z.id === form.zoneId);
  const isPickup = !!zone?.isPickup;

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: undefined }));
    setServerError("");
  };

  let delivery = calcDelivery(subtotal, zone, site);
  let discount = 0;
  if (promo?.valid) {
    if (promo.freeDelivery) delivery = 0;
    else discount = promo.discount;
  }
  const giftFee = form.giftWrap ? site.giftWrapPrice : 0;
  const total = Math.max(subtotal + delivery + giftFee - discount, 0);

  // إعادة حساب الخصم إذا تغيّرت السلة أو المنطقة
  useEffect(() => {
    if (!promo?.code) return;
    validatePromo(promo.code, subtotal, form.zoneId || undefined).then(setPromo).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal, form.zoneId]);

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setCheckingPromo(true);
    try {
      setPromo(await validatePromo(promoInput, subtotal, form.zoneId || undefined));
    } catch {
      setPromo({ valid: false, discount: 0, freeDelivery: false, message: "ما قدرنا نتحقق من الكود", code: null });
    } finally {
      setCheckingPromo(false);
    }
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (form.name.trim().length < 2) e.name = "اكتبي اسمك لو سمحتِ";
    if (!phoneOk(form.phone)) e.phone = "رقم الجوال لازم يكون مثل 0591234567";
    if (!isPickup) {
      if (form.city.trim().length < 2) e.city = "اكتبي اسم المدينة أو البلدة";
      if (form.address.trim().length < 3) e.address = "وصف العنوان بيساعد المندوب يوصلك";
    }
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(Object.keys(e)[0])?.focus();
      return false;
    }
    return true;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate() || sending || !zone) return;
    setSending(true);
    setServerError("");
    try {
      const order = await createOrder({ ...form, promoCode: promo?.valid ? promo.code ?? undefined : undefined, items });
      clear();
      navigate(`/order/${order.id}`, { replace: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "صار خطأ، جرّبي كمان مرة");
    } finally {
      setSending(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <PageHero eyebrow="إتمام الطلب" title="خطوة أخيرة" />
        <section className="container-b py-14">
          <EmptyState icon={<ShoppingBag className="size-14 text-sand" strokeWidth={1.2} />} title="السلة فاضية" text="ضيفي قطع للسلة أول، وبعدين ارجعي لهون.">
            <Link to="/shop" className="btn btn-primary mt-2">تصفّحي المتجر</Link>
          </EmptyState>
        </section>
      </>
    );
  }

  const field = (id: keyof Errors, label: string, props: InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input
        id={id}
        value={form[id]}
        onChange={(e) => set(id, e.target.value)}
        className={`field ${errors[id] ? "!border-rose" : ""}`}
        aria-invalid={!!errors[id]}
        aria-describedby={errors[id] ? `${id}-err` : undefined}
        {...props}
      />
      <AnimatePresence>
        {errors[id] && (
          <motion.p id={`${id}-err`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 text-sm text-rose">
            {errors[id]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );

  const step = (n: number, title: string) => (
    <legend className="mb-4 flex items-center gap-3 font-display text-2xl">
      <span className="grid size-9 place-items-center rounded-full border-2 border-dashed border-rose font-sans text-base text-rose">{n}</span>
      {title}
    </legend>
  );

  return (
    <>
      <PageHero eyebrow="إتمام الطلب" title="خطوة أخيرة وبتصير عندك" text="عبّي معلوماتك، والدفع بيكون عند الاستلام." />
      <form onSubmit={submit} noValidate className="container-b grid gap-10 py-10 md:py-14 lg:grid-cols-[1fr_400px]">
        <div className="space-y-10">
          <fieldset className="space-y-4">
            {step(1, "معلوماتك")}
            <div className="grid gap-4 sm:grid-cols-2">
              {field("name", "الاسم الكامل", { autoComplete: "name", placeholder: "مثلاً: لين أحمد" })}
              {field("phone", "رقم الجوال (واتساب)", { autoComplete: "tel", inputMode: "tel", dir: "ltr", placeholder: "059 123 4567", className: `field text-right ${errors.phone ? "!border-rose" : ""}` })}
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            {step(2, "التوصيل")}
            {zonesError && <p className="text-sm text-rose">ما قدرنا نحمّل مناطق التوصيل، حدّثي الصفحة.</p>}
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="المنطقة">
              {zones?.map((z) => {
                const active = form.zoneId === z.id;
                const fee = calcDelivery(subtotal, z, site);
                return (
                  <label key={z.id} className={`relative cursor-pointer rounded-2xl border-2 p-4 transition ${active ? "border-cocoa bg-linen" : "border-line hover:border-cocoa-3"}`}>
                    <input type="radio" name="zone" value={z.id} checked={active} onChange={() => set("zoneId", z.id)} className="sr-only" />
                    <span className="block font-semibold">{z.isPickup ? "🏡 " : ""}{z.name}</span>
                    {z.eta && <span className="mt-1 block text-sm text-cocoa-3">{z.eta}</span>}
                    <span className="mt-2 block text-sm font-semibold tabular-nums">
                      {fee === 0 ? <span className="text-sage">{z.isPickup ? "بدون رسوم" : "مجاني"}</span> : formatPrice(fee)}
                    </span>
                    {active && <motion.span layoutId="zone-dot" className="absolute end-3 top-3 size-3 rounded-full bg-rose" />}
                  </label>
                );
              })}
            </div>
            <AnimatePresence initial={false}>
              {!isPickup && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="grid gap-4 pt-1 sm:grid-cols-2">
                    {field("city", "المدينة / البلدة", { autoComplete: "address-level2", placeholder: "مثلاً: رام الله" })}
                    {field("address", "العنوان بالتفصيل", { autoComplete: "street-address", placeholder: "الحي، الشارع، علامة مميزة" })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {isPickup && <p className="rounded-2xl bg-sage-soft p-4 text-sm leading-7">رح نبعتلك العنوان وموعد الاستلام على واتساب بعد ما نجهّز الطلب 🤍</p>}
            <div>
              <label htmlFor="notes" className="label">ملاحظات للطلب (اختياري)</label>
              <textarea id="notes" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} className="field resize-none" placeholder="أي شي حابة تحكيلنا ياه" />
            </div>
          </fieldset>

          <fieldset>
            {step(3, "لمسة إضافية")}
            <label className={`flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-4 transition ${form.giftWrap ? "border-rose bg-rose-soft/50" : "border-line"}`}>
              <input type="checkbox" checked={form.giftWrap} onChange={(e) => set("giftWrap", e.target.checked)} className="mt-1 size-5 accent-[var(--color-rose)]" />
              <span className="flex-1">
                <span className="flex items-center gap-2 font-semibold"><Gift className="size-5 text-rose" /> تغليف هدية مع كرت بخط اليد</span>
                <span className="mt-1 block text-sm text-cocoa-2">علبة كرافت، شريطة، وكرت بنكتب عليه رسالتك · {formatPrice(site.giftWrapPrice)}</span>
              </span>
            </label>
            <AnimatePresence>
              {form.giftWrap && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <label htmlFor="giftMessage" className="label mt-4">الرسالة على الكرت</label>
                  <textarea id="giftMessage" rows={2} maxLength={140} value={form.giftMessage} onChange={(e) => set("giftMessage", e.target.value)} className="field resize-none font-serif text-lg" placeholder="كل عام وإنتِ بخير يا أحلى صديقة 🤍" />
                </motion.div>
              )}
            </AnimatePresence>
          </fieldset>

          <div className="rounded-2xl bg-cream-2 p-4 text-sm leading-7">
            <b>طريقة الدفع:</b> الدفع نقداً عند الاستلام. بعد ما تبعتي الطلب، رح يفتحلك واتساب لتبعتيلنا التفاصيل ونأكد معك.
          </div>
        </div>

        <aside className="h-fit rounded-[2rem] border border-dashed border-line bg-linen p-6 lg:sticky lg:top-28">
          <h2 className="mb-4 font-display text-2xl">طلبك</h2>
          <ul className="max-h-72 space-y-3 overflow-y-auto pe-1">
            {items.map((i) => (
              <li key={i.key} className="flex items-center gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl">
                  <ProductMedia image={i.image} art={i.art} color={i.color.hex} className="size-full" alt={i.name} />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-semibold">{i.name}</p>
                  <p className="text-cocoa-3">{i.color.name}{i.size ? ` · ${i.size}` : ""} · ×{i.qty}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums">{formatPrice(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>

          {/* كود الخصم */}
          <div className="mt-5 border-t border-dashed border-line pt-4">
            {promo?.valid ? (
              <div className="flex items-center justify-between rounded-xl bg-sage-soft px-3 py-2.5 text-sm">
                <span className="flex items-center gap-2"><Check className="size-4 text-sage" /> <b dir="ltr">{promo.code}</b> · {promo.message}</span>
                <button type="button" onClick={() => { setPromo(null); setPromoInput(""); }} className="grid size-7 place-items-center rounded-full hover:bg-cream" aria-label="إزالة الكود"><X className="size-4" /></button>
              </div>
            ) : (
              <>
                <label htmlFor="promo" className="label flex items-center gap-1.5"><Tag className="size-4" /> عندك كود خصم؟</label>
                <div className="flex gap-2">
                  <input id="promo" value={promoInput} onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromo(null); }} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void applyPromo(); } }} dir="ltr" className="field !py-2.5 text-center font-semibold tracking-wider" placeholder="BANAN10" />
                  <button type="button" onClick={applyPromo} disabled={checkingPromo || !promoInput.trim()} className="btn btn-ghost !px-4 !py-2.5">
                    {checkingPromo ? <LoaderCircle className="size-4 animate-spin" /> : "تطبيق"}
                  </button>
                </div>
                {promo && !promo.valid && <p className="mt-1.5 text-sm text-rose">{promo.message}</p>}
              </>
            )}
          </div>

          <dl className="mt-4 space-y-2 border-t border-dashed border-line pt-4 text-sm">
            <div className="flex justify-between"><dt>المجموع</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>{isPickup ? "الاستلام" : "التوصيل"}</dt><dd className="tabular-nums">{delivery === 0 ? <span className="text-sage">{isPickup ? "بدون رسوم" : "مجاني"}</span> : formatPrice(delivery)}</dd></div>
            {form.giftWrap && <div className="flex justify-between"><dt>تغليف هدية</dt><dd className="tabular-nums">{formatPrice(giftFee)}</dd></div>}
            {discount > 0 && <div className="flex justify-between text-sage"><dt>الخصم</dt><dd className="tabular-nums">− {formatPrice(discount)}</dd></div>}
            <div className="flex justify-between border-t border-dashed border-line pt-3 text-lg font-bold"><dt>الإجمالي</dt><dd className="tabular-nums">{formatPrice(total)}</dd></div>
          </dl>
          <AnimatePresence>
            {serverError && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-xl bg-rose-soft p-3 text-sm text-cocoa" role="alert">
                {serverError}
              </motion.p>
            )}
          </AnimatePresence>
          <button disabled={sending || !zone} className="btn btn-primary mt-5 w-full !py-3.5">
            {sending ? (<><LoaderCircle className="size-5 animate-spin" /> عم نرسل طلبك...</>) : (<>تأكيد الطلب · {formatPrice(total)}</>)}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-cocoa-3"><Lock className="size-3.5" /> معلوماتك بأمان ومش رح نشاركها مع حدا</p>
        </aside>
      </form>
    </>
  );
}
