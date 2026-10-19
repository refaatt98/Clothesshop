/**
 * THE ONLY DOOR TO DATA.
 * Every page reads and writes through these functions. Today they read the
 * mock files in src/data; when Supabase is connected, only this file changes —
 * keep the signatures and swap the bodies for supabase.from(...) calls.
 */
import { chapters } from "../data/chapters";
import { fabrics } from "../data/fabrics";
import { faqs, houseTimeline, legalDocs, makers, stores, wearerNotes } from "../data/house";
import { journal } from "../data/journal";
import { products } from "../data/products";
import type {
  CartLine,
  Chapter,
  CheckoutDetails,
  Fabric,
  Faq,
  JournalPost,
  LegalDoc,
  Maker,
  Order,
  Product,
  ProductQuery,
  Store,
  WearerNote,
} from "../types";
import { familyOf } from "./colour";

/** Simulated network latency so loading states are real during development. */
const wait = <T,>(value: T, ms = 220): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));

export const FREE_SHIPPING_FROM = 500; // ₪

const categoryWords: Record<string, string> = {
  outerwear: "معطف معاطف جاكيت جاكيتات",
  shirts: "قميص قمصان",
  knitwear: "تريكو كنزة صوف",
  tees: "تيشيرت تيشيرتات",
  trousers: "بنطال بناطيل",
  dresses: "فستان فساتين",
  skirts: "تنورة تنانير",
  accessories: "إكسسوارات حقيبة وشاح",
};

const deptWords: Record<string, string> = { women: "ستاتي نسائي نساء", men: "رجالي رجال", kids: "أطفال اطفال ولادي بناتي" };

/** Arabic-friendly matching: drop harakat/shadda, unify alef & ya/ta-marbuta forms. */
const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0640]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");

// ─── Products ──────────────────────────────────────────────────
export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  let list = [...products];
  const { category, dept, chapter, colourFamily, size, maxPrice, sort = "featured", q } = query;

  if (category && category !== "all") list = list.filter((p) => p.category === category);
  if (dept) list = list.filter((p) => p.departments.includes(dept));
  if (chapter) list = list.filter((p) => p.chapter === chapter);
  if (colourFamily) list = list.filter((p) => p.colorways.some((c) => familyOf(c.hex) === colourFamily));
  if (size) list = list.filter((p) => p.sizes.includes(size) && !p.soldOutSizes?.includes(size));
  if (maxPrice) list = list.filter((p) => p.price <= maxPrice);
  if (q) {
    const needle = normalise(q.trim());
    list = list.filter((p) =>
      normalise([p.name, p.line, p.category, categoryWords[p.category], ...p.departments.map((d) => deptWords[d]), p.composition, p.description, ...p.colorways.map((c) => c.name)].join(" ")).includes(needle),
    );
  }

  switch (sort) {
    case "new":
      list.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
      break;
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "slowest":
      list.sort((a, b) => b.makingHours - a.makingHours);
      break;
  }
  return wait(list);
}

export async function getProduct(slug: string): Promise<Product | null> {
  return wait(products.find((p) => p.slug === slug) ?? null);
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  return wait(slugs.map((s) => products.find((p) => p.slug === s)).filter(Boolean) as Product[], 120);
}

export async function getNewArrivals(limit = 6): Promise<Product[]> {
  return getProducts({ sort: "new" }).then((l) => l.slice(0, limit));
}

export async function searchProducts(q: string): Promise<Product[]> {
  if (!q.trim()) return wait([], 60);
  return getProducts({ q }).then((l) => l.slice(0, 6));
}

export async function getWearerNotes(slug: string): Promise<WearerNote[]> {
  return wait(wearerNotes.filter((n) => n.productSlug === slug));
}

// ─── Chapters & fabrics ────────────────────────────────────────
export async function getChapters(): Promise<Chapter[]> {
  return wait(chapters);
}

export async function getChapter(slug: string): Promise<Chapter | null> {
  return wait(chapters.find((c) => c.slug === slug) ?? null);
}

export async function getFabrics(): Promise<Fabric[]> {
  return wait(fabrics);
}

export async function getFabric(id: string): Promise<Fabric | null> {
  return wait(fabrics.find((f) => f.id === id) ?? null);
}

// ─── Journal ───────────────────────────────────────────────────
export async function getJournal(): Promise<JournalPost[]> {
  return wait([...journal].sort((a, b) => b.date.localeCompare(a.date)));
}

export async function getJournalPost(slug: string): Promise<JournalPost | null> {
  return wait(journal.find((j) => j.slug === slug) ?? null);
}

// ─── House ─────────────────────────────────────────────────────
export async function getStores(): Promise<Store[]> {
  return wait(stores);
}
export async function getFaqs(): Promise<Faq[]> {
  return wait(faqs);
}
export async function getMakers(): Promise<Maker[]> {
  return wait(makers);
}
export async function getHouseTimeline() {
  return wait(houseTimeline);
}
export async function getLegalDoc(slug: string): Promise<LegalDoc | null> {
  return wait(legalDocs.find((d) => d.slug === slug) ?? null);
}

// ─── Writes (forms) ────────────────────────────────────────────
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export async function subscribeToLetters(email: string): Promise<{ ok: true }> {
  if (!isEmail(email)) throw new Error("يبدو أن البريد الإلكتروني غير صحيح.");
  return wait({ ok: true as const }, 600);
}

export async function sendContactMessage(input: {
  name: string;
  email: string;
  topic: string;
  message: string;
}): Promise<{ ticket: string }> {
  if (!isEmail(input.email)) throw new Error("تأكّد من بريدك الإلكتروني من فضلك.");
  if (input.message.trim().length < 10) throw new Error("أخبرنا أكثر قليلاً — جملة واحدة على الأقل.");
  return wait({ ticket: "C-" + Math.floor(1000 + Math.random() * 9000) }, 700);
}

export async function requestMend(input: {
  name: string;
  email: string;
  piece: string;
  problem: string;
}): Promise<{ reference: string; labelSentTo: string }> {
  if (!isEmail(input.email)) throw new Error("تأكّد من بريدك الإلكتروني من فضلك.");
  return wait({ reference: "M-" + Math.floor(10000 + Math.random() * 89999), labelSentTo: input.email }, 800);
}

export async function bookFitting(input: {
  storeId: string;
  date: string;
  time: string;
  name: string;
  email: string;
}): Promise<{ confirmation: string }> {
  if (!isEmail(input.email)) throw new Error("تأكّد من بريدك الإلكتروني من فضلك.");
  return wait({ confirmation: "F-" + input.storeId.slice(0, 3).toUpperCase() + Math.floor(100 + Math.random() * 899) }, 700);
}

export async function placeOrder(lines: CartLine[], details: CheckoutDetails): Promise<Order> {
  if (!lines.length) throw new Error("الراف فارغ.");
  const priced = lines.map((l) => {
    const p = products.find((x) => x.slug === l.slug)!;
    return { ...l, name: p.name, price: p.price };
  });
  const subtotal = priced.reduce((s, l) => s + l.price * l.qty, 0);
  const shipping =
    details.delivery === "collect" ? 0 : details.delivery === "express" ? 40 : subtotal >= FREE_SHIPPING_FROM ? 0 : 20;
  const eta = new Date(Date.now() + (details.delivery === "express" ? 3 : 7) * 86400000);
  const order: Order = {
    number: "OU-" + String(Math.floor(100000 + Math.random() * 899999)),
    placedAt: new Date().toISOString(),
    lines: priced,
    subtotal,
    shipping,
    total: subtotal + shipping,
    details,
    eta: eta.toISOString(),
  };
  return wait(order, 1100);
}
