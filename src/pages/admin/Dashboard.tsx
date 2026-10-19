import { AlertTriangle, Gift, Mail, MessageSquareHeart, ReceiptText, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { AdminPageHeader, Card, StatusBadge, fmtDate } from "../../components/admin/ui";
import { adminCountSubscribers, adminListOrders, adminStats } from "../../lib/api";
import { formatPrice } from "../../lib/format";
import { useAsync, useTitle } from "../../lib/hooks";
import { ORDER_STATUSES } from "../../types";

export default function AdminDashboard() {
  useTitle("لوحة التحكم");
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const on = () => setTick((t) => t + 1);
    window.addEventListener("banan:new-order", on);
    return () => window.removeEventListener("banan:new-order", on);
  }, []);
  const { data: stats } = useAsync(adminStats, [tick]);
  const { data: latest } = useAsync(() => adminListOrders({ limit: 8 }), [tick]);
  const { data: subs } = useAsync(adminCountSubscribers, []);

  const valid = stats?.orders.filter((o) => o.status !== "cancelled") ?? [];
  const today = new Date().toDateString();
  const todayOrders = valid.filter((o) => new Date(o.createdAt).toDateString() === today);
  const revenue30 = valid.reduce((s, o) => s + o.total, 0);
  const delivered = stats?.orders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.total, 0) ?? 0;

  // مبيعات آخر 14 يوم
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = d.toDateString();
    const total = valid.filter((o) => new Date(o.createdAt).toDateString() === key).reduce((s, o) => s + o.total, 0);
    return { label: d.getDate(), total };
  });
  const max = Math.max(1, ...days.map((d) => d.total));

  const kpis = [
    { label: "طلبات اليوم", value: todayOrders.length, sub: formatPrice(todayOrders.reduce((s, o) => s + o.total, 0)), icon: ReceiptText },
    { label: "مبيعات آخر 30 يوم", value: formatPrice(revenue30), sub: `${valid.length} طلب`, icon: TrendingUp },
    { label: "تم تسليمه (30 يوم)", value: formatPrice(delivered), sub: "مبلغ مستلم", icon: Gift },
    { label: "مشتركين بالنشرة", value: subs ?? "—", sub: "إيميلات", icon: Users },
  ];

  const alerts = [
    stats?.pendingReviews ? { to: "/admin/reviews", text: `${stats.pendingReviews} رأي بستنى موافقتك`, icon: MessageSquareHeart } : null,
    stats?.unreadMessages ? { to: "/admin/messages", text: `${stats.unreadMessages} رسالة جديدة`, icon: Mail } : null,
    stats?.newCustom ? { to: "/admin/custom", text: `${stats.newCustom} طلب خاص جديد`, icon: Gift } : null,
    stats?.lowStock ? { to: "/admin/products", text: `${stats.lowStock} منتج كميته قليلة (2 أو أقل)`, icon: AlertTriangle } : null,
  ].filter(Boolean) as { to: string; text: string; icon: typeof Mail }[];

  return (
    <div>
      <AdminPageHeader title="أهلاً فيكِ 🤍" text="هاي نظرة سريعة على المتجر" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="!p-4">
            <k.icon className="size-5 text-rose" />
            <p className="mt-3 text-2xl font-bold tabular-nums md:text-3xl">{k.value}</p>
            <p className="mt-1 text-sm text-cocoa-2">{k.label}</p>
            <p className="text-xs text-cocoa-3">{k.sub}</p>
          </Card>
        ))}
      </div>

      {alerts.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {alerts.map((a) => (
            <Link key={a.to} to={a.to} className="inline-flex items-center gap-2 rounded-full bg-rose-soft px-4 py-2 text-sm font-semibold hover:bg-rose hover:text-white">
              <a.icon className="size-4" /> {a.text}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <h2 className="mb-4 font-semibold">المبيعات آخر 14 يوم</h2>
          <div className="flex h-44 items-end gap-1.5" role="img" aria-label="رسم المبيعات">
            {days.map((d, i) => (
              <div key={i} className="group flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] tabular-nums text-cocoa-3 opacity-0 transition group-hover:opacity-100">{d.total ? Math.round(d.total) : ""}</span>
                <div className="w-full rounded-t-lg bg-rose/80 transition group-hover:bg-rose" style={{ height: `${(d.total / max) * 100}%`, minHeight: d.total ? 6 : 2 }} />
                <span className="text-[10px] tabular-nums text-cocoa-3">{d.label}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">الطلبات حسب الحالة (30 يوم)</h2>
          <ul className="space-y-2">
            {ORDER_STATUSES.map((s) => {
              const n = stats?.orders.filter((o) => o.status === s.id).length ?? 0;
              if (!n) return null;
              return (
                <li key={s.id}>
                  <Link to={`/admin/orders?status=${s.id}`} className="flex items-center justify-between rounded-xl px-2 py-1.5 text-sm hover:bg-cream-2">
                    <StatusBadge status={s.id} />
                    <b className="tabular-nums">{n}</b>
                  </Link>
                </li>
              );
            })}
            {stats && stats.orders.length === 0 && <li className="text-sm text-cocoa-3">لسا ما في طلبات</li>}
          </ul>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">آخر الطلبات</h2>
          <Link to="/admin/orders" className="text-sm font-semibold text-rose">كل الطلبات ←</Link>
        </div>
        <ul className="divide-y divide-dashed divide-line">
          {latest?.map((o) => (
            <li key={o.id}>
              <Link to={`/admin/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:bg-cream-2/50">
                <span className="min-w-0">
                  <b className="tabular-nums">{o.number}</b> · {o.name}
                  <span className="block text-xs text-cocoa-3">{fmtDate(o.createdAt)} · {o.zoneName}</span>
                </span>
                <span className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <b className="tabular-nums">{formatPrice(o.total)}</b>
                </span>
              </Link>
            </li>
          ))}
          {latest && latest.length === 0 && <li className="py-6 text-center text-sm text-cocoa-3">لسا ما في طلبات — أول ما يوصل طلب رح يطلعلك تنبيه هون 🔔</li>}
        </ul>
      </Card>
    </div>
  );
}
