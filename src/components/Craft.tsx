// رسومات زخرفية بروح الشغل اليدوي: كبة صوف، إبرة، بكرة، زر، مقص...
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { color?: string };
const INK = "#4a2a18";

export function YarnBall({ color = "#c98f86", ...p }: P) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden {...p}>
      <path d="M96 92 C110 104 116 112 118 118" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <circle cx="58" cy="58" r="44" fill={color} />
      <g fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="2.5" strokeLinecap="round">
        <path d="M22 40 C44 30 76 34 98 54" />
        <path d="M16 58 C40 46 78 52 100 74" />
        <path d="M22 80 C44 70 70 74 90 90" />
        <path d="M44 16 C30 40 32 74 50 100" />
        <path d="M66 14 C52 40 54 76 74 102" />
      </g>
      <circle cx="58" cy="58" r="44" fill="none" stroke={INK} strokeOpacity=".25" strokeWidth="2" />
    </svg>
  );
}

export function Needle({ color = INK, ...p }: P) {
  return (
    <svg viewBox="0 0 140 24" aria-hidden {...p}>
      <path d="M4 12 L118 8.5 Q136 12 118 15.5 Z" fill={color} />
      <ellipse cx="122" cy="12" rx="8" ry="2" fill="#fbf7f2" />
      <path d="M4 12 L118 9.5" stroke="#fff" strokeOpacity=".5" strokeWidth="1" />
    </svg>
  );
}

export function Spool({ color = "#93a386", ...p }: P) {
  return (
    <svg viewBox="0 0 80 100" aria-hidden {...p}>
      <rect x="8" y="6" width="64" height="12" rx="4" fill="#c99b6d" stroke={INK} strokeOpacity=".4" />
      <rect x="8" y="82" width="64" height="12" rx="4" fill="#c99b6d" stroke={INK} strokeOpacity=".4" />
      <rect x="16" y="18" width="48" height="64" fill={color} />
      <g stroke="#fff" strokeOpacity=".4" strokeWidth="1.5">
        {[26, 34, 42, 50, 58, 66, 74].map((y) => (
          <path key={y} d={`M16 ${y} L64 ${y - 4}`} />
        ))}
      </g>
      <path d="M64 50 C78 56 76 74 70 96" fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function SewButton({ color = "#c5a46d", ...p }: P) {
  return (
    <svg viewBox="0 0 60 60" aria-hidden {...p}>
      <circle cx="30" cy="30" r="26" fill={color} />
      <circle cx="30" cy="30" r="20" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="2" />
      {[
        [24, 24],
        [36, 24],
        [24, 36],
        [36, 36],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="3.2" fill={INK} fillOpacity=".55" />
      ))}
      <path d="M24 24 L36 36 M36 24 L24 36" stroke="#fbf7f2" strokeWidth="1.8" />
    </svg>
  );
}

export function Scissors({ color = INK, ...p }: P) {
  return (
    <svg viewBox="0 0 120 80" aria-hidden {...p}>
      <g fill="none" stroke={color} strokeWidth="5" strokeLinecap="round">
        <circle cx="18" cy="22" r="13" />
        <circle cx="18" cy="58" r="13" />
        <path d="M29 28 L112 52" />
        <path d="M29 52 L112 28" />
      </g>
      <circle cx="60" cy="40" r="3.5" fill="#c5a46d" />
    </svg>
  );
}

export function Bow({ color = "#c98f86", ...p }: P) {
  return (
    <svg viewBox="0 0 100 70" aria-hidden {...p}>
      <path d="M50 30 C30 0 4 8 12 30 C18 46 38 38 50 30 Z" fill={color} />
      <path d="M50 30 C70 0 96 8 88 30 C82 46 62 38 50 30 Z" fill={color} />
      <path d="M46 34 L32 66 M54 34 L68 66" stroke={color} strokeWidth="6" strokeLinecap="round" />
      <circle cx="50" cy="31" r="7" fill={color} stroke={INK} strokeOpacity=".2" />
    </svg>
  );
}

/** المعين الصغير من الشعار */
export function Diamond({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 10 10" className={className} aria-hidden>
      <rect x="2" y="2" width="6" height="6" transform="rotate(45 5 5)" fill={color} />
    </svg>
  );
}

export function Leaf({ color = "#93a386", ...p }: P) {
  return (
    <svg viewBox="0 0 60 90" aria-hidden {...p}>
      <path d="M30 86 C30 60 30 30 30 4" stroke={INK} strokeOpacity=".4" strokeWidth="1.5" fill="none" />
      <path d="M30 70 C10 60 6 40 14 30 C24 40 30 52 30 70 Z" fill={color} />
      <path d="M30 50 C50 42 54 22 46 12 C36 22 30 34 30 50 Z" fill={color} opacity=".85" />
    </svg>
  );
}

/** فاصل مخيّط بين الأقسام */
export function StitchDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-line ${className}`} aria-hidden>
      <span className="stitch flex-1" />
      <Diamond className="size-3 text-rose" />
      <span className="stitch flex-1" />
    </div>
  );
}
