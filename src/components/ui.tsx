import { motion, type HTMLMotionProps } from "motion/react";
import { Star } from "lucide-react";
import type { ReactNode } from "react";
import { formatPrice } from "../lib/format";
import { Diamond } from "./Craft";

/** يظهر العنصر بنعومة لما يدخل الشاشة */
export function Reveal({ children, delay = 0, y = 24, ...rest }: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  text,
  align = "center",
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  text?: string;
  align?: "center" | "start";
  action?: ReactNode;
}) {
  const center = align === "center";
  return (
    <Reveal className={`mb-10 flex flex-col gap-3 md:mb-14 ${center ? "items-center text-center" : "items-start"} ${action ? "md:flex-row md:items-end md:justify-between md:text-start" : ""}`}>
      <div className={center && !action ? "flex flex-col items-center" : ""}>
        {eyebrow && (
          <span className="eyebrow mb-2">
            <Diamond className="size-2" /> {eyebrow} <Diamond className="size-2" />
          </span>
        )}
        <h2 className="font-display text-[2rem] leading-tight md:text-[2.75rem]">{title}</h2>
        {text && <p className={`mt-3 max-w-xl leading-8 text-cocoa-2 ${center && !action ? "mx-auto" : ""}`}>{text}</p>}
      </div>
      {action}
    </Reveal>
  );
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`التقييم ${value} من 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} style={{ width: size, height: size }} className={i <= Math.round(value) ? "fill-gold text-gold" : "text-sand"} />
      ))}
    </span>
  );
}

export function Price({ value, compareAt, className = "" }: { value: number; compareAt?: number; className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-2 tabular-nums ${className}`}>
      <span className="font-bold">{formatPrice(value)}</span>
      {compareAt && compareAt > value && <s className="text-sm text-cocoa-3">{formatPrice(compareAt)}</s>}
    </span>
  );
}

export function PageHero({ eyebrow, title, text, children }: { eyebrow?: string; title: string; text?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-dashed border-line bg-cream-2/60">
      <div className="container-b relative py-12 text-center md:py-16">
        {eyebrow && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="eyebrow mb-3">
            <Diamond className="size-2" /> {eyebrow} <Diamond className="size-2" />
          </motion.span>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display text-4xl leading-tight md:text-6xl"
        >
          {title}
        </motion.h1>
        {text && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mx-auto mt-4 max-w-xl leading-8 text-cocoa-2">
            {text}
          </motion.p>
        )}
        {children}
        <svg viewBox="0 0 300 20" className="mx-auto mt-6 h-4 w-48 text-rose" aria-hidden>
          <motion.path
            d="M2 10 Q20 0 38 10 T74 10 T110 10 T146 10 T182 10 T218 10 T254 10 T298 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />
        </svg>
      </div>
    </section>
  );
}

export function EmptyState({ title, text, children, icon }: { title: string; text?: string; children?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-dashed border-line px-6 py-16 text-center">
      {icon}
      <p className="font-serif text-2xl">{title}</p>
      {text && <p className="max-w-sm text-cocoa-3">{text}</p>}
      {children}
    </div>
  );
}
