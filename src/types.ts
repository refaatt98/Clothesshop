// ─── Garments are drawn, not photographed ──────────────────────
export type GarmentKind =
  | "coat"
  | "jacket"
  | "shirt"
  | "camp-shirt"
  | "tee"
  | "knit"
  | "trousers"
  | "dress"
  | "skirt"
  | "scarf"
  | "tote";

export type FabricPattern = "solid" | "stripe" | "check" | "herringbone" | "rib" | "linen" | "denim";

export interface Colorway {
  name: string;
  hex: string;
  /** Secondary yarn colour used by stripes, checks, buttons */
  accent?: string;
  pattern: FabricPattern;
}

export type Category =
  | "outerwear"
  | "shirts"
  | "knitwear"
  | "tees"
  | "trousers"
  | "dresses"
  | "skirts"
  | "accessories";

export type Fit = "close" | "true" | "relaxed" | "generous";

export interface PassportStage {
  stage: "Fibre" | "Spun" | "Woven" | "Knitted" | "Dyed" | "Cut" | "Sewn" | "Pressed";
  place: string;
  maker: string;
  note: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** One-line poetic subtitle shown under the name */
  line: string;
  category: Category;
  garment: GarmentKind;
  chapter: string; // chapter slug
  fabricId: string;
  price: number; // USD
  colorways: Colorway[];
  sizes: string[];
  lowSizes?: string[]; // last few
  soldOutSizes?: string[];
  fit: Fit;
  composition: string;
  weight: string;
  makingHours: number;
  edition: { made: number; of: number };
  cutter: string;
  description: string;
  details: string[];
  care: string[];
  cutterNote: string;
  passport: PassportStage[];
  measurements: { label: string; cm: number }[];
  pairsWith: string[]; // product slugs
  isNew?: boolean;
  addedAt: string; // ISO date
}

export interface Chapter {
  slug: string;
  numeral: string;
  title: string;
  season: string;
  intro: string;
  story: string[];
  palette: { name: string; hex: string }[];
  moods: string[];
  note: string;
  status: "current" | "archive" | "upcoming";
}

export interface Fabric {
  id: string;
  name: string;
  mill: string;
  origin: string;
  fibre: string;
  gsm: number;
  hand: string;
  warmth: number; // 1-5
  breath: number; // 1-5
  drape: number; // 1-5
  age: number; // 1-5 — how beautifully it ages
  hex: string;
  accent?: string;
  pattern: FabricPattern;
  story: string;
}

export type JournalBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "quote"; text: string; by?: string }
  | { type: "note"; text: string };

export interface JournalPost {
  slug: string;
  title: string;
  kicker: string;
  date: string;
  readMins: number;
  author: string;
  excerpt: string;
  cover: { garment: GarmentKind; hex: string; accent?: string; pattern: FabricPattern; tint: string };
  body: JournalBlock[];
}

export interface WearerNote {
  productSlug: string;
  name: string;
  city: string;
  worn: string; // e.g. "3 winters"
  size: string;
  height: string;
  text: string;
  fitVerdict: "runs small" | "true to size" | "runs large";
}

export interface Store {
  id: string;
  city: string;
  country: string;
  address: string;
  hours: { days: string; time: string }[];
  phone: string;
  email: string;
  note: string;
  services: string[];
}

export interface Faq {
  id: string;
  group: "Orders" | "Sizing" | "Mending" | "Shipping" | "The House";
  q: string;
  a: string;
}

export interface Maker {
  name: string;
  role: string;
  years: number;
  city: string;
  quote: string;
}

export interface LegalDoc {
  slug: string;
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
}

// ─── Shop state ────────────────────────────────────────────────
export interface CartLine {
  key: string; // slug|colour|size
  slug: string;
  colorway: string;
  size: string;
  qty: number;
}

export interface ProductQuery {
  category?: Category | "all";
  chapter?: string;
  colourFamily?: string;
  size?: string;
  maxPrice?: number;
  sort?: "featured" | "new" | "price-asc" | "price-desc" | "slowest";
  q?: string;
}

export interface CheckoutDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postcode: string;
  delivery: "standard" | "express" | "collect";
  giftNote?: string;
  tissueWrap: boolean;
}

export interface Order {
  number: string;
  placedAt: string;
  lines: (CartLine & { name: string; price: number })[];
  subtotal: number;
  shipping: number;
  total: number;
  details: CheckoutDetails;
  eta: string;
}

export type Currency = "USD" | "EUR" | "JOD" | "AED" | "GBP";
