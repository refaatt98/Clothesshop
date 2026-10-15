import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useId } from "react";
import { PinHead } from "./ui";

const groups = [
  { id: "age", label: "العمر", note: "سنوات", test: (s: string) => /^\d+-\d+$/.test(s) },
  { id: "letter", label: "المقاس", note: "", test: (s: string) => /^X*[SML]$|^XX?L$|^XS$/.test(s) },
  { id: "waist", label: "الخصر", note: "إنش", test: (s: string) => /^\d{2}$/.test(s) },
];

/** Tick marks along both edges of the tape, like a real tailor's tape measure. */
const ticks = {
  backgroundImage:
    "repeating-linear-gradient(to left, #1e1c19 0 1px, transparent 1px 7px), repeating-linear-gradient(to left, #1e1c19 0 1px, transparent 1px 35px), repeating-linear-gradient(to left, #1e1c19 0 1px, transparent 1px 7px)",
  backgroundSize: "100% 6px, 100% 12px, 100% 6px",
  backgroundPosition: "top, top, bottom",
  backgroundRepeat: "repeat-x",
};

/**
 * Size filter drawn as a tailor's tape measure: sizes are printed along the tape,
 * the chosen one gets circled in chalk and a pin slides over to mark it.
 */
export function SizeFilter({ sizes, value, onChange }: { sizes: string[]; value: string | null | undefined; onChange: (s: string | null) => void }) {
  const uid = useId();
  const usable = sizes.filter((s) => s !== "مقاس واحد");
  const present = groups.map((g) => ({ ...g, sizes: usable.filter(g.test) })).filter((g) => g.sizes.length);

  return (
    <div className="flex items-stretch gap-3">
      <div className="relative min-w-0 flex-1">
        <div className="no-scrollbar relative flex overflow-x-auto rounded-[3px] bg-[#efdcaa] shadow-[0_8px_18px_-12px_#1e1c1980] ring-1 ring-[#d4bf86]" style={ticks}>
          {/* the brass tip of the tape */}
          <div className="sticky right-0 z-20 flex w-6 shrink-0 items-center justify-center bg-brass shadow-[inset_-2px_0_0_#0003]">
            <span className="h-2 w-2 rounded-full bg-[#8a6a37] ring-1 ring-[#f3e3b9]" />
          </div>

          {present.map((g, gi) => (
            <div key={g.id} className={`flex shrink-0 items-stretch ${gi > 0 ? "border-s-2 border-ink/70" : ""}`}>
              {/* printed group label, like the red markings on a tape */}
              <div className="flex w-7 shrink-0 items-center justify-center">
                <span className="whitespace-nowrap text-[0.68rem] font-semibold text-thread [writing-mode:vertical-rl]">{g.label}</span>
              </div>
              {g.sizes.map((s) => {
                const on = value === s;
                return (
                  <button
                    key={s}
                    onClick={() => onChange(on ? null : s)}
                    aria-pressed={on}
                    aria-label={`${g.label} ${s}${g.note ? " " + g.note : ""}`}
                    className="group relative flex min-w-[3.6rem] flex-col items-center justify-center px-2 pb-2.5 pt-5 transition hover:bg-[#f6e8c2]"
                  >
                    <span className={`relative z-10 font-mono text-[0.95rem] font-bold transition ${on ? "text-thread" : "text-ink group-hover:-translate-y-0.5"}`} dir="ltr">
                      {s}
                    </span>
                    {g.note && <span className="text-[0.58rem] text-ink-3">{g.note}</span>}

                    {/* chalk circle drawn around the chosen size */}
                    <AnimatePresence>
                      {on && (
                        <motion.svg key="chalk" viewBox="0 0 60 40" className="pointer-events-none absolute inset-x-1 top-3 h-[60%] w-[calc(100%-0.5rem)]" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <motion.path
                            d="M30 4 C48 3 57 12 55 21 C53 32 38 37 26 36 C12 35 3 28 5 18 C7 9 18 4 34 6"
                            fill="none"
                            stroke="#c2432e"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.45, ease: "easeOut" }}
                          />
                        </motion.svg>
                      )}
                    </AnimatePresence>

                    {/* the pin travels to the chosen size */}
                    {on && (
                      <motion.span layoutId={`pin-${uid}`} className="absolute inset-x-0 -top-1 z-20 flex justify-center" transition={{ type: "spring", stiffness: 380, damping: 26 }}>
                        <PinHead className="h-6 w-6 drop-shadow" />
                      </motion.span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          {/* the tape keeps going */}
          <div className="w-10 shrink-0" />
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-center">
        {value ? (
          <button onClick={() => onChange(null)} className="flex items-center gap-1 whitespace-nowrap rounded-full bg-ink px-3 py-2 text-xs text-paper transition hover:bg-thread">
            <X className="h-3.5 w-3.5" /> كل المقاسات
          </button>
        ) : (
          <span className="whitespace-nowrap font-hand text-xl leading-tight text-chalk">→ اختر مقاسك</span>
        )}
      </div>
    </div>
  );
}
