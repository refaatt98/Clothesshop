import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Bow, YarnBall } from "../components/Craft";
import { WhatsappIcon } from "../components/Icons";
import { YarnLoader } from "../components/Loader";
import { EmptyState } from "../components/ui";
import { getOrder, whatsappLink } from "../lib/api";
import { formatPrice } from "../lib/format";
import { useAsync, useTitle } from "../lib/hooks";
import { useSite } from "../lib/site";
import { orderMessageForStore } from "../lib/whatsapp";

const SENT_KEY = "banan:wa-sent";

export default function OrderDone() {
  useTitle("تم الطلب");
  const { id = "" } = useParams();
  const { site } = useSite();
  const { data: order, loading } = useAsync(() => getOrder(id), [id]);
  const [countdown, setCountdown] = useState<number | null>(null);

  const link = order ? whatsappLink(site.whatsapp, orderMessageForStore(order, window.location.origin)) : "";

  // بنفتح واتساب تلقائياً مرة وحدة بعد الطلب
  useEffect(() => {
    if (!order) return;
    let sent: string[] = [];
    try {
      sent = JSON.parse(sessionStorage.getItem(SENT_KEY) ?? "[]");
    } catch {
      /* */
    }
    if (sent.includes(order.id)) return;
    setCountdown(4);
  }, [order]);

  useEffect(() => {
    if (countdown == null || !order) return;
    if (countdown === 0) {
      try {
        const sent = JSON.parse(sessionStorage.getItem(SENT_KEY) ?? "[]");
        sessionStorage.setItem(SENT_KEY, JSON.stringify([...sent, order.id]));
      } catch {
        /* */
      }
      setCountdown(null);
      window.location.href = link;
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c == null ? null : c - 1)), 1000);
    return () => clearTimeout(t);
  }, [countdown, order, link]);

  const markSent = () => {
    setCountdown(null);
    try {
      const sent = JSON.parse(sessionStorage.getItem(SENT_KEY) ?? "[]");
      sessionStorage.setItem(SENT_KEY, JSON.stringify([...sent, order?.id]));
    } catch {
      /* */
    }
  };

  if (loading) return <YarnLoader />;
  if (!order)
    return (
      <section className="container-b py-16">
        <EmptyState title="ما لقينا هالطلب" text="يمكن الرابط قديم. إذا عندك سؤال عن طلبك احكينا على واتساب.">
          <Link to="/" className="btn btn-primary mt-2">رجوع للرئيسية</Link>
        </EmptyState>
      </section>
    );

  return (
    <section className="container-b relative flex flex-col items-center py-14 text-center md:py-20">
      <div className="relative mb-6 h-40 w-40">
        <motion.svg viewBox="0 0 120 120" className="absolute inset-0 size-full" aria-hidden>
          <motion.rect x="18" y="46" width="84" height="62" rx="6" fill="#f3e1dc" stroke="#4a2a18" strokeWidth="2" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} />
          <motion.rect x="12" y="34" width="96" height="18" rx="4" fill="#e9c2bb" stroke="#4a2a18" strokeWidth="2" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, type: "spring", damping: 12 }} />
          <motion.path d="M60 34 V108" stroke="#c98f86" strokeWidth="8" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9, duration: 0.6 }} />
          <motion.path d="M38 78 l14 14 l30 -30" fill="none" stroke="#4a2a18" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.8, duration: 0.6 }} />
        </motion.svg>
        <motion.div className="absolute left-1/2 top-2 w-20 -translate-x-1/2" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 1.4, type: "spring", damping: 8 }}>
          <Bow className="w-full" color="#c98f86" />
        </motion.div>
      </div>

      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-display text-4xl md:text-5xl">
        شكراً {order.name.split(" ")[0]}، وصلنا طلبك! 🤍
      </motion.h1>
      <p className="mt-4 max-w-lg leading-8 text-cocoa-2">
        رقم الطلب <b className="tabular-nums text-cocoa">{order.number}</b>. ابعتيلنا الطلب على واتساب لنأكد معك التفاصيل، وبعدها بنبلّش نجهّز قطعك بحب.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <a href={link} onClick={markSent} target="_blank" rel="noreferrer" className="btn btn-primary !px-8 !py-4 text-base">
          <WhatsappIcon className="size-6" /> أرسلي الطلب على واتساب
        </a>
        {countdown != null && (
          <p className="text-sm text-cocoa-3" aria-live="polite">
            رح نفتحلك واتساب خلال {countdown} ثواني…{" "}
            <button onClick={() => setCountdown(null)} className="font-semibold text-rose underline underline-offset-4">إلغاء</button>
          </p>
        )}
      </div>

      <div className="mt-8 w-full max-w-md rounded-[2rem] border border-dashed border-line bg-linen p-6 text-start">
        <ul className="space-y-2 text-sm">
          {order.items.map((i, n) => (
            <li key={n} className="flex justify-between gap-3">
              <span>
                {i.name} <span className="text-cocoa-3">{i.color ? `(${i.color.name})` : ""} ×{i.qty}</span>
                {i.note && <span className="block text-xs text-cocoa-3">✍️ {i.note}</span>}
              </span>
              <span className="tabular-nums">{formatPrice(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-dashed border-line pt-4 text-sm">
          <div className="flex justify-between"><span>{order.isPickup ? "الاستلام" : "التوصيل"} · {order.zoneName}</span><span className="tabular-nums">{order.deliveryFee ? formatPrice(order.deliveryFee) : "مجاني"}</span></div>
          {order.giftWrap && <div className="flex justify-between"><span>تغليف هدية</span><span className="tabular-nums">{formatPrice(order.giftWrapFee)}</span></div>}
          {order.discount > 0 && <div className="flex justify-between text-sage"><span>خصم {order.promoCode}</span><span className="tabular-nums">− {formatPrice(order.discount)}</span></div>}
          <div className="flex justify-between pt-2 text-lg font-bold"><span>الإجمالي (عند الاستلام)</span><span className="tabular-nums">{formatPrice(order.total)}</span></div>
        </div>
      </div>

      <Link to="/shop" className="btn btn-ghost mt-8">كمّلي التسوق</Link>
      <YarnBall className="pointer-events-none absolute -bottom-6 start-4 hidden size-24 opacity-70 md:block" color="#e3e9dc" />
    </section>
  );
}
