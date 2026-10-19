import { AnimatePresence, motion } from "motion/react";
import { Gift, LoaderCircle, Lock, ShoppingBag } from "lucide-react";
import { useState, type FormEvent, type InputHTMLAttributes } from "react";
import { Link, useNavigate } from "react-router";
import { site } from "../data/site";
import { ProductArt } from "../components/ProductArt";
import { EmptyState, PageHero } from "../components/ui";
import { calcDelivery, createOrder, getRegions } from "../lib/api";
import { formatPrice } from "../lib/format";
import { useAsync, useTitle } from "../lib/hooks";
import { useShop } from "../lib/store";

type Errors = Partial<Record<"name" | "phone" | "city" | "address", string>>;

const phoneOk = (p: string) => /^(\+?970|\+?972|0)5\d{8}$/.test(p.replace(/[\s-]/g, ""));

export default function Checkout() {
  useTitle("إتمام الطلب");
  const { items, subtotal, clear } = useShop();
  const navigate = useNavigate();
  const { data: regions } = useAsync(getRegions, []);

  const [form, setForm] = useState({ name: "", phone: "", regionId: "westbank", city: "", address: "", notes: "", giftWrap: false, giftMessage: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const delivery = calcDelivery(subtotal, form.regionId);
  const giftFee = form.giftWrap ? site.giftWrapPrice : 0;
  const total = subtotal + delivery + giftFee;

  const validate = (): boolean => {
    const e: Errors = {};
    if (form.name.trim().length < 2) e.name = "اكتبي اسمك لو سمحتِ";
    if (!phoneOk(form.phone)) e.phone = "رقم الجوال لازم يكون مثل 0591234567";
    if (form.city.trim().length < 2) e.city = "اكتبي اسم المدينة أو البلدة";
    if (form.address.trim().length < 4) e.address = "وصف العنوان بيساعد المندوب يوصلك";
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(Object.keys(e)[0])?.focus();
      return false;
    }
    return true;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate() || sending) return;
    setSending(true);
    try {
      const order = await createOrder({ ...form, items });
      clear();
      navigate(`/order/${order.id}`, { replace: true });
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

  return (
    <>
      <PageHero eyebrow="إتمام الطلب" title="خطوة أخيرة وبتصير عندك" text="عبّي معلومات التوصيل، والدفع بيكون عند الاستلام." />
      <form onSubmit={submit} noValidate className="container-b grid gap-10 py-10 md:py-14 lg:grid-cols-[1fr_400px]">
        <div className="space-y-10">
          <fieldset className="space-y-4">
            <legend className="mb-4 flex items-center gap-3 font-display text-2xl">
              <span className="grid size-9 place-items-center rounded-full border-2 border-dashed border-rose font-sans text-base text-rose">1</span>
              معلوماتك
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("name", "الاسم الكامل", { autoComplete: "name", placeholder: "مثلاً: لين أحمد" })}
              {field("phone", "رقم الجوال (واتساب)", { autoComplete: "tel", inputMode: "tel", dir: "ltr", placeholder: "059 123 4567", className: `field text-right ${errors.phone ? "!border-rose" : ""}` })}
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-4 flex items-center gap-3 font-display text-2xl">
              <span className="grid size-9 place-items-center rounded-full border-2 border-dashed border-rose font-sans text-base text-rose">2</span>
              التوصيل
            </legend>
            <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="المنطقة">
              {regions?.map((r) => {
                const active = form.regionId === r.id;
                return (
                  <label key={r.id} className={`relative cursor-pointer rounded-2xl border-2 p-4 transition ${active ? "border-cocoa bg-linen" : "border-line hover:border-cocoa-3"}`}>
                    <input type="radio" name="region" value={r.id} checked={active} onChange={() => set("regionId", r.id)} className="sr-only" />
                    <span className="block font-semibold">{r.name}</span>
                    <span className="mt-1 block text-sm text-cocoa-3">{r.eta}</span>
                    <span className="mt-2 block text-sm font-semibold tabular-nums">
                      {subtotal >= site.freeDeliveryOver ? <span className="text-sage">مجاني</span> : formatPrice(r.fee)}
                    </span>
                    {active && <motion.span layoutId="region-dot" className="absolute end-3 top-3 size-3 rounded-full bg-rose" />}
                  </label>
                );
              })}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("city", "المدينة / البلدة", { autoComplete: "address-level2", placeholder: "مثلاً: رام الله" })}
              {field("address", "العنوان بالتفصيل", { autoComplete: "street-address", placeholder: "الحي، الشارع، علامة مميزة" })}
            </div>
            <div>
              <label htmlFor="notes" className="label">ملاحظات للطلب (اختياري)</label>
              <textarea id="notes" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} className="field resize-none" placeholder="أي شي حابة تحكيلنا ياه" />
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-4 flex items-center gap-3 font-display text-2xl">
              <span className="grid size-9 place-items-center rounded-full border-2 border-dashed border-rose font-sans text-base text-rose">3</span>
              لمسة إضافية
            </legend>
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
            <b>طريقة الدفع:</b> الدفع نقداً عند الاستلام. بعد ما تبعتي الطلب، رح نتواصل معك على واتساب لنأكد التفاصيل.
          </div>
        </div>

        <aside className="h-fit rounded-[2rem] border border-dashed border-line bg-linen p-6 lg:sticky lg:top-28">
          <h2 className="mb-4 font-display text-2xl">طلبك</h2>
          <ul className="max-h-72 space-y-3 overflow-y-auto pe-1">
            {items.map((i) => (
              <li key={i.key} className="flex items-center gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl">
                  <ProductArt kind={i.art} color={i.color.hex} className="size-full" />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-semibold">{i.name}</p>
                  <p className="text-cocoa-3">{i.color.name}{i.size ? ` · ${i.size}` : ""} · ×{i.qty}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums">{formatPrice(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-dashed border-line pt-4 text-sm">
            <div className="flex justify-between"><dt>المجموع</dt><dd className="tabular-nums">{formatPrice(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>التوصيل</dt><dd className="tabular-nums">{delivery === 0 ? <span className="text-sage">مجاني</span> : formatPrice(delivery)}</dd></div>
            {form.giftWrap && <div className="flex justify-between"><dt>تغليف هدية</dt><dd className="tabular-nums">{formatPrice(giftFee)}</dd></div>}
            <div className="flex justify-between border-t border-dashed border-line pt-3 text-lg font-bold"><dt>الإجمالي</dt><dd className="tabular-nums">{formatPrice(total)}</dd></div>
          </dl>
          <button disabled={sending} className="btn btn-primary mt-5 w-full !py-3.5">
            {sending ? (<><LoaderCircle className="size-5 animate-spin" /> عم نرسل طلبك...</>) : (<>تأكيد الطلب · {formatPrice(total)}</>)}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-cocoa-3"><Lock className="size-3.5" /> معلوماتك بأمان ومش رح نشاركها مع حدا</p>
        </aside>
      </form>
    </>
  );
}
