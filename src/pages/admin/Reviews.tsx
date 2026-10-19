import { Plus, Star } from "lucide-react";
import { useState } from "react";
import { AdminPageHeader, Card, DeleteButton, Field, MediaUploader, Modal, Toggle, fmtDate, useToast } from "../../components/admin/ui";
import { adminDeleteReview, adminListProducts, adminListReviews, adminSaveReview } from "../../lib/api";
import { useAsync, useTitle } from "../../lib/hooks";
import type { Review } from "../../types";

const blank: Partial<Review> = { name: "", city: "", text: "", rating: 5, productId: null, imageUrl: null, approved: true, showOnHome: true };

export default function AdminReviews() {
  useTitle("الآراء");
  const toast = useToast();
  const [tick, setTick] = useState(0);
  const { data } = useAsync(adminListReviews, [tick]);
  const { data: products } = useAsync(adminListProducts, []);
  const [filter, setFilter] = useState<"all" | "pending">("all");
  const [edit, setEdit] = useState<Partial<Review> | null>(null);
  const refresh = () => setTick((t) => t + 1);
  const list = (data ?? []).filter((r) => filter === "all" || !r.approved);
  const pending = data?.filter((r) => !r.approved).length ?? 0;

  const quick = async (r: Review, patch: Partial<Review>) => {
    try {
      await adminSaveReview({ id: r.id, ...patch });
      refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
    }
  };

  const save = async () => {
    if (!edit?.name?.trim()) return toast("اكتبي الاسم", "err");
    if (!edit.text?.trim() && !edit.imageUrl) return toast("اكتبي الرأي أو ارفعي صورة (سكرين شوت)", "err");
    try {
      await adminSaveReview({ ...edit, text: edit.text ?? "", city: edit.city || null });
      toast("انحفظ الرأي");
      setEdit(null);
      refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="آراء الزبائن"
        text="الآراء الموافق عليها بتظهر بشريط متحرك بصفحة المنتج، واللي عليها «بالرئيسية» بتظهر كمان بالرئيسية."
        action={<button onClick={() => setEdit({ ...blank })} className="btn btn-primary !py-2.5"><Plus className="size-4" /> أضيفي رأي</button>}
      />
      <div className="mb-5 flex gap-2">
        <button onClick={() => setFilter("all")} className={`rounded-full px-4 py-2 text-sm ${filter === "all" ? "bg-cocoa text-cream" : "bg-linen"}`}>الكل</button>
        <button onClick={() => setFilter("pending")} className={`rounded-full px-4 py-2 text-sm ${filter === "pending" ? "bg-cocoa text-cream" : "bg-linen"}`}>بستنى موافقة {pending > 0 && `(${pending})`}</button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((r) => (
          <Card key={r.id} className={`!p-4 ${r.approved ? "" : "border-rose bg-rose-soft/30"}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{r.name} {r.city && <span className="font-normal text-cocoa-3">· {r.city}</span>}</p>
                <p className="text-xs text-cocoa-3">{fmtDate(r.createdAt)}{r.productName ? ` · ${r.productName}` : ""}</p>
              </div>
              <span className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`size-3.5 ${i < r.rating ? "fill-gold text-gold" : "text-sand"}`} />)}</span>
            </div>
            {r.imageUrl && <img src={r.imageUrl} alt="" className="mt-3 max-h-48 w-full rounded-xl object-cover object-top" />}
            {r.text && <p className="mt-2 text-sm leading-7">{r.text}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-dashed border-line pt-3">
              <Toggle checked={r.approved} onChange={(v) => quick(r, { approved: v })} label={r.approved ? "ظاهر" : "مخفي"} />
              <Toggle checked={r.showOnHome} onChange={(v) => quick(r, { showOnHome: v, approved: v ? true : r.approved })} label="بالرئيسية" />
              <span className="ms-auto flex items-center gap-1">
                <button onClick={() => setEdit(r)} className="text-sm font-semibold text-rose">تعديل</button>
                <DeleteButton small label="" onConfirm={async () => { await adminDeleteReview(r.id); toast("انحذف"); refresh(); }} />
              </span>
            </div>
          </Card>
        ))}
      </div>
      {data && list.length === 0 && <Card className="py-12 text-center text-cocoa-3">ما في آراء هون</Card>}

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "تعديل الرأي" : "رأي جديد"}>
        {edit && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="الاسم"><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className="field" /></Field>
              <Field label="المدينة"><input value={edit.city ?? ""} onChange={(e) => setEdit({ ...edit, city: e.target.value })} className="field" /></Field>
            </div>
            <Field label="الرأي"><textarea rows={3} value={edit.text} onChange={(e) => setEdit({ ...edit, text: e.target.value })} className="field resize-none" /></Field>
            <Field label="صورة / سكرين شوت من واتساب (اختياري)">
              <MediaUploader value={edit.imageUrl ? [edit.imageUrl] : []} onChange={(v) => setEdit({ ...edit, imageUrl: v[0] ?? null })} folder="reviews" multiple={false} label="صورة" />
            </Field>
            <Field label="التقييم">
              <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" onClick={() => setEdit({ ...edit, rating: n })} aria-label={`${n}`}><Star className={`size-7 ${n <= (edit.rating ?? 5) ? "fill-gold text-gold" : "text-sand"}`} /></button>)}</div>
            </Field>
            <Field label="المنتج (اختياري)">
              <select value={edit.productId ?? ""} onChange={(e) => setEdit({ ...edit, productId: e.target.value || null })} className="field">
                <option value="">رأي عام عن المتجر</option>
                {products?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <div className="flex flex-wrap gap-5">
              <Toggle checked={!!edit.approved} onChange={(v) => setEdit({ ...edit, approved: v })} label="ظاهر" />
              <Toggle checked={!!edit.showOnHome} onChange={(v) => setEdit({ ...edit, showOnHome: v })} label="بالرئيسية" />
            </div>
            <button onClick={save} className="btn btn-primary w-full">حفظ</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
