import { Copy, Plus } from "lucide-react";
import { useState } from "react";
import { AdminPageHeader, Card, DeleteButton, Field, Modal, Toggle, fmtDate, useToast } from "../../components/admin/ui";
import { adminDeletePromo, adminListPromos, adminSavePromo } from "../../lib/api";
import { formatPrice } from "../../lib/format";
import { useAsync, useTitle } from "../../lib/hooks";
import type { PromoCode } from "../../types";

const blank: Partial<PromoCode> = { code: "", type: "percent", value: 10, minOrder: 0, maxUses: null, expiresAt: null, active: true, note: "" };

const describe = (p: Partial<PromoCode>) =>
  p.type === "percent" ? `خصم ${p.value}%` : p.type === "fixed" ? `خصم ${formatPrice(p.value ?? 0)}` : "توصيل مجاني";

export default function AdminPromos() {
  useTitle("أكواد الخصم");
  const toast = useToast();
  const [tick, setTick] = useState(0);
  const { data } = useAsync(adminListPromos, [tick]);
  const [edit, setEdit] = useState<Partial<PromoCode> | null>(null);

  const save = async () => {
    if (!edit?.code?.trim() || !/^[A-Z0-9_-]{3,30}$/i.test(edit.code.trim())) return toast("الكود لازم يكون أحرف إنجليزية وأرقام (3 أحرف على الأقل)", "err");
    try {
      await adminSavePromo({ ...edit, value: Number(edit.value) || 0, minOrder: Number(edit.minOrder) || 0, maxUses: edit.maxUses ? Number(edit.maxUses) : null });
      toast("انحفظ الكود");
      setEdit(null);
      setTick((t) => t + 1);
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
    }
  };

  const random = () => "BANAN" + Math.random().toString(36).slice(2, 6).toUpperCase();

  return (
    <div>
      <AdminPageHeader title="أكواد الخصم" action={<button onClick={() => setEdit({ ...blank, code: random() })} className="btn btn-primary !py-2.5"><Plus className="size-4" /> كود جديد</button>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data?.map((p) => {
          const expired = p.expiresAt && new Date(p.expiresAt) < new Date();
          const used = p.maxUses != null && p.usedCount >= p.maxUses;
          return (
            <Card key={p.id} className={`!p-4 ${p.active && !expired && !used ? "" : "opacity-60"}`}>
              <div className="flex items-start justify-between gap-2">
                <button onClick={() => { void navigator.clipboard.writeText(p.code); toast("انتسخ الكود"); }} className="flex items-center gap-2 rounded-xl border-2 border-dashed border-rose px-3 py-1.5 font-bold tracking-wider" dir="ltr">
                  {p.code} <Copy className="size-3.5" />
                </button>
                <Toggle checked={p.active} onChange={async (v) => { await adminSavePromo({ id: p.id, active: v }); setTick((t) => t + 1); }} />
              </div>
              <p className="mt-3 text-lg font-semibold">{describe(p)}</p>
              <ul className="mt-1 space-y-0.5 text-sm text-cocoa-3">
                {p.minOrder > 0 && <li>للطلبات فوق {formatPrice(p.minOrder)}</li>}
                <li>استُخدم {p.usedCount}{p.maxUses != null ? ` من ${p.maxUses}` : ""} مرة</li>
                {p.expiresAt && <li>{expired ? "انتهى" : "بينتهي"} {fmtDate(p.expiresAt, false)}</li>}
                {p.note && <li>📝 {p.note}</li>}
              </ul>
              <div className="mt-3 flex justify-between border-t border-dashed border-line pt-3">
                <DeleteButton small onConfirm={async () => { await adminDeletePromo(p.id); toast("انحذف الكود"); setTick((t) => t + 1); }} />
                <button onClick={() => setEdit(p)} className="text-sm font-semibold text-rose">تعديل</button>
              </div>
            </Card>
          );
        })}
      </div>
      {data && data.length === 0 && <Card className="py-12 text-center text-cocoa-3">ما في أكواد لسا</Card>}

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "تعديل الكود" : "كود جديد"}>
        {edit && (
          <div className="space-y-4">
            <Field label="الكود"><input value={edit.code} dir="ltr" onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase().replace(/\s/g, "") })} className="field text-center text-lg font-bold tracking-widest" /></Field>
            <Field label="نوع الخصم">
              <div className="grid grid-cols-3 gap-2">
                {([["percent", "نسبة %"], ["fixed", "مبلغ ₪"], ["free_delivery", "توصيل مجاني"]] as const).map(([t, l]) => (
                  <button key={t} type="button" onClick={() => setEdit({ ...edit, type: t })} className={`rounded-xl border-2 py-2.5 text-sm font-semibold ${edit.type === t ? "border-cocoa bg-linen" : "border-line"}`}>{l}</button>
                ))}
              </div>
            </Field>
            {edit.type !== "free_delivery" && (
              <Field label={edit.type === "percent" ? "النسبة %" : "المبلغ ₪"}><input type="number" min={0} max={edit.type === "percent" ? 100 : undefined} value={edit.value} onChange={(e) => setEdit({ ...edit, value: Number(e.target.value) })} className="field" /></Field>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="أقل مبلغ للطلب ₪"><input type="number" min={0} value={edit.minOrder} onChange={(e) => setEdit({ ...edit, minOrder: Number(e.target.value) })} className="field" /></Field>
              <Field label="أقصى عدد استخدام"><input type="number" min={1} value={edit.maxUses ?? ""} onChange={(e) => setEdit({ ...edit, maxUses: e.target.value ? Number(e.target.value) : null })} className="field" placeholder="بلا حد" /></Field>
            </div>
            <Field label="تاريخ الانتهاء (اختياري)">
              <input type="date" value={edit.expiresAt ? edit.expiresAt.slice(0, 10) : ""} onChange={(e) => setEdit({ ...edit, expiresAt: e.target.value ? new Date(`${e.target.value}T23:59:59`).toISOString() : null })} className="field" />
            </Field>
            <Field label="ملاحظة لإلك"><input value={edit.note ?? ""} onChange={(e) => setEdit({ ...edit, note: e.target.value })} className="field" placeholder="مثلاً: لمتابعين إنستغرام" /></Field>
            <Toggle checked={!!edit.active} onChange={(v) => setEdit({ ...edit, active: v })} label="مفعّل" />
            <button onClick={save} className="btn btn-primary w-full">حفظ</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
