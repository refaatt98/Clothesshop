import { createPortal } from "react-dom";
import { useEffect } from "react";
import { formatPrice } from "../../lib/format";
import { useSite } from "../../lib/site";
import { PAYMENT_STATUSES, type Order } from "../../types";
import { statusInfo } from "./ui";
import { useStatuses } from "./statuses";

function Invoice({ o }: { o: Order }) {
  const { site } = useSite();
  const { statuses } = useStatuses();
  const date = new Date(o.createdAt).toLocaleString("ar", { dateStyle: "medium", timeStyle: "short", numberingSystem: "latn" } as Intl.DateTimeFormatOptions);
  return (
    <section className="invoice">
      <header className="inv-head">
        <img src="/logo-600.png" alt="بَنان" className="inv-logo" />
        <div className="inv-meta">
          <h1>فاتورة طلب</h1>
          <p className="inv-num">#{o.number}</p>
          <p>{date}</p>
          <p>الحالة: {statusInfo(statuses, o.status).label}</p>
        </div>
      </header>

      <div className="inv-grid">
        <div>
          <h2>الزبونة</h2>
          <p><b>{o.name}</b></p>
          <p dir="ltr" style={{ textAlign: "right" }}>{o.phone}</p>
        </div>
        <div>
          <h2>{o.isPickup ? "الاستلام" : "عنوان التوصيل"}</h2>
          <p><b>{o.zoneName}</b></p>
          {!o.isPickup && <p>{[o.city, o.address].filter(Boolean).join("، ")}</p>}
        </div>
      </div>

      <table className="inv-table">
        <thead>
          <tr>
            <th>#</th>
            <th>القطعة</th>
            <th>الكمية</th>
            <th>السعر</th>
            <th>المجموع</th>
          </tr>
        </thead>
        <tbody>
          {o.items.map((i, n) => (
            <tr key={i.id ?? n}>
              <td>{n + 1}</td>
              <td>
                <b>{i.name}</b>
                {(i.color?.name || i.size) && <div className="inv-sub">{[i.color?.name, i.size].filter(Boolean).join(" · ")}</div>}
                {i.note && <div className="inv-sub">✍️ تخصيص: {i.note}</div>}
              </td>
              <td>{i.qty}</td>
              <td>{formatPrice(i.price)}</td>
              <td>{formatPrice(i.price * i.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="inv-bottom">
        <div className="inv-notes">
          {o.notes && <p><b>ملاحظات الزبونة:</b> {o.notes}</p>}
          {o.giftWrap && <p><b>🎁 تغليف هدية</b>{o.giftMessage ? ` — رسالة الكرت: «${o.giftMessage}»` : ""}</p>}
          {o.adminNote && <p><b>ملاحظة:</b> {o.adminNote}</p>}
          <p><b>طريقة الدفع:</b> الدفع عند الاستلام · {PAYMENT_STATUSES.find((p) => p.id === (o.paymentStatus ?? "unpaid"))?.label}</p>
        </div>
        <table className="inv-sum">
          <tbody>
            <tr><td>المجموع</td><td>{formatPrice(o.subtotal)}</td></tr>
            <tr><td>{o.isPickup ? "الاستلام" : "التوصيل"}</td><td>{o.deliveryFee ? formatPrice(o.deliveryFee) : "مجاني"}</td></tr>
            {o.giftWrapFee > 0 && <tr><td>تغليف هدية</td><td>{formatPrice(o.giftWrapFee)}</td></tr>}
            {o.discount > 0 && <tr><td>الخصم{o.promoCode ? ` (${o.promoCode})` : ""}</td><td>− {formatPrice(o.discount)}</td></tr>}
            <tr className="inv-total"><td>المطلوب للدفع</td><td>{formatPrice(o.total)}</td></tr>
          </tbody>
        </table>
      </div>

      <footer className="inv-foot">
        <p>شكراً لاختيارك بَنان 🤍 {site.tagline}</p>
        <p dir="ltr">{[site.phone, site.instagram ? `@${site.instagram}` : ""].filter(Boolean).join("  ·  ")}</p>
      </footer>
    </section>
  );
}

/** بيطبع الطلبات المعطاة وبعدين بيرجع */
export function PrintOrders({ orders, onDone }: { orders: Order[]; onDone: () => void }) {
  useEffect(() => {
    if (!orders.length) return;
    const after = () => onDone();
    window.addEventListener("afterprint", after, { once: true });
    // نستنى الصور والخطوط قبل الطباعة
    const t = setTimeout(() => window.print(), 400);
    return () => {
      clearTimeout(t);
      window.removeEventListener("afterprint", after);
    };
  }, [orders, onDone]);
  if (!orders.length) return null;
  return createPortal(
    <div className="print-area" dir="rtl">
      {orders.map((o) => (
        <Invoice key={o.id} o={o} />
      ))}
    </div>,
    document.body,
  );
}
