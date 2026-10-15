import type { Category, Fit } from "../types";

export const topSizes = [
  { size: "XS", chest: [80, 86], waist: [62, 68] },
  { size: "S", chest: [86, 92], waist: [68, 74] },
  { size: "M", chest: [92, 100], waist: [74, 82] },
  { size: "L", chest: [100, 108], waist: [82, 90] },
  { size: "XL", chest: [108, 116], waist: [90, 98] },
  { size: "XXL", chest: [116, 124], waist: [98, 106] },
] as const;

export const bottomSizes = [
  { size: "26", waist: [64, 68] },
  { size: "28", waist: [68, 73] },
  { size: "30", waist: [73, 78] },
  { size: "32", waist: [78, 83] },
  { size: "34", waist: [83, 88] },
  { size: "36", waist: [88, 94] },
] as const;

export const fitNotes: Record<Fit, string> = {
  close: "Close — follows the body. Size up if between sizes.",
  true: "True — cut to the size chart, with ordinary ease.",
  relaxed: "Relaxed — roomy through the body, cut to layer.",
  generous: "Generous — deliberately big. Size down for a neater line.",
};

const usesWaist = (c: Category) => c === "trousers" || c === "skirts";

/** Suggest a size from body measurements. Returns null if we can't help. */
export function suggestSize(opts: { category: Category; chest?: number; waist?: number; fit: Fit; preference?: "neat" | "easy" }) {
  const { category, chest, waist, fit, preference = "easy" } = opts;
  if (category === "accessories") return { size: "One size", why: "One size fits all — it's a scarf or a bag." };

  if (usesWaist(category) && category === "trousers") {
    if (!waist) return null;
    let idx = bottomSizes.findIndex((s) => waist < s.waist[1]);
    if (idx === -1) idx = bottomSizes.length - 1;
    if (fit === "generous" && preference === "neat") idx = Math.max(0, idx - 1);
    return { size: bottomSizes[idx].size, why: `Your ${waist} cm waist sits in our ${bottomSizes[idx].size}.` };
  }

  const key = usesWaist(category) ? "waist" : "chest";
  const value = key === "waist" ? waist : chest;
  if (!value) return null;
  let idx = topSizes.findIndex((s) => value < s[key][1]);
  if (idx === -1) idx = topSizes.length - 1;
  let note = `Your ${value} cm ${key} sits in our ${topSizes[idx].size}.`;
  if (fit === "generous" && preference === "neat" && idx > 0) {
    idx -= 1;
    note += " It's cut generously, so we've taken you down one for a neater line.";
  }
  if (fit === "close" && preference === "easy" && idx < topSizes.length - 1) {
    idx += 1;
    note += " It's cut close, so we've gone up one for ease.";
  }
  return { size: topSizes[idx].size, why: note };
}
