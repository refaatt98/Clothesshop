// ═══════════════════════════════════════════════════════════
// أنواع البيانات — نفس شكل جداول Supabase (بأسماء camelCase)
// ═══════════════════════════════════════════════════════════

/** شكل الرسمة اللي بتمثّل القطعة إذا ما في صور */
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

export const ART_KINDS: { id: ArtKind; label: string }[] = [
  { id: "bag", label: "شنطة" },
  { id: "pouch", label: "محفظة" },
  { id: "earrings", label: "حلق" },
  { id: "necklace", label: "عقد" },
  { id: "bracelet", label: "إسوارة" },
  { id: "scrunchie", label: "سكرنشي" },
  { id: "hoop", label: "إطار تطريز" },
  { id: "bookmark", label: "فاصل كتاب" },
  { id: "coaster", label: "قاعدة كوب" },
  { id: "keychain", label: "تعليقة" },
  { id: "giftbox", label: "علبة هدية" },
  { id: "basket", label: "سلة" },
];

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  art: ArtKind;
  tint: string;
  sort: number;
  active: boolean;
}

export interface ColorOption {
  name: string;
  hex: string;
}

export const BADGES = ["جديد", "الأكثر طلباً", "قطعة واحدة", "إصدار محدود"] as const;
export type Badge = (typeof BADGES)[number];

export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId: string | null;
  price: number;
  compareAtPrice: number | null;
  shortDescription: string;
  description: string;
  materials: string[];
  care: string;
  makingTime: string;
  art: ArtKind;
  images: string[];
  colors: ColorOption[];
  sizes: string[];
  personalizable: boolean;
  stock: number;
  badge: Badge | null;
  featured: boolean;
  active: boolean;
  rating: number;
  reviewsCount: number;
  sort: number;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string | null;
  productName?: string | null;
  productSlug?: string | null;
  name: string;
  city: string | null;
  text: string;
  rating: number;
  imageUrl: string | null;
  approved: boolean;
  showOnHome: boolean;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  type: "image" | "video";
  url: string;
  posterUrl: string | null;
  caption: string | null;
  sort: number;
  active: boolean;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  sort: number;
  active: boolean;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  eta: string;
  isPickup: boolean;
  active: boolean;
  sort: number;
}

export interface SiteInfo {
  name: string;
  tagline: string;
  intro: string;
  whatsapp: string; // بالصيغة الدولية بدون +
  instagram: string;
  email: string;
  phone: string;
  hours: string;
  giftWrapPrice: number;
  freeDeliveryOver: number | null;
  announcements: string[];
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

// ─── السلة والطلبات ───────────────────────────────────────

export interface CartItem {
  key: string; // productId + اللون + المقاس + التخصيص
  productId: string;
  slug: string;
  name: string;
  price: number;
  art: ArtKind;
  image?: string;
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
  zoneId: string;
  city: string;
  address: string;
  notes?: string;
  giftWrap: boolean;
  giftMessage?: string;
  promoCode?: string;
  items: CartItem[];
}

export const ORDER_STATUSES = [
  { id: "new", label: "جديد", color: "#22c55e" },
  { id: "pending", label: "في انتظار التأكيد", color: "#f97316" },
  { id: "confirmed_whatsapp", label: "تم التأكيد على الواتساب", color: "#16a34a" },
  { id: "preparing", label: "قيد التجهيز", color: "#10b981" },
  { id: "out_for_delivery", label: "في التوصيل", color: "#0ea5e9" },
  { id: "delivered", label: "تم التسليم", color: "#ec4899" },
  { id: "failed_attempt", label: "محاولة تسليم غير مكتملة", color: "#a855f7" },
  { id: "pickup", label: "الإستلام من البيت", color: "#eab308" },
  { id: "cancelled", label: "ملغى", color: "#ef4444" },
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number]["id"];

export interface OrderItem {
  id?: string;
  productId?: string | null;
  name: string;
  price: number;
  qty: number;
  color: ColorOption | null;
  size: string | null;
  note: string | null;
  image: string | null;
  art: ArtKind | null;
}

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  name: string;
  phone: string;
  zoneName: string;
  isPickup: boolean;
  city: string;
  address: string;
  notes: string | null;
  giftWrap: boolean;
  giftMessage: string | null;
  subtotal: number;
  deliveryFee: number;
  giftWrapFee: number;
  discount: number;
  promoCode: string | null;
  total: number;
  createdAt: string;
  items: OrderItem[];
  adminNote?: string | null;
  updatedAt?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: "percent" | "fixed" | "free_delivery";
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  active: boolean;
  note: string | null;
  createdAt: string;
}

export interface PromoResult {
  valid: boolean;
  discount: number;
  freeDelivery: boolean;
  message: string;
  code: string | null;
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

export interface CustomRequest extends CustomRequestInput {
  id: string;
  ref: string;
  status: "new" | "in_progress" | "done" | "cancelled";
  createdAt: string;
}

export interface ContactInput {
  name: string;
  phone: string;
  message: string;
}

export interface Message extends ContactInput {
  id: string;
  read: boolean;
  createdAt: string;
}
