export const colourFamilies = [
  { id: "light", name: "Lime-wash & ecru", hex: "#F1ECE1" },
  { id: "earth", name: "Sand & clay", hex: "#C9A27E" },
  { id: "blue", name: "Harbour & indigo", hex: "#4D6383" },
  { id: "green", name: "Moss & sage", hex: "#8D9A78" },
  { id: "dark", name: "Slate & ink", hex: "#3A3835" },
] as const;

export type ColourFamily = (typeof colourFamilies)[number]["id"];

function hsl(hex: string) {
  const n = hex.replace("#", "");
  const full = n.length === 3 ? n.split("").map((c) => c + c).join("") : n;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

/** Sorts a fabric colour into one of five families a person would actually say out loud. */
export function familyOf(hex: string): ColourFamily {
  const { h, s, l } = hsl(hex);
  if (l > 0.84) return "light";
  if (l < 0.33 && !(h > 190 && h < 260 && s > 0.2)) return "dark";
  if (h > 180 && h < 270) return "blue";
  if (h >= 60 && h <= 180) return "green";
  return "earth";
}

/** Whether ink or paper text reads better on top of a colour. */
export function isDark(hex: string) {
  return hsl(hex).l < 0.5;
}
