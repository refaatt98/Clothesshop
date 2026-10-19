// ═══════════════════════════════════════════════════════════
// طبقة البيانات — كل جلب أو إرسال بيمرّ من هون (Supabase)
// ═══════════════════════════════════════════════════════════
import { processSteps, siteDefaults, story } from "../data/site";
import type {
  Category,
  ContactInput,
  CustomRequest,
  CustomRequestInput,
  DeliveryZone,
  Faq,
  GalleryItem,
  Message,
  Order,
  OrderInput,
  OrderStatus,
  ProcessStep,
  Product,
  ProductFilter,
  PromoCode,
  PromoResult,
  Review,
  SiteInfo,
  StoryMilestone,
} from "../types";
import { supabase } from "./supabase";

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function check<T>(res: { data: T; error: { message: string } | null }): NonNullable<T> {
  if (res.error) throw new Error(translateError(res.error.message));
  return (res.data ?? []) as NonNullable<T>;
}

function translateError(msg: string): string {
  if (/duplicate key.*slug/i.test(msg)) return "الرابط (slug) مستعمل قبل، اختاري واحد تاني";
  if (/duplicate key.*code/i.test(msg)) return "الكود موجود قبل";
  if (/row-level security|permission denied/i.test(msg)) return "ما عندك صلاحية لهالعملية";
  if (/Failed to fetch|NetworkError/i.test(msg)) return "مشكلة بالاتصال، جرّبي كمان مرة";
  return msg;
}

// كاش بسيط للبيانات اللي ما بتتغيّر كتير
const cache = new Map<string, { at: number; value: Promise<unknown> }>();
function cached<T>(key: string, fn: () => Promise<T>, ttl = 60_000): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.value as Promise<T>;
  const value = fn().catch((e) => {
    cache.delete(key);
    throw e;
  });
  cache.set(key, { at: Date.now(), value });
  return value;
}
export function clearCache() {
  cache.clear();
}

// ─── تحويل الصفوف ─────────────────────────────────────────
const num = (v: unknown) => (v == null ? 0 : Number(v));

export const mapCategory = (r: Row): Category => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  description: r.description ?? "",
  imageUrl: r.image_url,
  art: r.art,
  tint: r.tint,
  sort: r.sort,
  active: r.active,
});

export const mapProduct = (r: Row): Product => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  categoryId: r.category_id,
  price: num(r.price),
  compareAtPrice: r.compare_at_price == null ? null : num(r.compare_at_price),
  shortDescription: r.short_description ?? "",
  description: r.description ?? "",
  materials: r.materials ?? [],
  care: r.care ?? "",
  makingTime: r.making_time ?? "",
  art: r.art,
  images: r.images ?? [],
  colors: Array.isArray(r.colors) && r.colors.length ? r.colors : [{ name: "افتراضي", hex: "#efe2cf" }],
  sizes: r.sizes ?? [],
  personalizable: r.personalizable,
  stock: r.stock,
  badge: r.badge,
  featured: r.featured,
  active: r.active,
  rating: num(r.rating),
  reviewsCount: r.reviews_count,
  sort: r.sort,
  createdAt: r.created_at,
});

const productToRow = (p: Partial<Product>): Row => {
  const r: Row = {};
  const map: [keyof Product, string][] = [
    ["slug", "slug"], ["name", "name"], ["categoryId", "category_id"], ["price", "price"], ["compareAtPrice", "compare_at_price"],
    ["shortDescription", "short_description"], ["description", "description"], ["materials", "materials"], ["care", "care"],
    ["makingTime", "making_time"], ["art", "art"], ["images", "images"], ["colors", "colors"], ["sizes", "sizes"],
    ["personalizable", "personalizable"], ["stock", "stock"], ["badge", "badge"], ["featured", "featured"], ["active", "active"], ["sort", "sort"],
  ];
  for (const [k, col] of map) if (p[k] !== undefined) r[col] = p[k];
  return r;
};

const mapReview = (r: Row): Review => ({
  id: r.id,
  productId: r.product_id,
  productName: r.products?.name ?? null,
  productSlug: r.products?.slug ?? null,
  name: r.name,
  city: r.city,
  text: r.text,
  rating: r.rating,
  imageUrl: r.image_url,
  approved: r.approved,
  showOnHome: r.show_on_home,
  createdAt: r.created_at,
});

