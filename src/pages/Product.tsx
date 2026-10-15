import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, ChevronDown, Clock, RotateCcw, Ruler as RulerIcon, Truck } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { CareSymbol, Ruler } from "../components/Decor";
import { categoryNames } from "../components/Header";
import { GarmentFlat } from "../components/GarmentFlat";
import { ProductCard } from "../components/ProductCard";
import { Swatch } from "../components/Swatch";
import { Breadcrumbs, Button, EmptyState, HandNote, Meter, PinHead, Reveal, SectionHead, Skeleton } from "../components/ui";
import { getFabric, getProduct, getProductsBySlugs, getWearerNotes } from "../lib/api";
import { fitNotes, suggestSize } from "../lib/fit";
import { pad, useAsync, useDocumentTitle } from "../lib/hooks";
import { useShop } from "../lib/store";
import type { Product as P, WearerNote } from "../types";

function Fold({ title, children, open: initial = false }: { title: string; children: ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(initial);
  return (
    <div className="border-b border-dashed border-ink/20">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-4 text-left" aria-expanded={open}>
        <span className="font-display text-lg">{title}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pb-5 text-[0.95rem] leading-relaxed text-ink-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Sizes as notches along a tailor's tape. */
function SizeTape({ product, value, onChange }: { product: P; value: string; onChange: (s: string) => void }) {
  return (
    <div className="relative rounded-md bg-[#efdcaa] px-2 pb-2 pt-5 ring-1 ring-[#d9c58f]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-3 opacity-70"
        style={{ backgroundImage: "repeating-linear-gradient(to left, #1e1c19 0 1px, transparent 1px 6px)" }}
      />
      <div className="flex gap-1" role="radiogroup" aria-label="المقاس">
        {product.sizes.map((s) => {
          const out = product.soldOutSizes?.includes(s);
          const low = product.lowSizes?.includes(s);
          const sel = value === s;
          return (
            <button
              key={s}
              role="radio"
              aria-checked={sel}
              disabled={out}
              onClick={() => onChange(s)}
              className={`relative flex-1 rounded py-2.5 font-mono text-[0.8rem] transition ${sel ? "bg-ink text-paper" : out ? "cursor-not-allowed text-ink/30 line-through" : "hover:bg-[#f6e8c2]"}`}
              aria-label={`${s}${out ? "، نفد" : low ? "، آخر القطع" : ""}`}
            >
              {s}
              {low && !out && <span className="absolute -top-1 end-1 h-1.5 w-1.5 rounded-full bg-thread" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SizeHelper({ product, onPick }: { product: P; onPick: (s: string) => void }) {
  const isBottom = product.category === "trousers" || product.category === "skirts";
  const [val, setVal] = useState(isBottom ? 76 : 96);
  const [pref, setPref] = useState<"neat" | "easy">("easy");
  const s = suggestSize({ category: product.category, chest: isBottom ? undefined : val, waist: isBottom ? val : undefined, fit: product.fit, preference: pref });
  return (
    <div className="mt-3 rounded-md bg-paper-2 p-4 ring-1 ring-line">
      <div className="flex items-baseline justify-between">
        <label htmlFor="body" className="label text-ink-3">
          محيط {isBottom ? "خصرك" : "صدرك"}
        </label>
        <span className="font-mono text-sm">{val} سم</span>
      </div>
      <input id="body" type="range" min={isBottom ? 60 : 78} max={isBottom ? 100 : 126} value={val} onChange={(e) => setVal(Number(e.target.value))} className="mt-2 w-full accent-thread" />
      <div className="mt-3 flex gap-2 text-xs">
        {(["neat", "easy"] as const).map((p) => (
          <button key={p} onClick={() => setPref(p)} className={`rounded-full px-3 py-1 ring-1 ${pref === p ? "bg-ink text-paper ring-ink" : "ring-line"}`}>
            {p === "neat" ? "أحبّها مرتّبة" : "أحبّها مريحة"}
          </button>
        ))}
      </div>
      {s && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-ink-2">
            <span className="font-mono text-xl font-bold text-ink">{s.size}</span> — {s.why}
          </p>
          {product.sizes.includes(s.size) && !product.soldOutSizes?.includes(s.size) && (
            <button onClick={() => onPick(s.size)} className="shrink-0 rounded-full bg-ink px-3 py-1.5 text-xs text-paper">
              اختر {s.size}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CostPerWear({ price }: { price: number }) {
  const { money } = useShop();
  const [perMonth, setPerMonth] = useState(6);
  const [years, setYears] = useState(8);
  const wears = perMonth * 12 * years;
  const cpw = price / wears;
  return (
    <div className="grid gap-8 rounded-md bg-tissue p-6 ring-1 ring-line md:grid-cols-2 md:p-10">
      <div>
        <p className="label text-thread">الحساب الوحيد الذي نؤمن به</p>
        <h3 className="mt-2 font-display text-[2.2rem] leading-tight">كلفة اللبسة الواحدة</h3>
        <p className="mt-2 text-ink-2">كن صادقاً. كم مرة ستلبسها فعلاً؟ (وتذكّر: نرفوها مجاناً، فالسنوات قد تطول.)</p>
        <div className="mt-6 space-y-5">
          <div>
            <div className="flex justify-between text-sm">
              <label htmlFor="cpw-m">مرات في الشهر</label>
              <span className="font-mono">{perMonth}×</span>
            </div>
            <input id="cpw-m" type="range" min={1} max={25} value={perMonth} onChange={(e) => setPerMonth(Number(e.target.value))} className="mt-2 w-full accent-thread" />
          </div>
          <div>
            <div className="flex justify-between text-sm">
              <label htmlFor="cpw-y">لكم سنة</label>
              <span className="font-mono">{years} سنوات</span>
            </div>
            <input id="cpw-y" type="range" min={1} max={25} value={years} onChange={(e) => setYears(Number(e.target.value))} className="mt-2 w-full accent-thread" />
          </div>
        </div>
      </div>
      <div className="relative flex flex-col justify-center rounded-md bg-paper bg-ruled p-6 ring-1 ring-line">
        <p className="label text-ink-3">{money(price)} ÷ {wears.toLocaleString("en")} لبسة</p>
        <motion.p key={cpw.toFixed(2)} initial={{ y: 6, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }} className="mt-2 font-mono text-[3rem] font-bold leading-none">
          {money(cpw, 2)}
          <span className="ms-2 font-sans text-xl text-ink-3">للبسة</span>
        </motion.p>
        <p className="mt-3 font-hand text-2xl text-chalk">
          {cpw < 0.5 ? "أقل من تذكرة باص. البسها حتى تبلى — وسنرفوها." : cpw < 2 ? "تقريباً بسعر فنجان قهوة." : cpw < 6 ? "معقول — لكن ربما تلبسها أكثر قليلاً؟" : "همم. تأكّد أنك ستحبّها. أو استعِر واحدة."}
        </p>
      </div>
    </div>
  );
}

function Passport({ product }: { product: P }) {
  return (
    <div className="relative">
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-6">
        {product.passport.map((s, i) => (
          <Reveal key={s.stage + i} delay={i * 0.07} className="w-[70vw] shrink-0 snap-start sm:w-64 md:w-auto">
            <div className="relative h-full rounded-md bg-tissue p-5 ring-1 ring-line">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-ink-3">{pad(i + 1, 2)}</span>
                <span
                  className="rotate-[-8deg] rounded border-2 border-double px-1.5 py-0.5 text-[0.75rem] font-bold"
                  style={{ color: i % 3 === 0 ? "#c2432e" : i % 3 === 1 ? "#3f6a8a" : "#6f7d55", borderColor: "currentColor" }}
                >
                  {s.stage}
                </span>
              </div>
              <p className="mt-5 font-display text-xl leading-snug">{s.place}</p>
              <p className="mt-1 text-sm text-ink-2">{s.maker}</p>
              <p className="mt-3 border-t border-dashed border-ink/20 pt-3 font-hand text-xl leading-tight text-chalk">{s.note}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function WearerNotes({ notes }: { notes: WearerNote[] }) {
  if (!notes.length)
    return <p className="text-ink-2">لا ملاحظات بعد — هذه القطعة ما زالت جديدة على العالم. البسها موسماً وأخبرنا كيف كانت.</p>;
  const counts = { "أصغر من المعتاد": 0, "مطابق للمقاس": 0, "أكبر من المعتاد": 0 };
  notes.forEach((n) => counts[n.fitVerdict]++);
  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <div className="rounded-md bg-paper-2 p-5 ring-1 ring-line">
        <p className="label text-ink-3">كيف تأتي على الجسم، بحسب من لبسها</p>
        <div className="mt-4 space-y-2">
          {(Object.keys(counts) as (keyof typeof counts)[]).map((k) => (
            <div key={k} className="flex items-center gap-3 text-sm">
              <span className="w-28 shrink-0">{k}</span>
              <div className="h-2 flex-1 rounded-full bg-ink/10">
                <div className="h-full rounded-full bg-ink" style={{ width: `${(counts[k] / notes.length) * 100}%` }} />
              </div>
              <span className="w-4 font-mono text-xs">{counts[k]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {notes.map((n) => (
          <figure key={n.name} className="rounded-md bg-tissue bg-ruled p-6 ring-1 ring-line">
            <blockquote className="font-display text-[1.25rem] leading-relaxed">«{n.text}»</blockquote>
            <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2">
              <span className="font-medium text-ink">{n.name}</span>
              <span>{n.city}</span>
              <span className="label rounded-full bg-butter/60 px-2 py-0.5 text-ink">لُبست {n.worn}</span>
              <span className="label text-ink-3">
                مقاس {n.size} · {n.height}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export default function Product() {
  const { slug = "" } = useParams();
  const [params] = useSearchParams();
  const { data: product, loading } = useAsync(() => getProduct(slug), [slug]);
  const { data: notes } = useAsync(() => getWearerNotes(slug), [slug]);
  const { data: fabric } = useAsync(() => (product ? getFabric(product.fabricId) : Promise.resolve(null)), [product?.fabricId]);
  const { data: pairs } = useAsync(() => getProductsBySlugs(product?.pairsWith ?? []), [product?.slug]);
  const { addToRail, setRailOpen, money, togglePin, isPinned, toast, chapters } = useShop();

  const [cw, setCw] = useState(0);
  const [size, setSize] = useState("");
  const [view, setView] = useState<"flat" | "cloth" | "measure">("flat");
  const [helper, setHelper] = useState(false);
  const [nudge, setNudge] = useState(false);

  useEffect(() => {
    const c = Number(params.get("c") ?? 0);
    setCw(Number.isFinite(c) ? c : 0);
    setSize("");
    setView("flat");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);
  useEffect(() => {
    if (product && product.sizes.length === 1) setSize(product.sizes[0]);
  }, [product]);

  useDocumentTitle(product?.name ?? "قطعة");
  const chapter = useMemo(() => chapters?.find((c) => c.slug === product?.chapter), [product, chapters]);

  if (loading && !product)
    return (
      <div className="wrap grid gap-10 py-10 lg:grid-cols-12">
        <Skeleton className="aspect-square lg:col-span-7" />
        <div className="space-y-4 lg:col-span-5">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  if (!product)
    return <EmptyState title="هذه القطعة ليست على الجدار." text="ربما نفد إصدارها، أو انفكّت غرزة الرابط." action={<Button to="/shop">تصفّح المتجر</Button>} />;

  const c = product.colorways[Math.min(cw, product.colorways.length - 1)];
  const left = product.edition.of - product.edition.made;
  const pinned = isPinned(product.slug);

  const add = () => {
    if (!size) {
      setNudge(true);
      setTimeout(() => setNudge(false), 900);
      return;
    }
    addToRail({ slug: product.slug, colorway: c.name, size });
    toast("عُلّقت على الراف", `${product.name} · ${c.name} · ${size}`);
    setRailOpen(true);
  };

  return (
    <>
      <div className="wrap pt-6">
        <Breadcrumbs trail={[{ label: "المتجر", to: "/shop" }, { label: categoryNames[product.category], to: `/shop?category=${product.category}` }, { label: product.name }]} />
      </div>

      <section className="wrap grid gap-10 py-8 lg:grid-cols-12 lg:gap-12">
        {/* visual */}
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-28">
            <div className="relative aspect-square overflow-hidden rounded-[10px] bg-mat ring-1 ring-chalk/20">
              <span className="label absolute right-4 top-4 z-10 text-chalk/80">
                {product.id.toUpperCase()} · {c.name}
              </span>
              <PinHead className="absolute left-4 top-4 h-7 w-7" />
              <AnimatePresence mode="wait">
                {view === "flat" && (
                  <motion.div key={`flat-${c.name}`} className="absolute inset-[10%]" initial={{ opacity: 0, scale: 0.96, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                    <GarmentFlat kind={product.garment} {...c} className="h-full w-full" title={`${product.name} — ${c.name}`} />
                  </motion.div>
                )}
                {view === "cloth" && (
                  <motion.div key={`cloth-${c.name}`} className="absolute inset-[8%] grid place-items-center" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <Swatch hex={c.hex} accent={c.accent} pattern={c.pattern} width={200} height={200} scale={4.5} className="w-[86%]" label={`قماش ${c.name} عن قرب`} />
                    <HandNote className="absolute bottom-0 left-2">{fabric ? `${fabric.name}، ${fabric.gsm} غ/م²` : ""}</HandNote>
                  </motion.div>
                )}
                {view === "measure" && (
                  <motion.div key="measure" className="absolute inset-[8%] grid grid-cols-[1.2fr_1fr] items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <GarmentFlat kind={product.garment} {...c} className="w-full opacity-80" shadow={false} />
                    <dl className="space-y-3">
                      {product.measurements.map((m) => (
                        <div key={m.label} className="border-b border-dashed border-chalk/40 pb-2">
                          <dt className="label text-chalk">{m.label}</dt>
                          <dd className="font-display text-3xl">
                            {m.cm}
                            <span className="ms-1 text-sm text-ink-3">سم</span>
                          </dd>
                        </div>
                      ))}
                      <p className="font-hand text-lg leading-tight text-chalk">ممدودة، مقاس M / 30</p>
                    </dl>
                  </motion.div>
                )}
              </AnimatePresence>
              <Ruler cm={50} className="absolute inset-x-0 bottom-0 h-6 w-full" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2" role="tablist" aria-label="طريقة العرض">
              {(
                [
                  ["flat", "الرسمة"],
                  ["cloth", "القماش"],
                  ["measure", "القياسات"],
                ] as const
              ).map(([v, l]) => (
                <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={`rounded-md py-2.5 text-sm ring-1 transition ${view === v ? "bg-ink text-paper ring-ink" : "bg-tissue ring-line hover:ring-ink/30"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* buy box */}
        <div className="lg:col-span-5">
          {chapter && (
            <Link to={`/chapters/${chapter.slug}`} className="label inline-flex items-center gap-2 text-ink-3 hover:text-thread">
              <span className="font-display text-base text-thread">الفصل {chapter.numeral}</span> {chapter.title} · {chapter.season}
            </Link>
          )}
          <h1 className="mt-3 font-display text-[2.6rem] leading-[1.2] md:text-[3.4rem]">{product.name}</h1>
          <p className="mt-2 font-hand text-[1.7rem] leading-tight text-chalk">{product.line}</p>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-y border-dashed border-ink/20 py-4">
            <p className="font-mono text-[1.7rem] font-bold">{money(product.price)}</p>
            <div className="text-left">
              <p className="label text-ink-3">
                الإصدار · رقم {pad(product.edition.made)} من {product.edition.of}
              </p>
              <div className="mt-1.5 me-0 ms-auto flex h-1.5 w-44 overflow-hidden rounded-full bg-ink/10">
                <div className="h-full bg-thread" style={{ width: `${(product.edition.made / product.edition.of) * 100}%` }} />
              </div>
              <p className="mt-1 text-xs text-ink-2">بقي {left} في هذا الإصدار</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="label text-ink-3">
              اللون — <span className="text-ink">{c.name}</span>
            </p>
            <div className="mt-3 flex gap-3">
              {product.colorways.map((col, i) => (
                <button key={col.name} onClick={() => setCw(i)} aria-label={col.name} aria-pressed={i === cw} className={`rounded-md p-1 ring-1 transition ${i === cw ? "ring-2 ring-ink" : "ring-line hover:ring-ink/40"}`}>
                  <Swatch hex={col.hex} accent={col.accent} pattern={col.pattern} width={56} height={56} className="w-14" label={col.name} />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-baseline justify-between">
              <p className="label text-ink-3">
                المقاس {size && <span className="text-ink">— {size}</span>}
              </p>
              {product.sizes.length > 1 && (
                <button onClick={() => setHelper((h) => !h)} className="flex items-center gap-1 text-sm underline decoration-dashed underline-offset-4 hover:text-thread">
                  <RulerIcon className="h-4 w-4" /> {helper ? "أخفِ مساعد المقاس" : "أيّ مقاس؟"}
                </button>
              )}
            </div>
            <motion.div className="mt-3" animate={nudge ? { x: [0, -8, 8, -5, 5, 0] } : {}} transition={{ duration: 0.5 }}>
              <SizeTape product={product} value={size} onChange={setSize} />
            </motion.div>
            {nudge && <p className="mt-2 text-sm text-thread">اختر مقاساً أولاً — أو اسأل مساعد المقاس.</p>}
            <p className="mt-2 text-xs text-ink-3">
              {fitNotes[product.fit]} {product.lowSizes?.length ? "النقطة الحمراء = آخر القطع." : ""}
            </p>
            <AnimatePresence>{helper && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><SizeHelper product={product} onPick={(s) => { setSize(s); setHelper(false); }} /></motion.div>}</AnimatePresence>
          </div>

          <div className="mt-7 flex gap-3">
            <Button onClick={add} className="flex-1 py-4">
              علّقها على الراف — {money(product.price)}
            </Button>
            <button
              onClick={() => {
                togglePin(product.slug);
                toast(pinned ? "أُزيل التثبيت" : "ثُبّتت على لوحتك", product.name);
              }}
              className={`grid h-14 w-14 shrink-0 place-items-center rounded-full ring-1 transition ${pinned ? "bg-paper-2 ring-thread" : "ring-ink/20 hover:ring-ink/50"}`}
              aria-label={pinned ? "إزالة التثبيت" : "ثبّتها لوقت لاحق"}
              aria-pressed={pinned}
            >
              <PinHead className={`h-7 w-7 ${pinned ? "" : "opacity-40 grayscale"}`} />
            </button>
          </div>

          <ul className="mt-6 grid gap-3 text-sm text-ink-2 sm:grid-cols-3">
            <li className="flex gap-2"><Clock className="h-4 w-4 shrink-0 text-thread" /> {product.makingHours} ساعة صنع، بيد {product.cutter.split(" ")[0]}</li>
            <li className="flex gap-2"><Truck className="h-4 w-4 shrink-0 text-thread" /> تُكوى وتُرسل خلال 2–4 أيام</li>
            <li className="flex gap-2"><RotateCcw className="h-4 w-4 shrink-0 text-thread" /> إرجاع خلال 30 يوماً، ورفو مدى الحياة</li>
          </ul>

          <div className="mt-8 border-t border-dashed border-ink/20">
            <Fold title="عن القطعة" open>
              <p>{product.description}</p>
            </Fold>
            <Fold title="التفاصيل">
              <ul className="space-y-2">
                {product.details.map((d) => (
                  <li key={d} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-sage" /> {d}</li>
                ))}
              </ul>
            </Fold>
            <Fold title="القماش والوزن">
              <p>{product.composition}</p>
              <p className="mt-1 font-mono text-sm">{product.weight}</p>
              {fabric && (
                <div className="mt-4 space-y-2 rounded-md bg-paper-2 p-4">
                  <p className="font-display text-lg text-ink">{fabric.name} — {fabric.origin}</p>
                  <Meter label="الدفء" value={fabric.warmth} />
                  <Meter label="التنفّس" value={fabric.breath} />
                  <Meter label="الانسدال" value={fabric.drape} />
                  <Link to={`/fabrics#${fabric.id}`} className="mt-2 inline-block text-sm underline decoration-dashed underline-offset-4 hover:text-thread">اقرأ عن هذا القماش ←</Link>
                </div>
              )}
            </Fold>
            <Fold title="العناية">
              <div className="mb-3 flex gap-3 text-ink">
                <CareSymbol kind={product.care.join(" ").includes("يدوي") ? "hand" : "wash"} />
                <CareSymbol kind="noBleach" />
                <CareSymbol kind={product.care.join(" ").includes("مسطّح") ? "flat" : "dry"} />
                <CareSymbol kind="iron" />
              </div>
              <ul className="space-y-1">{product.care.map((x) => <li key={x}>— {x}</li>)}</ul>
              <Link to="/care" className="mt-3 inline-block text-sm underline decoration-dashed underline-offset-4 hover:text-thread">دليل العناية الكامل ←</Link>
            </Fold>
            <Fold title={`ملاحظة من ${product.cutter.split(" ")[0]}، القاطع`}>
              <p className="font-hand text-[1.5rem] leading-relaxed text-chalk">«{product.cutterNote}»</p>
              <p className="mt-2 text-sm">— {product.cutter}</p>
            </Fold>
          </div>
        </div>
      </section>

      <section className="wrap py-16">
        <SectionHead no="ج" kicker="جواز سفر القطعة" title={<>أين <em className="text-thread not-italic">كانت</em> هذه القطعة</>} aside={<p className="text-ink-2">كل خطوة، كل يد، كل مكان — من الحقل حتى العلبة التي تصلك بها.</p>} />
        <div className="mt-10">
          <Passport product={product} />
        </div>
      </section>

      <section className="wrap py-10">
        <CostPerWear price={product.price} />
      </section>

      <section className="wrap py-16">
        <SectionHead no="م" kicker="ملاحظات من لبسوها" title={<>ماذا حدث <em className="text-thread not-italic">بعد</em> أن اشتروها</>} />
        <div className="mt-10">{notes ? <WearerNotes notes={notes} /> : <Skeleton className="h-40" />}</div>
      </section>

      {pairs && pairs.length > 0 && (
        <section className="wrap py-16">
          <SectionHead
            no="ت"
            kicker="تُلبس مع"
            title={<>قطع <em className="text-thread not-italic">تتّفق</em> معها</>}
            aside={
              <Button to={`/dressing-table?with=${product.slug}`} variant="paper">
                افردها معاً على الطاولة <ArrowLeft className="h-4 w-4" />
              </Button>
            }
          />
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
            {pairs.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
