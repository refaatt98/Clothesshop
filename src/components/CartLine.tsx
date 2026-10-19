import { Minus, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { formatPrice } from "../lib/format";
import { useShop } from "../lib/store";
import type { CartItem } from "../types";
import { ProductMedia } from "./ProductMedia";

export function QtyStepper({ value, onChange, max = 20 }: { value: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-linen">
      <button type="button" onClick={() => onChange(Math.min(value + 1, max))} className="grid size-9 place-items-center rounded-full hover:bg-cream-2" aria-label="زيادة الكمية">
        <Plus className="size-4" />
      </button>
      <span className="w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value - 1)} className="grid size-9 place-items-center rounded-full hover:bg-cream-2" aria-label="إنقاص الكمية">
        <Minus className="size-4" />
      </button>
    </div>
  );
}

export function CartLine({ item, onNavigate }: { item: CartItem; onNavigate?: () => void }) {
  const { setQty, remove } = useShop();
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 60 }}
      className="flex gap-4 border-b border-dashed border-line py-4"
    >
      <Link to={`/product/${item.slug}`} onClick={onNavigate} className="block size-24 shrink-0 overflow-hidden rounded-2xl">
        <ProductMedia image={item.image} art={item.art} color={item.color.hex} className="size-full" alt={item.name} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/product/${item.slug}`} onClick={onNavigate} className="font-semibold leading-6 hover:text-rose">
            {item.name}
          </Link>
          <button onClick={() => remove(item.key)} className="grid size-8 shrink-0 place-items-center rounded-full text-cocoa-3 hover:bg-rose-soft hover:text-cocoa" aria-label={`حذف ${item.name}`}>
            <Trash2 className="size-4" />
          </button>
        </div>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-cocoa-3">
          <span className="inline-flex items-center gap-1">
            <span className="size-3 rounded-full border border-line" style={{ background: item.color.hex }} />
            {item.color.name}
          </span>
          {item.size && <span>· {item.size}</span>}
        </p>
        {item.note && <p className="mt-1 truncate text-xs text-cocoa-2">✎ {item.note}</p>}
        <div className="mt-auto flex items-center justify-between pt-2">
          <QtyStepper value={item.qty} onChange={(v) => setQty(item.key, v)} />
          <span className="font-semibold tabular-nums">{formatPrice(item.price * item.qty)}</span>
        </div>
      </div>
    </motion.li>
  );
}
