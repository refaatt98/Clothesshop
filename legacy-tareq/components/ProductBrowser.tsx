import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { departments, sizesIn } from "../lib/departments";
import type { Department, Product } from "../types";
import { ProductCard } from "./ProductCard";
import { SizeFilter } from "./SizeFilter";
import { Button, EmptyState, Skeleton } from "./ui";

/**
 * A grid of pieces with department tabs (ستاتي / رجالي / أطفال) and a size filter.
 * Used on season pages so people can narrow a whole season to what fits them.
 */
export function ProductBrowser({ products }: { products: Product[] | null }) {
  const [dept, setDept] = useState<Department | "all">("all");
  const [size, setSize] = useState<string | null>(null);

  const available = useMemo(() => departments.filter((d) => products?.some((p) => p.departments.includes(d.id))), [products]);
  const inDept = useMemo(() => (products ?? []).filter((p) => dept === "all" || p.departments.includes(dept)), [products, dept]);
  const sizes = useMemo(() => sizesIn(inDept), [inDept]);
  const shown = inDept.filter((p) => !size || (p.sizes.includes(size) && !p.soldOutSizes?.includes(size)));

  if (!products)
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5]" />
        ))}
      </div>
    );

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="القسم">
        {[{ id: "all" as const, name: "الكل" }, ...available].map((d) => {
          const count = d.id === "all" ? products.length : products.filter((p) => p.departments.includes(d.id)).length;
          return (
            <button
              key={d.id}
              role="tab"
              aria-selected={dept === d.id}
              onClick={() => {
                setDept(d.id);
                setSize(null);
              }}
              className={`rounded-full px-5 py-2.5 font-display text-lg ring-1 transition ${dept === d.id ? "bg-ink text-paper ring-ink" : "ring-line hover:ring-ink/40"}`}
            >
              {d.name} <span className="ms-1 font-mono text-xs opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <SizeFilter sizes={sizes} value={size} onChange={setSize} />
      </div>

      {shown.length === 0 ? (
        <EmptyState title="لا قطع بهذا المقاس هنا." text="جرّب مقاساً آخر، أو شاهد كل القطع." action={<Button onClick={() => setSize(null)}>اعرض كل المقاسات</Button>} />
      ) : (
        <motion.div layout className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {shown.map((p, i) => (
            <motion.div layout key={p.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
              <ProductCard product={p} index={i} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
