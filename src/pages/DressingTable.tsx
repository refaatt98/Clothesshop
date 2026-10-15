import { AnimatePresence, motion } from "motion/react";
import { Bookmark, RotateCcw, Shuffle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { GarmentFlat } from "../components/GarmentFlat";
import { Button, HandNote, PageHeader } from "../components/ui";
import { useDocumentTitle } from "../lib/hooks";
import { useShop } from "../lib/store";
import type { Category, Product } from "../types";

type Slot = "outer" | "top" | "bottom" | "finish";

const shortLabel: Record<Slot, string> = { outer: "خارجي", top: "علوي", bottom: "سفلي", finish: "لمسة" };

const slotInfo: Record<Slot, { label: string; cats: Category[]; pos: string; rot: number }> = {
  outer: { label: "الطبقة الخارجية", cats: ["outerwear"], pos: "left-[2%] top-[6%] w-[34%]", rot: -7 },
  top: { label: "القطعة العلوية", cats: ["shirts", "knitwear", "tees", "dresses"], pos: "left-[33%] top-[3%] w-[30%]", rot: 4 },
  bottom: { label: "القطعة السفلية", cats: ["trousers", "skirts"], pos: "left-[63%] top-[9%] w-[30%]", rot: -3 },
  finish: { label: "لمسة أخيرة", cats: ["accessories"], pos: "left-[38%] top-[50%] w-[22%]", rot: 12 },
};
const slots = Object.keys(slotInfo) as Slot[];

const tables = [
  { id: "oak", name: "سنديان", bg: "#e4d3b6" },
  { id: "linen", name: "كتّان", bg: "#ece4d4" },
  { id: "chalk", name: "طباشير", bg: "#f3f0ea" },
  { id: "slate", name: "أردواز", bg: "#d6d3cc" },
];

const lookNames = ["معدّية إلى العمل", "غداء طويل", "سوق الجمعة", "أول صقيع", "يوم في المشغل", "القطار الأخير", "مشوار الميناء", "غرفة القراءة"];

interface Pick {
  slug: string;
  cw: number;
}

const slotOf = (p: Product): Slot => slots.find((s) => slotInfo[s].cats.includes(p.category))!;

export default function DressingTable() {
  useDocumentTitle("طاولة التنسيق");
  const { catalog, addToRail, money, saveLook, toast, setRailOpen } = useShop();
  const [params] = useSearchParams();
  const [picks, setPicks] = useState<Partial<Record<Slot, Pick>>>({});
  const [active, setActive] = useState<Slot>("outer");
  const [table, setTable] = useState(tables[0]);
  const [letter, setLetter] = useState("M");
  const [waist, setWaist] = useState("30");
  const [resetKey, setResetKey] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);

  const bySlot = useMemo(() => {
    const m: Record<Slot, Product[]> = { outer: [], top: [], bottom: [], finish: [] };
    catalog?.forEach((p) => m[slotOf(p)].push(p));
    return m;
  }, [catalog]);

  // initial look: from ?look=, ?with=, or a house default
  useEffect(() => {
    if (!catalog) return;
    const fromLook = params.get("look")?.split(",");
    const withSlug = params.get("with");
    const seed = fromLook ?? ["ferryman-overcoat", "morning-poplin-shirt", "long-table-trousers", "weather-scarf"];
    const next: Partial<Record<Slot, Pick>> = {};
    const place = (slug: string) => {
      const p = catalog.find((x) => x.slug === slug);
      if (p) next[slotOf(p)] = { slug, cw: 0 };
    };
    seed.forEach(place);
    if (withSlug) {
      place(withSlug);
      catalog.find((x) => x.slug === withSlug)?.pairsWith.forEach((s) => {
        const p = catalog.find((x) => x.slug === s);
        if (p && !fromLook) next[slotOf(p)] = { slug: s, cw: 0 };
      });
      place(withSlug);
    }
    setPicks(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog]);

  const items = slots
    .map((s) => ({ slot: s, pick: picks[s], product: catalog?.find((p) => p.slug === picks[s]?.slug) }))
    .filter((x): x is { slot: Slot; pick: Pick; product: Product } => !!x.pick && !!x.product);
  const hasDress = items.some((i) => i.product.category === "dresses");
  const shown = items.filter((i) => !(hasDress && i.slot === "bottom"));
  const total = shown.reduce((s, i) => s + i.product.price, 0);
  const hours = shown.reduce((s, i) => s + i.product.makingHours, 0);

  const choose = (slot: Slot, slug: string | null) =>
    setPicks((p) => {
      const n = { ...p };
      if (slug === null) delete n[slot];
      else n[slot] = { slug, cw: 0 };
      return n;
    });

  const shuffle = () => {
    const rnd = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
    const n: Partial<Record<Slot, Pick>> = {};
    slots.forEach((s) => {
      if (s === "finish" && Math.random() < 0.3) return;
      const p = rnd(bySlot[s]);
      if (p) n[s] = { slug: p.slug, cw: Math.floor(Math.random() * p.colorways.length) };
    });
    setPicks(n);
    setResetKey((k) => k + 1);
  };

  const sizeFor = (p: Product) =>
    p.sizes.length === 1 ? p.sizes[0] : p.category === "trousers" ? waist : p.sizes.includes(letter) ? letter : p.sizes[Math.floor(p.sizes.length / 2)];

  const hangAll = () => {
    const skipped: string[] = [];
    shown.forEach(({ product, pick }) => {
      const size = sizeFor(product);
      if (product.soldOutSizes?.includes(size)) return skipped.push(product.name);
      addToRail({ slug: product.slug, colorway: product.colorways[pick.cw].name, size });
    });
    toast(`عُلّقت ${shown.length - skipped.length} قطع على الراف`, skipped.length ? `${skipped.join("، ")} — نفد مقاسك` : `مجموع الإطلالة ${money(total)}`);
    setRailOpen(true);
  };

  const save = () => {
    const name = `${lookNames[Math.floor(Math.random() * lookNames.length)]}`;
    saveLook(name, shown.map((i) => i.product.slug));
    toast("حُفظت الإطلالة في لوحتك", `«${name}»`);
  };

  return (
    <>
      <PageHeader
        trail={[{ label: "الرئيسية", to: "/" }, { label: "طاولة التنسيق" }]}
        kicker="نسّق إطلالة"
        title={
          <>
            طاولة <em className="text-thread not-italic">التنسيق</em>
          </>
        }
        intro="هكذا ننسّق في المشغل: كل شيء ممدود على الطاولة الكبيرة. اختر قطعة لكل طبقة، بدّل الألوان، واسحب القطع وحرّكها حتى تشعر أنها صحيحة."
      />

      <section className="wrap grid gap-8 py-10 lg:grid-cols-[1fr_400px]">
        {/* the table */}
        <div>
          <div ref={tableRef} className="relative aspect-[5/4] overflow-hidden rounded-[10px] ring-1 ring-line transition-colors duration-700 md:aspect-[16/11]" style={{ background: table.bg }}>
            <div className="pointer-events-none absolute inset-0 bg-dots opacity-50" />
            <span className="label absolute right-4 top-3 text-ink-3">الطاولة رقم 2 · {table.name}</span>
            <AnimatePresence>
              {shown.map(({ slot, pick, product }) => {
                const c = product.colorways[pick.cw];
                const info = slotInfo[slot];
                const pos = slot === "top" && hasDress ? "left-[42%] top-[3%] w-[36%]" : info.pos;
                return (
                  <motion.div
                    key={`${product.slug}-${resetKey}`}
                    className={`absolute ${pos} cursor-grab touch-none active:cursor-grabbing`}
                    drag
                    dragConstraints={tableRef}
                    dragMomentum={false}
                    initial={{ opacity: 0, y: -60, rotate: 0, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, rotate: info.rot, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.9 }}
                    whileDrag={{ scale: 1.06, rotate: 0, zIndex: 20 }}
                    transition={{ type: "spring", stiffness: 120, damping: 14 }}
                    onPointerDown={() => setActive(slot)}
                  >
                    <GarmentFlat kind={product.garment} {...c} className="pointer-events-none w-full drop-shadow-[0_10px_10px_#1e1c1922]" title={product.name} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {shown.length === 0 && (
              <div className="absolute inset-0 grid place-items-center">
                <HandNote className="text-3xl">طاولة فارغة. اختر شيئاً ←</HandNote>
              </div>
            )}
            <HandNote className="absolute bottom-3 left-4 hidden text-xl sm:block">اسحب القطع لترتيبها</HandNote>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="label text-ink-3">الطاولة</span>
              {tables.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTable(t)}
                  title={t.name}
                  aria-label={`طاولة ${t.name}`}
                  aria-pressed={t.id === table.id}
                  className={`h-7 w-7 rounded-full ring-1 ring-ink/20 ring-offset-2 ring-offset-paper ${t.id === table.id ? "ring-2 ring-ink" : ""}`}
                  style={{ background: t.bg }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={shuffle} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm ring-1 ring-ink/20 hover:bg-ink hover:text-paper">
                <Shuffle className="h-4 w-4" /> خلط عشوائي
              </button>
              <button onClick={() => setResetKey((k) => k + 1)} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm ring-1 ring-ink/20 hover:bg-ink hover:text-paper">
                <RotateCcw className="h-4 w-4" /> رتّب
              </button>
              <button onClick={save} disabled={!shown.length} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm ring-1 ring-ink/20 hover:bg-ink hover:text-paper disabled:opacity-40">
                <Bookmark className="h-4 w-4" /> احفظ الإطلالة
              </button>
            </div>
          </div>
        </div>

        {/* the drawers */}
        <aside className="space-y-4">
          <div className="grid grid-cols-4 gap-1 rounded-full bg-paper-2 p-1" role="tablist">
            {slots.map((s) => (
              <button key={s} role="tab" aria-selected={active === s} onClick={() => setActive(s)} className={`rounded-full py-2 text-xs transition sm:text-sm ${active === s ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"}`}>
                {shortLabel[s]}
              </button>
            ))}
          </div>

          <div className="rounded-md bg-tissue p-4 ring-1 ring-line">
            <div className="flex items-center justify-between">
              <p className="font-display text-xl">{slotInfo[active].label}</p>
              {picks[active] && (
                <button onClick={() => choose(active, null)} className="text-xs underline decoration-dashed underline-offset-4 hover:text-thread">
                  اتركها فارغة
                </button>
              )}
            </div>
            {active === "bottom" && hasDress && <p className="mt-1 text-xs text-ink-3">اخترت فستاناً — القطعة السفلية مخفية حتى تبدّله.</p>}
            <div className="no-scrollbar mt-3 grid grid-cols-3 gap-2">
              {bySlot[active].map((p) => {
                const sel = picks[active]?.slug === p.slug;
                return (
                  <button key={p.slug} onClick={() => choose(active, p.slug)} aria-pressed={sel} className={`group rounded-md p-2 text-left ring-1 transition ${sel ? "bg-paper-2 ring-2 ring-ink" : "ring-line hover:ring-ink/30"}`}>
                    <GarmentFlat kind={p.garment} {...p.colorways[sel ? picks[active]!.cw : 0]} className="mx-auto w-4/5 transition group-hover:scale-105" shadow={false} />
                    <p className="mt-1 line-clamp-2 text-[0.7rem] leading-tight">{p.name}</p>
                  </button>
                );
              })}
            </div>
            {picks[active] && (() => {
              const p = catalog?.find((x) => x.slug === picks[active]!.slug);
              if (!p) return null;
              return (
                <div className="mt-4 flex items-center gap-2 border-t border-dashed border-ink/20 pt-3">
                  <span className="label text-ink-3">اللون</span>
                  {p.colorways.map((col, i) => (
                    <button
                      key={col.name}
                      title={col.name}
                      aria-label={col.name}
                      onClick={() => setPicks((x) => ({ ...x, [active]: { slug: p.slug, cw: i } }))}
                      className={`h-6 w-6 rounded-full ring-1 ring-ink/20 ring-offset-2 ring-offset-tissue ${picks[active]!.cw === i ? "ring-2 ring-ink" : ""}`}
                      style={{ background: col.hex }}
                    />
                  ))}
                </div>
              );
            })()}
          </div>

          <div className="rounded-md bg-ink p-5 text-paper">
            <p className="label text-paper/60">هذه الإطلالة</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {shown.map(({ product, pick }) => (
                <li key={product.slug} className="flex justify-between gap-3">
                  <Link to={`/piece/${product.slug}?c=${pick.cw}`} className="truncate hover:text-butter">
                    {product.name} <span className="text-paper/50">· {product.colorways[pick.cw].name}</span>
                  </Link>
                  <span className="shrink-0 font-mono">{money(product.price)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-paper/15 pt-4">
              <label className="text-xs text-paper/60">
                مقاسك
                <select value={letter} onChange={(e) => setLetter(e.target.value)} className="mt-1 block w-full rounded-md bg-paper/10 px-2 py-1.5 font-mono text-sm text-paper">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                    <option key={s} className="text-ink">
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-paper/60">
                خصر البنطال
                <select value={waist} onChange={(e) => setWaist(e.target.value)} className="mt-1 block w-full rounded-md bg-paper/10 px-2 py-1.5 font-mono text-sm text-paper">
                  {["26", "28", "30", "32", "34", "36"].map((s) => (
                    <option key={s} className="text-ink">
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-hand text-xl text-butter">{hours} ساعة عمل يدوي</span>
              <span className="font-mono text-2xl font-bold">{money(total)}</span>
            </div>
            <Button onClick={hangAll} disabled={!shown.length} variant="thread" className="mt-4 w-full">
              علّق الإطلالة كاملة على الراف
            </Button>
          </div>
        </aside>
      </section>
    </>
  );
}
