import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { CareSymbol, Marquee, RotatingStamp, Ruler, ScrollThread } from "../components/Decor";
import { GarmentFlat } from "../components/GarmentFlat";
import { PriceTag } from "../components/PriceTag";
import { ProductCard } from "../components/ProductCard";
import { Swatch } from "../components/Swatch";
import { Button, HandNote, Meter, PinHead, Reveal, SectionHead, Skeleton } from "../components/ui";
import { getChapters, getFabrics, getJournal, getProducts, getProductsBySlugs } from "../lib/api";
import { formatDate, pad, useAsync, useDocumentTitle } from "../lib/hooks";
import { useShop } from "../lib/store";
import type { Department, GarmentKind, Product } from "../types";
import { departments } from "../lib/departments";

// ─── Hero: the cutting table ───────────────────────────────────
const heroPieces = [
  { slug: "ferryman-overcoat", cw: 0, note: "كتف منسدل +4 سم", noteAt: [58, 36] as const },
  { slug: "orchard-midi-dress", cw: 0, note: "3.5 م مكشكشة باليد", noteAt: [62, 160] as const },
  { slug: "harbour-chore-jacket", cw: 2, note: "الجيب يتّسع لكتاب", noteAt: [64, 122] as const },
];

/** Where to draw measurement lines on each flat, in the flat's own 200×240 space. */
const annotate: Partial<Record<GarmentKind, { w: [number, number, number]; h: [number, number] }>> = {
  coat: { w: [60, 140, 92], h: [24, 226] },
  dress: { w: [77, 123, 58], h: [24, 232] },
  jacket: { w: [62, 138, 92], h: [24, 166] },
};

function Measure({ kind, m1, m2, k }: { kind: GarmentKind; m1: string; m2: string; k: string }) {
  const a = annotate[kind];
  if (!a) return null;
  const [x1, x2, y] = a.w;
  const [y1, y2] = a.h;
  const draw = { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 1.1, ease: "easeInOut" as const } };
  const col = "#3f6a8a";
  return (
    <svg key={k} viewBox="0 0 200 240" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" fill="none" aria-hidden>
      <motion.path d={`M${x1},${y} H${x2}`} stroke={col} strokeWidth="0.9" {...draw} transition={{ ...draw.transition, delay: 0.5 }} />
      <motion.path d={`M${x1},${y - 4} v8 M${x2},${y - 4} v8`} stroke={col} strokeWidth="0.9" {...draw} transition={{ ...draw.transition, delay: 0.5 }} />
      <motion.text x={(x1 + x2) / 2} y={y - 4} textAnchor="middle" fontSize="7" fontFamily="IBM Plex Sans Arabic" fill={col} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
        {m1}
      </motion.text>
      <motion.path d={`M186,${y1} V${y2} M182,${y1} h8 M182,${y2} h8`} stroke={col} strokeWidth="0.9" {...draw} transition={{ ...draw.transition, delay: 0.8 }} />
      <motion.text x="194" y={(y1 + y2) / 2} fontSize="7" fontFamily="IBM Plex Sans Arabic" fill={col} transform={`rotate(90 192 ${(y1 + y2) / 2})`} textAnchor="middle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
        {m2}
      </motion.text>
      {/* notches, like on a paper pattern */}
      <motion.path d={`M${x1 - 2},${y + 30} l4,-3 l0,6 z M${x2 + 2},${y + 30} l-4,-3 l0,6 z`} fill={col} initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 1.8 }} />
    </svg>
  );
}

