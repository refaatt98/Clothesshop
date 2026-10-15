import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Link, useParams } from "react-router";
import { NotifyForm } from "../components/NotifyForm";
import { ProductCard } from "../components/ProductCard";
import { Breadcrumbs, Button, EmptyState, PinHead, Reveal, SectionHead, Skeleton } from "../components/ui";
import { getChapter, getChapters, getProducts } from "../lib/api";
import { isDark } from "../lib/colour";
import { useAsync, useDocumentTitle } from "../lib/hooks";

export default function Chapter() {
  const { slug = "" } = useParams();
  const { data: c, loading } = useAsync(() => getChapter(slug), [slug]);
  const { data: all } = useAsync(getChapters, []);
  const { data: pieces } = useAsync(() => getProducts({ chapter: slug }), [slug]);
  useDocumentTitle(c ? `الفصل ${c.numeral}: ${c.title}` : "فصل");

  if (loading && !c)
    return (
      <div className="wrap py-16">
        <Skeleton className="h-96" />
      </div>
    );
  if (!c) return <EmptyState title="لا يوجد فصل كهذا." text="هذا الفصل ليس في الكتاب." action={<Button to="/chapters">كل الفصول</Button>} />;

  const idx = all?.findIndex((x) => x.slug === c.slug) ?? -1;
  const prev = all && idx > 0 ? all[idx - 1] : null;
  const next = all && idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <>
      <header className="relative overflow-hidden border-b border-line">
        {/* palette ribbon */}
        <div className="flex h-3">
          {c.palette.map((p) => (
            <span key={p.hex} className="flex-1" style={{ background: p.hex }} />
          ))}
        </div>
        <div className="wrap relative grid gap-8 py-12 md:grid-cols-[auto_1fr] md:items-end md:py-16">
          <motion.span
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display text-[8rem] leading-[0.9] text-thread md:text-[13rem]"
          >
            {c.numeral}
          </motion.span>
          <div>
            <Breadcrumbs trail={[{ label: "الفصول", to: "/chapters" }, { label: c.title }]} />
            <p className="label mt-5 text-ink-3">{c.season}</p>
            <h1 className="mt-2 font-display text-[3rem] leading-tight md:text-[5rem]">{c.title}</h1>
            <p className="mt-4 max-w-2xl text-lg text-ink-2">{c.intro}</p>
          </div>
        </div>
      </header>

      <section className="wrap grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr]">
        <div className="columns-1 gap-10 text-[1.05rem] leading-relaxed text-ink-2 md:columns-2">
          {c.story.map((para, i) => (
            <p key={i} className={`mb-5 break-inside-avoid ${i === 0 ? "first-letter:font-display first-letter:text-[1.6rem] first-letter:text-thread" : ""}`}>
              {para}
            </p>
          ))}
        </div>
        <div className="space-y-6">
          <div className="relative rounded-md bg-tissue p-6 ring-1 ring-line">
            <PinHead className="absolute -top-3 left-6 h-7 w-7" />
            <p className="label text-ink-3">بطاقة الألوان</p>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {c.palette.map((p) => (
                <div key={p.hex}>
                  <div className="grid aspect-[3/5] place-items-end rounded-sm p-1 ring-1 ring-ink/10" style={{ background: p.hex }}>
                    <span dir="ltr" className={`font-mono text-[0.55rem] ${isDark(p.hex) ? "text-paper/80" : "text-ink/60"}`}>{p.hex.slice(1)}</span>
                  </div>
                  <p className="mt-1 text-[0.7rem] leading-tight text-ink-2">{p.name}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {c.moods.map((m, i) => (
              <span key={m} className="rounded-sm bg-butter/50 px-2 py-0.5 font-hand text-2xl text-ink" style={{ transform: `rotate(${(i % 3) - 1.2}deg)` }}>
                {m}
              </span>
            ))}
          </div>
          <blockquote className="border-s-2 border-thread ps-5 font-display text-[1.8rem] leading-snug">«{c.note}»</blockquote>
        </div>
      </section>

      <section className="wrap py-10">
        {c.status === "upcoming" ? (
          <div className="rounded-md bg-ink p-8 text-paper md:p-12">
            <p className="label text-paper/60">ليس للبيع بعد</p>
            <h2 className="mt-3 font-display text-[2.4rem] leading-tight">هذا الفصل ما زال ورقاً.</h2>
            <p className="mt-3 max-w-lg text-paper/75">اترك بريدك وسنرسل لك ملاحظات البروفات والإطلالات الأولى قبل أن يُخاط أي شيء بقماشه النهائي.</p>
            <div className="mt-6 max-w-lg">
              <NotifyForm dark />
            </div>
          </div>
        ) : (
          <>
            <SectionHead kicker={`${pieces?.length ?? "…"} قطع`} title={<>كل ما في <em className="text-thread not-italic">{c.title}</em></>} />
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {pieces?.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.04}>
                  <ProductCard product={p} index={i} />
                </Reveal>
              ))}
              {!pieces && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5]" />)}
            </div>
          </>
        )}
      </section>

      <nav className="wrap mt-10 grid gap-4 border-t border-dashed border-ink/20 pt-8 sm:grid-cols-2" aria-label="التنقّل بين الفصول">
        {prev ? (
          <Link to={`/chapters/${prev.slug}`} className="group rounded-md p-4 ring-1 ring-line hover:ring-ink/30">
            <span className="label flex items-center gap-1 text-ink-3">
              <ArrowRight className="h-3.5 w-3.5" /> السابق
            </span>
            <span className="mt-1 block font-display text-2xl group-hover:text-thread">
              <span className="text-thread">{prev.numeral}</span> {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/chapters/${next.slug}`} className="group rounded-md p-4 text-left ring-1 ring-line hover:ring-ink/30">
            <span className="label flex items-center justify-end gap-1 text-ink-3">
              التالي <ArrowLeft className="h-3.5 w-3.5" />
            </span>
            <span className="mt-1 block font-display text-2xl group-hover:text-thread">
              <span className="text-thread">{next.numeral}</span> {next.title}
            </span>
          </Link>
        )}
      </nav>
    </>
  );
}
