import { Plus, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ProductMedia } from "../../components/ProductMedia";
import { AdminPageHeader, Card, Toggle, useToast } from "../../components/admin/ui";
import { adminListCategories, adminListProducts, adminSaveProduct } from "../../lib/api";
import { formatPrice } from "../../lib/format";
import { useAsync, useTitle } from "../../lib/hooks";
import type { Product } from "../../types";

export default function AdminProducts() {
  useTitle("المنتجات");
  const toast = useToast();
  const [tick, setTick] = useState(0);
  const { data } = useAsync(adminListProducts, [tick]);
  const { data: cats } = useAsync(adminListCategories, []);
  const [list, setList] = useState<Product[] | null>(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const products = list ?? data;

  const filtered = useMemo(
    () =>
      (products ?? []).filter(
        (p) => (!cat || p.categoryId === cat) && (!q.trim() || p.name.includes(q.trim()) || p.slug.includes(q.trim().toLowerCase())),
      ),
    [products, q, cat],
  );

  const patch = async (p: Product, change: Partial<Product>) => {
    setList((products ?? []).map((x) => (x.id === p.id ? { ...x, ...change } : x)));
    try {
      await adminSaveProduct({ id: p.id, ...change });
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
      setList(null);
      setTick((t) => t + 1);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="المنتجات"
        text={products ? `${products.length} منتج` : undefined}
        action={<Link to="/admin/products/new" className="btn btn-primary !py-2.5"><Plus className="size-4" /> منتج جديد</Link>}
      />
      <div className="mb-5 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-cocoa-3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحثي عن منتج" className="field !rounded-full !pr-12" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="field !w-auto !rounded-full">
          <option value="">كل الأقسام</option>
          {cats?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <Card key={p.id} className={`!p-3 ${p.active ? "" : "opacity-60"}`}>
            <div className="flex gap-3">
              <Link to={`/admin/products/${p.id}`} className="size-24 shrink-0 overflow-hidden rounded-2xl">
                <ProductMedia image={p.images[0]} art={p.art} color={p.colors[0]?.hex ?? "#efe2cf"} className="size-full" alt={p.name} />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/admin/products/${p.id}`} className="block truncate font-semibold hover:text-rose">{p.name}</Link>
                <p className="text-sm text-cocoa-3">{cats?.find((c) => c.id === p.categoryId)?.name ?? "بدون قسم"}</p>
                <p className="mt-1 font-bold tabular-nums">{formatPrice(p.price)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <label className="flex items-center gap-1 text-xs">
                    كمية
                    <input
                      type="number"
                      min={0}
                      defaultValue={p.stock ?? ""}
                      placeholder="∞"
                      title="فاضي = بدون حد"
                      onBlur={(e) => {
                        const v = e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0);
                        if (v !== p.stock) void patch(p, { stock: v });
                      }}
                      className={`w-16 rounded-lg border px-2 py-1 text-center text-sm ${p.stock !== null && p.stock <= 2 ? "border-rose bg-rose-soft" : "border-line bg-cream"}`}
                    />
                  </label>
                  <button onClick={() => patch(p, { featured: !p.featured })} title="مختار للرئيسية" aria-label="مختار للرئيسية" aria-pressed={p.featured}>
                    <Star className={`size-5 ${p.featured ? "fill-gold text-gold" : "text-sand"}`} />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-dashed border-line pt-3">
              <Toggle checked={p.active} onChange={(v) => patch(p, { active: v })} label={p.active ? "ظاهر بالمتجر" : "مخفي"} />
              <Link to={`/admin/products/${p.id}`} className="text-sm font-semibold text-rose">تعديل</Link>
            </div>
          </Card>
        ))}
      </div>
      {products && filtered.length === 0 && <Card className="py-12 text-center text-cocoa-3">ما في منتجات</Card>}
    </div>
  );
}
