import { motion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router";
import { useShop } from "../lib/store";
import { pad } from "../lib/hooks";
import type { Product } from "../types";
import { GarmentFlat, Hanger } from "./GarmentFlat";
import { PinHead } from "./ui";

export function ProductCard({ product, index, hanger = true }: { product: Product; index?: number; hanger?: boolean }) {
  const [cw, setCw] = useState(0);
  const { money, togglePin, isPinned, toast } = useShop();
  const c = product.colorways[cw];
  const pinned = isPinned(product.slug);
  const left = product.edition.of - product.edition.made;

  return (
    <article className="group relative">
      <Link
        to={`/piece/${product.slug}${cw ? `?c=${cw}` : ""}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-[6px] bg-tissue ring-1 ring-line transition-[box-shadow] duration-500 hover:ring-ink/30"
        aria-label={`${product.name}, ${money(product.price)}`}
      >
        <div className="absolute inset-0 bg-dots opacity-40" />
        {/* index number in the margin, like a pattern piece */}
        <span className="label absolute left-3 top-3 text-ink-3">{index !== undefined ? `Pc. ${pad(index + 1, 2)}` : product.category}</span>
        {product.isNew && (
          <span className="absolute left-3 top-8 rotate-[-4deg] rounded-sm border border-thread px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-thread">
            New in Ch.IV
          </span>
        )}

        <motion.div
          className="absolute inset-x-[12%] top-[6%] bottom-[10%] flex origin-top flex-col items-center"
          whileHover={{ rotate: [0, 2.2, -1.6, 0.8, 0] }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        >
          {hanger && product.garment !== "tote" && product.garment !== "scarf" && (
            <Hanger className="relative z-10 -mb-[9%] w-[44%] shrink-0" />
          )}
          <GarmentFlat
            kind={product.garment}
            hex={c.hex}
            accent={c.accent}
            pattern={c.pattern}
            className="h-full w-full transition-transform duration-700 ease-tailor group-hover:scale-[1.03]"
            title={`${product.name} in ${c.name}`}
          />
        </motion.div>

        {/* swing tag */}
        <div className="absolute bottom-3 right-3 origin-top-right rotate-[4deg] rounded-[3px] bg-[#f3e9d2] px-2.5 py-1.5 font-mono text-[0.8rem] font-bold text-ink shadow-[0_6px_14px_-8px_#1e1c1966] ring-1 ring-[#d8c49c] transition-transform duration-500 group-hover:rotate-[-2deg]">
          {money(product.price)}
        </div>
        {left <= 45 && (
          <span className="label absolute bottom-3 left-3 rounded-full bg-paper/90 px-2 py-1 text-[0.6rem] text-ink-2 ring-1 ring-line">
            {left} of {product.edition.of} left
          </span>
        )}
      </Link>

      <button
        onClick={() => {
          togglePin(product.slug);
          toast(pinned ? "Unpinned" : "Pinned to your board", product.name);
        }}
        className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-full bg-paper/80 ring-1 ring-line backdrop-blur transition hover:scale-110"
        aria-label={pinned ? `Unpin ${product.name}` : `Pin ${product.name}`}
        aria-pressed={pinned}
      >
        <PinHead className={`h-6 w-6 transition ${pinned ? "" : "grayscale opacity-40"}`} />
      </button>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-[1.15rem] leading-tight">
            <Link to={`/piece/${product.slug}`} className="hover:underline hover:decoration-thread hover:decoration-dashed hover:underline-offset-4">
              {product.name}
            </Link>
          </h3>
          <p className="mt-0.5 line-clamp-1 text-[0.85rem] text-ink-3">{product.line}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5" role="radiogroup" aria-label="Colour">
        {product.colorways.map((col, i) => (
          <button
            key={col.name}
            role="radio"
            aria-checked={i === cw}
            aria-label={col.name}
            title={col.name}
            onClick={() => setCw(i)}
            className={`h-5 w-5 rounded-full ring-1 ring-ink/20 ring-offset-2 ring-offset-paper transition ${i === cw ? "ring-2 ring-ink" : "hover:ring-ink/50"}`}
            style={{ background: col.hex }}
          />
        ))}
        <span className="label ml-2 truncate text-ink-3">{c.name}</span>
      </div>
    </article>
  );
}