const mapGallery = (r: Row): GalleryItem => ({
  id: r.id,
  type: r.type,
  url: r.url,
  posterUrl: r.poster_url,
  caption: r.caption,
  sort: r.sort,
  active: r.active,
});

const mapFaq = (r: Row): Faq => ({ id: r.id, question: r.question, answer: r.answer, sort: r.sort, active: r.active });

const mapZone = (r: Row): DeliveryZone => ({
  id: r.id,
  name: r.name,
  fee: num(r.fee),
  eta: r.eta,
  isPickup: r.is_pickup,
  active: r.active,
  sort: r.sort,
});

const mapSettings = (r: Row): SiteInfo => ({
  name: r.store_name,
  tagline: r.tagline,
  intro: r.intro,
  whatsapp: r.whatsapp,
  instagram: r.instagram,
  email: r.email,
  phone: r.phone,
  hours: r.hours,
  giftWrapPrice: num(r.gift_wrap_price),
  freeDeliveryOver: r.free_delivery_over == null ? null : num(r.free_delivery_over),
  announcements: r.announcements ?? [],
});

/** شكل الطلب من get_order أو من جدول orders */
export const mapOrder = (r: Row): Order => ({
  id: r.id,
  number: r.number,
  status: r.status,
  name: r.name ?? r.customer_name,
  phone: r.phone,
  zoneName: r.zone_name,
  isPickup: r.is_pickup,
  city: r.city,
  address: r.address,
  notes: r.notes,
  giftWrap: r.gift_wrap,
  giftMessage: r.gift_message,
  subtotal: num(r.subtotal),
  deliveryFee: num(r.delivery_fee),
  giftWrapFee: num(r.gift_wrap_fee),
  discount: num(r.discount),
  promoCode: r.promo_code,
  total: num(r.total),
  createdAt: r.created_at,
  adminNote: r.admin_note,
  updatedAt: r.updated_at,
  items: (r.items ?? r.order_items ?? []).map((i: Row) => ({
    id: i.id,
    productId: i.product_id,
    name: i.name,
    price: num(i.price),
    qty: i.qty,
    color: i.color,
    size: i.size,
    note: i.note,
    image: i.image,
    art: i.art,
  })),
});

const mapPromo = (r: Row): PromoCode => ({
  id: r.id,
  code: r.code,
  type: r.type,
  value: num(r.value),
  minOrder: num(r.min_order),
  maxUses: r.max_uses,
  usedCount: r.used_count,
  startsAt: r.starts_at,
  expiresAt: r.expires_at,
  active: r.active,
  note: r.note,
  createdAt: r.created_at,
});

// ═══ المتجر (عام) ════════════════════════════════════════

export async function getSiteInfo(): Promise<SiteInfo> {
  return cached("settings", async () => {
    const { data, error } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
    if (error || !data) return siteDefaults;
    return mapSettings(data);
  });
}

export async function getCategories(): Promise<Category[]> {
  return cached("categories", async () =>
    check(await supabase.from("categories").select("*").eq("active", true).order("sort")).map(mapCategory),
  );
}

export async function getProducts(filter: ProductFilter = {}): Promise<Product[]> {
  const { category, q, minPrice, maxPrice, sort = "featured", inStockOnly } = filter;
  let query = supabase.from("products").select("*").eq("active", true);
  if (category) {
    const cat = (await getCategories()).find((c) => c.slug === category);
    if (!cat) return [];
    query = query.eq("category_id", cat.id);
  }
  if (q?.trim()) {
    const t = q.trim().replace(/[%,()]/g, " ");
    query = query.or(`name.ilike.%${t}%,short_description.ilike.%${t}%,description.ilike.%${t}%`);
  }
  if (minPrice != null) query = query.gte("price", minPrice);
  if (maxPrice != null) query = query.lte("price", maxPrice);
  if (inStockOnly) query = query.gt("stock", 0);
  switch (sort) {
    case "new":
      query = query.order("created_at", { ascending: false });
      break;
    case "price-asc":
      query = query.order("price");
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query.order("featured", { ascending: false }).order("sort");
  }
  return check(await query).map(mapProduct);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return check(await supabase.from("products").select("*").eq("active", true).eq("featured", true).order("sort").limit(limit)).map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data } = await supabase.from("products").select("*").eq("slug", slug).eq("active", true).maybeSingle();
  return data ? mapProduct(data) : null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const valid = ids.filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  if (!valid.length) return [];
  return check(await supabase.from("products").select("*").in("id", valid).eq("active", true)).map(mapProduct);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const same = product.categoryId
    ? check(await supabase.from("products").select("*").eq("active", true).eq("category_id", product.categoryId).neq("id", product.id).limit(limit)).map(mapProduct)
    : [];
  if (same.length >= limit) return same;
  const more = check(await supabase.from("products").select("*").eq("active", true).eq("featured", true).neq("id", product.id).limit(limit)).map(mapProduct);
  return [...same, ...more.filter((m) => !same.some((s) => s.id === m.id))].slice(0, limit);
}

