import type { ArtKind } from "../types";

/** يغمّق أو يفتّح لون hex بنسبة (-1 .. 1) */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const ch = (v: number) => {
    const t = amt < 0 ? 0 : 255;
    return Math.round((t - v) * Math.abs(amt) + v);
  };
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** مسار متموّج حول دائرة (للسكرنشي والورود) */
function scallop(cx: number, cy: number, r: number, bumps: number, depth: number): string {
  const pts: string[] = [];
  const steps = bumps * 12;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const rr = r + Math.sin(a * bumps) * depth;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

function Flower({ x, y, r, color, center = "#c5a46d" }: { x: number; y: number; r: number; color: string; center?: string }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={x} cy={y - r * 0.7} rx={r * 0.45} ry={r * 0.75} fill={color} transform={`rotate(${a} ${x} ${y})`} />
      ))}
      <circle cx={x} cy={y} r={r * 0.35} fill={center} />
    </g>
  );
}

const INK = "#4a2a18";

interface Props {
  kind: ArtKind;
  color: string;
  bg?: string;
  variant?: 0 | 1 | 2;
  className?: string;
  title?: string;
}

export function ProductArt({ kind, color, bg = "#f5ede3", variant = 0, className = "", title }: Props) {
  const dark = shade(color, -0.28);
  const light = shade(color, 0.35);
  const stroke = { stroke: dark, strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const stitch = { stroke: light, strokeWidth: 1.6, strokeDasharray: "4 4", fill: "none", strokeLinecap: "round" as const };

  const transform =
    variant === 1 ? "translate(-60 -50) scale(1.6)" : variant === 2 ? "rotate(-8 100 100) translate(0 6)" : undefined;

  return (
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label={title ?? "رسمة القطعة"}>
      <rect width="200" height="200" fill={bg} />
      <circle cx="100" cy="104" r="74" fill={shade(bg, -0.04)} />
      {/* غرز زخرفية في الخلفية */}
      <path d="M18 30 q10 -6 20 0 t20 0" fill="none" stroke={shade(bg, -0.14)} strokeWidth="1.5" strokeDasharray="3 4" />
      <path d="M150 178 q10 -6 20 0 t20 0" fill="none" stroke={shade(bg, -0.14)} strokeWidth="1.5" strokeDasharray="3 4" />

      <g transform={transform}>
        {kind === "bag" && (
          <g>
            <path d="M72 78 C72 40 128 40 128 78" fill="none" stroke={dark} strokeWidth="6" strokeLinecap="round" />
            <path d="M58 78 H142 L152 150 Q152 162 140 162 H60 Q48 162 48 150 Z" fill={color} {...stroke} />
            {[96, 112, 128, 144].map((y) => (
              <path key={y} d={`M56 ${y} q6 -5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t10 0`} fill="none" stroke={light} strokeWidth="1.6" />
            ))}
            <Flower x={100} y={118} r={11} color={shade(color, 0.55)} />
            <path d="M58 86 H142" {...stitch} />
          </g>
        )}

        {kind === "pouch" && (
          <g>
            <rect x="46" y="74" width="108" height="80" rx="18" fill={color} {...stroke} />
            <path d="M46 92 Q100 140 154 92 V86 Q154 74 142 74 H58 Q46 74 46 86 Z" fill={shade(color, -0.08)} {...stroke} />
            <circle cx="100" cy="116" r="7" fill="#fbf7f2" stroke={dark} strokeWidth="1.5" />
            <circle cx="98" cy="114" r="2" fill="#fff" />
            <path d="M56 142 H144" {...stitch} />
            {[60, 76, 92, 108, 124, 140].map((x) => (
              <circle key={x} cx={x} cy={148} r="1.6" fill={light} />
            ))}
          </g>
        )}

        {kind === "earrings" && (
          <g>
            {[72, 128].map((x, i) => (
              <g key={x} transform={`rotate(${i ? 6 : -6} ${x} 56)`}>
                <path d={`M${x} 44 q12 0 10 14 q-2 8 -10 8`} fill="none" stroke="#c5a46d" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx={x} cy={70} r="4" fill="#c5a46d" />
                <path d={`M${x} 76 C${x + 26} 110 ${x + 22} 148 ${x} 150 C${x - 22} 148 ${x - 26} 110 ${x} 76 Z`} fill={color} {...stroke} />
                {[96, 110, 124, 138].map((y, j) => (
                  <g key={y}>
                    {Array.from({ length: j + 2 }).map((_, k, arr) => (
                      <circle key={k} cx={x + (k - (arr.length - 1) / 2) * 7} cy={y} r="2.3" fill={light} />
                    ))}
                  </g>
                ))}
              </g>
            ))}
          </g>
        )}

        {kind === "necklace" && (
          <g>
            <path d="M40 46 C40 130 160 130 160 46" fill="none" stroke="#c5a46d" strokeWidth="2" />
            {Array.from({ length: 15 }).map((_, i) => {
              const t = i / 14;
              const x = 40 + t * 120;
              const y = 46 + Math.sin(t * Math.PI) * 63;
              return i % 3 === 1 ? (
                <Flower key={i} x={x} y={y} r={8} color={color} />
              ) : (
                <circle key={i} cx={x} cy={y} r="3.4" fill={light} stroke={dark} strokeWidth="1" />
              );
            })}
            <Flower x={100} y={128} r={14} color={color} />
          </g>
        )}

        {kind === "bracelet" && (
          <g>
            <ellipse cx="100" cy="108" rx="66" ry="40" fill="none" stroke={dark} strokeWidth="14" />
            <ellipse cx="100" cy="108" rx="66" ry="40" fill="none" stroke={color} strokeWidth="10" />
            <ellipse cx="100" cy="108" rx="66" ry="40" fill="none" stroke={light} strokeWidth="1.5" strokeDasharray="3 5" />
            {[-2, -1, 0, 1, 2].map((k) => (
              <g key={k}>
                <rect x={92 + k * 18} y="136" width="16" height="16" rx="4" fill="#fbf7f2" stroke={dark} strokeWidth="1.5" />
                <circle cx={100 + k * 18} cy="144" r="2.4" fill={INK} />
              </g>
            ))}
          </g>
        )}

        {kind === "scrunchie" && (
          <g>
            <path d={scallop(100, 106, 54, 14, 7)} fill={color} {...stroke} />
            <circle cx="100" cy="106" r="24" fill={shade(bg, -0.04)} stroke={dark} strokeWidth="2.2" />
            {Array.from({ length: 14 }).map((_, i) => {
              const a = (i / 14) * Math.PI * 2;
              return (
                <path
                  key={i}
                  d={`M${100 + Math.cos(a) * 30} ${106 + Math.sin(a) * 30} L${100 + Math.cos(a) * 52} ${106 + Math.sin(a) * 52}`}
                  stroke={light}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        )}

        {kind === "hoop" && (
          <g>
            <rect x="94" y="30" width="12" height="14" rx="3" fill="#b88356" stroke={INK} strokeWidth="1.5" />
            <circle cx="100" cy="108" r="64" fill="#c99b6d" stroke={INK} strokeWidth="2" />
            <circle cx="100" cy="108" r="56" fill={shade(color, 0.6)} stroke={INK} strokeWidth="1.5" />
            <path d="M62 120 C76 96 92 92 100 104 C108 92 124 96 138 120" fill="none" stroke="#7c8f6a" strokeWidth="2.5" strokeLinecap="round" />
            {[
              [68, 116],
              [82, 102],
              [118, 102],
              [132, 116],
            ].map(([x, y], i) => (
              <ellipse key={i} cx={x} cy={y} rx="7" ry="3.5" fill="#93a386" transform={`rotate(${i < 2 ? -35 : 35} ${x} ${y})`} />
            ))}
            <Flower x={100} y={98} r={11} color="#c98f86" />
            <Flower x={78} y={128} r={7} color="#e9c2bb" />
            <Flower x={122} y={128} r={7} color="#e9c2bb" />
            <path d="M80 148 H120" stroke={INK} strokeWidth="2.2" strokeDasharray="5 3" strokeLinecap="round" />
            <circle cx="100" cy="108" r="50" fill="none" stroke={shade(color, 0.2)} strokeWidth="1.2" strokeDasharray="2 4" />
          </g>
        )}

        {kind === "bookmark" && (
          <g transform="rotate(-10 100 100)">
            <path d="M74 32 H126 V160 L100 142 L74 160 Z" fill={color} {...stroke} />
            <path d="M80 40 H120 V150 L100 136 L80 150 Z" {...stitch} />
            <Flower x={100} y={78} r={13} color={shade(color, 0.55)} />
            <path d="M100 92 V122" stroke="#7c8f6a" strokeWidth="2.4" />
            <ellipse cx="92" cy="108" rx="7" ry="3.5" fill="#93a386" transform="rotate(-30 92 108)" />
            <ellipse cx="108" cy="114" rx="7" ry="3.5" fill="#93a386" transform="rotate(30 108 114)" />
            <path d="M100 32 C100 18 108 12 112 6" fill="none" stroke="#c5a46d" strokeWidth="2" />
            <path d="M108 2 l6 16 l-4 14" fill="none" stroke="#c5a46d" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {kind === "coaster" && (
          <g>
            <ellipse cx="110" cy="132" rx="56" ry="18" fill={shade(color, -0.18)} />
            <path d={scallop(100, 100, 52, 10, 8)} fill={color} {...stroke} />
            <circle cx="100" cy="100" r="34" fill="none" stroke={light} strokeWidth="1.6" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="20" fill={shade(color, -0.2)} />
            <circle cx="100" cy="100" r="20" fill="none" stroke={light} strokeWidth="1.4" strokeDasharray="2 3" />
            <path d="M138 58 c10 -12 24 -8 22 4" fill="none" stroke={INK} strokeWidth="1.5" strokeDasharray="2 3" />
          </g>
        )}

        {kind === "keychain" && (
          <g>
            <circle cx="100" cy="46" r="16" fill="none" stroke="#c5a46d" strokeWidth="4" />
            <path d="M100 62 V78" stroke="#c5a46d" strokeWidth="3" />
            <path d="M100 160 C60 132 52 108 64 92 C76 78 94 82 100 96 C106 82 124 78 136 92 C148 108 140 132 100 160 Z" fill={color} {...stroke} />
            <path d="M100 146 C70 124 66 108 74 98 C82 90 94 94 100 106 C106 94 118 90 126 98 C134 108 130 124 100 146 Z" {...stitch} />
          </g>
        )}

        {kind === "giftbox" && (
          <g>
            <rect x="48" y="90" width="104" height="72" rx="6" fill={color} {...stroke} />
            <rect x="42" y="74" width="116" height="22" rx="5" fill={shade(color, -0.08)} {...stroke} />
            <rect x="93" y="74" width="14" height="88" fill="#fbf7f2" stroke={dark} strokeWidth="1.5" />
            <path d="M100 74 C82 50 62 60 74 72 C80 78 92 76 100 74 Z" fill="#fbf7f2" stroke={dark} strokeWidth="2" />
            <path d="M100 74 C118 50 138 60 126 72 C120 78 108 76 100 74 Z" fill="#fbf7f2" stroke={dark} strokeWidth="2" />
            <circle cx="100" cy="74" r="5" fill="#c5a46d" />
            <path d="M54 140 H88 M112 140 H146" {...stitch} />
            <g transform="rotate(14 140 128)">
              <rect x="128" y="118" width="26" height="18" rx="3" fill="#fffdfa" stroke={INK} strokeWidth="1.2" />
              <path d="M133 127 h16" stroke={INK} strokeWidth="1" strokeDasharray="2 2" />
            </g>
          </g>
        )}

        {kind === "basket" && (
          <g>
            <path d="M58 82 C52 60 76 54 78 76" fill="none" stroke="#8a5a3a" strokeWidth="5" strokeLinecap="round" />
            <path d="M142 82 C148 60 124 54 122 76" fill="none" stroke="#8a5a3a" strokeWidth="5" strokeLinecap="round" />
            <path d="M44 80 H156 L146 150 Q144 162 132 162 H68 Q56 162 54 150 Z" fill={color} {...stroke} />
            {[94, 108, 122, 136, 150].map((y) => (
              <path key={y} d={`M${50 + (y - 80) * 0.12} ${y} H${150 - (y - 80) * 0.12}`} stroke={dark} strokeWidth="1.2" strokeDasharray="7 3" opacity="0.6" />
            ))}
            <path d="M88 80 C84 56 100 40 112 46 C104 54 102 66 108 80" fill="#93a386" stroke="#5f7052" strokeWidth="1.5" />
          </g>
        )}
      </g>

      {variant === 2 && (
        <g transform="rotate(10 160 46)">
          <path d="M160 18 V34" stroke={INK} strokeWidth="1" />
          <rect x="138" y="34" width="44" height="26" rx="4" fill="#fffdfa" stroke={INK} strokeWidth="1.2" />
          <circle cx="160" cy="39" r="2" fill={INK} />
          <text x="160" y="53" textAnchor="middle" fontSize="9" fill={INK} fontFamily="Aref Ruqaa, serif">
            صُنع باليد
          </text>
        </g>
      )}
    </svg>
  );
}
