import { motion } from "motion/react";

/** كبة صوف بتلف وخيطها بيتفكّك — شاشة التحميل */
export function YarnLoader({ label = "لحظة، عم نحضّر القطع..." }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-16" role="status" aria-live="polite">
      <div className="relative h-20 w-40">
        <motion.svg
          viewBox="0 0 60 60"
          className="absolute end-0 top-2 size-16"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "linear" }}
          aria-hidden
        >
          <circle cx="30" cy="30" r="24" fill="#c98f86" />
          <g fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2">
            <path d="M10 22 C24 16 40 18 52 30" />
            <path d="M8 34 C22 26 42 30 52 42" />
            <path d="M24 7 C16 22 18 40 28 54" />
          </g>
        </motion.svg>
        <svg viewBox="0 0 110 40" className="absolute start-0 top-10 h-10 w-28" aria-hidden>
          <motion.path
            d="M108 10 C90 30 70 0 50 18 S20 34 2 20"
            fill="none"
            stroke="#c98f86"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 1], opacity: [1, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          />
        </svg>
      </div>
      <p className="font-serif text-lg text-cocoa-2">{label}</p>
    </div>
  );
}
