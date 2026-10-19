import { Phone, RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { WhatsappIcon } from "../../components/Icons";
import { AdminPageHeader, Card, StatusSelect, fmtDate, useToast } from "../../components/admin/ui";
import { adminListOrders, adminUpdateOrder, customerWhatsapp, whatsappLink } from "../../lib/api";
import { formatPrice } from "../../lib/format";
import { useTitle } from "../../lib/hooks";
import { statusMessageForCustomer } from "../../lib/whatsapp";
import type { Order, OrderStatus } from "../../types";
import { useStatuses } from "../../components/admin/statuses";

export default function AdminOrders() {
  useTitle("الطلبات");
  const toast = useToast();
  const { statuses } = useStatuses();
  const [params, setParams] = useSearchParams();
  const status = params.get("status") ?? "";
  const [q, setQ] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setOrders(await adminListOrders({ status: status || undefined, q }));
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, q]);

  useEffect(() => {
    const on = () => void load();
    window.addEventListener("banan:new-order", on);
    return () => window.removeEventListener("banan:new-order", on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, q]);

  const changeStatus = async (o: Order, s: OrderStatus) => {
    setOrders((list) => list?.map((x) => (x.id === o.id ? { ...x, status: s } : x)) ?? null);
    try {
      await adminUpdateOrder(o.id, { status: s });
      toast(`تم تغيير حالة ${o.number}`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "ما تغيّرت الحالة", "err");
      void load();
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="الطلبات"
        text={orders ? `${orders.length} طلب` : undefined}
        action={
          <button onClick={load} className="btn btn-ghost !py-2" disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> تحديث
          </button>
        }
      />

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-cocoa-3" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحثي بالاسم، الرقم، رقم الطلب أو المدينة" className="field !rounded-full !pr-12" />
      </div>
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        <button onClick={() => setParams({})} className={`shrink-0 rounded-full px-4 py-2 text-sm ${!status ? "bg-cocoa text-cream" : "bg-linen hover:bg-cream-2"}`}>الكل</button>
        {statuses.filter((s) => s.active).map((s) => (
          <button
            key={s.key}
            onClick={() => setParams({ status: s.key })}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm ${status === s.key ? "bg-cocoa text-cream" : "bg-linen hover:bg-cream-2"}`}
          >
            <span className="size-2 rounded-full" style={{ background: s.color }} /> {s.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {orders?.map((o) => (
          <Card key={o.id} className="!p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <Link to={`/admin/orders/${o.id}`} className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <b className="tabular-nums text-lg">{o.number}</b>
                  <span className="font-semibold">{o.name}</span>
                  <span className="text-sm text-cocoa-3">{fmtDate(o.createdAt)}</span>
                </p>
                <p className="mt-1 text-sm text-cocoa-2">
                  {o.isPickup ? "🏡 " : "📍 "}
                  {o.zoneName}
                  {!o.isPickup && o.city ? ` — ${o.city}` : ""} · {o.items.reduce((s, i) => s + i.qty, 0)} قطع
                  {o.promoCode && <span className="ms-2 rounded-full bg-sage-soft px-2 py-0.5 text-xs">{o.promoCode}</span>}
                  {o.giftWrap && <span className="ms-2 rounded-full bg-rose-soft px-2 py-0.5 text-xs">🎁 هدية</span>}
                </p>
                <p className="mt-1 truncate text-xs text-cocoa-3">{o.items.map((i) => `${i.name} ×${i.qty}`).join("، ")}</p>
              </Link>
              <div className="flex flex-col items-end gap-2">
                <b className="text-lg tabular-nums">{formatPrice(o.total)}</b>
                <div className="flex gap-1.5">
                  <a href={whatsappLink(customerWhatsapp(o.phone), statusMessageForCustomer(o, statuses))} target="_blank" rel="noreferrer" className="grid size-9 place-items-center rounded-full bg-sage-soft hover:bg-sage hover:text-white" aria-label="واتساب الزبونة">
                    <WhatsappIcon className="size-4" />
                  </a>
                  <a href={`tel:${o.phone}`} className="grid size-9 place-items-center rounded-full bg-cream-2 hover:bg-sand" aria-label="اتصال">
                    <Phone className="size-4" />
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-3 max-w-xs">
              <StatusSelect value={o.status} onChange={(s) => changeStatus(o, s)} />
            </div>
          </Card>
        ))}
        {orders && orders.length === 0 && <Card className="py-12 text-center text-cocoa-3">ما في طلبات هون</Card>}
      </div>
    </div>
  );
}
