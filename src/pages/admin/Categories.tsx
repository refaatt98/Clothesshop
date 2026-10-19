import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { ProductArt } from "../../components/ProductArt";
import { AdminPageHeader, Card, DeleteButton, Field, MediaUploader, Modal, Toggle, slugify, useToast } from "../../components/admin/ui";
import { adminDeleteCategory, adminListCategories, adminSaveCategory } from "../../lib/api";
import { useAsync, useTitle } from "../../lib/hooks";
import { ART_KINDS, type Category } from "../../types";

const blank: Partial<Category> = { name: "", slug: "", description: "", imageUrl: null, art: "bag", tint: "#f3e1dc", sort: 0, active: true };

export default function AdminCategories() {
  useTitle("الأقسام");
  const toast = useToast();
  const [tick, setTick] = useState(0);
  const { data } = useAsync(adminListCategories, [tick]);
  const [edit, setEdit] = useState<Partial<Category> | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!edit?.name?.trim()) return toast("اكتبي اسم القسم", "err");
    setSaving(true);
    try {
      await adminSaveCategory({ ...edit, slug: edit.slug?.trim() ? slugify(edit.slug) : slugify(edit.name) });
      toast("انحفظ القسم");
      setEdit(null);
      setTick((t) => t + 1);
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader title="الأقسام" text="الأقسام بتظهر بالرئيسية والمتجر" action={<button onClick={() => setEdit({ ...blank, sort: data?.length ?? 0 })} className="btn btn-primary !py-2.5"><Plus className="size-4" /> قسم جديد</button>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data?.map((c) => (
          <Card key={c.id} className={`flex items-center gap-4 !p-4 ${c.active ? "" : "opacity-60"}`}>
            <div className="size-20 shrink-0 overflow-hidden rounded-2xl" style={{ background: c.tint }}>
              {c.imageUrl ? <img src={c.imageUrl} alt="" className="size-full object-cover" /> : <ProductArt kind={c.art} color="#c98f86" bg={c.tint} className="size-full" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{c.name}</p>
              <p className="truncate text-sm text-cocoa-3">{c.description}</p>
              <p className="text-xs text-cocoa-3" dir="ltr" style={{ textAlign: "right" }}>/shop?category={c.slug}</p>
            </div>
            <button onClick={() => setEdit(c)} className="grid size-10 place-items-center rounded-full hover:bg-cream-2" aria-label="تعديل"><Pencil className="size-4" /></button>
          </Card>
        ))}
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "تعديل القسم" : "قسم جديد"}>
        {edit && (
          <div className="space-y-4">
            <Field label="الاسم"><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className="field" /></Field>
            <Field label="الرابط بالإنجليزي (اختياري)"><input value={edit.slug} dir="ltr" onChange={(e) => setEdit({ ...edit, slug: e.target.value })} className="field text-right" placeholder="bags" /></Field>
            <Field label="وصف قصير"><input value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} className="field" /></Field>
            <Field label="صورة القسم (اختياري)">
              <MediaUploader value={edit.imageUrl ? [edit.imageUrl] : []} onChange={(v) => setEdit({ ...edit, imageUrl: v[0] ?? null })} folder="categories" multiple={false} label="صورة" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="لون الخلفية"><input type="color" value={edit.tint} onChange={(e) => setEdit({ ...edit, tint: e.target.value })} className="h-11 w-full cursor-pointer rounded-xl border border-line" /></Field>
              <Field label="الترتيب"><input type="number" value={edit.sort} onChange={(e) => setEdit({ ...edit, sort: Number(e.target.value) })} className="field" /></Field>
            </div>
            <Field label="الرسمة (إذا ما في صورة)">
              <select value={edit.art} onChange={(e) => setEdit({ ...edit, art: e.target.value as Category["art"] })} className="field">
                {ART_KINDS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </Field>
            <Toggle checked={!!edit.active} onChange={(v) => setEdit({ ...edit, active: v })} label="ظاهر بالمتجر" />
            <div className="flex items-center justify-between pt-2">
              {edit.id ? (
                <DeleteButton onConfirm={async () => {
                  try { await adminDeleteCategory(edit.id!); toast("انحذف القسم"); setEdit(null); setTick((t) => t + 1); } catch (e) { toast(e instanceof Error ? e.message : "خطأ", "err"); }
                }} />
              ) : <span />}
              <button onClick={save} disabled={saving} className="btn btn-primary">{saving ? "عم نحفظ..." : "حفظ"}</button>
            </div>
            {edit.id && <p className="text-xs text-cocoa-3">حذف القسم ما بيحذف منتجاته — بيصيروا بدون قسم.</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
