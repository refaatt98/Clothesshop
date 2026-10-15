import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, PageHeader, Skeleton } from "../components/ui";
import { getFaqs } from "../lib/api";
import { useAsync, useDocumentTitle } from "../lib/hooks";
import type { Faq } from "../types";

const groups: (Faq["group"] | "الكل")[] = ["الكل", "الطلبات", "المقاسات", "الرفو", "الشحن", "عن الدار"];

export default function Help() {
  useDocumentTitle("أسئلة شائعة");
  const { data } = useAsync(getFaqs, []);
  const [group, setGroup] = useState<(typeof groups)[number]>("الكل");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>("f1");

  const list = useMemo(
    () => (data ?? []).filter((f) => (group === "الكل" || f.group === group) && (!q.trim() || (f.q + f.a).includes(q.trim()))),
    [data, group, q],
  );

  return (
    <>
      <PageHeader
        trail={[{ label: "الرئيسية", to: "/" }, { label: "أسئلة شائعة" }]}
        kicker="المساعدة"
        title={
          <>
            أسئلة نسمعها <em className="text-thread not-italic">على طاولة القصّ</em>
          </>
        }
        intro="إن لم تجد جوابك هنا، اكتب لنا — يردّ عليك إنسان من المشغل، عادة خلال يوم عمل."
      >
        <div className="mt-8 flex max-w-xl items-center gap-3 border-b-2 border-ink pb-2">
          <Search className="h-5 w-5 text-ink-3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث في الأسئلة… مثلاً: إرجاع، رفو، مقاس" className="min-w-0 flex-1 bg-transparent text-lg outline-none" aria-label="ابحث في الأسئلة" />
        </div>
      </PageHeader>

      <section className="wrap grid gap-10 py-12 lg:grid-cols-[220px_1fr]">
        <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0" aria-label="المجموعات">
          {groups.map((g) => (
            <button key={g} onClick={() => setGroup(g)} className={`shrink-0 rounded-full px-4 py-2 text-start text-sm transition lg:rounded-md ${group === g ? "bg-ink text-paper" : "hover:bg-paper-2"}`}>
              {g}
              <span className="ms-2 font-mono text-xs opacity-60">{g === "الكل" ? data?.length ?? "" : data?.filter((f) => f.group === g).length ?? ""}</span>
            </button>
          ))}
        </nav>

        <div>
          {!data && <Skeleton className="h-64" />}
          {data && list.length === 0 && <p className="font-hand text-3xl text-chalk">لا شيء بهذه الكلمات. جرّب كلمة أخرى، أو راسلنا مباشرة.</p>}
          <ul className="border-t border-ink/80">
            {list.map((f) => (
              <li key={f.id} className="border-b border-dashed border-ink/25">
                <button onClick={() => setOpen(open === f.id ? null : f.id)} className="flex w-full items-center justify-between gap-6 py-5 text-start" aria-expanded={open === f.id}>
                  <span>
                    <span className="label me-3 text-thread">{f.group}</span>
                    <span className="font-display text-[1.45rem] leading-snug">{f.q}</span>
                  </span>
                  <ChevronDown className={`h-5 w-5 shrink-0 transition ${open === f.id ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {open === f.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="max-w-2xl pb-6 text-lg leading-relaxed text-ink-2">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-md bg-tissue p-6 ring-1 ring-line">
            <p className="font-display text-2xl">ما زال عندك سؤال؟</p>
            <div className="flex gap-3">
              <Button to="/contact">راسلنا</Button>
              <Button to="/visit#book" variant="paper">
                احجز بروفة
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
