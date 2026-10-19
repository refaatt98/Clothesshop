import { useState } from "react";
import { WhatsappIcon } from "../../components/Icons";
import { AdminPageHeader, Card, DeleteButton, fmtDate, useToast } from "../../components/admin/ui";
import { adminDeleteCustomRequest, adminListCustomRequests, adminUpdateCustomRequest, customerWhatsapp, whatsappLink } from "../../lib/api";
import { useAsync, useTitle } from "../../lib/hooks";
import type { CustomRequest } from "../../types";

const statuses: { id: CustomRequest["status"]; label: string; cls: string }[] = [
  { id: "new", label: "جديد", cls: "bg-rose text-white" },
  { id: "in_progress", label: "قيد العمل", cls: "bg-gold text-white" },
  { id: "done", label: "تم", cls: "bg-sage text-white" },
  { id: "cancelled", label: "ملغى", cls: "bg-sand" },
];

export default function AdminCustomRequests() {
  useTitle("الطلبات الخاصة");
  const toast = useToast();
  const [tick, setTick] = useState(0);
  const { data } = useAsync(adminListCustomRequests, [tick]);

  return (
    <div>
      <AdminPageHeader title="الطلبات الخاصة" text="طلبات «اطلبي قطعتك» من الموقع" />
      <div className="grid gap-3 md:grid-cols-2">
        {data?.map((r) => (
          <Card key={r.id} className="!p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{r.name} · <span className="tabular-nums" dir="ltr">{r.phone}</span></p>
                <p className="text-xs text-cocoa-3">{r.ref} · {fmtDate(r.createdAt)}</p>
              </div>
              <a href={whatsappLink(customerWhatsapp(r.phone), `مرحبا ${r.name.split(" ")[0]} 🤍 معك متجر بَنان بخصوص طلبك الخاص (${r.ref}) — ${r.pieceType}`)} target="_blank" rel="noreferrer" className="grid size-9 shrink-0 place-items-center rounded-full bg-sage-soft hover:bg-sage hover:text-white" aria-label="واتساب">
                <WhatsappIcon className="size-4" />
              </a>
            </div>
            <p className="mt-3"><b>{r.pieceType}</b> {r.budget && <span className="text-sm text-cocoa-3">· {r.budget}</span>}</p>
            {r.colors.length > 0 && <p className="text-sm text-cocoa-2">الألوان: {r.colors.join("، ")}</p>}
            {r.deadline && <p className="text-sm text-cocoa-2">قبل: {r.deadline}</p>}
            <p className="mt-2 rounded-xl bg-cream-2 p-3 text-sm leading-7">{r.details}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {statuses.map((s) => (
                <button key={s.id} onClick={async () => { await adminUpdateCustomRequest(r.id, s.id); setTick((t) => t + 1); }} className={`rounded-full px-3 py-1 text-xs font-semibold ${r.status === s.id ? s.cls : "bg-linen ring-1 ring-line"}`}>{s.label}</button>
              ))}
              <span className="ms-auto"><DeleteButton small label="" onConfirm={async () => { await adminDeleteCustomRequest(r.id); toast("انحذف"); setTick((t) => t + 1); }} /></span>
            </div>
          </Card>
        ))}
      </div>
      {data && data.length === 0 && <Card className="py-12 text-center text-cocoa-3">ما في طلبات خاصة لسا</Card>}
    </div>
  );
}
