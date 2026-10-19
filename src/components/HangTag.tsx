/** بطاقة "صُنع باليد" معلّقة بخيط، بتتمرجح */
export function HangTag({ text = "صُنع باليد", className = "" }: { text?: string; className?: string }) {
  return (
    <div className={`pointer-events-none origin-top animate-swing ${className}`} aria-hidden>
      <svg viewBox="0 0 70 96" className="h-full w-full drop-shadow-[0_6px_8px_rgba(74,42,24,.15)]">
        <path d="M35 0 C30 10 40 16 35 26" fill="none" stroke="#4a2a18" strokeWidth="1.2" />
        <path d="M14 34 L35 22 L56 34 V88 Q56 94 50 94 H20 Q14 94 14 88 Z" fill="#fffdfa" stroke="#c9b29b" strokeWidth="1.2" />
        <circle cx="35" cy="32" r="3.2" fill="#f5ede3" stroke="#4a2a18" strokeWidth="1" />
        <path d="M20 42 V88 H50 V42" fill="none" stroke="#c98f86" strokeWidth="1" strokeDasharray="2.5 2.5" />
        <text x="35" y="64" textAnchor="middle" fontSize="11" fill="#4a2a18" fontFamily="Aref Ruqaa, serif">{text.split(" ")[0]}</text>
        <text x="35" y="78" textAnchor="middle" fontSize="11" fill="#4a2a18" fontFamily="Aref Ruqaa, serif">{text.split(" ").slice(1).join(" ")}</text>
      </svg>
    </div>
  );
}