// ─── المحتوى ──────────────────────────────────────────────

export async function getHomeReviews(): Promise<Review[]> {
  return check(
    await supabase.from("reviews").select("*, products(name, slug)").eq("approved", true).eq("show_on_home", true).order("created_at", { ascending: false }).limit(20),
  ).map(mapReview);
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  return check(
    await supabase.from("reviews").select("*, products(name, slug)").eq("approved", true).eq("product_id", productId).order("created_at", { ascending: false }).limit(30),
  ).map(mapReview);
}

export async function submitReview(input: { productId: string; name: string; city?: string; text: string; rating: number }): Promise<void> {
  check(
    await supabase.from("reviews").insert({
      product_id: input.productId,
      name: input.name.trim().slice(0, 60),
      city: input.city?.trim().slice(0, 40) || null,
      text: input.text.trim().slice(0, 1000),
      rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    }),
  );
}

export async function getGallery(): Promise<GalleryItem[]> {
  return cached("gallery", async () => check(await supabase.from("gallery").select("*").eq("active", true).order("sort")).map(mapGallery));
}

export async function getFaqs(): Promise<Faq[]> {
  return check(await supabase.from("faqs").select("*").eq("active", true).order("sort")).map(mapFaq);
}

export async function getZones(): Promise<DeliveryZone[]> {
  return check(await supabase.from("delivery_zones").select("*").eq("active", true).order("sort")).map(mapZone);
}

export async function getProcessSteps(): Promise<ProcessStep[]> {
  return processSteps;
}

export async function getStory(): Promise<StoryMilestone[]> {
  return story;
}

// ─── الطلبات والنماذج ─────────────────────────────────────

export function calcDelivery(subtotal: number, zone: DeliveryZone | undefined, site: SiteInfo): number {
  if (!zone || zone.isPickup) return 0;
  if (site.freeDeliveryOver != null && subtotal >= site.freeDeliveryOver) return 0;
  return zone.fee;
}

export async function validatePromo(code: string, subtotal: number, zoneId?: string): Promise<PromoResult> {
  const data = check(await supabase.rpc("validate_promo", { p_code: code, p_subtotal: subtotal, p_zone_id: zoneId ?? null })) as Row;
  return { valid: data.valid, discount: num(data.discount), freeDelivery: data.free_delivery, message: data.message, code: data.code };
}

export async function createOrder(input: OrderInput): Promise<Order> {
  const payload = {
    name: input.name,
    phone: input.phone,
    zone_id: input.zoneId,
    city: input.city,
    address: input.address,
    notes: input.notes,
    gift_wrap: input.giftWrap,
    gift_message: input.giftMessage,
    promo_code: input.promoCode,
    items: input.items.map((i) => ({ product_id: i.productId, qty: i.qty, color: i.color, size: i.size, note: i.note })),
  };
  const data = check(await supabase.rpc("place_order", { payload })) as Row;
  return mapOrder(data);
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await supabase.rpc("get_order", { p_id: id });
  return data ? mapOrder(data as Row) : null;
}

export async function submitCustomRequest(input: CustomRequestInput): Promise<{ ok: true; ref: string }> {
  const ref = check(await supabase.rpc("submit_custom_request", { payload: input })) as string;
  return { ok: true, ref };
}

export async function submitContact(input: ContactInput): Promise<{ ok: true }> {
  check(await supabase.from("messages").insert({ name: input.name.trim(), phone: input.phone.trim() || null, message: input.message.trim() }));
  return { ok: true };
}

export async function subscribeNewsletter(email: string): Promise<{ ok: boolean }> {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false };
  const { error } = await supabase.from("subscribers").insert({ email: email.trim().toLowerCase() });
  return { ok: !error || /duplicate/i.test(error.message) };
}

