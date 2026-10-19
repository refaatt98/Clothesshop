import { ArrowDown, ArrowUp, Plus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminPageHeader, Card, DeleteButton, Toggle, useToast } from "../../components/admin/ui";
import { adminDeleteFaq, adminListFaqs, adminSaveFaq } from "../../lib/api";
import { useAsync, useTitle } from "../../lib/hooks";
import type { Faq } from "../../types";

type Row = Partial<Faq> & { dirty?: boolean };

export default function AdminFaqs() {
  useTitle("الأسئلة الشائعة");
  const toast = useToast();
  const [tick, setTick] = useState(0);
  const { data } = useAsync(adminListFaqs, [tick]);
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    if (data) setRows(data);
  }, [data]);
  const refresh = () => setTick((t) => t + 1);
  const upd = (i: number, p: Partial<Faq>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...p, dirty: true } : x)));

  const save = async (r: Row, i: number) => {
    if (!r.question?.trim() || !r.answer?.trim()) return toast("اكتبي السؤال والجواب", "err");
    try {
      await adminSaveFaq({ ...r, sort: r.sort ?? i });
      toast("انحفظ");
      refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
    }
  };

  const move = async (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= rows.length || !rows[i].id || !rows[j].id) return;
    await Promise.all(rows.map((r, k) => r.id && adminSaveFaq({ id: r.id, sort: k === i ? j : k === j ? i : k })));
    refresh();
  };

  return (
    <div>
      <AdminPageHeader
        title="الأسئلة الشائعة"
        text="بتظهر بصفحة «تواصلي معنا»"
        action={<button onClick={() => setRows((r) => [...r, { question: "", answer: "", active: true, sort: r.length, dirty: true }])} className="btn btn-primary !py-2.5"><Plus className="size-4" /> سؤال جديد</button>}
      />
      <div className="space-y-3">
        {rows.map((r, i) => (
          <Card key={r.id ?? `n${i}`} className={`!p-4 ${r.active ? "" : "opacity-60"}`}>
            <input value={r.question} onChange={(e) => upd(i, { question: e.target.value })} className="field font-semibold" placeholder="السؤال" />
            <textarea rows={3} value={r.answer} onChange={(e) => upd(i, { answer: e.target.value })} className="field mt-2 resize-y" placeholder="الجواب" />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1">
                <Toggle checked={!!r.active} onChange={(v) => upd(i, { active: v })} label="ظاهر" />
                <button onClick={() => move(i, -1)} className="ms-3 grid size-8 place-items-center rounded-full hover:bg-cream-2" aria-label="لفوق"><ArrowUp className="size-4" /></button>
                <button onClick={() => move(i, 1)} className="grid size-8 place-items-center rounded-full hover:bg-cream-2" aria-label="لتحت"><ArrowDown className="size-4" /></button>
              </span>
              <span className="flex items-center gap-2">
                {r.id ? <DeleteButton small onConfirm={async () => { await adminDeleteFaq(r.id!); toast("انحذف"); refresh(); }} /> : <button onClick={() => setRows((x) => x.filter((_, j) => j !== i))} className="text-sm text-cocoa-3">إلغاء</button>}
                <button onClick={() => save(r, i)} disabled={!r.dirty} className="btn btn-primary !px-4 !py-2"><Save className="size-4" /> حفظ</button>
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
