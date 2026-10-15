import { seasonWord, weightWord } from "../lib/fabric";
import type { Fabric } from "../types";
import { Meter } from "./ui";

/** Plain-language qualities of a cloth: four bars and two easy chips. */
export function FabricQualities({ fabric }: { fabric: Fabric }) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-butter/60 px-3 py-1 text-sm">الوزن: {weightWord(fabric.gsm)}</span>
        <span className="rounded-full bg-paper-2 px-3 py-1 text-sm ring-1 ring-line">{seasonWord(fabric)}</span>
      </div>
      <div className="space-y-2.5">
        <Meter label="النعومة" value={fabric.soft} />
        <Meter label="الدفء" value={fabric.warmth} />
        <Meter label="التهوية" value={fabric.breath} />
        <Meter label="المتانة" value={fabric.age} />
      </div>
      <p className="mt-3 text-xs text-ink-3">كلما امتلأ الشريط، كانت الصفة أقوى.</p>
    </div>
  );
}
