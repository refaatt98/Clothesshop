// ═══════════════════════════════════════════════════════════
// طبقة البيانات — كل جلب أو إرسال بيمرّ من هون.
// لما نربط Supabase، بنغيّر هالملف بس وباقي الموقع ما بيتغيّر.
// ═══════════════════════════════════════════════════════════
import { categories } from "../data/categories";
import { products } from "../data/products";
import { faqs, processSteps, regions, reviews, site, story } from "../data/site";
import type {
  Category,
  ContactInput,
  CustomRequestInput,
  Faq,
  Order,
  OrderInput,
  ProcessStep,
  Product,
  ProductFilter,
  Region,
  Review,
  SiteInfo,
  StoryMilestone,
} from "../types";

/** تأخير بسيط يحاكي الشبكة */
const delay = <T,>(value: T, ms = 250): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));

// ─── المتجر ───────────────────────────────────────────────

export async function getSiteInfo(): Promise<SiteInfo> {
  return delay(site, 0);
}

export async function getCategories(): Promise<Category[]> {
  return delay(categories);
}

export async function getCategory(slug: string): Promise<Category | null> {
  return delay(categories.find((c) => c.slug === slug) ?? null);
}

export async function getProducts(filter: ProductFilter = {}): Promise<Product[]> {
  let list = [...products];
  const { category, q, minPrice, maxPrice, sort = "featured", inStockOnly } = filter;

  if (category) list = list.filter((p) => p.categorySlug === category);
  if (q?.trim()) {
    const term = q.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.shortDescription.toLowerCase().includes(term) ||
        p.materials.some((m) => m.toLowerCase().includes(term)),
    );
  }
  if (minPrice != null) list = list.filter((p) => p.price >= minPrice);
  if (maxPrice != null) list = list.filter((p) => p.price <= maxPrice);
  if (inStockOnly) list = list.filter((p) => p.stock > 0);

  switch (sort) {
    case "new":
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    default:
      list.sort((a, b) => Number(b.featured) - Number(a.featured) || b.reviewsCount - a.reviewsCount);
  }
  return delay(list);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return delay(products.filter((p) => p.featured).slice(0, limit));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return delay(products.find((p) => p.slug === slug) ?? null);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  return delay(products.filter((p) => ids.includes(p.id)));
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const same = products.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id);
  const others = products.filter((p) => p.categorySlug !== product.categorySlug && p.featured);
  return delay([...same, ...others].slice(0, limit));
}

export async function getPriceRange(): Promise<{ min: number; max: number }> {
  const prices = products.map((p) => p.price);
  return delay({ min: Math.min(...prices), max: Math.max(...prices) }, 0);
}

// ─── المحتوى ──────────────────────────────────────────────

export async function getReviews(): Promise<Review[]> {
  return delay(reviews);
}

export async function getProcessSteps(): Promise<ProcessStep[]> {
  return delay(processSteps);
}

export async function getStory(): Promise<StoryMilestone[]> {
  return delay(story);
}

export async function getFaqs(): Promise<Faq[]> {
  return delay(faqs);
}

export async function getRegions(): Promise<Region[]> {
  return delay(regions, 0);
}

// ─── الطلبات والنماذج ─────────────────────────────────────

const ORDERS_KEY = "banan:orders";

function readOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) ?? "[]") as Order[];
  } catch {
    return [];
  }
}

export function calcDelivery(subtotal: number, regionId: string): number {
  if (subtotal >= site.freeDeliveryOver) return 0;
  return regions.find((r) => r.id === regionId)?.fee ?? 0;
}

export async function createOrder(input: OrderInput): Promise<Order> {
  const subtotal = input.items.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = calcDelivery(subtotal, input.regionId);
  const giftWrapFee = input.giftWrap ? site.giftWrapPrice : 0;
  const id = crypto.randomUUID?.() ?? String(Date.now());
  const order: Order = {
    ...input,
    id,
    number: `BN-${Date.now().toString().slice(-6)}`,
    subtotal,
    delivery,
    giftWrapFee,
    total: subtotal + delivery + giftWrapFee,
    createdAt: new Date().toISOString(),
    payment: "cod",
  };
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...readOrders()].slice(0, 20)));
  } catch {
    /* التخزين غير متاح — لا مشكلة */
  }
  return delay(order, 700);
}

export async function getOrder(id: string): Promise<Order | null> {
  return delay(readOrders().find((o) => o.id === id) ?? null, 100);
}

export async function submitCustomRequest(input: CustomRequestInput): Promise<{ ok: true; ref: string }> {
  void input;
  return delay({ ok: true as const, ref: `CU-${Date.now().toString().slice(-5)}` }, 700);
}

export async function submitContact(input: ContactInput): Promise<{ ok: true }> {
  void input;
  return delay({ ok: true as const }, 600);
}

export async function subscribeNewsletter(email: string): Promise<{ ok: boolean }> {
  return delay({ ok: /\S+@\S+\.\S+/.test(email) }, 500);
}

// ─── مساعدات ──────────────────────────────────────────────

/** رابط واتساب برسالة جاهزة */
export function whatsappLink(message: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}
