import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, ChevronLeft, ChevronRight, Download, Eye, LoaderCircle, MoreHorizontal, Plus, Printer, RefreshCw, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { WhatsappIcon } from "../../components/Icons";
import { PrintOrders } from "../../components/admin/OrderInvoice";
import { OrderPanel } from "../../components/admin/OrderPanel";
import { NewOrderModal } from "../../components/admin/NewOrderModal";
import { useStatuses } from "../../components/admin/statuses";
import { AdminPageHeader, StatusBadge, statusInfo, useToast } from "../../components/admin/ui";
import {
  adminBulkStatus,
  adminListOrders,
  adminOrderZones,
  adminOrdersSummary,
  adminPageOrders,
  customerWhatsapp,
  whatsappLink,
  type OrderQuery,
} from "../../lib/api";
import { formatPrice, piecesLabel } from "../../lib/format";
import { useTitle } from "../../lib/hooks";
import { statusMessageForCustomer } from "../../lib/whatsapp";
import { PAYMENT_STATUSES, type Order } from "../../types";

type Range = "" | "today" | "yesterday" | "week" | "month" | "custom";
const ranges: { id: Range; label: string }[] = [
  { id: "today", label: "اليوم" },
  { id: "yesterday", label: "أمس" },
  { id: "week", label: "هذا الأسبوع" },
  { id: "month", label: "هذا الشهر" },
  { id: "custom", label: "مخصص" },
];

function rangeDates(r: Range, from: string, to: string): { from?: string; to?: string } {
  const d0 = new Date();
  d0.setHours(0, 0, 0, 0);
  const add = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);
  switch (r) {
    case "today":
      return { from: d0.toISOString(), to: add(d0, 1).toISOString() };
    case "yesterday":
      return { from: add(d0, -1).toISOString(), to: d0.toISOString() };
    case "week": {
      const back = (d0.getDay() + 1) % 7; // الأسبوع بيبلّش السبت
      return { from: add(d0, -back).toISOString() };
    }
    case "month":
      return { from: new Date(d0.getFullYear(), d0.getMonth(), 1).toISOString() };
    case "custom":
      return {
        from: from ? new Date(`${from}T00:00:00`).toISOString() : undefined,
        to: to ? add(new Date(`${to}T00:00:00`), 1).toISOString() : undefined,
      };
    default:
      return {};
  }
}

const OPEN_STATUSES = ["new", "pending", "confirmed_whatsapp", "preparing"];
const isLate = (o: Order) => OPEN_STATUSES.includes(o.status) && Date.now() - new Date(o.createdAt).getTime() > 3 * 86400000;

function timeAgo(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "هلأ";
  if (m < 60) return `قبل ${m} دقيقة`;
  const h = Math.round(m / 60);
  if (h < 24) return `قبل ${h} ساعة`;
  const d = Math.round(h / 24);
  return d === 1 ? "قبل يوم" : `قبل ${d} يوم`;
}

