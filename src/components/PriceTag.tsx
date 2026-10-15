import { useShop } from "../lib/store";
import { pad } from "../lib/hooks";

/**
 * A card swing-tag on a string: price on the front, edition number below.
 * Used on product cards and on the hero.
 */
export function PriceTag({
  price,
  edition,
  className = "",
  swing = true,
}: {
  price: number;
  edition?: { made: number; of: number };
  className?: string;
  swing?: boolean;
}) {
  const { money } = useShop();
  return (
    <div className={`pointer-events-none origin-top ${swing ? "animate-swing" : ""} ${className}`}>
      <svg viewBox="0 0 40 30" className="mx-auto -mb-1 h-6 w-8" aria-hidden>
        <path d="M20 0 C18 10 22 18 20 30" stroke="#8a8378" strokeWidth="1" fill="none" />
      </svg>
      <div className="relative rounded-[4px] bg-[#f3e9d2] px-3 pb-2 pt-4 text-center shadow-[0_6px_14px_-8px_#1e1c1966] ring-1 ring-[#d8c49c]">
        <span className="absolute left-1/2 top-1.5 h-2 w-2 -translate-x-1/2 rounded-full bg-paper ring-1 ring-[#bfa877]" />
        <p className="font-mono text-[0.95rem] font-bold leading-none text-ink">{money(price)}</p>
        {edition && (
          <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-wider text-ink-3">
            رقم {pad(edition.made)}/{edition.of}
          </p>
        )}
      </div>
    </div>
  );
}