// ─── مساعدات ──────────────────────────────────────────────

export function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

/** رقم الزبونة بصيغة دولية لواتساب */
export function customerWhatsapp(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) return `972${d.slice(1)}`;
  return d;
}

// ═══ لوحة الإدارة ════════════════════════════════════════

export async function adminExists(): Promise<boolean> {
  const { data } = await supabase.rpc("admin_exists");
  return !!data;
}

export async function isAdmin(): Promise<boolean> {
  const { data } = await supabase.rpc("is_admin");
  return !!data;
}

export async function adminSignIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(/Invalid login/i.test(error.message) ? "الإيميل أو كلمة السر غلط" : /not confirmed/i.test(error.message) ? "لازم تأكدي الإيميل أول (شوفي بريدك)" : error.message);
}

export async function adminSignUp(email: string, password: string): Promise<{ needsConfirm: boolean }> {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
  if (error) throw new Error(error.message);
  return { needsConfirm: !data.session };
}

export async function adminSignOut() {
  await supabase.auth.signOut();
}

// ─── الرفع (Cloudflare R2 أو Supabase Storage) ─────────────

async function compressImage(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 300_000) return file;
  try {
    const bmp = await createImageBitmap(file);
    const max = 1800;
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.86));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

export async function uploadMedia(original: File, folder: string, onProgress?: (p: number) => void): Promise<string> {
  const file = await compressImage(original);
  const { data, error } = await supabase.functions.invoke("media-upload", {
    body: { filename: file.name, contentType: file.type, folder },
  });
  if (error) throw new Error("ما قدرنا نجهّز الرفع: " + error.message);
  const info = data as { provider: "r2" | "supabase"; key: string; uploadUrl?: string; publicUrl?: string };

  if (info.provider === "r2" && info.uploadUrl && info.publicUrl) {
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", info.uploadUrl!);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
      xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`فشل الرفع على Cloudflare (${xhr.status})`)));
      xhr.onerror = () => reject(new Error("فشل الرفع على Cloudflare — تأكدي من إعدادات CORS للـ bucket"));
      xhr.send(file);
    });
    return info.publicUrl;
  }

  onProgress?.(0.3);
  const up = await supabase.storage.from("media").upload(info.key, file, { contentType: file.type, cacheControl: "31536000" });
  if (up.error) throw new Error("فشل الرفع: " + up.error.message);
  onProgress?.(1);
  return supabase.storage.from("media").getPublicUrl(info.key).data.publicUrl;
}

// ─── الإعدادات ────────────────────────────────────────────

export async function adminGetSettings(): Promise<SiteInfo> {
  return mapSettings(check(await supabase.from("settings").select("*").eq("id", 1).single()));
}

export async function adminSaveSettings(s: SiteInfo) {
  check(
    await supabase.from("settings").update({
      store_name: s.name,
      tagline: s.tagline,
      intro: s.intro,
      whatsapp: s.whatsapp.replace(/\D/g, ""),
      instagram: s.instagram.replace(/^@/, ""),
      email: s.email,
      phone: s.phone,
      hours: s.hours,
      gift_wrap_price: s.giftWrapPrice,
      free_delivery_over: s.freeDeliveryOver,
      announcements: s.announcements.filter((a) => a.trim()),
    }).eq("id", 1),
  );
  clearCache();
}

// ─── الطلبات ──────────────────────────────────────────────

export async function adminListOrders(opts: { status?: string; q?: string; limit?: number } = {}): Promise<Order[]> {
  let query = supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(opts.limit ?? 200);
  if (opts.status) query = query.eq("status", opts.status);
  if (opts.q?.trim()) {
    const t = opts.q.trim().replace(/[%,()]/g, " ");
    query = query.or(`customer_name.ilike.%${t}%,phone.ilike.%${t}%,number.ilike.%${t}%,city.ilike.%${t}%`);
  }
  return check(await query).map(mapOrder);
}

export async function adminGetOrder(id: string): Promise<{ order: Order; events: { status: OrderStatus; createdAt: string }[] } | null> {
  const { data } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (!data) return null;
  const ev = check(await supabase.from("order_events").select("*").eq("order_id", id).order("created_at"));
  return { order: mapOrder(data), events: ev.map((e: Row) => ({ status: e.status, createdAt: e.created_at })) };
}

