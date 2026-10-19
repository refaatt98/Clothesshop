// رسائل واتساب جاهزة ومرتّبة
import { ORDER_STATUSES, type Order, type OrderStatus } from "../types";
import { formatPrice } from "./format";

const statusLabel = (s: OrderStatus) => ORDER_STATUSES.find((x) => x.id === s)?.label ?? s;

/** الرسالة اللي بتبعتها الزبونة للمتجر بعد الطلب */
export function orderMessageForStore(o: Order, siteUrl: string): string {
  const lines: string[] = [];
  lines.push(`🛍️ *طلب جديد من متجر بَنان*`);
  lines.push(`رقم الطلب: *${o.number}*`);
  lines.push("━━━━━━━━━━━━");
  o.items.forEach((i, n) => {
    const opts = [i.color?.name, i.size].filter(Boolean).join(" · ");
    lines.push(`${n + 1}. *${i.name}*${opts ? ` (${opts})` : ""}`);
    lines.push(`   ${i.qty} × ${formatPrice(i.price)} = ${formatPrice(i.qty * i.price)}`);
    if (i.note) lines.push(`   ✍️ التخصيص: ${i.note}`);
  });
  lines.push("━━━━━━━━━━━━");
  lines.push(`المجموع: ${formatPrice(o.subtotal)}`);
  lines.push(`${o.isPickup ? "الاستلام" : "التوصيل"}: ${o.deliveryFee ? formatPrice(o.deliveryFee) : "مجاني"}`);
  if (o.giftWrap) lines.push(`🎁 تغليف هدية: ${formatPrice(o.giftWrapFee)}`);
  if (o.discount) lines.push(`🏷️ خصم${o.promoCode ? ` (${o.promoCode})` : ""}: −${formatPrice(o.discount)}`);
  lines.push(`💰 *الإجمالي: ${formatPrice(o.total)}* (دفع عند الاستلام)`);
  lines.push("━━━━━━━━━━━━");
  lines.push(`👤 ${o.name}`);
  lines.push(`📞 ${o.phone}`);
  lines.push(o.isPickup ? `🏡 ${o.zoneName}` : `📍 ${o.zoneName} — ${o.city}، ${o.address}`);
  if (o.giftWrap && o.giftMessage) lines.push(`💌 رسالة الكرت: ${o.giftMessage}`);
  if (o.notes) lines.push(`📝 ملاحظات: ${o.notes}`);
  lines.push("");
  lines.push(`رابط الطلب: ${siteUrl}/order/${o.id}`);
  return lines.join("\n");
}

/** رسائل جاهزة من المتجر للزبونة حسب حالة الطلب */
export function statusMessageForCustomer(o: Order, status: OrderStatus = o.status): string {
  const first = o.name.split(" ")[0];
  const head = `مرحبا ${first} 🤍\nمعك متجر بَنان بخصوص طلبك *${o.number}*`;
  const map: Partial<Record<OrderStatus, string>> = {
    new: `${head}\nوصلنا طلبك، شكراً إلك! رح نأكده معك هلأ.`,
    pending: `${head}\nبس بدنا نأكد معك التفاصيل قبل ما نبلّش: الإجمالي ${formatPrice(o.total)}${o.isPickup ? "" : ` والتوصيل لـ ${o.city}`}. كله تمام؟`,
    confirmed_whatsapp: `${head}\nتم تأكيد طلبك ✅ رح نبلّش نجهّزه بحب.`,
    preparing: `${head}\nطلبك قيد التجهيز هلأ 🧶 بنبعتلك أول ما يطلع.`,
    out_for_delivery: `${head}\nطلبك طلع مع التوصيل 🚚 جهّزي ${formatPrice(o.total)} للمندوب.`,
    delivered: `${head}\nإن شاء الله وصلك الطلب وعجبك 🫶🏼 بنحب نسمع رأيك!`,
    failed_attempt: `${head}\nالمندوب حاول يوصلك وما قدر 😔 احكيلنا أي وقت بناسبك.`,
    pickup: `${head}\nطلبك جاهز للاستلام من البيت 🏡 احكيلنا أي وقت بناسبك.`,
    cancelled: `${head}\nتم إلغاء الطلب. إذا في أي سؤال إحنا هون.`,
  };
  return map[status] ?? `${head}\nحالة الطلب: ${statusLabel(status)}`;
}
