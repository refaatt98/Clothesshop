import { motion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router";
import { GarmentFlat } from "../components/GarmentFlat";
import { Swatch } from "../components/Swatch";
import { HandNote, Meter, PageHeader, Reveal, Skeleton } from "../components/ui";
import { getFabrics, getProducts } from "../lib/api";
import { useAsync, useDocumentTitle } from "../lib/hooks";
import type { Fabric } from "../types";

const filters: { id: string; label: string; test: (f: Fabric) => boolean }[] = [
  { id: "all", label: "All eight", test: () => true },
  { id: "warm", label: "For cold days", test: (f) => f.warmth >= 4 },
  { id: "cool", label: "For heat", test: (f) => f.breath >= 5 },
  { id: "drape", label: "Moves beautifully", test: (f) => f.drape >= 4 },
  { id: "ages", label: "Ages best", test: (f) => f.age >= 5 },
];

export default function Fabrics() {
  useDocumentTitle("Fabric Library");
  const { data: fabrics } = useAsync(getFabrics, []);
  const { data: products } = useAsync(() => getProducts(), []);
  const [filter, setFilter] = useState("all");
  const maxGsm = Math.max(...(fabrics?.map((f) => f.gsm) ?? [1]));
  const visible = fabrics?.filter(filters.find((f) => f.id === filter)!.test);

  return (
    <>
      <PageHeader
        trail={[{ label: "Home", to: "/" }, { label: "Fabric Library" }]}
        kicker="The swatch drawer, opened fully"
        title={
          <>
            Eight cloths. <em>We know every mill by name.</em>
          </>
        }
        intro="We'd rather know a few cloths deeply than many shallowly. Here's every fabric we cut, where it comes from, how it feels, and what we make from it."
      />

      {/* weight ladder */}
      <section className="wrap py-12">
        <p className="label text-ink-3">The weight ladder · grams per square metre</p>
        <div className="mt-5 space-y-2">
          {fabrics
            ? [...fabrics]
                .sort((a, b) => a.gsm - b.gsm)
                .map((f, i) => (
                  <a key={f.id} href={`#${f.id}`} className="group grid grid-cols-[130px_1fr] items-center gap-3 sm:grid-cols-[200px_1fr]">
                    <span className="truncate text-sm text-ink-2 group-hover:text-thread">{f.name}</span>
                    <div className="relative h-5">
                      <motion.div
                        className="h-full rounded-sm"
                        style={{ background: f.hex, boxShadow: "inset 0 0 0 1px #1e1c1920" }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(f.gsm / maxGsm) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      />
                      <span className="absolute inset-y-0 right-0 flex items-center font-mono text-xs text-ink-3">{f.gsm}</span>
                    </div>
                  </a>
                ))
            : Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-5" />)}
        </div>
        <HandNote className="mt-4 text-xl">light as a letter ← → heavy as a blanket</HandNote>
      </section>

      <section className="wrap pb-10">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {filters.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={`shrink-0 rounded-full px-4 py-2 text-sm ring-1 transition ${filter === f.id ? "bg-ink text-paper ring-ink" : "ring-line hover:ring-ink/40"}`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-6">
          {visible?.map((f, i) => {
            const made = products?.filter((p) => p.fabricId === f.id) ?? [];
            return (
              <Reveal key={f.id}>
                <article id={f.id} className="scroll-mt-32 grid gap-8 rounded-md bg-tissue p-6 ring-1 ring-line md:grid-cols-[260px_1fr_260px] md:p-8">
                  <div className="relative">
                    <Swatch hex={f.hex} accent={f.accent} pattern={f.pattern} width={200} height={200} scale={2.6} className="w-full max-w-64" label={f.name} />
                    <span className="label absolute -bottom-1 left-2 rotate-[-3deg] bg-[#f3e9d2] px-2 py-1 text-ink shadow ring-1 ring-[#d8c49c]">No. {String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div>
                    <p className="label text-thread">
                      {f.origin} · {f.mill}
                    </p>
                    <h2 className="mt-2 font-display text-[2.2rem] leading-none">{f.name}</h2>
                    <p className="mt-1 font-mono text-sm text-ink-3">
                      {f.fibre} · {f.gsm} gsm
                    </p>
                    <p className="mt-4 leading-relaxed text-ink-2">{f.story}</p>
                    <p className="mt-3 font-hand text-2xl text-chalk">hand: “{f.hand.toLowerCase()}”</p>
                  </div>
                  <div className="space-y-2.5">
                    <Meter label="Warmth" value={f.warmth} />
                    <Meter label="Breath" value={f.breath} />
                    <Meter label="Drape" value={f.drape} />
                    <Meter label="Ages" value={f.age} />
                    <p className="label pt-4 text-ink-3">Made into</p>
                    <ul className="space-y-1.5">
                      {made.map((p) => (
                        <li key={p.slug}>
                          <Link to={`/piece/${p.slug}`} className="group flex items-center gap-2 text-sm hover:text-thread">
                            <GarmentFlat kind={p.garment} {...p.colorways[0]} className="h-8 w-7 shrink-0" shadow={false} />
                            <span className="truncate">{p.name}</span>
                          </Link>
                        </li>
                      ))}
                      {!made.length && <li className="text-sm text-ink-3">Coming in Chapter V</li>}
                    </ul>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>
    </>
  );
}