export async function adminUpdateOrder(id: string, patch: { status?: OrderStatus; adminNote?: string | null }) {
  const row: Row = {};
  if (patch.status) row.status = patch.status;
  if (patch.adminNote !== undefined) row.admin_note = patch.adminNote;
  check(await supabase.from("orders").update(row).eq("id", id));
}

export async function adminDeleteOrder(id: string) {
  check(await supabase.from("orders").delete().eq("id", id));
}

export async function adminStats() {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const orders = check(await supabase.from("orders").select("id,status,total,created_at").gte("created_at", since.toISOString()));
  const [{ count: pendingReviews }, { count: unreadMessages }, { count: newCustom }, { count: lowStock }] = await Promise.all([
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("approved", false),
    supabase.from("messages").select("id", { count: "exact", head: true }).eq("read", false),
    supabase.from("custom_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true).lte("stock", 2),
  ]);
  return {
    orders: orders.map((o: Row) => ({ id: o.id, status: o.status as OrderStatus, total: num(o.total), createdAt: o.created_at as string })),
    pendingReviews: pendingReviews ?? 0,
    unreadMessages: unreadMessages ?? 0,
    newCustom: newCustom ?? 0,
    lowStock: lowStock ?? 0,
  };
}

export async function adminCountNewOrders(): Promise<number> {
  const { count } = await supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["new", "pending"]);
  return count ?? 0;
}

// ─── المنتجات ─────────────────────────────────────────────

export async function adminListProducts(): Promise<Product[]> {
  return check(await supabase.from("products").select("*").order("sort").order("created_at", { ascending: false })).map(mapProduct);
}

export async function adminGetProduct(id: string): Promise<Product | null> {
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  return data ? mapProduct(data) : null;
}

export async function adminSaveProduct(p: Partial<Product> & { id?: string }): Promise<Product> {
  const row = productToRow(p);
  const res = p.id
    ? await supabase.from("products").update(row).eq("id", p.id).select().single()
    : await supabase.from("products").insert(row).select().single();
  return mapProduct(check(res));
}

export async function adminDeleteProduct(id: string) {
  check(await supabase.from("products").delete().eq("id", id));
}

// ─── الأقسام ──────────────────────────────────────────────

export async function adminListCategories(): Promise<Category[]> {
  return check(await supabase.from("categories").select("*").order("sort")).map(mapCategory);
}

export async function adminSaveCategory(c: Partial<Category> & { id?: string }) {
  const row: Row = { slug: c.slug, name: c.name, description: c.description, image_url: c.imageUrl, art: c.art, tint: c.tint, sort: c.sort, active: c.active };
  Object.keys(row).forEach((k) => row[k] === undefined && delete row[k]);
  check(c.id ? await supabase.from("categories").update(row).eq("id", c.id) : await supabase.from("categories").insert(row));
  clearCache();
}

export async function adminDeleteCategory(id: string) {
  check(await supabase.from("categories").delete().eq("id", id));
  clearCache();
}

// ─── التوصيل ──────────────────────────────────────────────

export async function adminListZones(): Promise<DeliveryZone[]> {
  return check(await supabase.from("delivery_zones").select("*").order("sort")).map(mapZone);
}

export async function adminSaveZone(z: Partial<DeliveryZone> & { id?: string }) {
  const row: Row = { name: z.name, fee: z.fee, eta: z.eta, is_pickup: z.isPickup, active: z.active, sort: z.sort };
  Object.keys(row).forEach((k) => row[k] === undefined && delete row[k]);
  check(z.id ? await supabase.from("delivery_zones").update(row).eq("id", z.id) : await supabase.from("delivery_zones").insert(row));
}

export async function adminDeleteZone(id: string) {
  check(await supabase.from("delivery_zones").delete().eq("id", id));
}

// ─── أكواد الخصم ──────────────────────────────────────────

export async function adminListPromos(): Promise<PromoCode[]> {
  return check(await supabase.from("promo_codes").select("*").order("created_at", { ascending: false })).map(mapPromo);
}

export async function adminSavePromo(p: Partial<PromoCode> & { id?: string }) {
  const row: Row = {
    code: p.code?.trim().toUpperCase(),
    type: p.type,
    value: p.value,
    min_order: p.minOrder,
    max_uses: p.maxUses,
    starts_at: p.startsAt,
    expires_at: p.expiresAt,
    active: p.active,
    note: p.note,
  };
  Object.keys(row).forEach((k) => row[k] === undefined && delete row[k]);
  check(p.id ? await supabase.from("promo_codes").update(row).eq("id", p.id) : await supabase.from("promo_codes").insert(row));
}

