import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Clock, Gift, Heart, PenLine, Share2, ShoppingBag, Star, Truck } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { Link, useParams } from "react-router";
import { QtyStepper } from "../components/CartLine";
import { Diamond, StitchDivider } from "../components/Craft";
import { WhatsappIcon } from "../components/Icons";
import { YarnLoader } from "../components/Loader";
import { ProductArt } from "../components/ProductArt";
import { ProductCard } from "../components/ProductCard";
import { ProductMedia } from "../components/ProductMedia";
import { ReviewsMarquee } from "../components/ReviewsMarquee";
import { Price, SectionHeading, Stars } from "../components/ui";
import { getHomeReviews, getProductBySlug, getProductReviews, getRelatedProducts, submitReview, whatsappLink } from "../lib/api";
import { formatPrice } from "../lib/format";
import { useAsync, useTitle } from "../lib/hooks";
import { useSite } from "../lib/site";
import { useShop } from "../lib/store";
import { NO_COLOR, type Product as TProduct } from "../types";
import NotFound from "./NotFound";

function Accordion({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-dashed border-line">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-4 text-start font-semibold" aria-expanded={open}>
        {title}
        <motion.span animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown className="size-5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pb-5 leading-8 text-cocoa-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const artViews = [
  { v: 0 as const, label: "القطعة" },
  { v: 1 as const, label: "التفاصيل" },
  { v: 2 as const, label: "مع التغليف" },
];

function Gallery({ product, color, tint }: { product: TProduct; color: string; tint?: string }) {
  const [view, setView] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const hasImages = product.images.length > 0;
  const count = hasImages ? product.images.length : artViews.length;

  useEffect(() => setView(0), [product.id]);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const render = (i: number, eager = false) =>
    hasImages ? (
      <ProductMedia image={product.images[i]} art={product.art} color={color} className="size-full" alt={`${product.name} ${i + 1}`} eager={eager} />
    ) : (
      <ProductArt kind={product.art} color={color} bg={tint} variant={artViews[i].v} className="size-full" title={product.name} />
    );

  return (
    <div className="flex flex-col gap-3 md:flex-row-reverse md:items-start">
      <div
        className="stitched relative aspect-square flex-1 cursor-zoom-in overflow-hidden rounded-[2rem] bg-cream-2"
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(null)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${color}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="size-full"
          >
            <div
              className="size-full transition-transform duration-300 ease-out"
              style={zoom ? { transform: "scale(1.7)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            >
              {render(view, true)}
            </div>
          </motion.div>
        </AnimatePresence>
        {product.badge && <span className="absolute start-5 top-5 rounded-full bg-cocoa px-3 py-1 text-xs font-semibold text-cream">{product.badge}</span>}
      </div>
      {count > 1 && (
        <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] md:max-h-[34rem] md:flex-col md:overflow-y-auto" role="tablist" aria-label="صور القطعة">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={view === i}
              aria-label={`صورة ${i + 1}`}
              onClick={() => setView(i)}
              className={`relative size-20 shrink-0 overflow-hidden rounded-2xl border-2 transition md:size-24 ${view === i ? "border-cocoa" : "border-transparent opacity-70 hover:opacity-100"}`}
            >
              {render(i)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** آراء القطعة + نموذج لإضافة رأي (بينعرض بعد موافقة المتجر) */
function ProductReviews({ product }: { product: TProduct }) {
  const { data: reviews } = useAsync(() => getProductReviews(product.id), [product.id]);
  const { data: homeReviews } = useAsync(() => getHomeReviews().catch(() => []), []);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", text: "", rating: 5 });
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState("");

  const list = reviews && reviews.length ? reviews : homeReviews ?? [];
  const own = !!reviews?.length;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2 || form.text.trim().length < 3) return setErr("اكتبي اسمك ورأيك");
    setErr("");
    setState("sending");
    try {
      await submitReview({ productId: product.id, ...form });
      setState("done");
    } catch (ex) {
      setState("idle");
      setErr(ex instanceof Error ? ex.message : "ما وصل الرأي");
    }
  };

  return (
    <section className="mt-24 bg-cream-2/70 py-16 md:py-20">
      <div className="container-b">
        <SectionHeading
          eyebrow="آراء البنات"
          title={own ? `شو حكوا عن ${product.name}` : "شو حكوا عن بَنان"}
          align="start"
          action={
            <button onClick={() => setOpen((o) => !o)} className="btn btn-ghost self-start md:self-auto">
              <PenLine className="size-4" /> اكتبي رأيك
            </button>
          }
        />
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              {state === "done" ? (
                <p className="mb-8 rounded-3xl bg-sage-soft p-6 text-center font-serif text-xl">شكراً على رأيك 🤍 رح يظهر هون بعد ما نراجعه.</p>
              ) : (
                <form onSubmit={submit} className="mb-10 grid gap-4 rounded-[2rem] border border-dashed border-line bg-linen p-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="rv-name" className="label">اسمك</label>
                    <input id="rv-name" value={form.name} maxLength={60} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" />
                  </div>
                  <div>
                    <label htmlFor="rv-city" className="label">مدينتك (اختياري)</label>
                    <input id="rv-city" value={form.city} maxLength={40} onChange={(e) => setForm({ ...form, city: e.target.value })} className="field" />
                  </div>
                  <div className="md:col-span-2">
                    <p className="label">تقييمك</p>
                    <div className="flex gap-1" role="radiogroup" aria-label="التقييم">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" role="radio" aria-checked={form.rating === n} aria-label={`${n} نجوم`} onClick={() => setForm({ ...form, rating: n })}>
                          <Star className={`size-7 transition ${n <= form.rating ? "fill-gold text-gold" : "text-sand"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="rv-text" className="label">رأيك</label>
                    <textarea id="rv-text" rows={3} maxLength={1000} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="field resize-none" />
                  </div>
                  <p className="text-sm text-rose md:col-span-2" role="alert">{err}</p>
                  <button disabled={state === "sending"} className="btn btn-primary md:col-span-2 md:justify-self-start">
                    {state === "sending" ? "عم نرسل..." : "إرسال الرأي"}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {list.length > 0 ? (
        <ReviewsMarquee reviews={list} />
      ) : (
        <p className="container-b text-cocoa-3">لسا ما في آراء — كوني أول وحدة بتكتب 🤍</p>
      )}
    </section>
  );
}

/** معاينة حية: النص المكتوب بيتطرّز على بطاقة */
function PersonalizePreview({ text }: { text: string }) {
  return (
    <div className="relative mt-3 flex items-center gap-4 rounded-2xl bg-cream-2 p-4">
      <svg viewBox="0 0 120 70" className="h-16 w-28 shrink-0" aria-hidden>
        <rect x="4" y="4" width="112" height="62" rx="10" fill="#fffdfa" stroke="#e4d5c4" />
        <rect x="10" y="10" width="100" height="50" rx="7" fill="none" stroke="#c98f86" strokeDasharray="3 3" />
        <AnimatePresence mode="wait">
          <motion.text
            key={text}
            x="60"
            y="43"
            textAnchor="middle"
            fontFamily="Aref Ruqaa, serif"
            fontSize={text.length > 10 ? 12 : 18}
            fill="#4a2a18"
            stroke="#4a2a18"
            strokeWidth=".4"
            strokeDasharray="200"
            initial={{ strokeDashoffset: 200, opacity: 0.3 }}
            animate={{ strokeDashoffset: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {text.slice(0, 18) || "اسمك هون"}
          </motion.text>
        </AnimatePresence>
      </svg>
      <p className="text-sm leading-6 text-cocoa-2">هيك تقريباً رح ينطرز النص على قطعتك ✨ الشكل النهائي بيكون بخيط يدوي.</p>
    </div>
  );
}

function ProductView({ product }: { product: TProduct }) {
  const { add, toggleWish, isWished, setDrawerOpen } = useShop();
  const [color, setColor] = useState(product.colors[0] ?? NO_COLOR);
  const [size, setSize] = useState<string | undefined>(product.sizes[0]);
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const out = product.stock !== null && product.stock <= 0;
  const maxQty = product.stock ?? 20;
  const wished = isWished(product.id);
  const { site, categories } = useSite();
  const category = categories.find((c) => c.id === product.categoryId);
  const { data: related } = useAsync(() => getRelatedProducts(product), [product.id]);
  useTitle(product.name);

  useEffect(() => {
    setColor(product.colors[0] ?? NO_COLOR);
    setSize(product.sizes[0]);
    setNote("");
    setQty(1);
  }, [product]);

  const addToCart = () => {
    add(product, { color, size, note, qty, from: btnRef.current });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      /* المستخدم ألغى المشاركة */
    }
  };

  return (
    <>
      <div className="container-b pt-6 md:pt-10">
        <nav aria-label="مسار الصفحة" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-cocoa-3">
          <Link to="/" className="hover:text-cocoa">الرئيسية</Link>
          <Diamond className="size-1.5" />
          <Link to="/shop" className="hover:text-cocoa">المتجر</Link>
          {category && (
            <>
              <Diamond className="size-1.5" />
              <Link to={`/shop?category=${category.slug}`} className="hover:text-cocoa">{category.name}</Link>
            </>
          )}
          <Diamond className="size-1.5" />
          <span className="text-cocoa">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Gallery product={product} color={color.hex} tint={category?.tint} />
          </div>

          <div>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="eyebrow">{category?.name}</p>
              <h1 className="mt-2 font-display text-4xl leading-tight md:text-5xl">{product.name}</h1>
              {product.reviewsCount > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-cocoa-3">
                  <Stars value={product.rating} />
                  <span>{product.rating} · {product.reviewsCount} تقييم</span>
                </div>
              )}
              <Price value={product.price} compareAt={product.compareAtPrice ?? undefined} className="mt-5 text-2xl" />
              <p className="mt-4 text-lg leading-8 text-cocoa-2">{product.shortDescription}</p>
            </motion.div>

            <StitchDivider className="my-7" />

            {/* اللون */}
            {product.colors.length > 0 && (
            <fieldset>
              <legend className="label">اللون: <span className="font-normal text-cocoa">{color.name}</span></legend>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c)}
                    aria-label={c.name}
                    aria-pressed={c.name === color.name}
                    className={`relative size-11 rounded-full transition ${c.name === color.name ? "ring-2 ring-cocoa ring-offset-2 ring-offset-cream" : "ring-1 ring-line hover:scale-110"}`}
                    style={{ background: c.hex }}
                  >
                    {c.name === color.name && (
                      <motion.span layoutId="color-check" className="absolute inset-0 grid place-items-center">
                        <Check className="size-4 text-cocoa mix-blend-multiply" />
                      </motion.span>
                    )}
                  </button>
                ))}
              </div>
            </fieldset>
            )}

            {product.sizes.length > 0 && (
              <fieldset className="mt-6">
                <legend className="label">الحجم</legend>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      aria-pressed={size === s}
                      className={`rounded-full border px-5 py-2 text-sm transition ${size === s ? "border-cocoa bg-cocoa text-cream" : "border-line bg-linen hover:border-cocoa-3"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {product.personalizable && (
              <div className="mt-6">
                <label htmlFor="note" className="label">التخصيص (اختياري)</label>
                <input
                  id="note"
                  value={note}
                  maxLength={30}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="مثلاً: اسم، حرف، أو تاريخ"
                  className="field"
                />
                <PersonalizePreview text={note} />
              </div>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {!out && <QtyStepper value={qty} onChange={(v) => setQty(Math.max(1, Math.min(v, maxQty)))} max={maxQty} />}
              <button
                ref={btnRef}
                onClick={addToCart}
                disabled={out}
                className="btn btn-primary min-w-0 flex-1 !py-3.5"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={String(added)} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} className="flex items-center gap-2">
                    {out ? "نفدت الكمية" : added ? (<><Check className="size-5" /> انضافت للسلة</>) : (<><ShoppingBag className="size-5" /> أضيفي للسلة · {formatPrice(product.price * qty)}</>)}
                  </motion.span>
                </AnimatePresence>
              </button>
              <button
                onClick={() => toggleWish(product.id)}
                className={`grid size-12 place-items-center rounded-full border transition ${wished ? "border-rose bg-rose-soft" : "border-line bg-linen hover:border-rose"}`}
                aria-label={wished ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                aria-pressed={wished}
              >
                <motion.span key={String(wished)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 12 }}>
                  <Heart className={`size-5 ${wished ? "fill-rose text-rose" : ""}`} />
                </motion.span>
              </button>
            </div>

            <AnimatePresence>
              {added && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <button onClick={() => setDrawerOpen(true)} className="mt-3 text-sm font-semibold text-rose underline underline-offset-4">عرض السلة ←</button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <a
                href={whatsappLink(site.whatsapp, `مرحبا بَنان 🤍 بدي أسأل عن "${product.name}"${color.name ? ` (${color.name})` : ""}`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-cocoa-2 hover:text-cocoa"
              >
                <WhatsappIcon className="size-4" /> اسألينا عن القطعة
              </a>
              <button onClick={share} className="inline-flex items-center gap-1.5 text-cocoa-2 hover:text-cocoa">
                <Share2 className="size-4" /> {copied ? "انتسخ الرابط ✓" : "شاركي القطعة"}
              </button>
            </div>

            <ul className="mt-7 grid gap-3 rounded-3xl border border-dashed border-line bg-linen p-5 text-sm sm:grid-cols-3">
              <li className="flex items-center gap-2"><Clock className="size-5 shrink-0 text-rose" /> {product.makingTime || "صُنع باليد بحب"}</li>
              <li className="flex items-center gap-2"><Truck className="size-5 shrink-0 text-rose" /> {site.freeDeliveryOver != null ? <>مجاني فوق {formatPrice(site.freeDeliveryOver)}</> : "توصيل لكل فلسطين"}</li>
              <li className="flex items-center gap-2"><Gift className="size-5 shrink-0 text-rose" /> تغليف هدية بـ {formatPrice(site.giftWrapPrice)}</li>
            </ul>
            {!out && product.stock !== null && product.stock <= 5 && (
              <p className="mt-3 text-sm font-semibold text-rose">باقي {product.stock === 1 ? "قطعة وحدة بس" : `${product.stock} قطع بس`} — كل قطعة معمولة بإيدينا 🤍</p>
            )}

            <div className="mt-6">
              <Accordion title="عن القطعة" defaultOpen><div className="whitespace-pre-line">{product.description}</div></Accordion>
              {product.materials.length > 0 && (
                <Accordion title="المواد">
                  <ul className="list-inside list-disc space-y-1">
                    {product.materials.map((m) => <li key={m}>{m}</li>)}
                  </ul>
                </Accordion>
              )}
              {product.care && <Accordion title="العناية بالقطعة">{product.care}</Accordion>}
              <Accordion title="التوصيل والإرجاع">
                توصيل لكل فلسطين خلال 2 – 5 أيام عمل، والدفع عند الاستلام. القطع الجاهزة بتنرجع خلال 3 أيام إذا كانت بحالتها الأصلية؛ القطع المخصّصة ما بتنرجع.
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      <ProductReviews product={product} />

      {related && related.length > 0 && (
        <section className="container-b mt-24">
          <SectionHeading eyebrow="ممكن تحبّي كمان" title="قطع من نفس العيلة" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </>
  );
}

export default function Product() {
  const { slug = "" } = useParams();
  const { data: product, loading } = useAsync(() => getProductBySlug(slug), [slug]);
  if (loading && !product) return <YarnLoader />;
  if (!product) return <NotFound />;
  return <ProductView product={product} />;
}
