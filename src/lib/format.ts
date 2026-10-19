/** السعر بالشيكل: 120 ₪ */
export function formatPrice(value: number): string {
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })} ₪`;
}

/** عدد القطع بصيغة عربية سليمة */
export function piecesLabel(n: number): string {
  if (n === 1) return "قطعة واحدة";
  if (n === 2) return "قطعتان";
  if (n >= 3 && n <= 10) return `${n} قطع`;
  return `${n} قطعة`;
}
