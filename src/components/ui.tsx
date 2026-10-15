import { motion, useInView } from "motion/react";
import { useRef, type ReactNode } from "react";
import { Link } from "react-router";

/** Fades content up as it enters the viewport. */
export function Reveal({ children, delay = 0, className, y = 18 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Section opener: a margin number, a mono kicker and a serif title. */
export function SectionHead({
  no,
  kicker,
  title,
  aside,
  className = "",
}: {
  no?: string;
  kicker: string;
  title: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-4 md:flex-row md:items-end md:justify-between ${className}`}>
      <div className="max-w-2xl">
        <p className="label flex items-center gap-3 text-ink-3">
          {no && <span className="text-thread">§ {no}</span>}
          <span className="h-px w-8 bg-ink-3/50" />
          {kicker}
        </p>
        <h2 className="mt-3 font-display text-[2.1rem] leading-[1.25] text-balance md:text-[3.1rem]">{title}</h2>
      </div>
      {aside && <div className="md:max-w-sm">{aside}</div>}
    </div>
  );
}

type BtnProps = {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: "ink" | "paper" | "ghost" | "thread";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
};

export function Button({ children, to, onClick, variant = "ink", type = "button", disabled, className = "", ariaLabel }: BtnProps) {
  const base =
    "group relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[0.92rem] font-medium tracking-tight transition-all duration-300 ease-tailor disabled:cursor-not-allowed disabled:opacity-45 select-none";
  const styles = {
    ink: "bg-ink text-paper hover:bg-ink-2 hover:-translate-y-0.5 shadow-[0_1px_0_#0002,0_10px_24px_-14px_#1e1c19]",
    paper: "bg-tissue text-ink ring-1 ring-ink/15 hover:ring-ink/40 hover:-translate-y-0.5",
    ghost: "text-ink underline decoration-ink/30 decoration-dashed underline-offset-[8px] hover:decoration-thread px-1 py-1 rounded-none",
    thread: "bg-thread text-tissue hover:-translate-y-0.5 hover:bg-[#a9381f]",
  }[variant];
  const cls = `${base} ${styles} ${className}`;
  if (to)
    return (
      <Link to={to} className={cls} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

/** Hand-written pencil note, as if scribbled on the pattern paper. */
export function HandNote({ children, className = "", rotate = -3 }: { children: ReactNode; className?: string; rotate?: number }) {
  return (
    <span className={`inline-block font-hand text-[1.55rem] leading-none text-chalk ${className}`} style={{ transform: `rotate(${rotate}deg)` }}>
      {children}
    </span>
  );
}

/** Pin pushed through the paper. */
export function PinHead({ className = "", colour = "#c2432e" }: { className?: string; colour?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <ellipse cx="13" cy="15" rx="6" ry="2.2" fill="#1e1c19" opacity="0.12" />
      <path d="M12 12 L19 20" stroke="#8a8378" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="10" cy="9" r="5.5" fill={colour} />
      <circle cx="8.2" cy="7.3" r="1.6" fill="#fff" opacity="0.55" />
    </svg>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-paper-3/70 ${className}`} />;
}

export function Meter({ value, max = 5, label }: { value: number; max?: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="label w-16 shrink-0 text-ink-3">{label}</span>
      <div className="flex flex-1 gap-1" aria-label={`${label}: ${value} من ${max}`}>
        {Array.from({ length: max }).map((_, i) => (
          <span key={i} className={`h-2 flex-1 rounded-full ${i < value ? "bg-ink" : "bg-ink/10"}`} />
        ))}
      </div>
    </div>
  );
}

export function Breadcrumbs({ trail }: { trail: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="مسار التنقّل" className="label flex flex-wrap items-center gap-2 text-ink-3">
      {trail.map((t, i) => (
        <span key={t.label} className="flex items-center gap-2">
          {i > 0 && <span className="text-ink-3/50">/</span>}
          {t.to ? (
            <Link to={t.to} className="hover:text-ink">
              {t.label}
            </Link>
          ) : (
            <span className="text-ink">{t.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** A full page header used across content pages. */
export function PageHeader({
  kicker,
  title,
  intro,
  children,
  trail,
}: {
  kicker: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  trail?: { label: string; to?: string }[];
}) {
  return (
    <header className="relative overflow-hidden border-b border-line">
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-60" />
      <div className="wrap relative pb-12 pt-10 md:pb-16 md:pt-14">
        {trail && <Breadcrumbs trail={trail} />}
        <p className="label mt-6 text-thread">{kicker}</p>
        <h1 className="mt-3 max-w-4xl font-display text-[2.6rem] leading-[1.2] text-balance md:text-[4.4rem]">{title}</h1>
        {intro && <div className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-ink-2 md:text-lg">{intro}</div>}
        {children}
      </div>
    </header>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <svg viewBox="0 0 120 80" className="w-36" aria-hidden>
        <path d="M10 70 L60 40 L110 70" fill="none" stroke="#1e1c19" strokeWidth="2" strokeLinejoin="round" />
        <path d="M60 40 V28 a6 6 0 1 1 6 -6" fill="none" stroke="#1e1c19" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 76 H100" stroke="#c2432e" strokeDasharray="4 4" strokeWidth="1.5" />
      </svg>
      <h3 className="mt-4 font-display text-2xl">{title}</h3>
      <p className="mt-2 text-ink-2">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
