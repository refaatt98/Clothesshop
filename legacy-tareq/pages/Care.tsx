import { useState } from "react";
import { Link } from "react-router";
import { CareSymbol } from "../components/Decor";
import { Swatch } from "../components/Swatch";
import { HandNote, PageHeader, SectionHead } from "../components/ui";
import { useDocumentTitle } from "../lib/hooks";
import type { FabricPattern } from "../types";

type Sym = "wash" | "iron" | "dry" | "hand" | "noBleach" | "flat";

const guides: { id: string; name: string; hex: string; accent?: string; pattern: FabricPattern; symbols: Sym[]; steps: string[]; tip: string }[] = [
  {
    id: "linen",
    name: "الكتّان",
    hex: "#D9C7A7",
    accent: "#7A6744",
    pattern: "linen",
    symbols: ["wash", "noBleach", "dry", "iron"],
    steps: ["غسالة على 30° بدورة لطيفة.", "انشره في الظل، واتركه رطباً قليلاً.", "إن أردت الكيّ، اكوِه رطباً من الوجه الخلفي.", "أو لا تكوِه — التجاعيد جزء من جماله."],
    tip: "الكتّان يزداد نعومة مع كل غسلة. لا تخف منه.",
  },
  {
    id: "wool",
    name: "الصوف والتويد",
    hex: "#8C7B65",
    accent: "#5F5242",
    pattern: "herringbone",
    symbols: ["hand", "noBleach", "flat", "iron"],
    steps: ["افرشه بفرشاة ملابس بعد كل لبسة.", "علّقه في الهواء الطلق ليتنفّس — هذا يغني عن الغسيل غالباً.", "نظّف البقع موضعياً بماء بارد.", "استعمل البخار بدل المكواة."],
    tip: "الصوف ينظّف نفسه حين يُهوّى. اغسله أقلّ مما تظن.",
  },
  {
    id: "knit",
    name: "التريكو",
    hex: "#E8E0CF",
    accent: "#B5AA92",
    pattern: "rib",
    symbols: ["hand", "noBleach", "flat"],
    steps: ["اغسله يدوياً بماء فاتر وصابون للصوف.", "لا تعصره — لفّه في منشفة واضغط.", "جفّفه مسطّحاً بعيداً عن الشمس.", "اطوِه ولا تعلّقه، ودعه يرتاح يوماً بين اللبسات."],
    tip: "في الداخل بطاقة صوف احتياطي للرفو. احتفظ بها.",
  },
  {
    id: "denim",
    name: "الدنيم",
    hex: "#2E3F5C",
    accent: "#4D6383",
    pattern: "denim",
    symbols: ["wash", "noBleach", "dry"],
    steps: ["لا تغسله في الأشهر الستة الأولى إن استطعت.", "حين تغسله: بارد، مقلوباً، وحده.", "انشره ليجف — لا نشّافة أبداً.", "انقعه في الخلّ الأبيض مرة لتثبيت اللون."],
    tip: "البَهتات خريطة لحياتك. لا تمحها بالغسيل.",
  },
  {
    id: "cotton",
    name: "القطن والبوبلين",
    hex: "#F1EEE7",
    accent: "#6E8BA6",
    pattern: "stripe",
    symbols: ["wash", "noBleach", "dry", "iron"],
    steps: ["غسالة على 30° مع ألوان مشابهة.", "علّقه على شمّاعة ليجف بلا تجاعيد.", "اكوِه وهو رطب قليلاً للمعة نظيفة.", "أزرار الصدف: اقلب القميص قبل الكيّ."],
    tip: "قميص البوبلين المعلّق مبلولاً على شمّاعة يكاد لا يحتاج كيّاً.",
  },
  {
    id: "silk",
    name: "الحرير والفوال",
    hex: "#E9D8A6",
    accent: "#B9A26A",
    pattern: "check",
    symbols: ["hand", "noBleach", "flat", "iron"],
    steps: ["اغسله يدوياً بماء بارد وصابون لطيف.", "اشطفه جيداً ولا تفركه.", "جفّفه في الظل على منشفة.", "كيّ بارد جداً من الخلف، عبر قطعة قماش."],
    tip: "الحرير يحبّ البرودة والصبر — مثلنا تماماً.",
  },
];

