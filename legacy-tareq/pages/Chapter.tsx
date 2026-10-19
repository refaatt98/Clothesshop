import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useParams } from "react-router";
import { NotifyForm } from "../components/NotifyForm";
import { ProductBrowser } from "../components/ProductBrowser";
import { Breadcrumbs, Button, EmptyState, PinHead, Skeleton } from "../components/ui";
import { getChapter, getChapters, getProducts } from "../lib/api";
import { isDark } from "../lib/colour";
import { useAsync, useDocumentTitle } from "../lib/hooks";

export default function Chapter() {
  const { slug = "" } = useParams();
  const { data: c, loading } = useAsync(() => getChapter(slug), [slug]);
  const { data: all } = useAsync(getChapters, []);
  const { data: pieces } = useAsync(() => getProducts({ chapter: slug }), [slug]);
  useDocumentTitle(c ? c.title : "الموسم");

  if (loading && !c)
    return (
      <div className="wrap py-16">
        <Skeleton className="h-96" />
      </div>
    );
  if (!c) return <EmptyState title="لا يوجد موسم كهذا." text="ربما انتهى عرضه." action={<Button to="/chapters">كل المواسم</Button>} />;

  const idx = all?.findIndex((x) => x.slug === c.slug) ?? -1;
  const prev = all && idx > 0 ? all[idx - 1] : null;
  const next = all && idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <>
      <header className="relative overflow-hidden border-b border-line">
        <div className="flex h-3">
          {c.palette.map((p) => (
            <span key={p.hex} className="flex-1" style={{ background: p.hex }} />
          ))}
        </div>
        <div className="wrap relative py-10 md:py-12">
          <Breadcrumbs trail={[{ label: "الفصول", to: "/chapters" }, { label: c.title }]} />
          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-display text-[3rem] leading-tight md:text-[4.6rem]">
                {c.title}
                <sup className="ms-2 align-super font-mono text-base text-thread">{pieces?.length ?? "…"}</sup>
              </h1>
              <p className="font-hand text-2xl text-chalk">{c.season}</p>
            </div>
            <p className="max-w-md text-ink-2">{c.intro}</p>
          </div>
        </div>
      </header>

      <section className="wrap py-10">
        {c.status === "upcoming" ? (
          <div className="rounded-md bg-ink p-8 text-paper md:p-12">
            <p className="label text-paper/60">ليس للبيع بعد</p>
            <h2 className="mt-3 font-display text-[2.4rem] leading-tight">هذا الموسم ما زال على الورق.</h2>
            <p className="mt-3 max-w-lg text-paper/75">اترك بريدك وسنخبرك أول ما تنزل قطعه.</p>
            <div className="mt-6 max-w-lg">
              <NotifyForm dark />
            </div>
          </div>
        ) : (
          <ProductBrowser products={pieces} />
        )}
      </section>

      {/* حكاية الموسم */}
      <section className="wrap grid gap-12 border-t border-dashed border-ink/20 py-14 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="label text-thread">حكاية الموسم</p>
          <div className="mt-4 columns-1 gap-10 text-[1.05rem] leading-relaxed text-ink-2 md:columns-2">
            {c.story.map((para, i) => (
              <p key={i} className="mb-5 break-inside-avoid">
                {para}
              </p>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="relative rounded-md bg-tissue p-6 ring-1 ring-line">
            <PinHead className="absolute -top-3 left-6 h-7 w-7" />
            <p className="label text-ink-3">ألوان الموسم</p>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {c.palette.map((p) => (
                <div key={p.hex}>
                  <div className="grid aspect-[3/5] place-items-end rounded-sm p-1 ring-1 ring-ink/10" style={{ background: p.hex }}>
                    <span dir="ltr" className={`font-mono text-[0.55rem] ${isDark(p.hex) ? "text-paper/80" : "text-ink/60"}`}>
                      {p.hex.slice(1)}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.7rem] leading-tight text-ink-2">{p.name}</p>
                </div>
              ))}
            </div>
          </div>
          <blockquote className="border-s-2 border-thread ps-5 font-display text-[1.8rem] leading-snug">«{c.note}»</blockquote>
        </div>
      </section>

      <nav className="wrap grid gap-4 border-t border-dashed border-ink/20 pt-8 sm:grid-cols-2" aria-label="التنقّل بين المواسم">
        {prev ? (
          <Link to={`/chapters/${prev.slug}`} className="group rounded-md p-4 ring-1 ring-line hover:ring-ink/30">
            <span className="label flex items-center gap-1 text-ink-3">
              <ArrowRight className="h-3.5 w-3.5" /> السابق
            </span>
            <span className="mt-1 block font-display text-2xl group-hover:text-thread">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/chapters/${next.slug}`} className="group rounded-md p-4 text-left ring-1 ring-line hover:ring-ink/30">
            <span className="label flex items-center justify-end gap-1 text-ink-3">
              التالي <ArrowLeft className="h-3.5 w-3.5" />
            </span>
            <span className="mt-1 block font-display text-2xl group-hover:text-thread">{next.title}</span>
          </Link>
        )}
      </nav>
    </>
  );
}
