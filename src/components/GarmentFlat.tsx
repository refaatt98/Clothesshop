import { useId } from "react";
import type { FabricPattern, GarmentKind } from "../types";

/**
 * Technical "flats" — the line drawings a pattern-cutter makes before cutting.
 * Every garment in the shop is drawn here in a 200×240 box and filled with
 * a woven texture that matches its real cloth.
 */
interface Spec {
  inside?: string; // back of the neck, seen through the opening
  sleeves: string[];
  body: string;
  parts?: string[]; // filled pieces on top: collars, cuffs, waistbands
  lines?: string[];
  stitches?: string[];
  creases?: string[];
  buttons?: [number, number][];
  strap?: string; // tote handles
  fringe?: string;
}

const specs: Record<GarmentKind, Spec> = {
  coat: {
    inside: "M84,24 Q100,16 116,24 Q100,34 84,24 Z",
    sleeves: [
      "M64,42 C52,48 44,58 41,72 L30,170 L48,174 L58,104 Z",
      "M136,42 C148,48 156,58 159,72 L170,170 L152,174 L142,104 Z",
    ],
    body: "M84,24 L64,42 L60,104 L55,226 L145,226 L140,104 L136,42 L116,24 L100,40 Z",
    parts: ["M84,24 L72,54 L84,59 L104,104 L100,40 Z", "M116,24 L128,54 L116,59 L104,104 L100,40 Z"],
    lines: [
      "M104,104 L108,226",
      "M72,54 L78,50",
      "M128,54 L122,50",
      "M66,168 L88,170 L88,178 L66,176 Z",
      "M134,168 L113,170 L113,178 L134,176 Z",
      "M31,160 L49,164",
      "M169,160 L151,164",
    ],
    stitches: ["M57,219 L143,219", "M86,62 L101,98"],
    creases: ["M72,112 Q69,160 66,218", "M128,112 Q131,160 134,218", "M44,90 L38,150"],
    buttons: [
      [88, 124],
      [118, 124],
      [88, 150],
      [118, 150],
      [88, 176],
      [118, 176],
    ],
  },
  jacket: {
    sleeves: [
      "M66,40 C54,46 47,56 44,70 L36,152 L54,156 L60,96 Z",
      "M134,40 C146,46 153,56 156,70 L164,152 L146,156 L140,96 Z",
    ],
    body: "M82,24 L66,40 L62,96 L62,166 L138,166 L138,96 L134,40 L118,24 L100,30 Z",
    parts: [
      "M82,24 Q100,17 118,24 L121,31 L104,47 L100,38 L96,47 L79,31 Z",
      "M37,143 L55,147 L54,156 L36,152 Z",
      "M163,143 L145,147 L146,156 L164,152 Z",
    ],
    lines: [
      "M100,40 L100,166",
      "M70,62 h20 v18 h-20 Z",
      "M110,62 h20 v18 h-20 Z",
      "M68,110 h24 v30 h-24 Z",
      "M108,110 h24 v30 h-24 Z",
    ],
    stitches: ["M64,159 L136,159", "M70,66 h20", "M110,66 h20", "M68,114 h24", "M108,114 h24", "M103,40 L103,166"],
    creases: ["M48,84 L42,130", "M152,84 L158,130"],
    buttons: [
      [100, 56],
      [100, 80],
      [100, 104],
      [100, 128],
      [100, 152],
    ],
  },
  shirt: {
    sleeves: [
      "M68,40 C58,44 52,52 49,62 L38,168 L54,171 L62,100 Z",
      "M132,40 C142,44 148,52 151,62 L162,168 L146,171 L138,100 Z",
    ],
    body: "M84,26 L68,40 L64,100 L64,206 Q100,220 136,206 L136,100 L132,40 L116,26 L100,34 Z",
    parts: [
      "M84,26 Q100,19 116,26 L119,33 L105,49 L100,37 L95,49 L81,33 Z",
      "M39.5,156 L55.6,159.5 L54,171 L38,168 Z",
      "M160.5,156 L144.4,159.5 L146,171 L162,168 Z",
    ],
    lines: ["M96.5,40 L96.5,213", "M103.5,40 L103.5,213", "M108,70 h18 v20 l-9,4 l-9,-4 Z"],
    stitches: ["M66,200 Q100,213 134,200", "M108,74 h18"],
    creases: ["M74,110 Q72,160 74,200", "M50,80 L44,140", "M150,80 L156,140"],
    buttons: [
      [100, 54],
      [100, 78],
      [100, 102],
      [100, 126],
      [100, 150],
      [100, 174],
      [100, 198],
    ],
  },
  "camp-shirt": {
    sleeves: [
      "M66,40 C54,44 46,52 42,62 L50,100 L66,94 Z",
      "M134,40 C146,44 154,52 158,62 L150,100 L134,94 Z",
    ],
    body: "M84,26 L66,40 L64,94 L64,198 L136,198 L136,94 L134,40 L116,26 L100,34 Z",
    parts: ["M84,26 Q100,19 116,26 L122,38 L106,60 L100,42 L94,60 L78,38 Z"],
    lines: ["M100,42 L100,198", "M100,60 L106,60", "M72,70 h18 v22 h-18 Z", "M64,184 L68,198", "M136,184 L132,198"],
    stitches: ["M47,92 L65,86", "M153,92 L135,86", "M65,192 L135,192", "M72,74 h18"],
    creases: ["M80,110 Q78,150 80,190", "M120,110 Q122,150 120,190"],
    buttons: [
      [100, 76],
      [100, 104],
      [100, 132],
      [100, 160],
    ],
  },
  tee: {
    inside: "M82,26 Q100,18 118,26 Q100,40 82,26 Z",
    sleeves: [
      "M70,36 C58,40 48,48 42,58 L54,92 L68,86 Z",
      "M130,36 C142,40 152,48 158,58 L146,92 L132,86 Z",
    ],
    body: "M80,26 L70,36 L66,86 L66,206 L134,206 L134,86 L130,36 L120,26 Q100,44 80,26 Z",
    parts: ["M80,26 Q100,44 120,26 L117,24 Q100,38 83,24 Z"],
    stitches: ["M67,199 L133,199", "M51,85 L67,79", "M149,85 L133,79", "M83,31 Q100,47 117,31"],
    creases: ["M78,100 Q76,150 80,196", "M122,100 Q124,150 120,196"],
  },
  knit: {
    inside: "M84,24 Q100,18 116,24 Q100,36 84,24 Z",
    sleeves: [
      "M68,36 C56,40 48,50 45,62 L34,176 L52,180 L62,98 Z",
      "M132,36 C144,40 152,50 155,62 L166,176 L148,180 L138,98 Z",
    ],
    body: "M80,26 L68,36 L64,98 L64,194 L136,194 L136,98 L132,36 L120,26 Q100,42 80,26 Z",
    parts: [
      "M80,26 Q100,42 120,26 L116,24 Q100,36 84,24 Z",
      "M64,192 L136,192 L136,210 L64,210 Z",
      "M35.6,162 L53.5,166 L52,180 L34,176 Z",
      "M164.4,162 L146.5,166 L148,180 L166,176 Z",
    ],
    lines: ["M68,36 Q72,30 80,26", "M132,36 Q128,30 120,26"],
    creases: ["M80,110 Q78,150 80,186", "M120,110 Q122,150 120,186", "M50,90 L42,150", "M150,90 L158,150"],
  },
  trousers: {
    sleeves: [],
    body: "M61,32 L54,230 L94,230 L100,96 L106,230 L146,230 L139,32 Z",
    parts: ["M62,18 L138,18 L139,32 L61,32 Z"],
    lines: ["M100,32 L100,96", "M64,34 L73,66", "M136,34 L127,66", "M80,32 L82,62", "M120,32 L118,62"],
    stitches: ["M106,34 L106,80 Q106,90 100,94", "M55,222 L93,222", "M107,222 L145,222", "M62,25 L138,25"],
    creases: ["M78,64 L74,228", "M122,64 L126,228"],
    buttons: [[100, 25]],
  },
  dress: {
    inside: "M86,24 Q100,18 114,24 Q100,38 86,24 Z",
    sleeves: [
      "M76,34 C64,34 56,42 54,54 L60,72 L77,64 Z",
      "M124,34 C136,34 144,42 146,54 L140,72 L123,64 Z",
    ],
    body: "M86,24 L76,34 L77,64 L79,98 L46,226 Q100,238 154,226 L121,98 L123,64 L124,34 L114,24 Q100,40 86,24 Z",
    lines: ["M79,98 Q100,103 121,98", "M100,38 L100,98"],
    stitches: ["M50,220 Q100,232 150,220", "M58,67 L76,60", "M142,67 L124,60", "M89,28 Q100,42 111,28"],
    creases: [
      "M86,103 L72,228",
      "M93,104 L86,231",
      "M100,104 L100,233",
      "M107,104 L114,231",
      "M114,103 L128,228",
    ],
    buttons: [
      [100, 48],
      [100, 62],
      [100, 76],
      [100, 90],
    ],
  },
  skirt: {
    sleeves: [],
    body: "M65,36 L40,218 Q100,232 160,218 L135,36 Z",
    parts: ["M66,22 L134,22 L135,36 L65,36 Z"],
    lines: ["M79,36 L64,224", "M93,36 L88,228", "M107,36 L112,228", "M121,36 L136,224"],
    stitches: ["M79,38 L75,70", "M93,38 L92,70", "M107,38 L108,70", "M121,38 L125,70", "M44,212 Q100,225 156,212"],
    creases: ["M86,80 L76,224", "M114,80 L124,224"],
  },
  scarf: {
    sleeves: [],
    body: "M74,30 L64,196 L94,200 L100,42 Z",
    parts: ["M126,30 L136,168 L108,172 L100,42 Z", "M74,30 Q100,12 126,30 L116,44 Q100,32 84,44 Z"],
    lines: [],
    stitches: ["M66,188 L94,192", "M135,160 L108,164"],
    creases: ["M80,60 L74,190", "M120,60 L126,160"],
    fringe: "M66,198 v14 M70,198.5 v14 M74,199 v14 M78,199.5 v14 M82,200 v14 M86,200.5 v14 M90,201 v14 M110,172.5 v14 M114,172 v14 M118,171.5 v14 M122,171 v14 M126,170.5 v14 M130,170 v14 M134,169.5 v14",
  },
  tote: {
    sleeves: [],
    strap: "M72,96 C70,24 130,24 128,96",
    body: "M52,92 L148,92 L154,226 L46,226 Z",
    parts: [],
    lines: ["M52,104 L148,104", "M86,150 h28 v18 h-28 Z"],
    stitches: ["M48,218 L152,218", "M66,92 l12,12 M78,92 l-12,12 M122,92 l12,12 M134,92 l-12,12"],
    creases: ["M70,110 L64,220", "M130,110 L136,220"],
  },
};

