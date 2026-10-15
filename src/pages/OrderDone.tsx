import { motion } from "motion/react";
import { Printer } from "lucide-react";
import { useLocation } from "react-router";
import { RotatingStamp } from "../components/Decor";
import { Button, EmptyState } from "../components/ui";
import { formatDate, useDocumentTitle } from "../lib/hooks";
import { useShop } from "../lib/store";
import type { Order } from "../types";

function readOrder(state: unknown): Order | null {
  if (state && typeof state === "object" && "number" in state) return state as Order;
  try {
    const raw = sessionStorage.getItem("tareq.lastOrder");
    return raw ? (JSON.parse(raw) as Order) : null;
  } catch {
    return null;
  }
}

export default function OrderDone() {
  useDocumentTitle("إيصال الطلب");
  const { state } = useLocation();
  const { money } = useShop();
  const order = readOrder(state);

  if (!order) return <EmptyState title="لا طلب حديث." text="يظهر إيصال طلبك هنا مباشرة بعد إتمام الطلب." action={<Button to="/shop">تصفّح المتجر</Button>} />;

  return (
    <div className="wrap py-12 md:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="label text-thread">استلمنا طلبك</p>
        <h1 className="mt-3 font-display text-[2.6rem] leading-tight md:text-[3.8rem]">
          شكراً لك، <em className="text-thread not-italic">{order.details.name.split(" ")[0]}</em>.
        </h1>
        <p className="mt-4 text-lg text-ink-2">
          قطعك الآن تُكوى وتُرقّم وتُطوى بورق الباترون. نسخة من هذا الإيصال في طريقها إلى {order.details.email}.
        </p>
      </div>

      <motion.div
        initial={{ y: 60, opacity: 0, rotate: -2 }}
        animate={{ y: 0, opacity: 1, rotate: -0.6 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto mt-12 max-w-xl"
      >
        {/* perforated top edge */}
        <div className="h-3 bg-[radial-gradient(circle_at_6px_0,transparent_5px,var(--color-tissue)_5.5px)] bg-[length:12px_12px]" />
        <div className="bg-tissue bg-ruled px-6 pb-8 pt-4 shadow-[0_30px_60px_-30px_#1e1c1966] md:px-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-display text-2xl font-bold">Tareq Project</p>
              <p className="label text-ink-3">إيصال الطلب</p>
            </div>
            <div className="text-left font-mono text-sm">
              <p className="font-bold">{order.number}</p>
              <p className="text-ink-3">{formatDate(order.placedAt)}</p>
            </div>
          </div>
          <table className="mt-6 w-full text-sm">
            <tbody>
              {order.lines.map((l) => (
                <tr key={l.key} className="align-top">
                  <td className="py-1.5 pl-2 font-mono">{l.qty}×</td>
                  <td className="py-1.5">
                    {l.name}
                    <span className="block text-xs text-ink-3">
                      {l.colorway} · {l.size}
                    </span>
                  </td>
                  <td className="py-1.5 text-left font-mono">{money(l.price * l.qty)}</td>
                </tr>
              ))}
              <tr className="border-t border-dashed border-ink/30">
                <td />
                <td className="pt-3">الشحن ({order.details.delivery === "express" ? "سريع" : order.details.delivery === "collect" ? "استلام" : "عادي"})</td>
                <td className="pt-3 text-left font-mono">{order.shipping ? money(order.shipping) : "مجاني"}</td>
              </tr>
              <tr>
                <td />
                <td className="py-1 font-bold">الإجمالي</td>
                <td className="py-1 text-left font-mono font-bold">{money(order.total)}</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-6 grid gap-4 border-t border-dashed border-ink/30 pt-5 text-sm sm:grid-cols-2">
            <div>
              <p className="label text-ink-3">يُرسل إلى</p>
              <p className="mt-1">
                {order.details.name}
                <br />
                {order.details.delivery === "collect" ? "استلام من المحلّ" : `${order.details.address}، ${order.details.city}، ${order.details.country}`}
              </p>
            </div>
            <div>
              <p className="label text-ink-3">الوصول المتوقّع</p>
              <p className="mt-1">{formatDate(order.eta, { weekday: "long", day: "numeric", month: "long" })}</p>
            </div>
          </div>
          {order.details.giftNote && <p className="mt-6 font-hand text-2xl text-chalk">«{order.details.giftNote}»</p>}
          <p className="mt-6 font-hand text-2xl text-thread">كُويت بعناية — مشغل بديا</p>
          <RotatingStamp text="رفو مدى الحياة · رفو مدى الحياة · " className="absolute -right-4 -top-10 h-24 w-24 text-thread/70 md:-right-10 md:top-auto md:bottom-6">
            <span className="font-display text-xl italic text-thread">✓</span>
          </RotatingStamp>
        </div>
      </motion.div>

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <Button onClick={() => window.print()} variant="paper">
          <Printer className="h-4 w-4" /> اطبع الإيصال
        </Button>
        <Button to="/journal/how-to-darn-a-jumper" variant="paper">
          تعلّم الرفو
        </Button>
        <Button to="/shop">تابع التصفّح</Button>
      </div>
    </div>
  );
}
