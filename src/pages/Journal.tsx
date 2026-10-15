import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { GarmentFlat } from "../components/GarmentFlat";
import { PageHeader, Reveal, Skeleton } from "../components/ui";
import { getJournal } from "../lib/api";
import { formatDate, pad, useAsync, useDocumentTitle } from "../lib/hooks";

export default function Journal() {
  useDocumentTitle("اليوميات");
  const { data } = useAsync(getJournal, []);
  const [first, ...rest] = data ?? [];

  return (
    <>
      <PageHeader
        trail={[{ label: "الرئيسية", to: "/" }, { label: "اليوميات" }]}
        kicker="دفتر المشغل"
        title={
          <>
            ملاحظات من <em className="text-thread not-italic">المشغل</em>
          </>
        }
        intro="رسائل من الدار، ملاحظات ميدانية من المصانع، ودروس رفو. يكتبها من يقصّون ويخيطون ويحيكون."
      />

      <div className="wrap py-14">
        {!data && <Skeleton className="h-96" />}
        {first && (
          <Reveal>
            <Link to={`/journal/${first.slug}`} className="group grid overflow-hidden rounded-md ring-1 ring-line md:grid-cols-2">
              <div className="relative grid min-h-80 place-items-center" style={{ background: first.cover.tint }}>
                <div className="absolute inset-0 bg-dots opacity-40" />
                <GarmentFlat kind={first.cover.garment} hex={first.cover.hex} accent={first.cover.accent} pattern={first.cover.pattern} className="relative h-72 transition duration-700 group-hover:rotate-[3deg] group-hover:scale-105" />
                <span className="label absolute right-5 top-5 rounded-full bg-paper/80 px-3 py-1 text-thread">أحدث مدخل</span>
              </div>
              <div className="flex flex-col justify-center bg-tissue p-8 md:p-12">
                <p className="label text-ink-3">
                  {first.kicker} · {formatDate(first.date)}
                </p>
                <h2 className="mt-3 font-display text-[2.4rem] leading-tight group-hover:text-thread md:text-[3rem]">{first.title}</h2>
                <p className="mt-4 text-lg leading-relaxed text-ink-2">{first.excerpt}</p>
                <p className="mt-6 flex items-center gap-2 text-sm">
                  <span className="text-ink-3">{first.author}</span>
                  <span className="text-ink-3">·</span>
                  <span className="inline-flex items-center gap-1 underline decoration-dashed underline-offset-4">
                    اقرأ ({first.readMins} دقائق) <ArrowLeft className="h-4 w-4" />
                  </span>
                </p>
              </div>
            </Link>
          </Reveal>
        )}

        {/* فهرس الدفتر */}
        <div className="mt-14 grid gap-x-10 lg:grid-cols-[220px_1fr]">
          <p className="label mb-6 text-ink-3 lg:mb-0 lg:pt-6">الفهرس · {data?.length ?? "…"} مدخلات</p>
          <ol className="border-t border-ink/80">
            {rest.map((j, i) => (
              <Reveal key={j.slug} delay={i * 0.05}>
                <li className="border-b border-dashed border-ink/25">
                  <Link to={`/journal/${j.slug}`} className="group grid grid-cols-[auto_1fr] items-center gap-5 py-6 sm:grid-cols-[auto_1fr_120px]">
                    <span className="font-mono text-sm text-thread">{pad(i + 2, 2)}</span>
                    <div className="min-w-0">
                      <p className="label text-ink-3">
                        {j.kicker} · {formatDate(j.date)} · {j.readMins} دقائق
                      </p>
                      <h3 className="mt-1 font-display text-[1.7rem] leading-snug transition group-hover:-translate-x-2 group-hover:text-thread">{j.title}</h3>
                      <p className="mt-1 line-clamp-2 text-ink-2">{j.excerpt}</p>
                    </div>
                    <div className="hidden h-28 place-items-center rounded-md sm:grid" style={{ background: j.cover.tint }}>
                      <GarmentFlat kind={j.cover.garment} hex={j.cover.hex} accent={j.cover.accent} pattern={j.cover.pattern} className="h-24 transition group-hover:rotate-[-4deg]" shadow={false} />
                    </div>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
