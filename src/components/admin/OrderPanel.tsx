import { Check, ClipboardList, LoaderCircle, MapPin, Package, Pencil, Phone, Plus, Printer, Settings2, StickyNote, Trash2, User, X } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { WhatsappIcon } from "../Icons";
import { ProductMedia } from "../ProductMedia";
import {
  adminAddOrderItem,
  adminDeleteOrder,
  adminGetOrder,
  adminListProducts,
  adminListZones,
  adminRemoveOrderItem,
  adminUpdateOrder,
  adminUpdateOrderFields,
  adminUpdateOrderItem,
  customerWhatsapp,
  whatsappLink,
} from "../../lib/api";
import { formatPrice } from "../../lib/format";
import { statusMessageForCustomer } from "../../lib/whatsapp";
import { PAYMENT_STATUSES, type DeliveryZone, type Order, type OrderItem, type PaymentStatus, type Product } from "../../types";
import { PrintOrders } from "./OrderInvoice";
import { useStatuses } from "./statuses";
import { DeleteButton, StatusBadge, StatusSelect, fmtDate, statusInfo, useToast } from "./ui";

function Box({ title, icon, children, tone = "", action }: { title: string; icon: ReactNode; children: ReactNode; tone?: string; action?: ReactNode }) {
  return (
    <section className={`rounded-2xl border p-4 ${tone || "border-line bg-linen"}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-semibold">{icon} {title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function ItemRow({ item, orderId, onChanged }: { item: OrderItem; orderId: string; onChanged: () => void }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(item.price);
  const [qty, setQty] = useState(item.qty);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!item.id) return;
    setBusy(true);
    try {
      await adminUpdateOrderItem(orderId, item.id, { price: Math.max(0, Number(price) || 0), qty: Math.max(1, Math.round(Number(qty) || 1)) });
      setEditing(false);
      onChanged();
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="flex gap-3 py-3">
      <div className="size-16 shrink-0 overflow-hidden rounded-xl">
        <ProductMedia image={item.image} art={item.art} color={item.color?.hex ?? "#efe2cf"} className="size-full" alt={item.name} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold leading-6">{item.name}</p>
          <b className="shrink-0 tabular-nums">{formatPrice(item.price * item.qty)}</b>
        </div>
        {(item.color?.name || item.size) && <p className="text-xs text-cocoa-3">{[item.color?.name, item.size].filter(Boolean).join(" · ")}</p>}
        {item.note && <p className="mt-1 rounded-lg bg-gold-soft px-2 py-1 text-xs">✍️ التخصيص: <b>{item.note}</b></p>}
        {editing ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1 text-xs">السعر<input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-20 rounded-lg border border-line bg-cream px-2 py-1 text-sm" /></label>
            <label className="flex items-center gap-1 text-xs">الكمية<input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-16 rounded-lg border border-line bg-cream px-2 py-1 text-sm" /></label>
            <button onClick={save} disabled={busy} className="grid size-8 place-items-center rounded-full bg-sage text-white" aria-label="حفظ">{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}</button>
            <button onClick={() => { setEditing(false); setPrice(item.price); setQty(item.qty); }} className="grid size-8 place-items-center rounded-full hover:bg-cream-2" aria-label="إلغاء"><X className="size-4" /></button>
          </div>
        ) : (
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-md bg-cream-2 px-2 py-0.5 tabular-nums">{formatPrice(item.price)}</span>
            <span className="rounded-md bg-sage-soft px-2 py-0.5">الكمية: {item.qty}</span>
            <button onClick={() => setEditing(true)} className="grid size-7 place-items-center rounded-full hover:bg-cream-2" aria-label="تعديل"><Pencil className="size-3.5" /></button>
            <DeleteButton
              small
              label=""
              onConfirm={async () => {
                if (!item.id) return;
                try {
                  await adminRemoveOrderItem(orderId, item.id);
                  onChanged();
                } catch (e) {
                  toast(e instanceof Error ? e.message : "خطأ", "err");
                }
              }}
            />
          </div>
        )}
      </div>
    </li>
  );
}

function AddItem({ orderId, onChanged }: { orderId: string; onChanged: () => void }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [pid, setPid] = useState("");
  const [qty, setQty] = useState(1);
  useEffect(() => {
    if (open && !products) adminListProducts().then((p) => setProducts(p.filter((x) => x.active))).catch(() => setProducts([]));
  }, [open, products]);
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="btn btn-ghost mt-2 !px-4 !py-2 text-sm"><Plus className="size-4" /> إضافة منتج</button>
    );
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <select value={pid} onChange={(e) => setPid(e.target.value)} className="field !w-auto min-w-0 flex-1 !py-2">
        <option value="">اختاري منتج…</option>
        {products?.map((p) => <option key={p.id} value={p.id}>{p.name} — {formatPrice(p.price)}</option>)}
      </select>
      <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} className="field !w-20 !py-2" aria-label="الكمية" />
      <button
        disabled={!pid}
        onClick={async () => {
          const p = products?.find((x) => x.id === pid);
          if (!p) return;
          try {
            await adminAddOrderItem(orderId, p, qty);
            setOpen(false);
            setPid("");
            setQty(1);
            onChanged();
          } catch (e) {
            toast(e instanceof Error ? e.message : "خطأ", "err");
          }
        }}
        className="btn btn-primary !px-4 !py-2"
      >
        إضافة
      </button>
      <button onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full hover:bg-cream-2" aria-label="إلغاء"><X className="size-4" /></button>
    </div>
  );
}

function AddressEdit({ order, onDone }: { order: Order; onDone: () => void }) {
  const toast = useToast();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [f, setF] = useState({ zoneId: order.zoneId ?? "", city: order.city, address: order.address, name: order.name, phone: order.phone, updateFee: true });
  useEffect(() => {
    adminListZones().then(setZones).catch(() => undefined);
  }, []);
  const save = async () => {
    const z = zones.find((x) => x.id === f.zoneId);
    try {
      await adminUpdateOrderFields(order.id, {
        name: f.name.trim(),
        phone: f.phone.trim(),
        city: f.city.trim(),
        address: f.address.trim(),
        ...(z ? { zoneId: z.id, zoneName: z.name, isPickup: z.isPickup, ...(f.updateFee ? { deliveryFee: z.isPickup ? 0 : z.fee } : {}) } : {}),
      });
      toast("انحفظ العنوان");
      onDone();
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
    }
  };
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="field !py-2" placeholder="الاسم" />
        <input value={f.phone} dir="ltr" onChange={(e) => setF({ ...f, phone: e.target.value })} className="field !py-2 text-right" placeholder="الجوال" />
      </div>
      <select value={f.zoneId} onChange={(e) => setF({ ...f, zoneId: e.target.value })} className="field !py-2">
        <option value="">— المنطقة —</option>
        {zones.map((z) => <option key={z.id} value={z.id}>{z.name}{z.active ? "" : " (مخفية)"} — {z.isPickup ? "استلام" : formatPrice(z.fee)}</option>)}
      </select>
      <input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} className="field !py-2" placeholder="المدينة / البلدة" />
      <input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} className="field !py-2" placeholder="العنوان بالتفصيل" />
      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={f.updateFee} onChange={(e) => setF({ ...f, updateFee: e.target.checked })} /> حدّثي سعر التوصيل حسب المنطقة</label>
      <div className="flex gap-2">
        <button onClick={save} className="btn btn-primary !px-4 !py-2">حفظ</button>
        <button onClick={onDone} className="btn btn-ghost !px-4 !py-2">إلغاء</button>
      </div>
    </div>
  );
}

/** تفاصيل الطلب الكاملة — بتنفتح كنافذة من صفحة الطلبات أو كصفحة لحالها */
export function OrderPanel({ id, onChanged, onDeleted }: { id: string; onChanged?: () => void; onDeleted?: () => void }) {
  const toast = useToast();
  const { statuses } = useStatuses();
  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<{ status: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [editAddr, setEditAddr] = useState(false);
  const [money, setMoney] = useState<{ deliveryFee: number; discount: number } | null>(null);
  const [printing, setPrinting] = useState<Order[]>([]);

  const load = useCallback(async () => {
    const res = await adminGetOrder(id);
    setOrder(res?.order ?? null);
    setEvents(res?.events ?? []);
    setNote(res?.order.adminNote ?? "");
    setLoading(false);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const changed = async () => {
    await load();
    onChanged?.();
  };

  if (loading) return <div className="grid min-h-[40vh] place-items-center"><LoaderCircle className="size-8 animate-spin text-rose" /></div>;
  if (!order) return <p className="py-10 text-center text-cocoa-3">ما لقينا الطلب</p>;

  const setStatus = async (s: string) => {
    try {
      await adminUpdateOrder(order.id, { status: s });
      toast(`الحالة: ${statusInfo(statuses, s).label}`);
      await changed();
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
    }
  };
  const setPayment = async (p: PaymentStatus) => {
    try {
      await adminUpdateOrder(order.id, { paymentStatus: p });
      await changed();
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-cocoa-3">تفاصيل الطلب</p>
          <p className="flex items-center gap-2 text-2xl font-bold tabular-nums" dir="ltr">
            #{order.number}
          </p>
          <div className="mt-1"><StatusBadge status={order.status} /></div>
        </div>
        <button onClick={() => setPrinting([order])} className="btn btn-ghost !px-4 !py-2"><Printer className="size-4" /> طباعة الطلب</button>
      </div>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-linen p-4">
        <div>
          <p className="font-semibold">{order.name}</p>
          <p className="text-sm tabular-nums text-cocoa-3" dir="ltr" style={{ textAlign: "right" }}>{order.phone}</p>
        </div>
        <div className="flex gap-2">
          <a href={whatsappLink(customerWhatsapp(order.phone), statusMessageForCustomer(order, statuses))} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-sage px-3 py-1.5 text-sm text-sage hover:bg-sage hover:text-white"><WhatsappIcon className="size-4" /> واتساب</a>
          <a href={`tel:${order.phone}`} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm hover:bg-cream-2"><Phone className="size-4" /> اتصال</a>
        </div>
      </section>

      <Box title="سجل الحالة" icon={<ClipboardList className="size-4 text-rose" />}>
        <ol className="space-y-2 border-s-2 border-dashed border-line ps-4">
          {events.map((e, i) => (
            <li key={i} className="relative">
              <span className="absolute -start-[1.4rem] top-1.5 size-2.5 rounded-full" style={{ background: statusInfo(statuses, e.status).color }} />
              <p className="text-sm font-semibold">{statusInfo(statuses, e.status).label}</p>
              <p className="text-xs text-cocoa-3">{fmtDate(e.createdAt)}</p>
            </li>
          ))}
        </ol>
      </Box>

      <div className="grid gap-4 md:grid-cols-2">
        <Box title="عناصر الطلب" icon={<Package className="size-4 text-rose" />} tone="border-gold/40 bg-gold-soft/40">
          <ul className="divide-y divide-dashed divide-line">
            {order.items.map((i, n) => <ItemRow key={i.id ?? n} item={i} orderId={order.id} onChanged={changed} />)}
          </ul>
          <AddItem orderId={order.id} onChanged={changed} />
        </Box>

        <Box
          title="ملخص الطلب"
          icon={<ClipboardList className="size-4 text-rose" />}
          action={!money && <button onClick={() => setMoney({ deliveryFee: order.deliveryFee, discount: order.discount })} className="grid size-8 place-items-center rounded-full hover:bg-cream-2" aria-label="تعديل"><Pencil className="size-3.5" /></button>}
        >
          {money ? (
            <div className="space-y-2 text-sm">
              <label className="flex items-center justify-between gap-2">تكلفة التوصيل<input type="number" min={0} value={money.deliveryFee} onChange={(e) => setMoney({ ...money, deliveryFee: Number(e.target.value) })} className="w-24 rounded-lg border border-line bg-cream px-2 py-1" /></label>
              <label className="flex items-center justify-between gap-2">الخصم<input type="number" min={0} value={money.discount} onChange={(e) => setMoney({ ...money, discount: Number(e.target.value) })} className="w-24 rounded-lg border border-line bg-cream px-2 py-1" /></label>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={async () => {
                    try {
                      await adminUpdateOrderFields(order.id, { deliveryFee: Math.max(0, money.deliveryFee || 0), discount: Math.max(0, money.discount || 0) });
                      setMoney(null);
                      await changed();
                    } catch (e) {
                      toast(e instanceof Error ? e.message : "خطأ", "err");
                    }
                  }}
                  className="btn btn-primary !px-4 !py-1.5"
                >حفظ</button>
                <button onClick={() => setMoney(null)} className="btn btn-ghost !px-4 !py-1.5">إلغاء</button>
              </div>
            </div>
          ) : (
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-cocoa-3">المجموع</dt><dd className="tabular-nums">{formatPrice(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-cocoa-3">تكلفة التوصيل</dt><dd className="tabular-nums">{formatPrice(order.deliveryFee)}</dd></div>
              {order.giftWrapFee > 0 && <div className="flex justify-between"><dt className="text-cocoa-3">تغليف هدية</dt><dd className="tabular-nums">{formatPrice(order.giftWrapFee)}</dd></div>}
              <div className="flex justify-between"><dt className="text-cocoa-3">الخصم{order.promoCode ? ` (${order.promoCode})` : ""}</dt><dd className="tabular-nums">{formatPrice(order.discount)}</dd></div>
              <div className="mt-2 flex justify-between rounded-xl bg-gold-soft px-3 py-2 font-bold"><dt>المطلوب للدفع</dt><dd className="tabular-nums">{formatPrice(order.total)}</dd></div>
            </dl>
          )}
        </Box>

        <Box
          title="عنوان الشحن"
          icon={<MapPin className="size-4 text-rose" />}
          action={!editAddr && <button onClick={() => setEditAddr(true)} className="grid size-8 place-items-center rounded-full hover:bg-cream-2" aria-label="تعديل"><Pencil className="size-3.5" /></button>}
        >
          {editAddr ? (
            <AddressEdit order={order} onDone={() => { setEditAddr(false); void changed(); }} />
          ) : (
            <div className="text-sm leading-7">
              <p className="font-semibold">{order.isPickup ? "🏡 " : ""}{order.zoneName}</p>
              {!order.isPickup && <p className="text-cocoa-2">{[order.city, order.address].filter(Boolean).join("، ") || "—"}</p>}
            </div>
          )}
        </Box>

        <Box title="حالة الطلب" icon={<Settings2 className="size-4 text-rose" />}>
          <label className="mb-1 block text-xs text-cocoa-3">حالة الطلب</label>
          <StatusSelect value={order.status} onChange={setStatus} />
          <label className="mb-1 mt-3 block text-xs text-cocoa-3">حالة الدفع</label>
          <select value={order.paymentStatus ?? "unpaid"} onChange={(e) => setPayment(e.target.value as PaymentStatus)} className="field !py-2.5">
            {PAYMENT_STATUSES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </Box>

        <Box title="ملاحظات الطلب" icon={<StickyNote className="size-4 text-rose" />} tone="border-gold/40 bg-gold-soft/30">
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="field resize-none !bg-cream" placeholder="لا توجد ملاحظات — بتظهر إلك وبالفاتورة" />
          {note !== (order.adminNote ?? "") && (
            <button
              onClick={async () => {
                try {
                  await adminUpdateOrder(order.id, { adminNote: note.trim() || null });
                  toast("انحفظت الملاحظة");
                  await changed();
                } catch (e) {
                  toast(e instanceof Error ? e.message : "خطأ", "err");
                }
              }}
              className="btn btn-primary mt-2 !px-4 !py-1.5"
            >حفظ</button>
          )}
        </Box>

        <Box title="العميل" icon={<User className="size-4 text-rose" />}>
          <p className="font-semibold">{order.name}</p>
          <p className="text-sm tabular-nums text-cocoa-3" dir="ltr" style={{ textAlign: "right" }}>{order.phone}</p>
          <p className="mt-1 text-xs text-cocoa-3">{fmtDate(order.createdAt)}</p>
        </Box>
      </div>

      <Box title="ملاحظات العميل" icon={<StickyNote className="size-4 text-sage" />} tone="border-sage/40 bg-sage-soft/40">
        <p className="text-sm leading-7">{order.notes || <span className="text-cocoa-3">لا توجد ملاحظات من العميل</span>}</p>
        {order.giftWrap && <p className="mt-2 font-serif">🎁 تغليف هدية{order.giftMessage ? ` — «${order.giftMessage}»` : ""}</p>}
      </Box>

      <div className="pt-2 text-center">
        <DeleteButton
          label="حذف الطلب"
          onConfirm={async () => {
            try {
              await adminDeleteOrder(order.id);
              toast("انحذف الطلب");
              onDeleted?.();
            } catch (e) {
              toast(e instanceof Error ? e.message : "خطأ", "err");
            }
          }}
        />
        <p className="mt-1 text-xs text-cocoa-3"><Trash2 className="me-1 inline size-3" />الأفضل تغيّري الحالة لـ «ملغى» بدل الحذف — بترجع الكمية للمخزون.</p>
      </div>

      <PrintOrders orders={printing} onDone={() => setPrinting([])} />
    </div>
  );
}
