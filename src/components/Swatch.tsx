import { useId } from "react";
import type { FabricPattern } from "../types";
import { FabricPatternDef } from "./GarmentFlat";

/** Zig-zag outline, as if cut with pinking shears. */
function pinkedPath(w: number, h: number, tooth = 6, depth = 3.2) {
  const pts: string[] = [];
  const nx = Math.round(w / tooth);
  const ny = Math.round(h / tooth);
  const sx = w / nx;
  const sy = h / ny;
  for (let i = 0; i <= nx * 2; i++) pts.push(`${(i * sx) / 2},${i % 2 ? depth : 0}`);
  for (let i = 1; i <= ny * 2; i++) pts.push(`${w - (i % 2 ? depth : 0)},${(i * sy) / 2}`);
  for (let i = 1; i <= nx * 2; i++) pts.push(`${w - (i * sx) / 2},${h - (i % 2 ? depth : 0)}`);
  for (let i = 1; i < ny * 2; i++) pts.push(`${i % 2 ? depth : 0},${h - (i * sy) / 2}`);
  return `M${pts.join(" L")} Z`;
}

export function Swatch({
  hex,
  accent,
  pattern,
  width = 120,
  height = 120,
  className,
  scale = 1.6,
  label,
}: {
  hex: string;
  accent?: string;
  pattern: FabricPattern;
  width?: number;
  height?: number;
  className?: string;
  scale?: number;
  label?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const d = pinkedPath(width, height);
  return (
    <svg viewBox={`-2 -2 ${width + 8} ${height + 8}`} className={className} role="img" aria-label={label ?? "fabric swatch"}>
      <defs>
        <FabricPatternDef id={`s-${uid}`} hex={hex} accent={accent} pattern={pattern} scale={scale} />
      </defs>
      <path d={d} transform="translate(3,4)" fill="#1e1c19" opacity="0.1" />
      <path d={d} fill={`url(#s-${uid})`} stroke="#1e1c19" strokeOpacity="0.25" strokeWidth="0.8" />
      <rect x="9" y="9" width={width - 18} height={height - 18} fill="none" stroke="#1e1c19" strokeOpacity="0.28" strokeDasharray="3 2.5" strokeWidth="0.8" />
    </svg>
  );
}
