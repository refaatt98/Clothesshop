import { AnimatePresence, motion } from "motion/react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { YarnBall } from "../components/Craft";
import { YarnLoader } from "../components/Loader";
import { ProductCard } from "../components/ProductCard";
import { EmptyState, PageHero } from "../components/ui";
import { getCategories, getProducts } from "../lib/api";
import { piecesLabel } from "../lib/format";
import { useAsync, useTitle } from "../lib/hooks";
import type { ProductFilter } from "../types";

const priceRanges = [
  { id: "", label: "كل الأسعار" },
  { id: "0-50", label: "أقل من 50 ₪", min: 0, max: 50 },
  { id: "50-100", label: "50 – 100 ₪", min: 50, max: 100 },
  { id: "100-", label: "أكثر من 100 ₪", min: 100 },
];

const sorts: { id: NonNullable<ProductFilter["sort"]>; label: string }[] = [
  { id: "featured", label: "المختارة أولاً" },
  { id: "new", label: "الأحدث" },
  { id: "price-asc", label: "السعر: من الأقل" },
  { id: "price-desc", label: "السعر: من الأعلى" },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") ?? "";
  const q = params.get("q") ?? "";
  const price = params.get("price") ?? "";
  const sort = (params.get("sort") as ProductFilter["sort"]) ?? "featured";
  const inStock = params.get("stock") === "1";
  const [searchText, setSearchText] = useState(q);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => setSearchText(q), [q]);

  const { data: categories } = useAsync(getCategories, []);
  const range = priceRanges.find((r) => r.id === price);
  const { data: products, loading } = useAsync(
    () => getProducts({ category: category || undefined, q, minPrice: range?.min, maxPrice: range?.max, sort, inStockOnly: inStock }),
    [category, q, price, sort, inStock],
  );

  const current = categories?.find((c) => c.slug === category);
  useTitle(current ? current.name : "المتجر");

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  // بحث مع تأخير بسيط
  useEffect(() => {
    if (searchText === q) return;
    const t = setTimeout(() => update("q", searchText.trim()), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const activeCount = [price, inStock ? "1" : "", q].filter(Boolean).length;

  const filtersPanel = (
    <div className="space-y-6">
      <div>
        <p className="label">السعر</p>
        <div className="flex flex-wrap gap-2">
          {priceRanges.map((r) => (
            <button
              key={r.id}
              onClick={() => update("price", r.id)}
              className={`rounded-full border px-4 py-2 text-sm transition ${price === r.id ? "border-cocoa bg-cocoa text-cream" : "border-line bg-linen hover:border-cocoa-3"}`}
              aria-pressed={price === r.id}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-3">
        <span className={`relative h-6 w-11 rounded-full transition ${inStock ? "bg-sage" : "bg-sand"}`}>
          <motion.span className="absolute top-1 size-4 rounded-full bg-white shadow" animate={{ right: inStock ? 24 : 4 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
        </span>
        <input type="checkbox" className="sr-only" checked={inStock} onChange={(e) => update("stock", e.target.checked ? "1" : "")} />
        <span className="text-sm">المتوفر حالياً بس</span>
      </label>
      {activeCount > 0 && (
        <button
          onClick={() => {
            setSearchText("");
            setParams(category ? { category } : {}, { replace: true });
          }}
          className="text-sm font-semibold text-rose underline-offset-4 hover:underline"
        >
          مسح الفلاتر
        </button>
      )}
    </div>
  );

  return (
    <>
      <PageHero
        eyebrow="المتجر"
        title={current ? current.name : "كل القطع"}
        text={current ? current.description : "قطع يدوية بتفاصيل ناعمة — اختاري اللي بيشبهك."}
      />

      {/* التصنيفات */}
      <div className="sticky top-[68px] z-30 border-b border-dashed border-line bg-cream/90 backdrop-blur md:top-20">
        <div className="container-b">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] md:mx-0 md:flex-wrap md:justify-center md:px-0" role="tablist" aria-label="التصنيفات">
            {[{ slug: "", name: "الكل" }, ...(categories ?? [])].map((c) => {
              const active = category === c.slug;
              return (
                <button
                  key={c.slug || "all"}
                  role="tab"
                  aria-selected={active}
                  onClick={() => update("category", c.slug)}
                  className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${active ? "text-cream" : "text-cocoa-2 hover:bg-cream-2"}`}
                >
                  {active && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-cocoa" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                  <span className="relative">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section className="container-b py-8 md:py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-cocoa-3" />
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="ابحثي عن قطعة، لون أو خامة..."
              className="field !rounded-full !pr-12"
              aria-label="بحث في المتجر"
            />
          </div>
          <div className="flex gap-2">
            <select value={sort} onChange={(e) => update("sort", e.target.value === "featured" ? "" : e.target.value)} className="field !w-auto flex-1 !rounded-full sm:flex-none" aria-label="الترتيب">
              {sorts.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <button onClick={() => setFiltersOpen((o) => !o)} className="btn btn-ghost !px-4" aria-expanded={filtersOpen}>
              <SlidersHorizontal className="size-4" />
              فلترة
              {activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-rose text-xs text-white">{activeCount}</span>}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {filtersOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-4 rounded-3xl border border-dashed border-line bg-linen p-5">{filtersPanel}</div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 mb-8 flex flex-wrap items-center gap-2 text-sm text-cocoa-3">
          {!loading && products && <span>{products.length ? `عنّا ${piecesLabel(products.length)}` : "ما في نتائج"}</span>}
          {q && (
            <button onClick={() => setSearchText("")} className="inline-flex items-center gap-1 rounded-full bg-cream-2 px-3 py-1 text-cocoa">
              «{q}» <X className="size-3.5" />
            </button>
          )}
        </div>

        {loading && !products ? (
          <YarnLoader />
        ) : products && products.length > 0 ? (
          <motion.div layout className={`grid grid-cols-2 gap-x-4 gap-y-10 transition-opacity md:gap-x-6 lg:grid-cols-4 ${loading ? "opacity-50" : ""}`}>
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={<YarnBall className="size-20" color="#e9c2bb" />}
            title="ما لقينا قطع بهالمواصفات"
            text="جرّبي كلمة تانية أو امسحي الفلاتر — أو اطلبي قطعة مخصوص إلك!"
          >
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <button onClick={() => { setSearchText(""); setParams({}, { replace: true }); }} className="btn btn-ghost">عرض كل القطع</button>
              <Link to="/custom" className="btn btn-primary">اطلبي قطعة خاصة</Link>
            </div>
          </EmptyState>
        )}
      </section>
    </>
  );
}
