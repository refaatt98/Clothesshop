import type { Department, Product } from "../types";

export const departments: { id: Department; name: string; tagline: string }[] = [
  { id: "women", name: "ستاتي", tagline: "فساتين، قمصان، معاطف وتريكو" },
  { id: "men", name: "رجالي", tagline: "معاطف، قمصان، بناطيل وتريكو" },
  { id: "kids", name: "أطفال", tagline: "من سنتين حتى 11 سنة" },
];

export const deptName = (d?: string | null) => departments.find((x) => x.id === d)?.name;

/** Every size we sell, in the order a person reads them. */
export const sizeOrder = ["2-3", "4-5", "6-7", "8-9", "10-11", "XS", "S", "M", "L", "XL", "XXL", "26", "28", "30", "32", "34", "36", "مقاس واحد"];

/** The sizes that actually exist in a list of products, in reading order. */
export const sizesIn = (list: Product[]) => {
  const set = new Set(list.flatMap((p) => p.sizes));
  return sizeOrder.filter((s) => set.has(s));
};

export const isKidsSize = (s: string) => /^\d+-\d+$/.test(s);