/** Woven textures. Patterns are tiles that repeat across the cloth. */
export function FabricPatternDef({
  id,
  hex,
  accent = "#000",
  pattern,
  scale = 1,
}: {
  id: string;
  hex: string;
  accent?: string;
  pattern: FabricPattern;
  scale?: number;
}) {
  const t = `scale(${scale})`;
  switch (pattern) {
    case "stripe":
      return (
        <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform={t}>
          <rect width="8" height="8" fill={hex} />
          <rect x="0" width="1.6" height="8" fill={accent} opacity="0.85" />
          <rect x="4" width="0.6" height="8" fill={accent} opacity="0.35" />
        </pattern>
      );
    case "check":
      return (
        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform={t}>
          <rect width="16" height="16" fill={hex} />
          <rect x="0" width="4" height="16" fill={accent} opacity="0.28" />
          <rect y="0" width="16" height="4" fill={accent} opacity="0.28" />
          <rect x="10" width="0.8" height="16" fill={accent} opacity="0.45" />
          <rect y="10" width="16" height="0.8" fill={accent} opacity="0.45" />
        </pattern>
      );
    case "herringbone":
      return (
        <pattern id={id} width="10" height="8" patternUnits="userSpaceOnUse" patternTransform={t}>
          <rect width="10" height="8" fill={hex} />
          <path d="M0,8 L5,0 M-5,8 L0,0 M5,8 L10,0" stroke={accent} strokeWidth="1" opacity="0.55" />
          <path d="M5,0 L10,8 M10,0 L15,8 M0,0 L5,8" stroke={accent} strokeWidth="1" opacity="0.18" transform="translate(0,0)" />
        </pattern>
      );
    case "rib":
      return (
        <pattern id={id} width="4" height="6" patternUnits="userSpaceOnUse" patternTransform={t}>
          <rect width="4" height="6" fill={hex} />
          <rect x="0" width="1.2" height="6" fill={accent} opacity="0.32" />
          <path d="M2,0 L3,3 L2,6" stroke="#fff" strokeWidth="0.5" opacity="0.18" fill="none" />
        </pattern>
      );
    case "denim":
      return (
        <pattern id={id} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform={`${t} rotate(-25)`}>
          <rect width="5" height="5" fill={hex} />
          <rect width="1.4" height="5" fill={accent} opacity="0.45" />
          <rect x="3" width="0.5" height="5" fill="#fff" opacity="0.08" />
        </pattern>
      );
    case "linen":
      return (
        <pattern id={id} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform={t}>
          <rect width="9" height="9" fill={hex} />
          <path d="M0,2.5 H9 M0,6.8 H9" stroke={accent} strokeWidth="0.45" opacity="0.22" />
          <path d="M3.2,0 V9 M7.6,0 V9" stroke={accent} strokeWidth="0.4" opacity="0.16" />
          <path d="M1,4.5 H4" stroke={accent} strokeWidth="0.8" opacity="0.18" />
        </pattern>
      );
    default:
      return (
        <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform={`${t} rotate(35)`}>
          <rect width="6" height="6" fill={hex} />
          <rect width="0.7" height="6" fill={accent} opacity="0.09" />
        </pattern>
      );
  }
}

