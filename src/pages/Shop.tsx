import { AnimatePresence, motion } from "motion/react";
import { LayoutGrid, Rows3, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { categoryNames } from "../components/Header";
import { ProductCard } from "../components/ProductCard";
import { Breadcrumbs, Button, EmptyState, HandNote, Skeleton } from "../components/ui";
import { getProducts } from "../lib/api";
import { colourFamilies } from "../lib/colour";
import { departments, deptName, sizesIn } from "../lib/departments";
import { useAsync, useDocumentTitle } from "../lib/hooks";
import { useShop } from "../lib/store";
import type { Category, Department, ProductQuery } from "../types";

const sorts: { id: NonNullable<ProductQuery["sort"]>; label: string }[] = [
  { id: "featured", label: "كما عُلّقت في المشغل" },
  { id: "new", label: "الأحدث أولاً" },
  { id: "price-asc", label: "السعر: من الأقل" },
  { id: "price-desc", label: "السعر: من الأعلى" },
  { id: "slowest", label: "الأبطأ صنعاً أولاً" },
];
const PRICE_MAX = 700;

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<"rail" | "flat">("rail");
  const { money, chapters: chapterList, catalog } = useShop();
  const chapters = chapterList ?? [];

  const query: ProductQuery = {
    category: (params.get("category") as Category) || "all",
    dept: (params.get("dept") as Department) || undefined,
    chapter: params.get("chapter") || undefined,
    colourFamily: params.get("colour") || undefined,
    size: params.get("size") || undefined,
    maxPrice: params.get("max") ? Number(params.get("max")) : undefined,
    sort: (params.get("sort") as ProductQuery["sort"]) || "featured",
    q: params.get("q") || undefined,
  };
  const key = params.toString();
  const { data, loading } = useAsync(() => getProducts(query), [key]);

  const set = (k: string, v?: string | null) => {
    const next = new URLSearchParams(params);
    if (v === undefined || v === null || v === "" || v === "all") next.delete(k);
    else next.set(k, v);
    setParams(next, { replace: true });
  };

  const activeCount = ["chapter", "colour", "size", "max", "q"].filter((k) => params.get(k)).length;
  const inDept = (catalog ?? []).filter((p) => !query.dept || p.departments.includes(query.dept));
  const sizes = sizesIn(inDept);
  const deptCategories = (Object.keys(categoryNames) as Category[]).filter((c) => inDept.some((p) => p.category === c));
  const catLabel = query.category && query.category !== "all" ? categoryNames[query.category] : null;
  const title = [deptName(query.dept), catLabel].filter(Boolean).join(" · ") || "كل ما على الراف";
  useDocumentTitle(title === "كل ما على الراف" ? "المتجر" : title);

  const chooseDept = (d: Department | "all") => {
    const next = new URLSearchParams(params);
    if (d === "all") next.delete("dept");
    else next.set("dept", d);
    next.delete("size");
    next.delete("category");
    setParams(next, { replace: true });
  };

  const chips = useMemo(() => {
    const c: { k: string; label: string }[] = [];
    if (query.q) c.push({ k: "q", label: `«${query.q}»` });
    if (query.chapter) c.push({ k: "chapter", label: chapters.find((x) => x.slug === query.chapter)?.title ?? query.chapter });
    if (query.colourFamily) c.push({ k: "colour", label: colourFamilies.find((x) => x.id === query.colourFamily)?.name ?? "" });
    if (query.size) c.push({ k: "size", label: `مقاس ${query.size}` });
    if (query.maxPrice) c.push({ k: "max", label: `أقل من ${money(query.maxPrice)}` });
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, money]);

  const Filters = (
    <div className="space-y-8">
      <div>
        <p className="label text-ink-3">الفصل</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => set("chapter", null)} className={`rounded-full px-3 py-1.5 text-sm ring-1 transition ${!query.chapter ? "bg-ink text-paper ring-ink" : "ring-line hover:ring-ink/40"}`}>
            الكل
          </button>
          {chapters
            .filter((c) => c.status !== "upcoming")
            .map((c) => (
              <button
                key={c.slug}
                onClick={() => set("chapter", query.chapter === c.slug ? null : c.slug)}
                className={`rounded-full px-3 py-1.5 text-sm ring-1 transition ${query.chapter === c.slug ? "bg-ink text-paper ring-ink" : "ring-line hover:ring-ink/40"}`}
              >
                <span className="font-display text-thread">{c.numeral}</span> {c.title}
              </button>
            ))}
        </div>
      </div>
      <div>
        <p className="label text-ink-3">اللون</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {colourFamilies.map((f) => (
            <button
              key={f.id}
              onClick={() => set("colour", query.colourFamily === f.id ? null : f.id)}
              className="group flex flex-col items-center gap-1.5"
              aria-pressed={query.colourFamily === f.id}
              title={f.name}
            >
              <span className={`h-9 w-9 rounded-full ring-1 ring-ink/20 ring-offset-2 ring-offset-paper transition ${query.colourFamily === f.id ? "ring-2 ring-ink" : "group-hover:ring-ink/50"}`} style={{ background: f.hex }} />
              <span className="max-w-16 text-center text-[0.72rem] leading-tight text-ink-3">{f.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="max-price" className="label text-ink-3">
            حتى
          </label>
          <span className="font-mono text-sm">{money(query.maxPrice ?? PRICE_MAX)}</span>
        </div>
        <input
          id="max-price"
          type="range"
          min={60}
          max={PRICE_MAX}
          step={10}
          value={query.maxPrice ?? PRICE_MAX}
          onChange={(e) => set("max", Number(e.target.value) >= PRICE_MAX ? null : e.target.value)}
          className="mt-3 w-full accent-thread"
        />
      </div>
      <Link to="/fit-guide" className="block rounded-md bg-paper-2 p-4 text-sm text-ink-2 ring-1 ring-line hover:ring-ink/30">
        <HandNote className="text-xl" rotate={-2}>بين مقاسين؟</HandNote>
        <span className="mt-1 block">دليل المقاسات يقترح مقاساً لكل قصّة ←</span>
      </Link>
    </div>
  );

  return (
    <>
      <header className="border-b border-line">
        <div className="wrap pb-8 pt-8 md:pt-10">
          <Breadcrumbs trail={[{ label: "الرئيسية", to: "/" }, { label: "المتجر", to: "/shop" }, ...(title !== "كل ما على الراف" ? [{ label: title }] : [])]} />
          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h1 className="font-display text-[2.8rem] leading-[1.2] md:text-[4.4rem]">
              {title}
              <sup className="ms-2 align-super font-mono text-base text-thread">{data?.length ?? "…"}</sup>
            </h1>
            <p className="max-w-sm text-ink-2">قطع مرقّمة بإصدارات صغيرة. حين ينفد الإصدار، ينفد — ثم يبقى على قائمة الرفو إلى الأبد.</p>
          </div>

          {/* الأقسام */}
          <div className="mt-8 grid grid-cols-4 gap-2 sm:flex" role="tablist" aria-label="القسم">
            {[{ id: "all" as const, name: "الكل" }, ...departments].map((d) => {
              const active = (query.dept ?? "all") === d.id;
              return (
                <button
                  key={d.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => chooseDept(d.id)}
                  className={`rounded-full px-4 py-2.5 font-display text-lg ring-1 transition sm:px-7 ${active ? "bg-thread text-tissue ring-thread" : "ring-line hover:ring-ink/40"}`}
                >
                  {d.name}
                </button>
              );
            })}
          </div>

          {/* envelope tabs */}
          <div className="no-scrollbar -mx-4 mt-6 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0">
            {(["all", ...deptCategories] as (Category | "all")[]).map((c) => {
              const active = query.category === c;
              return (
                <button
                  key={c}
                  onClick={() => set("category", c)}
                  className={`relative shrink-0 rounded-t-md px-4 pb-2.5 pt-3 text-sm transition ${active ? "bg-ink text-paper" : "bg-paper-2 text-ink-2 hover:bg-paper-3"}`}
                >
                  {c === "all" ? "الكل" : categoryNames[c]}
                </button>
              );
            })}
          </div>
          <div className="h-[3px] bg-ink" />
        </div>
      </header>

      <div className="wrap py-8">
        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setFiltersOpen(true)} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm ring-1 ring-ink/20 lg:hidden">
            <SlidersHorizontal className="h-4 w-4" /> الفلاتر {activeCount > 0 && <span className="rounded-full bg-thread px-1.5 font-mono text-xs text-tissue">{activeCount}</span>}
          </button>
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <button key={c.k} onClick={() => set(c.k, null)} className="flex items-center gap-1 rounded-full bg-butter/60 px-3 py-1.5 text-sm hover:bg-butter">
                {c.label} <X className="h-3.5 w-3.5" />
              </button>
            ))}
            {chips.length > 1 && (
              <button
                onClick={() => {
                  const keep: Record<string, string> = {};
                  if (query.dept) keep.dept = query.dept;
                  if (query.category !== "all") keep.category = query.category!;
                  setParams(keep);
                }}
                className="px-2 text-sm underline decoration-dashed underline-offset-4"
              >
                مسح الكل
              </button>
            )}
          </div>
          <div className="ms-auto flex items-center gap-2">
            <label htmlFor="sort" className="sr-only">
              الترتيب
            </label>
            <select id="sort" value={query.sort} onChange={(e) => set("sort", e.target.value === "featured" ? null : e.target.value)} className="rounded-full bg-tissue px-3 py-2 text-sm ring-1 ring-line outline-none focus:ring-thread">
              {sorts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <div className="hidden rounded-full p-1 ring-1 ring-line sm:flex" role="group" aria-label="طريقة العرض">
              <button onClick={() => setView("rail")} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs ${view === "rail" ? "bg-ink text-paper" : ""}`} aria-pressed={view === "rail"}>
                <Rows3 className="h-3.5 w-3.5" /> على الشمّاعات
              </button>
              <button onClick={() => setView("flat")} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs ${view === "flat" ? "bg-ink text-paper" : ""}`} aria-pressed={view === "flat"}>
                <LayoutGrid className="h-3.5 w-3.5" /> ممدودة
              </button>
            </div>
          </div>
        </div>

        {/* شريط المقاسات */}
        <div className="mt-5 flex items-center gap-3 rounded-md bg-tissue p-3 ring-1 ring-line">
          <span className="label shrink-0 text-ink-3">المقاس</span>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => set("size", query.size === s ? null : s)}
                aria-pressed={query.size === s}
                className={`h-9 shrink-0 rounded-md px-3 font-mono text-xs ring-1 transition ${query.size === s ? "bg-thread text-tissue ring-thread" : "bg-paper ring-line hover:ring-ink/40"}`}
              >
                {s}
              </button>
            ))}
          </div>
          {query.dept === "kids" && <span className="ms-auto hidden shrink-0 text-xs text-ink-3 sm:block">بالسنوات</span>}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-32">{Filters}</div>
          </aside>

          <div>
            {loading && !data ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/5]" />
                ))}
              </div>
            ) : data && data.length === 0 ? (
              <EmptyState
                title="لا شيء على هذا الراف."
                text="لا قطع تطابق كل هذه الشروط معاً. خفّف فلتراً أو اثنين — أو أخبرنا عمّا كنت تبحث."
                action={
                  <div className="flex gap-3">
                    <Button onClick={() => setParams({})}>اعرض كل شيء</Button>
                    <Button to="/contact" variant="paper">
                      اطلب قطعة
                    </Button>
                  </div>
                }
              />
            ) : (
              <motion.div layout className={`grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 ${loading ? "opacity-60" : ""} transition-opacity`}>
                {data?.map((p, i) => (
                  <motion.div layout key={p.slug} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.4) }}>
                    <ProductCard product={p} index={i} hanger={view === "rail"} />
                  </motion.div>
                ))}
                {data && data.length > 4 && (
                  <div className="col-span-2 row-start-3 flex flex-col justify-between rounded-md bg-ink p-6 text-paper md:col-span-1">
                    <p className="label text-paper/60">ملاحظة من طاولة القصّ</p>
                    <p className="my-6 font-display text-[1.7rem] leading-snug">
                      «في كل حاشية 6 سم مخبّأة في الداخل، لتُطال بعد عشر سنوات.»
                    </p>
                    <Link to="/mending" className="font-hand text-2xl text-butter hover:underline">
                      اقرأ عن الرفو مدى الحياة ←
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* mobile filter sheet */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div className="fixed inset-0 z-[80] bg-ink/30 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFiltersOpen(false)} />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[90] max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-paper p-6 lg:hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-label="الفلاتر"
            >
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-ink/20" />
              <div className="mb-6 flex items-center justify-between">
                <p className="font-display text-2xl">صفِّ الراف</p>
                <button onClick={() => setFiltersOpen(false)} className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-line" aria-label="إغلاق الفلاتر">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {Filters}
              <Button onClick={() => setFiltersOpen(false)} className="mt-8 w-full">
                اعرض {data?.length ?? 0} قطعة
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
