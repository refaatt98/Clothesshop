import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { CareSymbol, Marquee, RotatingStamp, Ruler, ScrollThread } from "../components/Decor";
import { GarmentFlat } from "../components/GarmentFlat";
import { PriceTag } from "../components/PriceTag";
import { ProductCard } from "../components/ProductCard";
import { Swatch } from "../components/Swatch";
import { Button, HandNote, Meter, PinHead, Reveal, SectionHead, Skeleton } from "../components/ui";
import { getChapters, getFabrics, getJournal, getProducts, getProductsBySlugs, getStores } from "../lib/api";
import { formatDate, pad, useAsync, useDocumentTitle } from "../lib/hooks";
import { useShop } from "../lib/store";
import type { GarmentKind, Product } from "../types";

// ─── Hero: the cutting table ───────────────────────────────────
const heroPieces = [
  { slug: "ferryman-overcoat", cw: 0, note: "dropped shoulder, +4cm", noteAt: [148, 40] as const },
  { slug: "orchard-midi-dress", cw: 0, note: "3.5 m gathered by hand", noteAt: [150, 150] as const },
  { slug: "harbour-chore-jacket", cw: 2, note: "pocket fits a paperback", noteAt: [146, 128] as const },
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
      <motion.text x={(x1 + x2) / 2} y={y - 4} textAnchor="middle" fontSize="6.2" fontFamily="Courier Prime" fill={col} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
        {m1}
      </motion.text>
      <motion.path d={`M186,${y1} V${y2} M182,${y1} h8 M182,${y2} h8`} stroke={col} strokeWidth="0.9" {...draw} transition={{ ...draw.transition, delay: 0.8 }} />
      <motion.text x="192" y={(y1 + y2) / 2} fontSize="6.2" fontFamily="Courier Prime" fill={col} transform={`rotate(90 192 ${(y1 + y2) / 2})`} textAnchor="middle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
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
            <span className="rounded-full bg-thread px-2 py-0.5 text-tissue">Ch. IV</span> Salt & Linen · Summer 2026
          </p>
          <h1 className="mt-6 font-display text-[3.2rem] leading-[0.92] tracking-[-0.03em] text-balance sm:text-[4.2rem] xl:text-[5.6rem]">
            Every piece <br className="hidden sm:block" />
            starts as{" "}
            <span className="relative inline-block italic">
              paper
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
            Drafted by hand in our Amman studio, cut one at a time, numbered like prints — and mended for free for as long as they live.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button to="/shop">
              Enter the shop <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Button>
            <Button to="/dressing-table" variant="paper">
              Compose a look
            </Button>
          </div>

          <dl className="mt-auto grid grid-cols-3 gap-4 border-t border-dashed border-ink/20 pt-6 max-lg:mt-12">
            {[
              ["18", "pieces on the rail"],
              ["1,204", "mended this year"],
              ["0", "sales, ever"],
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
              <span className="label absolute left-12 top-4 text-chalk/70">Pattern no. {piece ? piece.id.toUpperCase() : "—"} · scale 1:8</span>
              <span className="label absolute right-12 top-4 hidden text-chalk/70 sm:block">grain ↓</span>

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
                    <Link to={`/piece/${piece.slug}?c=${meta.cw}`} aria-label={`View ${piece.name}`} className="relative block h-full">
                      <GarmentFlat kind={piece.garment} {...c} className="h-full w-full" title={`${piece.name} in ${c.name}`} />
                      <Measure
                        k={piece.slug}
                        kind={piece.garment}
                        m1={`${piece.measurements[0].label.toUpperCase()} ${piece.measurements[0].cm} CM`}
                        m2={`LENGTH ${piece.measurements.find((m) => m.label === "Length")?.cm ?? piece.measurements[1].cm} CM`}
                      />
                    </Link>
                    <motion.div
                      className="pointer-events-none absolute hidden sm:block"
                      style={{ left: `${(meta.noteAt[0] / 200) * 100}%`, top: `${(meta.noteAt[1] / 240) * 100}%` }}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.9 }}
                    >
                      <HandNote className="whitespace-nowrap">← {meta.note}</HandNote>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              {!piece && <Skeleton className="absolute inset-[20%]" />}

              <Ruler cm={60} className="absolute inset-x-0 bottom-0 h-6 w-full" />
            </div>

            {piece && (
              <Link to={`/piece/${piece.slug}`} className="absolute -right-1 top-14 w-24 sm:right-6 sm:w-28" aria-label={`${piece.name} price`}>
                <PriceTag price={piece.price} edition={piece.edition} />
              </Link>
            )}

            <RotatingStamp text="MADE SLOWLY · MENDED FOREVER · NUMBERED BY HAND · " className="absolute -bottom-10 -left-4 hidden h-28 w-28 text-ink/70 md:block">
              <span className="font-display text-2xl italic">O</span>
            </RotatingStamp>
          </div>

          {/* piece selector */}
          <div className="mt-5 grid grid-cols-3 gap-2 md:ml-24">
            {heroPieces.map((h, n) => {
              const p = data?.[n];
              return (
                <button key={h.slug} onClick={() => setI(n)} className="group text-left" aria-label={p ? `Show ${p.name}` : "Loading"} aria-pressed={n === i}>
                  <div className="relative h-[2px] overflow-hidden bg-ink/10">
                    {n === i && (
                      <motion.div
                        key={`${i}-${paused}`}
                        className="absolute inset-y-0 left-0 bg-thread"
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
    <span className="flex items-center gap-3"><CareSymbol kind="wash" /> Cut single-ply, on paper</span>,
    <span className="flex items-center gap-3"><CareSymbol kind="iron" /> Pressed & numbered</span>,
    <span className="flex items-center gap-3"><CareSymbol kind="flat" /> Folded in pattern tissue</span>,
    <span className="flex items-center gap-3"><CareSymbol kind="hand" /> Mended free, for life</span>,
    <span className="flex items-center gap-3"><CareSymbol kind="dry" /> Duties included</span>,
    <span className="flex items-center gap-3"><CareSymbol kind="noBleach" /> No sales. Ever.</span>,
  ];
  return (
    <div className="border-y border-line bg-paper-2 py-4">
      <Marquee items={items} className="font-mono text-[0.78rem] uppercase tracking-[0.14em] text-ink-2" />
    </div>
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
          kicker="Now hanging · Chapter IV"
          title={
            <>
              The rail, <em>Salt & Linen</em>
            </>
          }
          aside={
            <div className="flex items-end justify-between gap-6 md:flex-col md:items-end">
              <p className="text-ink-2 md:text-right">Eight pieces drafted in a borrowed fisherman's house on the Atlantic coast. Linen that was left in the field for five weeks of dew.</p>
              <div className="flex gap-2">
                <button onClick={() => scrollBy(-1)} className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-ink/20 hover:bg-ink hover:text-paper" aria-label="Scroll rail left">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button onClick={() => scrollBy(1)} className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-ink/20 hover:bg-ink hover:text-paper" aria-label="Scroll rail right">
                  <ArrowRight className="h-4 w-4" />
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
            <HandNote className="text-3xl">the whole chapter →</HandNote>
            <p className="mt-3 text-sm text-ink-2">Story, palette and every piece from Salt & Linen.</p>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── From fibre to hem ─────────────────────────────────────────
const stages = [
  { n: "I", t: "Fibre", d: "Flax pulled by hand in Normandy and left in the field for five weeks of dew.", h: "5 weeks" },
  { n: "II", t: "Spun & woven", d: "In a Flemish mill founded in 1858, on looms that run slower than they could.", h: "3 weeks" },
  { n: "III", t: "Drafted", d: "Rania draws the pattern in pencil on brown paper. It joins the wall, forever.", h: "2 days" },
  { n: "IV", t: "Cut", d: "One layer at a time, by hand, so stripes meet and the grain runs true.", h: "40 min" },
  { n: "V", t: "Sewn", d: "One maker sews the whole piece — not an assembly line of strangers.", h: "4–19 hours" },
  { n: "VI", t: "Pressed & numbered", d: "Steamed, signed, numbered, folded in pattern tissue, sent.", h: "25 min" },
];

function FibreToHem() {
  return (
    <section className="relative overflow-hidden bg-tissue py-20 md:py-28">
      <div className="wrap">
        <SectionHead
          no="02"
          kicker="How a piece is made"
          title={
            <>
              From fibre to <em>hem</em>, in six slow steps
            </>
          }
          aside={<p className="text-ink-2">Scroll and follow the red thread. Every product page has a Garment Passport that shows these steps — with the actual names and places.</p>}
        />
        <div className="relative mt-16">
          <ScrollThread viewBox="0 0 1000 100" d="M0,50 C120,10 200,90 330,50 S540,10 660,50 S880,90 1000,50" className="absolute inset-x-0 top-6 hidden h-24 w-full lg:block" />
          <ScrollThread viewBox="0 0 100 1000" d="M50,0 C10,120 90,200 50,330 S10,540 50,660 S90,880 50,1000" className="absolute bottom-0 left-0 top-0 h-full w-10 lg:hidden" />
          <ol className="relative grid gap-10 pl-14 lg:grid-cols-6 lg:gap-6 lg:pl-0">
            {stages.map((s, n) => (
              <Reveal key={s.t} delay={n * 0.08} className="relative lg:pt-32">
                <span className="absolute -left-[3.05rem] top-1 grid h-8 w-8 place-items-center rounded-full bg-paper font-mono text-[0.7rem] ring-1 ring-ink/25 lg:left-0 lg:top-[3.25rem]">
                  {s.n}
                </span>
                <p className="label text-thread">{s.h}</p>
                <h3 className="mt-2 font-display text-[1.45rem] leading-tight">{s.t}</h3>
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
          <SectionHead no="03" kicker="The swatch drawer" title={<>Touch the cloth <em>before</em> the coat</>} />
          <p className="mt-5 max-w-md text-ink-2">
            We only use eight cloths. We know each mill by name. Pull a swatch from the drawer to feel it, as much as a screen allows.
          </p>
          <AnimatePresence mode="wait">
            {f && (
              <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-8 rounded-md bg-tissue p-6 ring-1 ring-line">
                <p className="label text-ink-3">
                  {f.origin} · {f.gsm} gsm
                </p>
                <h3 className="mt-1 font-display text-3xl">{f.name}</h3>
                <p className="mt-1 font-hand text-2xl text-chalk">“{f.hand.toLowerCase()}”</p>
                <div className="mt-5 space-y-2.5">
                  <Meter label="Warmth" value={f.warmth} />
                  <Meter label="Breath" value={f.breath} />
                  <Meter label="Drape" value={f.drape} />
                  <Meter label="Ages" value={f.age} />
                </div>
                <Link to={`/fabrics#${f.id}`} className="mt-6 inline-flex items-center gap-1 text-sm underline decoration-dashed underline-offset-4 hover:text-thread">
                  Its story & pieces made from it <ArrowUpRight className="h-4 w-4" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="lg:col-span-7">
          <div className="relative grid grid-cols-4 gap-3 rounded-md bg-paper-2 p-4 ring-1 ring-line sm:gap-5 sm:p-8">
            <span className="label absolute -top-3 left-6 bg-paper px-2 text-ink-3">Drawer 02 · cloths in use</span>
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
                <span className={`label mt-1 block truncate text-[0.6rem] ${n === sel ? "text-thread" : "text-ink-3"}`}>{fab.name}</span>
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
    ["Garments made", "2,140", "every one numbered"],
    ["Garments mended", "1,204", "free, as promised"],
    ["Average hours per piece", "7.8", "from cut to press"],
    ["Makers on payroll", "14", "paid 22% above living wage"],
    ["Plastic in our parcels", "0 g", "tissue, card, cotton tape"],
    ["Sales held", "0", "and never will be"],
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHead no="04" kicker="The open ledger · 2026" title={<>We keep our books <em>on the table</em></>} />
          <p className="mt-5 text-ink-2">Numbers from our workroom this year, written up every quarter in the same notebook.</p>
          <Button to="/atelier" variant="ghost" className="mt-6">
            Meet the makers
          </Button>
        </div>
        <Reveal className="lg:col-span-8">
          <div className="relative overflow-hidden rounded-md bg-tissue bg-ruled pl-10 ring-1 ring-line md:pl-16">
            <div className="absolute inset-y-0 left-7 w-px bg-thread/50 md:left-12" />
            <table className="w-full">
              <tbody>
                {rows.map(([k, v, note], n) => (
                  <tr key={k} className="border-b border-transparent">
                    <td className="py-[0.62rem] pr-3 align-bottom font-mono text-[0.85rem] text-ink-2">{pad(n + 1, 2)}. {k}</td>
                    <td className="hidden py-[0.62rem] align-bottom font-hand text-xl text-chalk md:table-cell">{note}</td>
                    <td className="py-[0.62rem] pr-5 text-right align-bottom font-display text-[1.6rem] leading-none md:pr-8 md:text-[2rem]">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="pb-4 pr-6 pt-2 text-right font-hand text-2xl text-thread">signed, L.H. — Sept 2026</p>
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
          <HandNote className="absolute bottom-5 right-6 text-2xl">look no. 07 — “ferry to work”</HandNote>
        </div>
        <div className="order-1 lg:order-2">
          <SectionHead no="05" kicker="The Dressing Table" title={<>Lay a look out <em>flat</em>, like we do in the studio</>} />
          <p className="mt-5 max-w-lg text-ink-2">
            Pick an outer layer, a top, a bottom and something for the hands. Swap colours, shuffle, save the looks you like, and hang the whole lot on your rail in one go.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/dressing-table">
              Open the dressing table <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Chapters ──────────────────────────────────────────────────
const romans: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6 };

function ChapterStack() {
  const { data } = useAsync(getChapters, []);
  const ordered = data ? [...data].sort((a, b) => romans[a.numeral] - romans[b.numeral]) : null;
  return (
    <section className="py-20 md:py-28">
      <div className="wrap">
        <SectionHead
          no="06"
          kicker="Chapters, not seasons"
          title={
            <>
              We publish clothes <em>like a book</em>
            </>
          }
          aside={<p className="text-ink-2">Each chapter is written in a place, with a palette and a handful of cloths. Old chapters stay on sale until their editions run out.</p>}
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
                  <span className="font-display text-5xl italic">{ch.numeral}</span>
                  <span className={`label rounded-full px-2 py-0.5 ${ch.status === "current" ? "bg-thread text-tissue" : ch.status === "upcoming" ? "bg-butter text-ink" : "text-ink-3 ring-1 ring-line"}`}>
                    {ch.status === "current" ? "now" : ch.status === "upcoming" ? "drafting" : "archive"}
                  </span>
                </div>
                <h3 className="mt-auto font-display text-[1.7rem] leading-none">{ch.title}</h3>
                <p className={`label mt-2 ${ch.status === "current" ? "text-paper/60" : "text-ink-3"}`}>{ch.season}</p>
                <div className="mt-4 flex">
                  {ch.palette.map((p, k) => (
                    <span key={p.hex} className="-ml-1.5 h-7 w-7 rounded-full first:ml-0" style={{ background: p.hex, zIndex: 10 - k, boxShadow: "0 0 0 2px var(--color-paper)" }} title={p.name} />
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
        <SectionHead no="07" kicker="The Journal" title={<>Notes from the <em>workroom</em></>} aside={<Button to="/journal" variant="ghost">All entries →</Button>} />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {(data?.slice(0, 3) ?? []).map((j, n) => (
            <Reveal key={j.slug} delay={n * 0.08}>
              <Link to={`/journal/${j.slug}`} className="group block">
                <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-md ring-1 ring-line" style={{ background: j.cover.tint }}>
                  <div className="absolute inset-0 bg-dots opacity-40" />
                  <GarmentFlat kind={j.cover.garment} hex={j.cover.hex} accent={j.cover.accent} pattern={j.cover.pattern} className="relative h-[78%] transition duration-700 group-hover:rotate-[-4deg] group-hover:scale-105" />
                  <span className="label absolute left-4 top-4 text-ink-3">{j.kicker}</span>
                </div>
                <p className="label mt-4 text-ink-3">
                  {formatDate(j.date)} · {j.readMins} min
                </p>
                <h3 className="mt-2 font-display text-[1.55rem] leading-tight group-hover:text-thread">{j.title}</h3>
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

// ─── Visit ─────────────────────────────────────────────────────
function VisitStrip() {
  const { data } = useAsync(getStores, []);
  const { money } = useShop();
  return (
    <section className="py-12">
      <div className="wrap">
        <div className="grid overflow-hidden rounded-md bg-tissue ring-1 ring-line lg:grid-cols-[1.1fr_2fr]">
          <div className="border-b border-dashed border-ink/20 p-8 lg:border-b-0 lg:border-r">
            <p className="label text-thread">§ 08 · Come in</p>
            <h2 className="mt-3 font-display text-[2.2rem] leading-none">
              Three rooms, <em>one tape measure</em>
            </h2>
            <p className="mt-4 text-ink-2">Book a fitting, have trousers hemmed to your shoes while you wait (free), or drop off something for mending. Orders over {money(250)} ship free.</p>
            <Button to="/visit#book" className="mt-6">
              Book a fitting
            </Button>
          </div>
          <div className="grid sm:grid-cols-3">
            {(data ?? []).map((s) => (
              <Link key={s.id} to={`/visit#${s.id}`} className="group border-b border-dashed border-ink/20 p-6 transition last:border-b-0 hover:bg-paper-2 sm:border-b-0 sm:border-r sm:last:border-r-0">
                <p className="font-display text-[1.8rem] leading-none group-hover:text-thread">{s.city}</p>
                <p className="label mt-1 text-ink-3">{s.country}</p>
                <p className="mt-4 flex gap-2 text-sm text-ink-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {s.address}
                </p>
                {s.hours.map((h) => (
                  <p key={h.days} className="mt-1.5 flex gap-2 text-sm text-ink-2">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0" /> {h.days}: {h.time}
                  </p>
                ))}
              </Link>
            ))}
          </div>
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
      <TheRail />
      <FibreToHem />
      <SwatchDrawer />
      <DressingTeaser />
      <Ledger />
      <ChapterStack />
      <JournalTeaser />
      <VisitStrip />
    </>
  );
}
