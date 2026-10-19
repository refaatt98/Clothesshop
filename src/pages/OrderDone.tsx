import { motion } from "motion/react";
import { Link, useParams } from "react-router";
import { regions } from "../data/site";
import { Bow, YarnBall } from "../components/Craft";
import { WhatsappIcon } from "../components/Icons";
import { YarnLoader } from "../components/Loader";
import { EmptyState } from "../components/ui";
import { getOrder, whatsappLink } from "../lib/api";
import { formatPrice } from "../lib/format";
import { useAsync, useTitle } from "../lib/hooks";
import type { Order } from "../types";

function orderMessage(o: Order): string {
  const region = regions.find((r) => r.id === o.regionId)?.name ?? "";
  const lines = [
    `مرحبا بَنان 🤍 هاد طلبي رقم ${o.number}`,
    "",
    ...o.items.map((i) => `• ${i.name} (${i.color.name}${i.size ? `، ${i.size}` : ""}) ×${i.qty}${i.note ? ` — تخصيص: ${i.note}` : ""}`),
    "",
    `الإجمالي: ${formatPrice(o.total)} (شامل التوصيل${o.giftWrap ? " والتغليف" : ""})`,
    `الاسم: ${o.name}`,
    `الجوال: ${o.phone}`,
    `العنوان: ${region} — ${o.city}، ${o.address}`,
  ];
  if (o.giftWrap && o.giftMessage) lines.push(`رسالة الكرت: ${o.giftMessage}`);
  if (o.notes) lines.push(`ملاحظات: ${o.notes}`);
  return lines.join("\n");
}

export default function OrderDone() {
  useTitle("تم الطلب");
  const { id = "" } = useParams();
  const { data: order, loading } = useAsync(() => getOrder(id), [id]);

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
      {/* علبة بتنربط بفيونكة */}
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
        رقم الطلب <b className="tabular-nums text-cocoa">{order.number}</b>. رح نتواصل معك على واتساب لنأكد التفاصيل، وبعدها بنبلّش نجهّز قطعك بحب.
      </p>

      <div className="mt-8 w-full max-w-md rounded-[2rem] border border-dashed border-line bg-linen p-6 text-start">
        <ul className="space-y-2 text-sm">
          {order.items.map((i) => (
            <li key={i.key} className="flex justify-between gap-3">
              <span>{i.name} <span className="text-cocoa-3">({i.color.name}) ×{i.qty}</span></span>
              <span className="tabular-nums">{formatPrice(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-dashed border-line pt-4 text-sm">
          <div className="flex justify-between"><span>التوصيل</span><span className="tabular-nums">{order.delivery ? formatPrice(order.delivery) : "مجاني"}</span></div>
          {order.giftWrap && <div className="flex justify-between"><span>تغليف هدية</span><span className="tabular-nums">{formatPrice(order.giftWrapFee)}</span></div>}
          <div className="flex justify-between pt-2 text-lg font-bold"><span>الإجمالي (عند الاستلام)</span><span className="tabular-nums">{formatPrice(order.total)}</span></div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href={whatsappLink(orderMessage(order))} target="_blank" rel="noreferrer" className="btn btn-primary">
          <WhatsappIcon className="size-5" /> أرسلي الطلب على واتساب
        </a>
        <Link to="/shop" className="btn btn-ghost">كمّلي التسوق</Link>
      </div>
      <p className="mt-3 text-xs text-cocoa-3">إرسال الطلب على واتساب بيسرّع التأكيد</p>

      <YarnBall className="pointer-events-none absolute -bottom-6 start-4 hidden size-24 opacity-70 md:block" color="#e3e9dc" />
    </section>
  );
}