const legend: { s: Sym; t: string }[] = [
  { s: "wash", t: "غسالة، الرقم هو الحرارة القصوى" },
  { s: "hand", t: "غسيل يدوي فقط" },
  { s: "noBleach", t: "لا مبيّض" },
  { s: "dry", t: "يُنشر على حبل ليجف" },
  { s: "flat", t: "يُجفّف مسطّحاً" },
  { s: "iron", t: "كيّ بحرارة منخفضة" },
];

export default function Care() {
  useDocumentTitle("العناية بالقماش");
  const [open, setOpen] = useState(guides[0].id);
  const g = guides.find((x) => x.id === open)!;

  return (
    <>
      <PageHeader
        trail={[{ label: "الرئيسية", to: "/" }, { label: "العناية بالقماش" }]}
        kicker="ملاحظات الغسيل"
        title={
          <>
            اغسل أقلّ، <em className="text-thread not-italic">هوِّ أكثر.</em>
          </>
        }
        intro="معظم الملابس تبلى من الغسيل لا من اللبس. هنا كيف تعتني بكل قماش نستخدمه — وإن حدث شيء، فالرفو علينا."
      />

      <section className="wrap py-14">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0" role="tablist">
          {guides.map((x) => (
            <button key={x.id} role="tab" aria-selected={open === x.id} onClick={() => setOpen(x.id)} className={`flex shrink-0 items-center gap-2 rounded-full py-1.5 pe-4 ps-1.5 text-sm ring-1 transition ${open === x.id ? "bg-ink text-paper ring-ink" : "ring-line hover:ring-ink/40"}`}>
              <span className="h-7 w-7 rounded-full ring-1 ring-ink/10" style={{ background: x.hex }} />
              {x.name}
            </button>
          ))}
        </div>

        <div key={g.id} className="mt-8 grid gap-8 rounded-md bg-tissue p-6 ring-1 ring-line md:grid-cols-[220px_1fr] md:p-10">
          <Swatch hex={g.hex} accent={g.accent} pattern={g.pattern} width={200} height={200} scale={2.6} className="w-full max-w-56" label={g.name} />
          <div>
            <h2 className="font-display text-[2.4rem] leading-tight">{g.name}</h2>
            <div className="mt-4 flex gap-3 text-ink">
              {g.symbols.map((s) => (
                <CareSymbol key={s} kind={s} className="h-9 w-9" />
              ))}
            </div>
            <ol className="mt-6 space-y-3">
              {g.steps.map((s, i) => (
                <li key={s} className="flex gap-4 text-lg text-ink-2">
                  <span className="font-mono text-sm text-thread">0{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <HandNote className="mt-6 text-2xl" rotate={-1}>
              {g.tip}
            </HandNote>
          </div>
        </div>
      </section>

      <section className="wrap py-10">
        <SectionHead no="01" kicker="لغة الملصق" title={<>ماذا تعني <em className="text-thread not-italic">الرموز</em></>} />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {legend.map((l) => (
            <div key={l.s} className="flex items-center gap-4 rounded-md p-4 ring-1 ring-line">
              <CareSymbol kind={l.s} className="h-10 w-10 shrink-0" />
              <span className="text-ink-2">{l.t}</span>
            </div>
          ))}
        </div>
        <p className="mt-8 text-ink-2">
          ثقب؟ زرّ ضائع؟ لا ترمِ شيئاً.{" "}
          <Link to="/mending" className="underline decoration-dashed underline-offset-4 hover:text-thread">
            اطلب رفواً مجانياً ←
          </Link>
        </p>
      </section>
    </>
  );
}
