// رسائل واتساب جاهزة ومرتّبة
import type { Order, OrderStatus, StatusDef } from "../types";
import { formatPrice } from "./format";


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

/** رسالة من المتجر للزبونة حسب حالة الطلب — النص بيتعدّل من لوحة الإدارة ← حالات الطلب */
export function statusMessageForCustomer(o: Order, statuses: StatusDef[], status: OrderStatus = o.status): string {
  const def = statuses.find((s) => s.key === status);
  const first = o.name.split(" ")[0];
  const template = def?.customerMessage?.trim() || `مرحبا {name} 🤍\nمعك متجر بَنان بخصوص طلبك *{number}*\nحالة الطلب: ${def?.label ?? status}`;
  return template
    .replaceAll("{name}", first)
    .replaceAll("{number}", o.number)
    .replaceAll("{total}", formatPrice(o.total))
    .replaceAll("{city}", o.city || o.zoneName);
}
