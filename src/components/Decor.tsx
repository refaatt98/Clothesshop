import { motion, useScroll, useTransform } from "motion/react";
import { useId, useRef, type ReactNode } from "react";

/** Laundry-label care symbols, drawn by hand. */
export function CareSymbol({ kind, className = "h-6 w-6" }: { kind: "wash" | "iron" | "dry" | "hand" | "noBleach" | "flat"; className?: string }) {
  const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      {kind === "wash" && (
        <>
          <path d="M4 9 L7 26 H25 L28 9" {...s} />
          <path d="M4 12 Q8 9 12 12 T20 12 T28 12" {...s} />
          <text x="16" y="22" textAnchor="middle" fontSize="7" fontFamily="Courier Prime" fill="currentColor">30</text>
        </>
      )}
      {kind === "hand" && (
        <>
          <path d="M4 12 L7 26 H25 L28 12" {...s} />
          <path d="M11 18 V9 M14 18 V7 M17 18 V8 M20 19 V11 M11 18 Q12 23 17 23 Q21 23 20 19" {...s} />
        </>
      )}
      {kind === "iron" && (
        <>
          <path d="M5 24 H27 Q27 13 18 13 H11 Q9 13 8 16 Z" {...s} />
          <path d="M12 13 Q12 8 20 8" {...s} />
          <circle cx="16" cy="19.5" r="1.2" fill="currentColor" />
        </>
      )}
      {kind === "dry" && (
        <>
          <rect x="5" y="5" width="22" height="22" {...s} />
          <path d="M5 10 Q16 17 27 10" {...s} />
        </>
      )}
      {kind === "flat" && (
        <>
          <rect x="5" y="5" width="22" height="22" {...s} />
          <path d="M10 16 H22" {...s} />
        </>
      )}
      {kind === "noBleach" && (
        <>
          <path d="M16 5 L28 26 H4 Z" {...s} />
          <path d="M8 9 L24 26 M24 9 L8 26" {...s} />
        </>
      )}
    </svg>
  );
}

export function Marquee({ items, className = "" }: { items: ReactNode[]; className?: string }) {
  const row = (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-10 whitespace-nowrap">
          {it}
          <span className="text-thread">✂</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`relative flex overflow-hidden ${className}`}>
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {row}
        {row}
      </div>
    </div>
  );
}

/** Circular text stamp that slowly turns, like a rubber stamp on a box. */
export function RotatingStamp({ text, className = "", children }: { text: string; className?: string; children?: ReactNode }) {
  const id = "stamp" + useId().replace(/:/g, "");
  return (
    <div className={`relative ${className}`}>
      <motion.svg viewBox="0 0 100 100" className="h-full w-full" animate={{ rotate: 360 }} transition={{ duration: 28, ease: "linear", repeat: Infinity }} aria-hidden>
        <defs>
          <path id={id} d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text fontFamily="Courier Prime, monospace" fontSize="8.6" letterSpacing="2.2" fill="currentColor">
          <textPath href={`#${id}`}>{text}</textPath>
        </text>
      </motion.svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

/** A red tacking thread that is drawn along as you scroll through its section. */
export function ScrollThread({ className = "", d, viewBox }: { className?: string; d: string; viewBox: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const len = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <div ref={ref} className={className}>
    <svg viewBox={viewBox} className="h-full w-full" fill="none" preserveAspectRatio="none" aria-hidden>
      <path d={d} stroke="#1e1c19" strokeOpacity="0.12" strokeWidth="2" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />
      <motion.path d={d} stroke="#c2432e" strokeWidth="2.2" style={{ pathLength: len }} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
    </svg>
    </div>
  );
}

/** Ruler with centimetre ticks. */
export function Ruler({ cm = 40, className = "" }: { cm?: number; className?: string }) {
  return (
    <svg viewBox={`0 0 ${cm * 10} 22`} preserveAspectRatio="none" className={className} aria-hidden>
      <rect width={cm * 10} height="22" fill="#f1e2b8" />
      {Array.from({ length: cm * 2 + 1 }).map((_, i) => {
        const x = i * 5;
        const big = i % 2 === 0;
        return <line key={i} x1={x} x2={x} y1="0" y2={i % 10 === 0 ? 12 : big ? 8 : 4} stroke="#1e1c19" strokeWidth="0.6" />;
      })}
      {Array.from({ length: cm / 5 + 1 }).map((_, i) => (
        <text key={i} x={i * 50 + 2} y="20" fontSize="6.5" fontFamily="Courier Prime" fill="#1e1c19">
          {i * 5}
        </text>
      ))}
    </svg>
  );
}
