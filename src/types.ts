// ═══════════════════════════════════════════════════════════
// أنواع البيانات — نفس الشكل الذي سنستخدمه مع Supabase لاحقاً
// ═══════════════════════════════════════════════════════════

/** شكل الرسمة التي تمثّل القطعة إلى حين وصول الصور الحقيقية */
export type ArtKind =
  | "bag"
  | "pouch"
  | "earrings"
  | "necklace"
  | "bracelet"
  | "scrunchie"
  | "hoop"
  | "bookmark"
  | "coaster"
  | "keychain"
  | "giftbox"
  | "basket";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  art: ArtKind;
  tint: string; // لون خلفية البطاقة
}

export interface ColorOption {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  price: number; // بالشيكل
  compareAtPrice?: number;
  shortDescription: string;
  description: string;
  materials: string[];
  care: string;
  makingTime: string; // مدة التحضير
  art: ArtKind;
  colors: ColorOption[];
  sizes?: string[];
  personalizable: boolean;
  stock: number;
  badge?: "جديد" | "الأكثر طلباً" | "قطعة واحدة" | "إصدار محدود";
  featured: boolean;
  rating: number;
  reviewsCount: number;
  createdAt: string;
}

export interface Review {
  id: string;
  name: string;
  city: string;
  text: string;
  rating: number;
  productName: string;
}

export interface ProcessStep {
  id: string;
  title: string;
  text: string;
  icon: "sketch" | "thread" | "hands" | "gift";
}

export interface StoryMilestone {
  year: string;
  title: string;
  text: string;
}

export interface Region {
  id: string;
  name: string;
  fee: number;
  eta: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface SiteInfo {
  name: string;
  tagline: string;
  intro: string;
  whatsapp: string; // بالصيغة الدولية بدون +
  instagram: string;
  email: string;
  phone: string;
  city: string;
  hours: string;
  giftWrapPrice: number;
  freeDeliveryOver: number;
}

// ─── السلة والطلبات ───────────────────────────────────────

export interface CartItem {
  key: string; // productId + اللون + المقاس + التخصيص
  productId: string;
  slug: string;
  name: string;
  price: number;
  art: ArtKind;
  color: ColorOption;
  size?: string;
  note?: string;
  qty: number;
}

export interface ProductFilter {
  category?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "featured" | "new" | "price-asc" | "price-desc";
  inStockOnly?: boolean;
}

export interface OrderInput {
  name: string;
  phone: string;
  regionId: string;
  city: string;
  address: string;
  notes?: string;
  giftWrap: boolean;
  giftMessage?: string;
  items: CartItem[];
}

export interface Order extends OrderInput {
  id: string;
  number: string;
  subtotal: number;
  delivery: number;
  giftWrapFee: number;
  total: number;
  createdAt: string;
  payment: "cod";
}

export interface CustomRequestInput {
  pieceType: string;
  colors: string[];
  budget: string;
  deadline?: string;
  details: string;
  name: string;
  phone: string;
}

export interface ContactInput {
  name: string;
  phone: string;
  message: string;
}
