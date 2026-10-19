import { AnimatePresence, motion } from "motion/react";
import { Heart, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { categories } from "../data/categories";
import { useShop } from "../lib/store";
import type { Product } from "../types";
import { HangTag } from "./HangTag";
import { ProductArt } from "./ProductArt";
import { Price, Stars } from "./ui";

const badgeTone: Record<NonNullable<Product["badge"]>, string> = {
  "جديد": "bg-sage text-white",
  "الأكثر طلباً": "bg-rose text-white",
  "قطعة واحدة": "bg-cocoa text-cream",
  "إصدار محدود": "bg-gold text-white",
};

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add, toggleWish, isWished } = useShop();
  const [color, setColor] = useState(product.colors[0]);
  const [added, setAdded] = useState(false);
  const wished = isWished(product.id);
  const out = product.stock <= 0;
  const tint = categories.find((c) => c.slug === product.categorySlug)?.tint;
  const needsChoice = product.personalizable || (product.sizes?.length ?? 0) > 0;

  const quickAdd = (el: HTMLElement) => {
    add(product, { color, size: product.sizes?.[0], from: el });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col"
    >
      <div className="stitched relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-cream-2">
        <Link to={`/product/${product.slug}`} className="block size-full" aria-label={product.name}>
          <motion.div className="size-full" whileHover={{ scale: 1.06 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <ProductArt kind={product.art} color={color.hex} bg={tint} className="size-full" title={product.name} />
          </motion.div>
        </Link>

        <HangTag className="absolute -top-1 end-5 h-[4.5rem] w-12 transition-transform duration-500 group-hover:translate-y-1" />

        {product.badge && (
          <span className={`absolute start-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${badgeTone[product.badge]}`}>{product.badge}</span>
        )}
        {out && <span className="absolute inset-x-4 bottom-4 rounded-full bg-cream/90 py-2 text-center text-sm font-semibold backdrop-blur">نفدت الكمية — بنرجّعها قريباً</span>}

        <button
          onClick={() => toggleWish(product.id)}
          className="absolute start-4 bottom-4 grid size-10 place-items-center rounded-full bg-cream/90 backdrop-blur transition hover:scale-110"
          aria-label={wished ? "إزالة من المفضلة" : "إضافة للمفضلة"}
          aria-pressed={wished}
          hidden={out}
        >
          <motion.span key={String(wished)} initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 12 }}>
            <Heart className={`size-[18px] ${wished ? "fill-rose text-rose" : ""}`} />
          </motion.span>
        </button>

        {!out && (
          needsChoice ? (
            <Link
              to={`/product/${product.slug}`}
              className="absolute end-4 bottom-4 flex h-10 items-center gap-1.5 rounded-full bg-cocoa px-4 text-sm font-semibold text-cream transition md:translate-y-14 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
            >
              {product.personalizable ? "خصّصيها" : "اختاري"}
            </Link>
          ) : (
            <button
              onClick={(e) => quickAdd(e.currentTarget)}
              className="absolute end-4 bottom-4 flex h-10 items-center gap-1.5 overflow-hidden rounded-full bg-cocoa px-4 text-sm font-semibold text-cream transition md:translate-y-14 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus:translate-y-0 md:focus:opacity-100"
              aria-label={`إضافة ${product.name} للسلة`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={String(added)} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} className="flex items-center gap-1.5">
                  {added ? "انضافت 🤍" : (<><Plus className="size-4" /> للسلة</>)}
                </motion.span>
              </AnimatePresence>
            </button>
          )
        )}
      </div>

      <div className="flex flex-1 flex-col px-1 pt-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
          <h3 className="font-semibold leading-6">
            <Link to={`/product/${product.slug}`} className="hover:text-rose">{product.name}</Link>
          </h3>
          <Price value={product.price} compareAt={product.compareAtPrice} className="shrink-0" />
        </div>
        <p className="mt-1 line-clamp-1 text-sm text-cocoa-3">{product.shortDescription}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5" role="radiogroup" aria-label="اللون">
            {product.colors.slice(0, 5).map((c) => (
              <button
                key={c.name}
                role="radio"
                aria-checked={c.name === color.name}
                aria-label={c.name}
                title={c.name}
                onClick={() => setColor(c)}
                className={`size-5 rounded-full border-2 transition ${c.name === color.name ? "scale-110 border-cocoa" : "border-cream shadow-[0_0_0_1px_var(--color-line)]"}`}
                style={{ background: c.hex }}
              />
            ))}
          </div>
          <span className="hidden items-center gap-1 text-xs text-cocoa-3 sm:flex">
            <Stars value={product.rating} size={12} /> ({product.reviewsCount})
          </span>
        </div>
      </div>
    </motion.article>
  );
}
