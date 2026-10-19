import { ArrowDown, ArrowUp, Lock, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { useStatuses } from "../../components/admin/statuses";
import { AdminPageHeader, Card, DeleteButton, Field, Modal, StatusBadge, Toggle, useToast } from "../../components/admin/ui";
import { adminDeleteStatus, adminSaveStatus } from "../../lib/api";
import { useTitle } from "../../lib/hooks";
import type { StatusDef } from "../../types";

const swatches = ["#22c55e", "#16a34a", "#10b981", "#0ea5e9", "#6366f1", "#a855f7", "#ec4899", "#f97316", "#eab308", "#ef4444", "#9c8070", "#4a2a18"];

const sampleOrder = { name: "لين", number: "BN-1024", total: "145 ₪" };

export default function AdminStatuses() {
  useTitle("حالات الطلب");
  const toast = useToast();
  const { statuses, refresh } = useStatuses();
  const [edit, setEdit] = useState<(StatusDef & { isNew?: boolean }) | null>(null);

  const openNew = () =>
    setEdit({ key: "", label: "", color: "#0ea5e9", sort: statuses.length, active: true, isSystem: false, customerMessage: "مرحبا {name} 🤍\nمعك متجر بَنان بخصوص طلبك *{number}*\n", isNew: true });

  const save = async () => {
    if (!edit) return;
    if (!edit.label.trim()) return toast("اكتبي اسم الحالة", "err");
    const key = edit.isNew ? `s_${Date.now().toString(36)}` : edit.key;
    try {
      await adminSaveStatus({ ...edit, key, label: edit.label.trim() }, !!edit.isNew);
      toast("انحفظت الحالة");
      setEdit(null);
      refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
    }
  };

  const move = async (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= statuses.length) return;
    const list = [...statuses];
    [list[i], list[j]] = [list[j], list[i]];
    try {
      await Promise.all(list.map((s, k) => (s.sort !== k ? adminSaveStatus({ key: s.key, sort: k }, false) : null)));
      refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
    }
  };

  const preview = (t: string) => t.replaceAll("{name}", sampleOrder.name).replaceAll("{number}", sampleOrder.number).replaceAll("{total}", sampleOrder.total).replaceAll("{city}", "رام الله");

  return (
    <div>
      <AdminPageHeader
        title="حالات الطلب"
        text="غيّري الأسماء والألوان والترتيب، وأضيفي حالات جديدة. كل حالة إلها رسالة واتساب جاهزة للزبونة."
        action={<button onClick={openNew} className="btn btn-primary !py-2.5"><Plus className="size-4" /> حالة جديدة</button>}
      />

      <div className="space-y-2">
        {statuses.map((s, i) => (
          <Card key={s.key} className={`flex flex-wrap items-center gap-3 !p-3 ${s.active ? "" : "opacity-60"}`}>
            <span className="flex flex-col">
              <button onClick={() => move(i, -1)} disabled={i === 0} className="grid size-7 place-items-center rounded-full hover:bg-cream-2 disabled:opacity-30" aria-label="لفوق"><ArrowUp className="size-4" /></button>
              <button onClick={() => move(i, 1)} disabled={i === statuses.length - 1} className="grid size-7 place-items-center rounded-full hover:bg-cream-2 disabled:opacity-30" aria-label="لتحت"><ArrowDown className="size-4" /></button>
            </span>
            <div className="min-w-0 flex-1">
              <StatusBadge status={s.key} />
              <p className="mt-1 line-clamp-1 text-xs text-cocoa-3">{s.customerMessage.replace(/\n/g, " · ") || "بدون رسالة"}</p>
            </div>
            {s.isSystem && <span className="inline-flex items-center gap-1 rounded-full bg-cream-2 px-2.5 py-1 text-xs text-cocoa-3" title="مستعملة تلقائياً بالنظام"><Lock className="size-3" /> أساسية</span>}
            <Toggle
              checked={s.active}
              onChange={async (v) => {
                try {
                  await adminSaveStatus({ key: s.key, active: v }, false);
                  refresh();
                } catch (e) {
                  toast(e instanceof Error ? e.message : "خطأ", "err");
                }
              }}
            />
            <button onClick={() => setEdit({ ...s })} className="grid size-9 place-items-center rounded-full hover:bg-cream-2" aria-label="تعديل"><Pencil className="size-4" /></button>
            {!s.isSystem && (
              <DeleteButton
                small
                label=""
                onConfirm={async () => {
                  try {
                    await adminDeleteStatus(s.key);
                    toast("انحذفت الحالة");
                    refresh();
                  } catch (e) {
                    toast(e instanceof Error ? e.message : "خطأ", "err");
                  }
                }}
              />
            )}
          </Card>
        ))}
      </div>
      <p className="mt-4 text-xs leading-6 text-cocoa-3">
        الحالات «الأساسية» (جديد، الإستلام من البيت، ملغى) بيستعملها النظام تلقائياً: الطلب الجديد بياخد «جديد» أو «الإستلام من البيت»، و«ملغى» بترجّع الكمية للمخزون. بتقدري تغيّري اسمها ولونها ورسالتها، بس ما بتنحذف.
      </p>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.isNew ? "حالة جديدة" : "تعديل الحالة"}>
        {edit && (
          <div className="space-y-4">
            <Field label="اسم الحالة">
              <input value={edit.label} onChange={(e) => setEdit({ ...edit, label: e.target.value })} className="field" placeholder="مثلاً: بانتظار الدفع" />
            </Field>
            <Field label="اللون">
              <div className="flex flex-wrap items-center gap-2">
                {swatches.map((c) => (
                  <button key={c} type="button" onClick={() => setEdit({ ...edit, color: c })} className={`size-8 rounded-full transition ${edit.color === c ? "ring-2 ring-cocoa ring-offset-2 ring-offset-cream" : ""}`} style={{ background: c }} aria-label={c} />
                ))}
                <input type="color" value={edit.color} onChange={(e) => setEdit({ ...edit, color: e.target.value })} className="size-9 cursor-pointer rounded-full border border-line" aria-label="لون مخصص" />
              </div>
            </Field>
            <Field label="رسالة واتساب للزبونة" hint="بتقدري تستعملي: {name} الاسم · {number} رقم الطلب · {total} الإجمالي · {city} المدينة">
              <textarea rows={4} value={edit.customerMessage} onChange={(e) => setEdit({ ...edit, customerMessage: e.target.value })} className="field resize-y" />
            </Field>
            {edit.customerMessage.trim() && (
              <div className="rounded-2xl bg-[#dcf8c6] p-3 text-sm leading-6 whitespace-pre-line text-[#111]">{preview(edit.customerMessage)}</div>
            )}
            <Toggle checked={edit.active} onChange={(v) => setEdit({ ...edit, active: v })} label="ظاهرة بقائمة الحالات" />
            <button onClick={save} className="btn btn-primary w-full">حفظ</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