function Hero() {
  const { data } = useAsync(() => getProductsBySlugs(heroPieces.map((p) => p.slug)), []);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setI((n) => (n + 1) % heroPieces.length), 6500);
    return () => clearTimeout(t);
  }, [i, paused]);

  const piece = data?.[i];
  const meta = heroPieces[i];
  const c = piece?.colorways[meta.cw];

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-50" />
      <div className="wrap relative grid gap-10 pb-16 pt-8 md:pt-12 lg:grid-cols-12 lg:gap-8 lg:pb-24">
        {/* words */}
        <div className="flex flex-col lg:col-span-5 lg:pt-10">
          <p className="label flex flex-wrap items-center gap-2 text-ink-3">
            <span className="rounded-full bg-thread px-2 py-0.5 text-tissue">الفصل ٤</span> ملح وكتّان · صيف 2026
          </p>
          <h1 className="mt-6 font-display text-[3.3rem] leading-[1.15] text-balance sm:text-[4.2rem] xl:text-[5.4rem]">
            كل قطعة <br className="hidden sm:block" />
            تبدأ{" "}
            <span className="relative inline-block text-thread">
              ورقاً
              <svg viewBox="0 0 200 20" className="absolute -bottom-2 left-0 w-full" aria-hidden>
                <motion.path
                  d="M2 12 Q50 2 100 10 T198 8"
                  fill="none"
                  stroke="#c2432e"
                  strokeWidth="2.5"
                  strokeDasharray="7 5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.4, delay: 0.4 }}
                />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-7 max-w-md text-[1.08rem] leading-relaxed text-ink-2">
            تُرسم باليد في مشغلنا في بديا، تُقصّ واحدة واحدة، تُرقّم كاللوحات المطبوعة — وتُرفأ مجاناً طوال عمرها.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button to="/shop">
              ادخل المتجر <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
            </Button>
            <Button to="/dressing-table" variant="paper">
              نسّق إطلالة
            </Button>
          </div>

          <dl className="mt-auto grid grid-cols-3 gap-4 border-t border-dashed border-ink/20 pt-6 max-lg:mt-12">
            {[
              ["18", "قطعة على الراف"],
              ["1,204", "قطعة رُفيت هذا العام"],
              ["0", "تخفيضات، أبداً"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="font-display text-[2rem] leading-none md:text-[2.4rem]">{n}</dt>
                <dd className="label mt-1.5 text-ink-3">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* the cutting mat */}
        <div className="lg:col-span-7" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="relative">
            <div className="relative aspect-[5/5.4] overflow-hidden rounded-[10px] bg-mat ring-1 ring-chalk/20 sm:aspect-[5/4.4]">
              <PinHead className="absolute left-3 top-3 h-7 w-7" />
              <PinHead className="absolute right-3 top-3 h-7 w-7" colour="#3f6a8a" />
              <PinHead className="absolute bottom-9 left-3 h-7 w-7" colour="#b38a4a" />
              <span className="label absolute right-12 top-4 text-chalk/70">باترون رقم {piece ? piece.id.toUpperCase() : "—"} · مقياس 1:8</span>
              <span className="label absolute left-12 top-4 hidden text-chalk/70 sm:block">اتجاه النسيج ↓</span>

              <AnimatePresence mode="wait">
                {piece && c && (
                  <motion.div
                    key={piece.slug}
                    className="absolute inset-x-[16%] bottom-[12%] top-[9%] sm:inset-x-[24%]"
                    initial={{ opacity: 0, y: 30, rotate: -4 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    exit={{ opacity: 0, y: -20, rotate: 3 }}
                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link to={`/piece/${piece.slug}?c=${meta.cw}`} aria-label={`عرض ${piece.name}`} className="relative block h-full">
                      <GarmentFlat kind={piece.garment} {...c} className="h-full w-full" title={`${piece.name} — ${c.name}`} />
                      <Measure
                        k={piece.slug}
                        kind={piece.garment}
                        m1={`${piece.measurements[0].label} ${piece.measurements[0].cm} سم`}
                        m2={`الطول ${piece.measurements.find((m) => m.label === "الطول")?.cm ?? piece.measurements[1].cm} سم`}
                      />
                    </Link>
                    <motion.div
                      className="pointer-events-none absolute hidden sm:block"
                      style={{ right: `${100 - (meta.noteAt[0] / 200) * 100}%`, top: `${(meta.noteAt[1] / 240) * 100}%` }}
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.9 }}
                    >
                      <HandNote className="whitespace-nowrap" rotate={3}>→ {meta.note}</HandNote>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              {!piece && <Skeleton className="absolute inset-[20%]" />}

              <Ruler cm={60} className="absolute inset-x-0 bottom-0 h-6 w-full" />
            </div>

            {piece && (
              <Link to={`/piece/${piece.slug}`} className="absolute -left-1 top-14 w-24 sm:left-6 sm:w-28" aria-label={`سعر ${piece.name}`}>
                <PriceTag price={piece.price} edition={piece.edition} />
              </Link>
            )}

            <RotatingStamp text="صُنع ببطء · يُرفأ للأبد · مرقّم باليد · " className="absolute -bottom-10 -left-4 hidden h-28 w-28 text-ink/70 md:block">
              <span className="font-display text-2xl font-bold">أ</span>
            </RotatingStamp>
          </div>

          {/* piece selector */}
          <div className="mt-5 grid grid-cols-3 gap-2 md:ml-24">
            {heroPieces.map((h, n) => {
              const p = data?.[n];
              return (
                <button key={h.slug} onClick={() => setI(n)} className="group text-left" aria-label={p ? `اعرض ${p.name}` : "جارٍ التحميل"} aria-pressed={n === i}>
                  <div className="relative h-[2px] overflow-hidden bg-ink/10">
                    {n === i && (
                      <motion.div
                        key={`${i}-${paused}`}
                        className="absolute inset-y-0 right-0 bg-thread"
                        initial={{ width: paused ? "100%" : "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: paused ? 0 : 6.5, ease: "linear" }}
                      />
                    )}
                  </div>
                  <p className={`label mt-2 transition ${n === i ? "text-ink" : "text-ink-3 group-hover:text-ink"}`}>{pad(n + 1, 2)}</p>
                  <p className={`truncate text-[0.82rem] transition md:text-sm ${n === i ? "text-ink" : "text-ink-3 group-hover:text-ink"}`}>{p?.name ?? "…"}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Marquee ───────────────────────────────────────────────────
function CareBand() {
  const items = [
    <span className="flex items-center gap-3"><CareSymbol kind="wash" /> يُقصّ طبقة واحدة، على الورق</span>,
    <span className="flex items-center gap-3"><CareSymbol kind="iron" /> يُكوى ويُرقّم</span>,
    <span className="flex items-center gap-3"><CareSymbol kind="flat" /> يُطوى بورق الباترون</span>,
    <span className="flex items-center gap-3"><CareSymbol kind="hand" /> يُرفأ مجاناً، مدى الحياة</span>,
    <span className="flex items-center gap-3"><CareSymbol kind="dry" /> الدفع عند الاستلام</span>,
    <span className="flex items-center gap-3"><CareSymbol kind="noBleach" /> بلا تخفيضات. أبداً.</span>,
  ];
  return (
    <div className="border-y border-line bg-paper-2 py-4">
      <Marquee items={items} className="text-[0.92rem] text-ink-2" />
    </div>
  );
}

// ─── Departments: ستاتي / رجالي / أطفال ─────────────────────────
const deptLooks: Record<Department, { slug: string; cw: number; cls: string; r: number }[]> = {
  women: [
    { slug: "orchard-midi-dress", cw: 0, cls: "right-[8%] top-[10%] w-[46%]", r: -4 },
    { slug: "harbour-chore-jacket", cw: 2, cls: "left-[6%] top-[18%] w-[44%]", r: 6 },
  ],
  men: [
    { slug: "ferryman-overcoat", cw: 1, cls: "right-[6%] top-[8%] w-[46%]", r: -5 },
    { slug: "salt-linen-camp-shirt", cw: 0, cls: "left-[8%] top-[20%] w-[42%]", r: 5 },
  ],
  kids: [
    { slug: "little-orchard-dress", cw: 0, cls: "right-[10%] top-[14%] w-[40%]", r: -6 },
    { slug: "little-dockside-tee", cw: 0, cls: "left-[10%] top-[24%] w-[38%]", r: 6 },
  ],
};

function Departments() {
  const { catalog, bySlug } = useShop();
  const tints: Record<Department, string> = { women: "#f1e4dc", men: "#e6ebf1", kids: "#f5edd5" };
  return (
    <section className="py-16 md:py-20">
      <div className="wrap">
        <div className="grid gap-4 md:grid-cols-3">
          {departments.map((d, i) => {
            const count = catalog?.filter((p) => p.departments.includes(d.id)).length;
            return (
              <Reveal key={d.id} delay={i * 0.08}>
                <Link to={`/shop?dept=${d.id}`} className="group relative block aspect-[4/3.4] overflow-hidden rounded-md ring-1 ring-line transition hover:ring-ink/30" style={{ background: tints[d.id] }}>
                  <div className="absolute inset-0 bg-dots opacity-40" />
                  {deptLooks[d.id].map((l) => {
                    const p = bySlug(l.slug);
                    if (!p) return null;
                    return (
                      <div key={l.slug} className={`absolute ${l.cls} transition duration-700 group-hover:scale-105`} style={{ transform: `rotate(${l.r}deg)` }}>
                        <GarmentFlat kind={p.garment} {...p.colorways[l.cw]} className="w-full" />
                      </div>
                    );
                  })}
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between border-t border-dashed border-ink/15 bg-paper/90 p-5 backdrop-blur-sm">
                    <div>
                      <h2 className="font-display text-[2.6rem] leading-none">{d.name}</h2>
                      <p className="mt-1 text-sm text-ink-2">{d.tagline}</p>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-ink px-4 py-2 text-sm text-paper transition group-hover:bg-thread">
                      {count ?? "…"} قطعة <ArrowLeft className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── The rail ──────────────────────────────────────────────────
function TheRail() {
  const { data } = useAsync(() => getProducts({ chapter: "salt-and-linen" }), []);
  const scroller = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: number) => scroller.current?.scrollBy({ left: dir * (scroller.current.clientWidth * 0.7), behavior: "smooth" });

  return (
    <section className="py-20 md:py-28">
      <div className="wrap">
        <SectionHead
          no="01"
          kicker="معلّق الآن · الفصل الرابع"
          title={
            <>
              الراف: <em className="text-thread not-italic">ملح وكتّان</em>
            </>
          }
          aside={
            <div className="flex items-end justify-between gap-6 md:flex-col md:items-end">
              <p className="text-ink-2 md:text-left">ثماني قطع رُسمت في بيت صيّاد مُستعار على ساحل الأطلسي. كتّان تُرك في الحقل خمسة أسابيع للندى.</p>
              <div className="flex gap-2">
                <button onClick={() => scrollBy(1)} className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-ink/20 hover:bg-ink hover:text-paper" aria-label="القطع السابقة">
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => scrollBy(-1)} className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-ink/20 hover:bg-ink hover:text-paper" aria-label="القطع التالية">
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          }
        />
      </div>

      <div className="relative mt-12">
        {/* brass bar */}
        <div className="wrap pointer-events-none absolute inset-x-0 top-0 z-10">
          <div className="relative h-[7px] rounded-full bg-brass shadow-[0_2px_0_#0000001a,inset_0_-2px_0_#0000002a]">
            <span className="absolute -left-1 -top-2 h-6 w-2 rounded-sm bg-[#8a6a37]" />
            <span className="absolute -right-1 -top-2 h-6 w-2 rounded-sm bg-[#8a6a37]" />
          </div>
        </div>
        <div ref={scroller} className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pt-0 md:scroll-px-8 md:px-8 xl:px-[max(2rem,calc((100vw-1320px)/2+2rem))]">
          {(data ?? Array.from({ length: 4 })).map((p, n) =>
            p ? (
              <div key={(p as Product).slug} className="w-[72vw] shrink-0 snap-start sm:w-[300px]">
                <ProductCard product={p as Product} index={n} />
              </div>
            ) : (
              <Skeleton key={n} className="aspect-[4/5] w-[72vw] shrink-0 sm:w-[300px]" />
            ),
          )}
          <Link to="/chapters/salt-and-linen" className="flex aspect-[4/5] w-[60vw] shrink-0 snap-start flex-col justify-end rounded-[6px] border-2 border-dashed border-ink/20 p-6 transition hover:border-thread sm:w-[260px]">
            <HandNote className="text-3xl">الفصل كاملاً ←</HandNote>
            <p className="mt-3 text-sm text-ink-2">الحكاية والألوان وكل قطع «ملح وكتّان».</p>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── From fibre to hem ─────────────────────────────────────────
const stages = [
  { n: "١", t: "الألياف", d: "كتّان يُقلع باليد في نورماندي ويُترك في الحقل خمسة أسابيع للندى.", h: "5 أسابيع" },
  { n: "٢", t: "الغزل والنسج", d: "في مصنع فلمنكي تأسّس عام 1858، على أنوال تعمل أبطأ مما تستطيع.", h: "3 أسابيع" },
  { n: "٣", t: "الرسم", d: "ترسم رانيا الباترون بقلم رصاص على ورق بنّي. ويُعلّق على الجدار، إلى الأبد.", h: "يومان" },
  { n: "٤", t: "القصّ", d: "طبقة واحدة في كل مرة، باليد، لتلتقي الخطوط ويستقيم النسيج.", h: "40 دقيقة" },
  { n: "٥", t: "الخياطة", d: "صانع واحد يخيط القطعة كاملة — لا خطّ إنتاج من الغرباء.", h: "4–19 ساعة" },
  { n: "٦", t: "الكيّ والترقيم", d: "تُبخّر، تُوقَّع، تُرقّم، تُطوى بورق الباترون، وتُرسل.", h: "25 دقيقة" },
];

function FibreToHem() {
  return (
    <section className="relative overflow-hidden bg-tissue py-20 md:py-28">
      <div className="wrap">
        <SectionHead
          no="02"
          kicker="كيف تُصنع القطعة"
          title={
            <>
              من الليفة إلى <em className="text-thread not-italic">الحاشية</em>، في ست خطوات بطيئة
            </>
          }
          aside={<p className="text-ink-2">انزل واتبع الخيط الأحمر من الحقل حتى العلبة التي تصلك.</p>}
        />
        <div className="relative mt-16">
          <ScrollThread viewBox="0 0 1000 100" d="M0,50 C120,10 200,90 330,50 S540,10 660,50 S880,90 1000,50" className="absolute inset-x-0 top-6 hidden h-24 w-full -scale-x-100 lg:block" />
          <ScrollThread viewBox="0 0 100 1000" d="M50,0 C10,120 90,200 50,330 S10,540 50,660 S90,880 50,1000" className="absolute bottom-0 right-0 top-0 h-full w-10 lg:hidden" />
          <ol className="relative grid gap-10 pr-14 lg:grid-cols-6 lg:gap-6 lg:pr-0">
            {stages.map((s, n) => (
              <Reveal key={s.t} delay={n * 0.08} className="relative lg:pt-32">
                <span className="absolute -right-[3.05rem] top-1 grid h-8 w-8 place-items-center rounded-full bg-paper text-[0.85rem] ring-1 ring-ink/25 lg:right-0 lg:top-[3.25rem]">
                  {s.n}
                </span>
                <p className="label text-thread">{s.h}</p>
                <h3 className="mt-2 font-display text-[1.6rem] leading-snug">{s.t}</h3>
                <p className="mt-2 text-[0.93rem] leading-relaxed text-ink-2">{s.d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// ─── Swatch drawer ─────────────────────────────────────────────
function SwatchDrawer() {
  const { data } = useAsync(getFabrics, []);
  const [sel, setSel] = useState(0);
  const f = data?.[sel];
  return (
    <section className="py-20 md:py-28">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHead no="03" kicker="درج العيّنات" title={<>المس القماش <em className="text-thread not-italic">قبل</em> المعطف</>} />
          <p className="mt-5 max-w-md text-ink-2">
            نستخدم ثمانية أقمشة فقط، ونعرف كل مصنع باسمه. اسحب عيّنة من الدرج لتتحسّسها، بقدر ما تسمح الشاشة.
          </p>
          <AnimatePresence mode="wait">
            {f && (
              <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-8 rounded-md bg-tissue p-6 ring-1 ring-line">
                <p className="label text-ink-3">
                  {f.origin} · {f.gsm} غ/م²
                </p>
                <h3 className="mt-1 font-display text-3xl">{f.name}</h3>
                <p className="mt-1 font-hand text-2xl text-chalk">«{f.hand}»</p>
                <div className="mt-5 space-y-2.5">
                  <Meter label="الدفء" value={f.warmth} />
                  <Meter label="التنفّس" value={f.breath} />
                  <Meter label="الانسدال" value={f.drape} />
                  <Meter label="العتق" value={f.age} />
                </div>
                <Link to={`/fabrics#${f.id}`} className="mt-6 inline-flex items-center gap-1 text-sm underline decoration-dashed underline-offset-4 hover:text-thread">
                  حكايته والقطع المصنوعة منه <ArrowUpLeft className="h-4 w-4" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="lg:col-span-7">
          <div className="relative grid grid-cols-4 gap-3 rounded-md bg-paper-2 p-4 ring-1 ring-line sm:gap-5 sm:p-8">
            <span className="label absolute -top-3 right-6 bg-paper px-2 text-ink-3">الدرج 02 · الأقمشة المستخدمة</span>
            {(data ?? []).map((fab, n) => (
              <motion.button
                key={fab.id}
                onClick={() => setSel(n)}
                className="relative"
                animate={{ y: n === sel ? -10 : 0, rotate: n === sel ? -3 : n % 2 ? 1.5 : -1.5 }}
                whileHover={{ y: -6 }}
                aria-label={fab.name}
                aria-pressed={n === sel}
              >
                <Swatch hex={fab.hex} accent={fab.accent} pattern={fab.pattern} className="w-full" label={fab.name} />
                <span className={`mt-1 block truncate text-[0.7rem] ${n === sel ? "text-thread" : "text-ink-3"}`}>{fab.name}</span>
              </motion.button>
            ))}
            {!data && Array.from({ length: 8 }).map((_, n) => <Skeleton key={n} className="aspect-square" />)}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Ledger ────────────────────────────────────────────────────
function Ledger() {
  const rows = [
    ["قطع صُنعت", "2,140", "كل واحدة مرقّمة"],
    ["قطع رُفيت", "1,204", "مجاناً، كما وعدنا"],
    ["متوسط الساعات لكل قطعة", "7.8", "من القصّ إلى الكيّ"],
    ["صنّاع على كشف الرواتب", "14", "بأجر يزيد 22% عن أجر المعيشة"],
    ["بلاستيك في طرودنا", "0 غ", "ورق، كرتون، شريط قطني"],
    ["تخفيضات أُقيمت", "0", "ولن تُقام"],
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHead no="04" kicker="الدفتر المفتوح · 2026" title={<>نضع دفاترنا <em className="text-thread not-italic">على الطاولة</em></>} />
          <p className="mt-5 text-ink-2">أرقام مشغلنا لهذا العام، تُكتب كل ربع سنة في الدفتر نفسه.</p>
          <Button to="/atelier" variant="ghost" className="mt-6">
            تعرّف إلى الصنّاع
          </Button>
        </div>
        <Reveal className="lg:col-span-8">
          <div className="relative overflow-hidden rounded-md bg-tissue bg-ruled pr-10 ring-1 ring-line md:pr-16">
            <div className="absolute inset-y-0 right-7 w-px bg-thread/50 md:right-12" />
            <table className="w-full">
              <tbody>
                {rows.map(([k, v, note], n) => (
                  <tr key={k} className="border-b border-transparent">
                    <td className="py-[0.5rem] pl-3 align-bottom text-[0.92rem] text-ink-2">{pad(n + 1, 2)}. {k}</td>
                    <td className="hidden py-[0.5rem] align-bottom font-hand text-lg text-chalk md:table-cell">{note}</td>
                    <td className="py-[0.5rem] pl-5 text-left align-bottom font-display text-[1.6rem] leading-none md:pl-8 md:text-[2rem]">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="pb-4 pl-6 pt-2 text-left font-hand text-2xl text-thread">التوقيع: ل.ح — أيلول 2026</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Dressing table teaser ─────────────────────────────────────
function DressingTeaser() {
  const lay: { slug: string; kind: GarmentKind; cw: number; cls: string; r: number }[] = [
    { slug: "ferryman-overcoat", kind: "coat", cw: 1, cls: "left-[2%] top-[6%] w-[42%]", r: -8 },
    { slug: "morning-poplin-shirt", kind: "shirt", cw: 0, cls: "left-[34%] top-[2%] w-[34%]", r: 6 },
    { slug: "long-table-trousers", kind: "trousers", cw: 2, cls: "left-[58%] top-[18%] w-[34%]", r: -4 },
    { slug: "weather-scarf", kind: "scarf", cw: 1, cls: "left-[30%] top-[46%] w-[26%]", r: 14 },
  ];
  const { data } = useAsync(() => getProductsBySlugs(lay.map((l) => l.slug)), []);
  return (
    <section className="bg-paper-2/70 py-20 md:py-28">
      <div className="wrap grid items-center gap-12 lg:grid-cols-2">
        <div className="relative order-2 aspect-[5/4] rounded-md bg-[#e9dfcd] ring-1 ring-line lg:order-1">
          <div className="absolute inset-0 bg-dots opacity-50" />
          {data &&
            lay.map((l, n) => {
              const p = data.find((x) => x.slug === l.slug)!;
              return (
                <motion.div
                  key={l.slug}
                  className={`absolute ${l.cls}`}
                  initial={{ opacity: 0, y: 40, rotate: 0 }}
                  whileInView={{ opacity: 1, y: 0, rotate: l.r }}
                  viewport={{ once: true }}
                  transition={{ delay: n * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ rotate: 0, scale: 1.04, zIndex: 10 }}
                >
                  <GarmentFlat kind={l.kind} {...p.colorways[l.cw]} className="w-full drop-shadow-[0_8px_10px_#1e1c1920]" />
                </motion.div>
              );
            })}
          <HandNote className="absolute bottom-5 left-6 text-2xl">الإطلالة رقم 07 — «معدّية إلى العمل»</HandNote>
        </div>
        <div className="order-1 lg:order-2">
          <SectionHead no="05" kicker="طاولة التنسيق" title={<>افرد الإطلالة <em className="text-thread not-italic">على الطاولة</em>، كما نفعل في المشغل</>} />
          <p className="mt-5 max-w-lg text-ink-2">
            اختر طبقة خارجية، وقطعة علوية، وسفلية، وشيئاً لليدين. بدّل الألوان، اخلط عشوائياً، احفظ الإطلالات التي تحبّها، وعلّقها كلها على الراف دفعة واحدة.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/dressing-table">
              افتح طاولة التنسيق <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Chapters ──────────────────────────────────────────────────
const romans: Record<string, number> = { "١": 1, "٢": 2, "٣": 3, "٤": 4, "٥": 5, "٦": 6 };

function ChapterStack() {
  const { data } = useAsync(getChapters, []);
  const ordered = data ? [...data].sort((a, b) => romans[a.numeral] - romans[b.numeral]) : null;
  return (
    <section className="py-20 md:py-28">
      <div className="wrap">
        <SectionHead
          no="06"
          kicker="الفصول"
          title={
            <>
              كل موسم <em className="text-thread not-italic">وقطعه</em>
            </>
          }
          aside={<p className="text-ink-2">اختر الموسم وشاهد كل قطعه — للستات والرجال والأطفال — مع فلتر المقاسات.</p>}
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ordered?.map((ch, n) => (
            <Reveal key={ch.slug} delay={n * 0.06}>
              <Link
                to={`/chapters/${ch.slug}`}
                className={`group relative flex h-full min-h-[210px] sm:min-h-[300px] flex-col rounded-md p-5 ring-1 transition duration-500 hover:-translate-y-2 hover:rotate-[-1deg] ${
                  ch.status === "current" ? "bg-ink text-paper ring-ink" : "bg-tissue ring-line hover:ring-ink/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-display text-6xl leading-none">{ch.numeral}</span>
                  <span className={`label rounded-full px-2 py-0.5 ${ch.status === "current" ? "bg-thread text-tissue" : ch.status === "upcoming" ? "bg-butter text-ink" : "text-ink-3 ring-1 ring-line"}`}>
                    {ch.status === "current" ? "الآن" : ch.status === "upcoming" ? "قيد الرسم" : "أرشيف"}
                  </span>
                </div>
                <h3 className="mt-auto font-display text-[1.8rem] leading-tight">{ch.title}</h3>
                <p className={`label mt-2 ${ch.status === "current" ? "text-paper/60" : "text-ink-3"}`}>{ch.season}</p>
                <div className="mt-4 flex">
                  {ch.palette.map((p, k) => (
                    <span key={p.hex} className="-ms-1.5 h-7 w-7 rounded-full first:ms-0" style={{ background: p.hex, zIndex: 10 - k, boxShadow: "0 0 0 2px var(--color-paper)" }} title={p.name} />
                  ))}
                </div>
              </Link>
            </Reveal>
          ))}
          {!ordered && Array.from({ length: 5 }).map((_, n) => <Skeleton key={n} className="min-h-[300px]" />)}
        </div>
      </div>
    </section>
  );
}

// ─── Journal ───────────────────────────────────────────────────
function JournalTeaser() {
  const { data } = useAsync(getJournal, []);
  return (
    <section className="py-20 md:py-28">
      <div className="wrap">
        <SectionHead no="07" kicker="اليوميات" title={<>ملاحظات من <em className="text-thread not-italic">المشغل</em></>} aside={<Button to="/journal" variant="ghost">كل اليوميات ←</Button>} />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {(data?.slice(0, 3) ?? []).map((j, n) => (
            <Reveal key={j.slug} delay={n * 0.08}>
              <Link to={`/journal/${j.slug}`} className="group block">
                <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-md ring-1 ring-line" style={{ background: j.cover.tint }}>
                  <div className="absolute inset-0 bg-dots opacity-40" />
                  <GarmentFlat kind={j.cover.garment} hex={j.cover.hex} accent={j.cover.accent} pattern={j.cover.pattern} className="relative h-[78%] transition duration-700 group-hover:rotate-[-4deg] group-hover:scale-105" />
                  <span className="label absolute right-4 top-4 text-ink-3">{j.kicker}</span>
                </div>
                <p className="label mt-4 text-ink-3">
                  {formatDate(j.date)} · {j.readMins} دقائق قراءة
                </p>
                <h3 className="mt-2 font-display text-[1.6rem] leading-snug group-hover:text-thread">{j.title}</h3>
                <p className="mt-2 line-clamp-2 text-ink-2">{j.excerpt}</p>
              </Link>
            </Reveal>
          ))}
          {!data && Array.from({ length: 3 }).map((_, n) => <Skeleton key={n} className="aspect-[4/3]" />)}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  useDocumentTitle("");
  return (
    <>
      <Hero />
      <CareBand />
      <Departments />
      <TheRail />
      <FibreToHem />
      <SwatchDrawer />
      <DressingTeaser />
      <Ledger />
      <ChapterStack />
      <JournalTeaser />
    </>
  );
}
