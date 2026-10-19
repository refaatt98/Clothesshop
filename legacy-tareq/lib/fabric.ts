import type { Fabric } from "../types";

/** Weight in words people understand, instead of grams per square metre. */
export function weightWord(gsm: number) {
  if (gsm < 120) return "خفيف جداً";
  if (gsm < 220) return "خفيف";
  if (gsm < 330) return "متوسط";
  if (gsm < 420) return "ثقيل";
  return "ثقيل جداً";
}

/** Which time of year the cloth is best for. */
export function seasonWord(f: Pick<Fabric, "warmth" | "breath">) {
  if (f.warmth >= 4) return "مثالي للشتاء";
  if (f.breath >= 5) return "مثالي للصيف";
  return "لكل المواسم";
}
