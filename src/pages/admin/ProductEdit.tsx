import { ArrowRight, ExternalLink, LoaderCircle, Plus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ProductArt } from "../../components/ProductArt";
import { AdminPageHeader, Card, DeleteButton, Field, MediaUploader, TagsInput, Toggle, slugify, useToast } from "../../components/admin/ui";
import { adminDeleteProduct, adminGetProduct, adminListCategories, adminSaveProduct } from "../../lib/api";
import { useAsync, useTitle } from "../../lib/hooks";
import { ART_KINDS, BADGES, type Product } from "../../types";

const empty: Partial<Product> = {
  name: "",
  slug: "",
  categoryId: null,
  price: 0,
  compareAtPrice: null,
  shortDescription: "",
  description: "",
  materials: [],
  care: "",
  makingTime: "جاهزة للشحن خلال يومين",
  art: "bag",
  images: [],
  colors: [{ name: "كريمي", hex: "#efe2cf" }],
  sizes: [],
  personalizable: false,
  stock: 1,
  badge: null,
  featured: false,
  active: true,
  sort: 0,
};

export default function AdminProductEdit() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const toast = useToast();
  const { data: cats } = useAsync(adminListCategories, []);
  const [p, setP] = useState<Partial<Product> | null>(isNew ? empty : null);
  const [saving, setSaving] = useState(false);
  useTitle(isNew ? "منتج جديد" : p?.name ?? "تعديل منتج");

  useEffect(() => {
    if (isNew) {
      setP(empty);
      return;
    }
    adminGetProduct(id!).then((x) => (x ? setP(x) : navigate("/admin/products", { replace: true })));
  }, [id, isNew, navigate]);

  if (!p) return <div className="grid min-h-[40vh] place-items-center"><LoaderCircle className="size-8 animate-spin text-rose" /></div>;

  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((x) => ({ ...x!, [k]: v }));

  const save = async () => {
    if (!p.name?.trim()) return toast("اكتبي اسم المنتج", "err");
    if (!(Number(p.price) >= 0)) return toast("السعر غلط", "err");
    if (!p.colors?.length) return toast("ضيفي لون واحد على الأقل", "err");
    setSaving(true);
    try {
      const saved = await adminSaveProduct({
        ...p,
        price: Number(p.price),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        stock: Math.max(0, Number(p.stock) || 0),
        sort: Number(p.sort) || 0,
        slug: p.slug?.trim() ? slugify(p.slug) : slugify(p.name ?? ""),
      });
      toast("انحفظ المنتج ✨");
      if (isNew) navigate(`/admin/products/${saved.id}`, { replace: true });
      else setP(saved);
    } catch (e) {
      toast(e instanceof Error ? e.message : "ما انحفظ", "err");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-24">
      <Link to="/admin/products" className="mb-3 inline-flex items-center gap-1 text-sm text-cocoa-3 hover:text-cocoa">
        <ArrowRight className="size-4" /> كل المنتجات
      </Link>
      <AdminPageHeader
        title={isNew ? "منتج جديد" : p.name || "تعديل"}
        action={
          !isNew && p.slug ? (
            <a href={`/product/${p.slug}`} target="_blank" rel="noreferrer" className="btn btn-ghost !py-2"><ExternalLink className="size-4" /> عرض بالمتجر</a>
          ) : undefined
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <Card className="space-y-4">
            <Field label="اسم المنتج">
              <input
                value={p.name}
                onChange={(e) => set("name", e.target.value)}
                className="field"
              />
            </Field>
            <Field label="الرابط بالإنجليزي (اختياري)" hint={`رابط المنتج: /product/${p.slug || "بينعمل تلقائي"}`}>
              <input
                value={p.slug}
                dir="ltr"
                onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                placeholder="jasmine-bag"
                className="field text-right"
              />
            </Field>
            <Field label="وصف قصير (بيظهر بالكرت)">
              <input value={p.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className="field" />
            </Field>
            <Field label="الوصف الكامل">
              <textarea rows={4} value={p.description} onChange={(e) => set("description", e.target.value)} className="field resize-y" />
            </Field>
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold">الصور</h2>
            <MediaUploader value={p.images ?? []} onChange={(v) => set("images", v)} folder="products" />
            <p className="mt-2 text-xs text-cocoa-3">أول صورة هي الرئيسية. إذا ما في صور، بتظهر رسمة القطعة.</p>
          </Card>

          <Card className="space-y-4">
            <h2 className="font-semibold">الألوان والمقاسات</h2>
            <div className="space-y-2">
              {(p.colors ?? []).map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="color" value={c.hex} onChange={(e) => set("colors", p.colors!.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))} className="size-11 shrink-0 cursor-pointer rounded-xl border border-line" aria-label="اللون" />
                  <input value={c.name} onChange={(e) => set("colors", p.colors!.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className="field" placeholder="اسم اللون" />
                  <button type="button" onClick={() => set("colors", p.colors!.filter((_, j) => j !== i))} className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-rose-soft" aria-label="حذف اللون"><X className="size-4" /></button>
                </div>
              ))}
              <button type="button" onClick={() => set("colors", [...(p.colors ?? []), { name: "", hex: "#c98f86" }])} className="btn btn-ghost !py-2"><Plus className="size-4" /> لون</button>
            </div>
            <Field label="المقاسات / الأحجام (اختياري)" hint="اكتبي واضغطي Enter">
              <TagsInput value={p.sizes ?? []} onChange={(v) => set("sizes", v)} placeholder="صغير، وسط..." />
            </Field>
            <Toggle checked={!!p.personalizable} onChange={(v) => set("personalizable", v)} label="الزبونة بتقدر تكتب تخصيص (اسم، حرف...)" />
          </Card>

          <Card className="space-y-4">
            <h2 className="font-semibold">تفاصيل إضافية</h2>
            <Field label="المواد" hint="اكتبي واضغطي Enter">
              <TagsInput value={p.materials ?? []} onChange={(v) => set("materials", v)} placeholder="خيط قطن..." />
            </Field>
            <Field label="العناية بالقطعة">
              <input value={p.care} onChange={(e) => set("care", e.target.value)} className="field" />
            </Field>
            <Field label="مدة التجهيز">
              <input value={p.makingTime} onChange={(e) => set("makingTime", e.target.value)} className="field" />
            </Field>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="space-y-4">
            <Toggle checked={!!p.active} onChange={(v) => set("active", v)} label={p.active ? "ظاهر بالمتجر" : "مخفي عن المتجر"} />
            <Toggle checked={!!p.featured} onChange={(v) => set("featured", v)} label="مختار للصفحة الرئيسية" />
          </Card>
          <Card className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="السعر ₪">
                <input type="number" min={0} step="0.5" value={p.price ?? 0} onChange={(e) => set("price", Number(e.target.value))} className="field" />
              </Field>
              <Field label="السعر قبل الخصم">
                <input type="number" min={0} step="0.5" value={p.compareAtPrice ?? ""} onChange={(e) => set("compareAtPrice", e.target.value ? Number(e.target.value) : null)} className="field" placeholder="اختياري" />
              </Field>
              <Field label="الكمية بالمخزون">
                <input type="number" min={0} value={p.stock ?? 0} onChange={(e) => set("stock", Number(e.target.value))} className="field" />
              </Field>
              <Field label="الترتيب">
                <input type="number" value={p.sort ?? 0} onChange={(e) => set("sort", Number(e.target.value))} className="field" />
              </Field>
            </div>
          </Card>
          <Card className="space-y-4">
            <Field label="القسم">
              <select value={p.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value || null)} className="field">
                <option value="">بدون قسم</option>
                {cats?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="شارة">
              <select value={p.badge ?? ""} onChange={(e) => set("badge", (e.target.value || null) as Product["badge"])} className="field">
                <option value="">بدون</option>
                {BADGES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="الرسمة (إذا ما في صور)">
              <div className="grid grid-cols-4 gap-2">
                {ART_KINDS.map((a) => (
                  <button key={a.id} type="button" onClick={() => set("art", a.id)} title={a.label} aria-pressed={p.art === a.id} className={`overflow-hidden rounded-xl border-2 ${p.art === a.id ? "border-cocoa" : "border-transparent"}`}>
                    <ProductArt kind={a.id} color={p.colors?.[0]?.hex ?? "#c98f86"} className="aspect-square w-full" />
                  </button>
                ))}
              </div>
            </Field>
          </Card>
          {!isNew && (
            <div className="text-center">
              <DeleteButton
                label="حذف المنتج"
                onConfirm={async () => {
                  try {
                    await adminDeleteProduct(p.id!);
                    toast("انحذف المنتج");
                    navigate("/admin/products", { replace: true });
                  } catch (e) {
                    toast(e instanceof Error ? e.message : "خطأ", "err");
                  }
                }}
              />
              <p className="mt-1 text-xs text-cocoa-3">أو خبّيه بدل ما تحذفيه، لتضل الطلبات القديمة مربوطة فيه.</p>
            </div>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur lg:right-[260px]">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-3">
          <Link to="/admin/products" className="btn btn-ghost !py-2.5">إلغاء</Link>
          <button onClick={save} disabled={saving} className="btn btn-primary !py-2.5">
            {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />} حفظ
          </button>
        </div>
      </div>
    </div>
  );
}
