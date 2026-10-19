import { motion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router";
import { GarmentFlat } from "../components/GarmentFlat";
import { FabricQualities } from "../components/FabricQualities";
import { Swatch } from "../components/Swatch";
import { weightWord } from "../lib/fabric";
import { HandNote, PageHeader, Reveal, Skeleton } from "../components/ui";
import { getFabrics, getProducts } from "../lib/api";
import { useAsync, useDocumentTitle } from "../lib/hooks";
import type { Fabric } from "../types";

const filters: { id: string; label: string; test: (f: Fabric) => boolean }[] = [
  { id: "all", label: "الثمانية كلها", test: () => true },
  { id: "warm", label: "للأيام الباردة", test: (f) => f.warmth >= 4 },
  { id: "cool", label: "للحرّ", test: (f) => f.breath >= 5 },
  { id: "soft", label: "ناعم جداً", test: (f) => f.soft >= 5 },
  { id: "strong", label: "يعيش طويلاً", test: (f) => f.age >= 5 },
];

export default function Fabrics() {
  useDocumentTitle("مكتبة الأقمشة");
  const { data: fabrics } = useAsync(getFabrics, []);
  const { data: products } = useAsync(() => getProducts(), []);
  const [filter, setFilter] = useState("all");
  const maxGsm = Math.max(...(fabrics?.map((f) => f.gsm) ?? [1]));
  const visible = fabrics?.filter(filters.find((f) => f.id === filter)!.test);

  return (
    <>
      <PageHeader
        trail={[{ label: "الرئيسية", to: "/" }, { label: "مكتبة الأقمشة" }]}
        kicker="درج العيّنات، مفتوحاً بالكامل"
        title={
          <>
            ثمانية أقمشة. <em className="text-thread not-italic">ونعرف كل مصنع باسمه.</em>
          </>
        }
        intro="نفضّل أن نعرف أقمشة قليلة معرفة عميقة على أن نعرف كثيرها معرفة سطحية. هنا كل قماش نقصّه، من أين يأتي، كيف يُحَسّ، وماذا نصنع منه."
      />

      {/* weight ladder */}
      <section className="wrap py-12">
        <p className="label text-ink-3">من الأخفّ إلى الأثقل</p>
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
                      <span className="absolute inset-y-0 left-0 flex items-center text-xs text-ink-3">{weightWord(f.gsm)}</span>
                    </div>
                  </a>
                ))
            : Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-5" />)}
        </div>
        <HandNote className="mt-4 text-xl">خفيف كرسالة → ← ثقيل كبطّانية</HandNote>
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
                    <span className="label absolute -bottom-1 right-2 rotate-[3deg] bg-[#f3e9d2] px-2 py-1 text-ink shadow ring-1 ring-[#d8c49c]">رقم {String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div>
                    <p className="label text-thread">
                      {f.origin} · {f.mill}
                    </p>
                    <h2 className="mt-2 font-display text-[2.2rem] leading-tight">{f.name}</h2>
                    <p className="mt-1 font-mono text-sm text-ink-3">
                      {f.fibre} · الوزن: {weightWord(f.gsm)}
                    </p>
                    <p className="mt-4 leading-relaxed text-ink-2">{f.story}</p>
                    <p className="mt-3 font-hand text-2xl text-chalk">الملمس: «{f.hand}»</p>
                  </div>
                  <div className="space-y-2.5">
                    <FabricQualities fabric={f} />
                    <p className="label pt-4 text-ink-3">صُنع منه</p>
                    <ul className="space-y-1.5">
                      {made.map((p) => (
                        <li key={p.slug}>
                          <Link to={`/piece/${p.slug}`} className="group flex items-center gap-2 text-sm hover:text-thread">
                            <GarmentFlat kind={p.garment} {...p.colorways[0]} className="h-8 w-7 shrink-0" shadow={false} />
                            <span className="truncate">{p.name}</span>
                          </Link>
                        </li>
                      ))}
                      {!made.length && <li className="text-sm text-ink-3">قريباً في الفصل الخامس</li>}
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
