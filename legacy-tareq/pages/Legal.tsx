import { Link, NavLink, useParams } from "react-router";
import { Button, EmptyState, PageHeader, Skeleton } from "../components/ui";
import { getLegalDoc } from "../lib/api";
import { formatDate, useAsync, useDocumentTitle } from "../lib/hooks";

const docs = [
  { slug: "privacy", label: "الخصوصية" },
  { slug: "terms", label: "شروط البيع" },
  { slug: "accessibility", label: "إمكانية الوصول" },
];

export default function Legal() {
  const { doc = "privacy" } = useParams();
  const { data, loading } = useAsync(() => getLegalDoc(doc), [doc]);
  useDocumentTitle(data?.title ?? "الصفحات القانونية");

  if (!loading && !data) return <EmptyState title="هذه الوثيقة غير موجودة." text="جرّب إحدى الوثائق أدناه." action={<Button to="/legal/privacy">الخصوصية</Button>} />;

  return (
    <>
      <PageHeader
        trail={[{ label: "الرئيسية", to: "/" }, { label: data?.title ?? "…" }]}
        kicker="بالخط الصغير — لكن بلغة واضحة"
        title={data?.title ?? "…"}
        intro={data ? `آخر تحديث: ${formatDate(data.updated)}` : undefined}
      >
        <nav className="mt-8 flex flex-wrap gap-2" aria-label="الوثائق">
          {docs.map((d) => (
            <NavLink key={d.slug} to={`/legal/${d.slug}`} className={({ isActive }) => `rounded-full px-4 py-2 text-sm ring-1 ${isActive ? "bg-ink text-paper ring-ink" : "ring-line hover:ring-ink/40"}`}>
              {d.label}
            </NavLink>
          ))}
        </nav>
      </PageHeader>

      <section className="wrap max-w-3xl py-14">
        {!data && <Skeleton className="h-96" />}
        {data?.sections.map((s, i) => (
          <div key={s.heading} className="grid gap-2 border-b border-dashed border-ink/20 py-8 md:grid-cols-[48px_1fr]">
            <span className="font-mono text-sm text-thread">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h2 className="font-display text-[1.8rem] leading-snug">{s.heading}</h2>
              <p className="mt-2 text-lg leading-relaxed text-ink-2">{s.body}</p>
            </div>
          </div>
        ))}
        <p className="mt-10 text-ink-2">
          سؤال عن هذه الوثيقة؟{" "}
          <Link to="/contact" className="underline decoration-dashed underline-offset-4 hover:text-thread">
            راسلنا
          </Link>
          .
        </p>
      </section>
    </>
  );
}
