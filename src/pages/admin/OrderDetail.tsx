import { ArrowRight, Copy, LoaderCircle, Phone, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { WhatsappIcon } from "../../components/Icons";
import { ProductMedia } from "../../components/ProductMedia";
import { AdminPageHeader, Card, DeleteButton, StatusBadge, StatusSelect, fmtDate, useToast } from "../../components/admin/ui";
import { adminDeleteOrder, adminGetOrder, adminUpdateOrder, customerWhatsapp, whatsappLink } from "../../lib/api";
import { formatPrice } from "../../lib/format";
import { useTitle } from "../../lib/hooks";
import { orderMessageForStore, statusMessageForCustomer } from "../../lib/whatsapp";
import type { Order, OrderStatus } from "../../types";
import { useStatuses } from "../../components/admin/statuses";

export default function AdminOrderDetail() {
  const { id = "" } = useParams();
  const toast = useToast();
  const { statuses } = useStatuses();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<{ status: OrderStatus; createdAt: string }[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  useTitle(order ? `طلب ${order.number}` : "طلب");

  const load = async () => {
    const res = await adminGetOrder(id);
    if (res) {
      setOrder(res.order);
      setEvents(res.events);
      setNote(res.order.adminNote ?? "");
    }
    setLoading(false);
  };
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="grid min-h-[40vh] place-items-center"><LoaderCircle className="size-8 animate-spin text-rose" /></div>;
  if (!order) return <Card className="text-center">ما لقينا الطلب. <Link to="/admin/orders" className="text-rose">رجوع</Link></Card>;

  const setStatus = async (s: OrderStatus) => {
    try {
      await adminUpdateOrder(order.id, { status: s });
      toast("تم تغيير الحالة");
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
    }
  };

  const saveNote = async () => {
    try {
      await adminUpdateOrder(order.id, { adminNote: note.trim() || null });
      toast("انحفظت الملاحظة");
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(orderMessageForStore(order, window.location.origin));
    toast("انتسخت تفاصيل الطلب");
  };

  return (
    <div className="print:text-black">
      <Link to="/admin/orders" className="mb-3 inline-flex items-center gap-1 text-sm text-cocoa-3 hover:text-cocoa print:hidden">
        <ArrowRight className="size-4" /> كل الطلبات
      </Link>
      <AdminPageHeader
        title={`طلب ${order.number}`}
        text={`${fmtDate(order.createdAt)}`}
        action={
          <div className="flex flex-wrap gap-2 print:hidden">
            <button onClick={copy} className="btn btn-ghost !py-2"><Copy className="size-4" /> نسخ</button>
            <button onClick={() => window.print()} className="btn btn-ghost !py-2"><Printer className="size-4" /> طباعة</button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 font-semibold">القطع</h2>
            <ul className="divide-y divide-dashed divide-line">
              {order.items.map((i, n) => (
                <li key={i.id ?? n} className="flex items-center gap-3 py-3">
                  <div className="size-16 shrink-0 overflow-hidden rounded-xl">
                    <ProductMedia image={i.image} art={i.art} color={i.color?.hex ?? "#efe2cf"} className="size-full" alt={i.name} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{i.name}</p>
                    <p className="text-sm text-cocoa-3">
                      {i.color && <span className="inline-flex items-center gap-1"><span className="size-3 rounded-full border border-line" style={{ background: i.color.hex }} /> {i.color.name}</span>}
                      {i.size && ` · ${i.size}`}
                    </p>
                    {i.note && <p className="mt-1 rounded-lg bg-gold-soft px-2 py-1 text-sm">✍️ التخصيص: <b>{i.note}</b></p>}
                  </div>
                  <div className="text-end text-sm">
                    <p className="tabular-nums">{i.qty} × {formatPrice(i.price)}</p>
                    <b className="tabular-nums">{formatPrice(i.qty * i.price)}</b>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-dashed border-line pt-3 text-sm">
              <div className="flex justify-between"><dt>المجموع</dt><dd className="tabular-nums">{formatPrice(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>{order.isPickup ? "الاستلام" : "التوصيل"} ({order.zoneName})</dt><dd className="tabular-nums">{order.deliveryFee ? formatPrice(order.deliveryFee) : "مجاني"}</dd></div>
              {order.giftWrap && <div className="flex justify-between"><dt>تغليف هدية</dt><dd className="tabular-nums">{formatPrice(order.giftWrapFee)}</dd></div>}
              {order.discount > 0 && <div className="flex justify-between text-sage"><dt>خصم ({order.promoCode})</dt><dd className="tabular-nums">− {formatPrice(order.discount)}</dd></div>}
              <div className="flex justify-between pt-2 text-lg font-bold"><dt>الإجمالي</dt><dd className="tabular-nums">{formatPrice(order.total)}</dd></div>
            </dl>
          </Card>

          {(order.notes || order.giftMessage) && (
            <Card>
              {order.notes && <p className="text-sm"><b>📝 ملاحظات الزبونة:</b> {order.notes}</p>}
              {order.giftMessage && <p className="mt-2 font-serif text-lg">💌 رسالة الكرت: «{order.giftMessage}»</p>}
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 font-semibold">الحالة</h2>
            <StatusSelect value={order.status} onChange={setStatus} />
            <a
              href={whatsappLink(customerWhatsapp(order.phone), statusMessageForCustomer(order, statuses))}
              target="_blank"
              rel="noreferrer"
              className="btn mt-3 w-full bg-sage text-white hover:bg-sage/90 print:hidden"
            >
              <WhatsappIcon className="size-5" /> بلّغي الزبونة بالحالة
            </a>
            <ol className="mt-4 space-y-2 border-t border-dashed border-line pt-3">
              {events.map((e, i) => (
                <li key={i} className="flex items-center justify-between text-xs">
                  <StatusBadge status={e.status} />
                  <span className="text-cocoa-3">{fmtDate(e.createdAt)}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <h2 className="mb-3 font-semibold">الزبونة</h2>
            <p className="font-semibold">{order.name}</p>
            <p className="mt-1 tabular-nums" dir="ltr" style={{ textAlign: "right" }}>{order.phone}</p>
            <p className="mt-2 text-sm text-cocoa-2">{order.isPickup ? `🏡 ${order.zoneName}` : `📍 ${order.zoneName} — ${order.city}، ${order.address}`}</p>
            <div className="mt-3 flex gap-2 print:hidden">
              <a href={`https://wa.me/${customerWhatsapp(order.phone)}`} target="_blank" rel="noreferrer" className="btn btn-ghost flex-1 !py-2"><WhatsappIcon className="size-4" /> واتساب</a>
              <a href={`tel:${order.phone}`} className="btn btn-ghost flex-1 !py-2"><Phone className="size-4" /> اتصال</a>
            </div>
          </Card>

          <Card className="print:hidden">
            <h2 className="mb-2 font-semibold">ملاحظة داخلية</h2>
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="field resize-none" placeholder="بتظهر إلك بس" />
            <button onClick={saveNote} className="btn btn-primary mt-2 !py-2">حفظ</button>
          </Card>

          <div className="text-center print:hidden">
            <DeleteButton
              label="حذف الطلب"
              onConfirm={async () => {
                await adminDeleteOrder(order.id);
                toast("انحذف الطلب");
                navigate("/admin/orders", { replace: true });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
