import { useState } from "react";
import { WhatsappIcon } from "../../components/Icons";
import { AdminPageHeader, Card, DeleteButton, Toggle, fmtDate, useToast } from "../../components/admin/ui";
import { adminDeleteMessage, adminListMessages, adminMarkMessage, customerWhatsapp } from "../../lib/api";
import { useAsync, useTitle } from "../../lib/hooks";

export default function AdminMessages() {
  useTitle("الرسائل");
  const toast = useToast();
  const [tick, setTick] = useState(0);
  const { data } = useAsync(adminListMessages, [tick]);
  return (
    <div>
      <AdminPageHeader title="الرسائل" text="رسائل صفحة «تواصلي معنا»" />
      <div className="space-y-3">
        {data?.map((m) => (
          <Card key={m.id} className={`!p-4 ${m.read ? "opacity-70" : "border-rose"}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold">{m.name} {m.phone && <span className="font-normal text-cocoa-3" dir="ltr">· {m.phone}</span>}</p>
              <span className="text-xs text-cocoa-3">{fmtDate(m.createdAt)}</span>
            </div>
            <p className="mt-2 whitespace-pre-line leading-7">{m.message}</p>
            <div className="mt-3 flex items-center gap-3 border-t border-dashed border-line pt-3">
              <Toggle checked={m.read} onChange={async (v) => { await adminMarkMessage(m.id, v); setTick((t) => t + 1); }} label={m.read ? "مقروءة" : "جديدة"} />
              {m.phone && <a href={`https://wa.me/${customerWhatsapp(m.phone)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-sage"><WhatsappIcon className="size-4" /> رد</a>}
              <span className="ms-auto"><DeleteButton small label="" onConfirm={async () => { await adminDeleteMessage(m.id); toast("انحذفت"); setTick((t) => t + 1); }} /></span>
            </div>
          </Card>
        ))}
      </div>
      {data && data.length === 0 && <Card className="py-12 text-center text-cocoa-3">ما في رسائل</Card>}
    </div>
  );
}
