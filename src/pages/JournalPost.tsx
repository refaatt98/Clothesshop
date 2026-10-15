import { ArrowLeft, ArrowRight, Link2 } from "lucide-react";
import { motion, useScroll } from "motion/react";
import { Link, useParams } from "react-router";
import { GarmentFlat } from "../components/GarmentFlat";
import { NotifyForm } from "../components/NotifyForm";
import { Breadcrumbs, Button, EmptyState, PinHead, Skeleton } from "../components/ui";
import { getJournal, getJournalPost } from "../lib/api";
import { formatDate, useAsync, useDocumentTitle } from "../lib/hooks";
import { useShop } from "../lib/store";

export default function JournalPost() {
  const { slug = "" } = useParams();
  const { data: post, loading } = useAsync(() => getJournalPost(slug), [slug]);
  const { data: all } = useAsync(getJournal, []);
  const { toast } = useShop();
  const { scrollYProgress } = useScroll();
  useDocumentTitle(post?.title ?? "اليوميات");

  if (loading && !post)
    return (
      <div className="wrap max-w-3xl space-y-4 py-16">
        <Skeleton className="h-12" />
        <Skeleton className="h-80" />
      </div>
    );
  if (!post) return <EmptyState title="هذه الصفحة ليست في الدفتر." text="ربما انتُزعت. جرّب الفهرس." action={<Button to="/journal">كل اليوميات</Button>} />;

  const idx = all?.findIndex((j) => j.slug === post.slug) ?? -1;
  const newer = all && idx > 0 ? all[idx - 1] : null;
  const older = all && idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("نُسخ الرابط", "أرسله لمن يحبّ الحكايات الطويلة");
    } catch {
      toast("لم نستطع النسخ", window.location.href);
    }
  };

  return (
    <article>
      {/* خيط القراءة */}
      <motion.div className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-right bg-thread" style={{ scaleX: scrollYProgress }} />

      <header className="relative overflow-hidden border-b border-line" style={{ background: post.cover.tint }}>
        <div className="absolute inset-0 bg-dots opacity-40" />
        <div className="wrap relative grid gap-8 py-12 md:grid-cols-[1.4fr_1fr] md:items-center md:py-16">
          <div>
            <Breadcrumbs trail={[{ label: "اليوميات", to: "/journal" }, { label: post.kicker }]} />
            <h1 className="mt-6 font-display text-[2.6rem] leading-tight text-balance md:text-[4rem]">{post.title}</h1>
            <p className="mt-4 max-w-xl text-lg text-ink-2">{post.excerpt}</p>
            <p className="label mt-6 text-ink-3">
              {post.author} · {formatDate(post.date)} · {post.readMins} دقائق قراءة
            </p>
          </div>
          <motion.div initial={{ rotate: 6, opacity: 0, y: 20 }} animate={{ rotate: -3, opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="relative mx-auto w-56 md:w-72">
            <PinHead className="absolute -top-3 left-1/2 z-10 h-8 w-8 -translate-x-1/2" />
            <div className="rounded-md bg-tissue p-6 shadow-[0_20px_40px_-20px_#1e1c1966] ring-1 ring-line">
              <GarmentFlat kind={post.cover.garment} hex={post.cover.hex} accent={post.cover.accent} pattern={post.cover.pattern} className="w-full" />
            </div>
          </motion.div>
        </div>
      </header>

      <div className="wrap grid gap-10 py-14 lg:grid-cols-[1fr_minmax(0,680px)_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-32 space-y-3">
            <button onClick={copy} className="flex items-center gap-2 text-sm text-ink-2 hover:text-thread">
              <Link2 className="h-4 w-4" /> انسخ الرابط
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(post.title + " — " + (typeof window !== "undefined" ? window.location.href : ""))}`}
              target="_blank"
              rel="noreferrer"
              className="block text-sm text-ink-2 hover:text-thread"
            >
              شارك عبر واتساب
            </a>
          </div>
        </aside>

        <div className="text-[1.12rem] leading-[2] text-ink-2">
          {post.body.map((b, i) => {
            if (b.type === "h") return <h2 key={i} className="mb-3 mt-10 font-display text-[1.9rem] leading-snug text-ink">{b.text}</h2>;
            if (b.type === "quote")
              return (
                <figure key={i} className="my-10 border-s-4 border-thread ps-6">
                  <blockquote className="font-display text-[1.9rem] leading-snug text-ink">«{b.text}»</blockquote>
                  {b.by && <figcaption className="label mt-3 text-ink-3">— {b.by}</figcaption>}
                </figure>
              );
            if (b.type === "note")
              return (
                <aside key={i} className="relative my-10 rotate-[-1deg] rounded-sm bg-butter/70 p-6 shadow-[0_10px_20px_-12px_#1e1c1966]">
                  <PinHead className="absolute -top-3 right-8 h-7 w-7" />
                  <p className="font-hand text-[1.6rem] leading-relaxed text-ink">{b.text}</p>
                </aside>
              );
            return (
              <p key={i} className="mb-6">
                {b.text}
              </p>
            );
          })}

          <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-dashed border-ink/25 pt-6 lg:hidden">
            <button onClick={copy} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm ring-1 ring-line">
              <Link2 className="h-4 w-4" /> انسخ الرابط
            </button>
          </div>

          <div className="mt-12 rounded-md bg-tissue p-6 ring-1 ring-line">
            <p className="font-display text-2xl text-ink">هل أعجبتك؟ تصلك واحدة كل شهر.</p>
            <p className="mb-4 mt-1 text-base">رسائل من طاولة القصّ — بلا أكواد خصم، وعد.</p>
            <NotifyForm cta="اشترك" />
          </div>
        </div>
      </div>

      <nav className="wrap grid gap-4 sm:grid-cols-2" aria-label="مدخلات أخرى">
        {newer ? (
          <Link to={`/journal/${newer.slug}`} className="group rounded-md p-5 ring-1 ring-line hover:ring-ink/30">
            <span className="label flex items-center gap-1 text-ink-3">
              <ArrowRight className="h-3.5 w-3.5" /> الأحدث
            </span>
            <span className="mt-1 block font-display text-2xl leading-snug group-hover:text-thread">{newer.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {older && (
          <Link to={`/journal/${older.slug}`} className="group rounded-md p-5 text-left ring-1 ring-line hover:ring-ink/30">
            <span className="label flex items-center justify-end gap-1 text-ink-3">
              الأقدم <ArrowLeft className="h-3.5 w-3.5" />
            </span>
            <span className="mt-1 block font-display text-2xl leading-snug group-hover:text-thread">{older.title}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