function csvCell(v: unknown) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function RowMenu({ o, onOpen, onPrint }: { o: Order; onOpen: () => void; onPrint: () => void }) {
  const { statuses } = useStatuses();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((x) => !x)} className="grid size-9 place-items-center rounded-xl border border-line bg-linen hover:bg-cream-2" aria-label="إجراءات" aria-expanded={open}>
        <MoreHorizontal className="size-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute end-0 z-30 mt-1 w-44 overflow-hidden rounded-2xl border border-line bg-linen py-1 shadow-xl">
            <button onClick={() => { setOpen(false); onOpen(); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-cream-2"><Eye className="size-4" /> التفاصيل</button>
            <button onClick={() => { setOpen(false); onPrint(); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-cream-2"><Printer className="size-4" /> طباعة</button>
            <a href={whatsappLink(customerWhatsapp(o.phone), statusMessageForCustomer(o, statuses))} target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-cream-2"><WhatsappIcon className="size-4" /> واتساب</a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminOrders() {
  useTitle("الطلبات");
  const toast = useToast();
  const { statuses } = useStatuses();
  const [params, setParams] = useSearchParams();
  const status = params.get("status") ?? "";
  const openId = params.get("order");

  const [q, setQ] = useState("");
  const [range, setRange] = useState<Range>("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [zone, setZone] = useState("");
  const [payment, setPayment] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<{ counts: Record<string, number>; all: number; collected: number; pending: number } | null>(null);
  const [zones, setZones] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [printing, setPrinting] = useState<Order[]>([]);
  const [newOpen, setNewOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const filters: OrderQuery = useMemo(() => ({ q, zone: zone || undefined, payment: payment || undefined, ...rangeDates(range, from, to) }), [q, zone, payment, range, from, to]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pg, sum] = await Promise.all([adminPageOrders({ ...filters, status: status || undefined, page, pageSize }), adminOrdersSummary(filters)]);
      setOrders(pg.orders);
      setTotal(pg.total);
      setSummary(sum);
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
    } finally {
      setLoading(false);
    }
  }, [filters, status, page, pageSize, toast]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  useEffect(() => setPage(1), [filters, status, pageSize]);
  useEffect(() => setSelected([]), [filters, status, page]);

  useEffect(() => {
    adminOrderZones().then(setZones).catch(() => undefined);
    const on = () => void load();
    window.addEventListener("banan:new-order", on);
    return () => window.removeEventListener("banan:new-order", on);
  }, [load]);

  const setStatusFilter = (s: string) => {
    const next = new URLSearchParams(params);
    if (s) next.set("status", s);
    else next.delete("status");
    setParams(next, { replace: true });
  };
  const openOrder = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set("order", id);
    else next.delete("order");
    setParams(next);
  };

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const allChecked = !!orders?.length && orders.every((o) => selected.includes(o.id));

  const bulk = async (s: string) => {
    if (!selected.length) return;
    try {
      await adminBulkStatus(selected, s);
      toast(`انتقل ${selected.length} طلب لـ «${statusInfo(statuses, s).label}»`);
      setSelected([]);
      void load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all = await adminListOrders({ ...filters, status: status || undefined, limit: 5000 });
      const head = ["رقم الطلب", "التاريخ", "الاسم", "الجوال", "المنطقة", "المدينة", "العنوان", "المنتجات", "عدد القطع", "المجموع", "التوصيل", "الخصم", "الإجمالي", "الحالة", "الدفع", "كود الخصم", "ملاحظات الزبونة", "ملاحظة داخلية"];
      const rows = all.map((o) => [
        o.number,
        new Date(o.createdAt).toLocaleString("en-GB"),
        o.name,
        o.phone,
        o.zoneName,
        o.city,
        o.address,
        o.items.map((i) => `${i.name}${i.color?.name ? ` (${i.color.name})` : ""} ×${i.qty}${i.note ? ` [${i.note}]` : ""}`).join(" | "),
        o.items.reduce((s, i) => s + i.qty, 0),
        o.subtotal,
        o.deliveryFee,
        o.discount,
        o.total,
        statusInfo(statuses, o.status).label,
        PAYMENT_STATUSES.find((p) => p.id === (o.paymentStatus ?? "unpaid"))?.label,
        o.promoCode ?? "",
        o.notes ?? "",
        o.adminNote ?? "",
      ]);
      const csv = "﻿" + [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `banan-orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast(`انصدّر ${all.length} طلب`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
    } finally {
      setExporting(false);
    }
  };

  const activeStatuses = statuses.filter((s) => s.active || summary?.counts[s.key]);

  return (
    <div>
      <AdminPageHeader
        title="الطلبات"
        text="إدارة ومتابعة جميع طلبات متجرك"
        action={
          <div className="flex flex-wrap gap-2">
            <button onClick={exportCsv} disabled={exporting} className="btn btn-ghost !px-4 !py-2">
              {exporting ? <LoaderCircle className="size-4 animate-spin" /> : <Download className="size-4" />} تصدير Excel
            </button>
            <button onClick={() => setNewOpen(true)} className="btn btn-primary !px-4 !py-2"><Plus className="size-4" /> طلب جديد</button>
          </div>
        }
      />

      {/* الكروت */}
      <div className="mb-5 grid gap-3 lg:grid-cols-[17rem_1fr]">
        <div className="grid grid-cols-2 gap-3 rounded-3xl border border-line bg-linen p-4 lg:grid-cols-1">
          <div>
            <p className="text-sm font-semibold">المبالغ المحصّلة</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{formatPrice(summary?.collected ?? 0)}</p>
            <p className="text-xs text-cocoa-3">الطلبات المدفوعة أو اللي تسلّمت</p>
          </div>
          <div>
            <p className="text-sm font-semibold">بانتظار التحصيل</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-gold">{formatPrice(summary?.pending ?? 0)}</p>
            <p className="text-xs text-cocoa-3">طلبات لسا ما انقبض ثمنها</p>
          </div>
        </div>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] lg:overflow-visible lg:px-0">
          <button
            onClick={() => setStatusFilter("")}
            className={`min-w-32 shrink-0 rounded-3xl border-2 bg-linen p-4 text-start transition ${!status ? "border-cocoa" : "border-line hover:border-cocoa-3"}`}
          >
            <p className="flex items-center gap-2 text-sm"><span className="size-2 rounded-full bg-cocoa-3" /> الكل</p>
            <p className="mt-2 text-2xl font-bold tabular-nums">{summary?.all ?? "—"}</p>
          </button>
          {activeStatuses.map((s) => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(status === s.key ? "" : s.key)}
              className={`min-w-32 shrink-0 rounded-3xl border-2 bg-linen p-4 text-start transition ${status === s.key ? "" : "border-line hover:border-cocoa-3"}`}
              style={status === s.key ? { borderColor: s.color } : undefined}
            >
              <p className="flex items-center gap-2 text-sm"><span className="size-2 shrink-0 rounded-full" style={{ background: s.color }} /> <span className="truncate">{s.label}</span></p>
              <p className="mt-2 text-2xl font-bold tabular-nums">{summary?.counts[s.key] ?? 0}</p>
            </button>
          ))}
        </div>
      </div>

      {/* الفلاتر */}
      <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-cocoa-3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحثي برقم الطلب، اسم العميل أو الهاتف" className="field !rounded-full !py-2.5 !pr-12" />
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:px-0">
          {ranges.map((r) => (
            <button key={r.id} onClick={() => setRange(range === r.id ? "" : r.id)} className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm ${range === r.id ? "border-cocoa bg-cocoa text-cream" : "border-line bg-linen hover:bg-cream-2"}`}>
              {r.id === "custom" && <CalendarDays className="size-4" />} {r.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <select value={zone} onChange={(e) => setZone(e.target.value)} className="field !w-auto flex-1 !rounded-full !py-2.5">
            <option value="">كل المدن</option>
            {zones.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
          <select value={payment} onChange={(e) => setPayment(e.target.value)} className="field !w-auto flex-1 !rounded-full !py-2.5">
            <option value="">كل حالات الدفع</option>
            {PAYMENT_STATUSES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
      </div>
      {range === "custom" && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          من <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="field !w-auto !py-2" />
          لـ <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="field !w-auto !py-2" />
        </div>
      )}

      {/* إجراءات جماعية */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl bg-cocoa px-4 py-3 text-sm text-cream">
            <b>{selected.length} محدد</b>
            <select onChange={(e) => { if (e.target.value) void bulk(e.target.value); e.target.value = ""; }} defaultValue="" className="rounded-full bg-cream px-3 py-1.5 text-cocoa">
              <option value="">تغيير الحالة لـ…</option>
              {statuses.filter((s) => s.active).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <button onClick={() => setPrinting(orders?.filter((o) => selected.includes(o.id)) ?? [])} className="inline-flex items-center gap-1.5 rounded-full bg-cream/15 px-3 py-1.5 hover:bg-cream/25"><Printer className="size-4" /> طباعة</button>
            <button onClick={() => setSelected([])} className="ms-auto inline-flex items-center gap-1 text-cream/80 hover:text-cream"><X className="size-4" /> إلغاء</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* الجدول */}
      <div className="overflow-hidden rounded-3xl border border-line bg-linen">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="bg-cream-2/70 text-xs text-cocoa-3">
              <tr className="text-start">
                <th className="w-10 p-3"><input type="checkbox" checked={allChecked} onChange={(e) => setSelected(e.target.checked ? orders?.map((o) => o.id) ?? [] : [])} aria-label="تحديد الكل" /></th>
                <th className="p-3 text-start font-semibold">رقم الطلب</th>
                <th className="p-3 text-start font-semibold">العميل</th>
                <th className="p-3 text-start font-semibold">المنطقة</th>
                <th className="p-3 text-start font-semibold">المنتجات</th>
                <th className="p-3 text-start font-semibold">المبلغ</th>
                <th className="p-3 text-start font-semibold">الحالة</th>
                <th className="p-3 text-start font-semibold">الدفع</th>
                <th className="p-3 text-start font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((o) => {
                const late = isLate(o);
                return (
                  <tr key={o.id} className={`border-t border-line transition hover:bg-cream-2/40 ${late ? "shadow-[inset_-4px_0_0_#eab308]" : ""}`}>
                    <td className="p-3"><input type="checkbox" checked={selected.includes(o.id)} onChange={(e) => setSelected((s) => (e.target.checked ? [...s, o.id] : s.filter((x) => x !== o.id)))} aria-label={`تحديد ${o.number}`} /></td>
                    <td className="p-3">
                      <button onClick={() => openOrder(o.id)} className="text-start">
                        <span className="flex items-center gap-2">
                          <b className="tabular-nums hover:text-rose" dir="ltr">#{o.number}</b>
                          {late && <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-semibold text-gold">متأخر</span>}
                        </span>
                        <span className="text-xs text-cocoa-3">{timeAgo(o.createdAt)}</span>
                      </button>
                    </td>
                    <td className="p-3">
                      <p className="font-semibold">{o.name}</p>
                      <a href={`https://wa.me/${customerWhatsapp(o.phone)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-cocoa-3 hover:text-sage" dir="ltr"><WhatsappIcon className="size-3.5" /> {o.phone}</a>
                    </td>
                    <td className="p-3">{o.zoneName}</td>
                    <td className="p-3"><span className="underline decoration-dashed underline-offset-4" title={o.items.map((i) => `${i.name} ×${i.qty}`).join("\n")}>{piecesLabel(o.items.reduce((s, i) => s + i.qty, 0))}</span></td>
                    <td className="p-3 font-semibold tabular-nums">{formatPrice(o.total)}</td>
                    <td className="p-3"><StatusBadge status={o.status} /></td>
                    <td className="p-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs ${o.paymentStatus === "paid" ? "border-sage bg-sage-soft" : "border-line"}`}>
                        {o.paymentStatus === "paid" ? "مدفوع" : o.paymentStatus === "refunded" ? "مُرجع" : "الدفع عند الاستلام"}
                      </span>
                    </td>
                    <td className="p-3"><RowMenu o={o} onOpen={() => openOrder(o.id)} onPrint={() => setPrinting([o])} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* موبايل */}
        <ul className="divide-y divide-line md:hidden">
          {orders?.map((o) => (
            <li key={o.id} className={`flex gap-3 p-4 ${isLate(o) ? "border-s-4 border-gold" : ""}`}>
              <input type="checkbox" className="mt-1.5" checked={selected.includes(o.id)} onChange={(e) => setSelected((s) => (e.target.checked ? [...s, o.id] : s.filter((x) => x !== o.id)))} aria-label={`تحديد ${o.number}`} />
              <button onClick={() => openOrder(o.id)} className="min-w-0 flex-1 text-start">
                <span className="flex flex-wrap items-center gap-2">
                  <b className="tabular-nums" dir="ltr">#{o.number}</b>
                  {isLate(o) && <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-semibold text-gold">متأخر</span>}
                  <span className="text-xs text-cocoa-3">{timeAgo(o.createdAt)}</span>
                </span>
                <span className="mt-1 block font-semibold">{o.name} <span className="font-normal text-cocoa-3">· {o.zoneName}</span></span>
                <span className="mt-1.5 flex flex-wrap items-center gap-2">
                  <StatusBadge status={o.status} />
                  <b className="tabular-nums">{formatPrice(o.total)}</b>
                  <span className="text-xs text-cocoa-3">{piecesLabel(o.items.reduce((s, i) => s + i.qty, 0))}</span>
                </span>
              </button>
              <RowMenu o={o} onOpen={() => openOrder(o.id)} onPrint={() => setPrinting([o])} />
            </li>
          ))}
        </ul>

        {orders && orders.length === 0 && <p className="py-14 text-center text-cocoa-3">ما في طلبات هون</p>}
        {!orders && <div className="grid place-items-center py-14"><LoaderCircle className="size-7 animate-spin text-rose" /></div>}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm">
          <span className="flex items-center gap-2 text-cocoa-3">
            عرض {total ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, total)} من {total}
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="rounded-lg border border-line bg-cream px-2 py-1">
              {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            لكل صفحة
          </span>
          <span className="flex items-center gap-2">
            <button onClick={load} className="grid size-8 place-items-center rounded-lg border border-line hover:bg-cream-2" aria-label="تحديث"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /></button>
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="grid size-8 place-items-center rounded-lg border border-line disabled:opacity-40" aria-label="السابق"><ChevronRight className="size-4" /></button>
            <span className="tabular-nums">{page} / {pages}</span>
            <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="grid size-8 place-items-center rounded-lg border border-line disabled:opacity-40" aria-label="التالي"><ChevronLeft className="size-4" /></button>
          </span>
        </div>
      </div>

      {/* نافذة التفاصيل */}
      <AnimatePresence>
        {openId && (
          <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="تفاصيل الطلب">
            <motion.div className="absolute inset-0 bg-cocoa/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => openOrder(null)} />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
              className="absolute inset-y-0 left-0 w-full max-w-2xl overflow-y-auto bg-cream p-4 shadow-2xl sm:p-6"
            >
              <button onClick={() => openOrder(null)} className="absolute end-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-cream hover:bg-cream-2" aria-label="إغلاق"><X className="size-5" /></button>
              <OrderPanel id={openId} onChanged={() => void load()} onDeleted={() => { openOrder(null); void load(); }} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <NewOrderModal open={newOpen} onClose={() => setNewOpen(false)} onCreated={(id) => { setNewOpen(false); void load(); openOrder(id); }} />
      <PrintOrders orders={printing} onDone={() => setPrinting([])} />
    </div>
  );
}