export interface GarmentFlatProps {
  kind: GarmentKind;
  hex: string;
  accent?: string;
  pattern: FabricPattern;
  className?: string;
  shadow?: boolean;
  title?: string;
}

const INK = "#2a2622";

export function GarmentFlat({ kind, hex, accent, pattern, className, shadow = true, title }: GarmentFlatProps) {
  const uid = useId().replace(/:/g, "");
  const fill = `url(#f-${uid})`;
  const s = specs[kind];
  const buttonFill = accent ?? "#3a332b";

  return (
    <svg viewBox="0 0 200 240" className={className} role="img" aria-label={title ?? kind} fill="none">
      {title && <title>{title}</title>}
      <defs>
        <FabricPatternDef id={`f-${uid}`} hex={hex} accent={accent} pattern={pattern} />
      </defs>

      {/* cut-paper shadow on the table */}
      {shadow && (
        <g transform="translate(4,6)" fill={INK} opacity="0.08">
          {s.strap && <path d={s.strap} stroke={INK} strokeWidth="9" fill="none" />}
          {s.sleeves.map((d) => (
            <path key={d} d={d} />
          ))}
          <path d={s.body} />
          {s.parts?.map((d) => <path key={d} d={d} />)}
        </g>
      )}

      {s.inside && <path d={s.inside} fill={hex} stroke={INK} strokeWidth="1.2" />}
      {s.inside && <path d={s.inside} fill={INK} opacity="0.22" />}

      {s.strap && (
        <>
          <path d={s.strap} stroke={INK} strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d={s.strap} stroke={fill} strokeWidth="6.4" strokeLinecap="round" fill="none" />
          <path d={s.strap} stroke={INK} strokeWidth="0.6" strokeDasharray="2.5 2" opacity="0.5" fill="none" />
        </>
      )}

      <g stroke={INK} strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round">
        {s.sleeves.map((d) => (
          <g key={d}>
            <path d={d} fill={fill} />
            <path d={d} fill={INK} opacity="0.07" stroke="none" />
          </g>
        ))}
        <path d={s.body} fill={fill} />
        {s.creases?.map((d) => (
          <path key={d} d={d} stroke={INK} strokeWidth="0.8" opacity="0.16" fill="none" />
        ))}
        {s.parts?.map((d) => (
          <g key={d}>
            <path d={d} fill={fill} />
            <path d={d} fill="#fff" opacity="0.06" stroke="none" />
          </g>
        ))}
        {s.lines?.map((d) => (
          <path key={d} d={d} fill="none" strokeWidth="1" />
        ))}
        {s.stitches?.map((d) => (
          <path key={d} d={d} fill="none" strokeWidth="0.7" strokeDasharray="2.6 2.2" opacity="0.55" />
        ))}
        {s.fringe && <path d={s.fringe} strokeWidth="0.9" opacity="0.8" stroke={accent ?? INK} />}
        {s.buttons?.map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="2.6" fill={buttonFill} strokeWidth="0.9" />
            <circle cx={x - 0.6} cy={y - 0.5} r="0.45" fill="#fff" stroke="none" opacity="0.7" />
          </g>
        ))}
      </g>

      {kind === "tote" && (
        <text x="100" y="162.5" textAnchor="middle" fontFamily="Courier Prime, monospace" fontSize="7" letterSpacing="1.5" fill={INK} opacity="0.75">
          OURLET
        </text>
      )}
    </svg>
  );
}

/** A brass-coloured wooden hanger, drawn to sit above a GarmentFlat. */
export function Hanger({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 48" className={className} fill="none" aria-hidden>
      <path d="M60 18 V10 a6 6 0 1 1 6 -6" stroke="#8a6a37" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M8 42 L60 18 L112 42 Q114 46 108 46 H12 Q6 46 8 42 Z" fill="#c9a46a" stroke="#6f5329" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M16 43 H104" stroke="#6f5329" strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}