export async function adminDeletePromo(id: string) {
  check(await supabase.from("promo_codes").delete().eq("id", id));
}

// ─── معرض الأعمال ─────────────────────────────────────────

export async function adminListGallery(): Promise<GalleryItem[]> {
  return check(await supabase.from("gallery").select("*").order("sort")).map(mapGallery);
}

export async function adminSaveGallery(g: Partial<GalleryItem> & { id?: string }) {
  const row: Row = { type: g.type, url: g.url, poster_url: g.posterUrl, caption: g.caption, sort: g.sort, active: g.active };
  Object.keys(row).forEach((k) => row[k] === undefined && delete row[k]);
  check(g.id ? await supabase.from("gallery").update(row).eq("id", g.id) : await supabase.from("gallery").insert(row));
  clearCache();
}

export async function adminDeleteGallery(id: string) {
  check(await supabase.from("gallery").delete().eq("id", id));
  clearCache();
}

// ─── الآراء ───────────────────────────────────────────────

export async function adminListReviews(): Promise<Review[]> {
  return check(await supabase.from("reviews").select("*, products(name, slug)").order("created_at", { ascending: false })).map(mapReview);
}

export async function adminSaveReview(r: Partial<Review> & { id?: string }) {
  const row: Row = {
    product_id: r.productId,
    name: r.name,
    city: r.city,
    text: r.text,
    rating: r.rating,
    image_url: r.imageUrl,
    approved: r.approved,
    show_on_home: r.showOnHome,
  };
  Object.keys(row).forEach((k) => row[k] === undefined && delete row[k]);
  check(r.id ? await supabase.from("reviews").update(row).eq("id", r.id) : await supabase.from("reviews").insert(row));
}

export async function adminDeleteReview(id: string) {
  check(await supabase.from("reviews").delete().eq("id", id));
}

// ─── الأسئلة الشائعة ──────────────────────────────────────

export async function adminListFaqs(): Promise<Faq[]> {
  return check(await supabase.from("faqs").select("*").order("sort")).map(mapFaq);
}

export async function adminSaveFaq(f: Partial<Faq> & { id?: string }) {
  const row: Row = { question: f.question, answer: f.answer, sort: f.sort, active: f.active };
  Object.keys(row).forEach((k) => row[k] === undefined && delete row[k]);
  check(f.id ? await supabase.from("faqs").update(row).eq("id", f.id) : await supabase.from("faqs").insert(row));
}

export async function adminDeleteFaq(id: string) {
  check(await supabase.from("faqs").delete().eq("id", id));
}

// ─── الطلبات الخاصة والرسائل ──────────────────────────────

export async function adminListCustomRequests(): Promise<CustomRequest[]> {
  return check(await supabase.from("custom_requests").select("*").order("created_at", { ascending: false })).map((r: Row) => ({
    id: r.id,
    ref: r.ref,
    pieceType: r.piece_type,
    colors: r.colors ?? [],
    budget: r.budget ?? "",
    deadline: r.deadline ?? undefined,
    details: r.details,
    name: r.name,
    phone: r.phone,
    status: r.status,
    createdAt: r.created_at,
  }));
}

export async function adminUpdateCustomRequest(id: string, status: CustomRequest["status"]) {
  check(await supabase.from("custom_requests").update({ status }).eq("id", id));
}

export async function adminDeleteCustomRequest(id: string) {
  check(await supabase.from("custom_requests").delete().eq("id", id));
}

export async function adminListMessages(): Promise<Message[]> {
  return check(await supabase.from("messages").select("*").order("created_at", { ascending: false })).map((r: Row) => ({
    id: r.id,
    name: r.name,
    phone: r.phone ?? "",
    message: r.message,
    read: r.read,
    createdAt: r.created_at,
  }));
}

export async function adminMarkMessage(id: string, read: boolean) {
  check(await supabase.from("messages").update({ read }).eq("id", id));
}

export async function adminDeleteMessage(id: string) {
  check(await supabase.from("messages").delete().eq("id", id));
}

export async function adminCountSubscribers(): Promise<number> {
  const { count } = await supabase.from("subscribers").select("id", { count: "exact", head: true });
  return count ?? 0;
}
