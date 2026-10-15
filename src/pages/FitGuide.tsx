import { motion } from "motion/react";
import { useState } from "react";
import { HandNote, PageHeader, SectionHead } from "../components/ui";
import { bottomSizes, fitNotes, suggestSize, topSizes } from "../lib/fit";
import { useDocumentTitle } from "../lib/hooks";
import type { Fit } from "../types";

const fits: { id: Fit; name: string }[] = [
  { id: "close", name: "ضيّقة" },
  { id: "true", name: "عادية" },
  { id: "relaxed", name: "مريحة" },
  { id: "generous", name: "سخيّة" },
];

/** مانيكان الخيّاط مع خطوط القياس. */
function DressForm({ active }: { active: string }) {
  const lines: Record<string, { d: string; label: string; y: number }> = {
    chest: { d: "M62,92 Q100,104 138,92", label: "الصدر", y: 88 },
    waist: { d: "M70,140 Q100,150 130,140", label: "الخصر", y: 136 },
    hip: { d: "M64,180 Q100,192 136,180", label: "الورك", y: 176 },
    inseam: { d: "M100,212 V300", label: "الطول الداخلي", y: 260 },
  };
  return (
    <svg viewBox="0 0 200 340" className="h-full w-full" aria-label="مانيكان مع خطوط القياس">
      <path d="M100,212 V310 M78,318 H122" stroke="#8a6a37" strokeWidth="4" strokeLinecap="round" />
      <path d="M86,40 Q100,30 114,40 L118,54 Q140,60 142,80 Q138,120 128,140 Q140,170 138,196 Q100,222 62,196 Q60,170 72,140 Q62,120 58,80 Q60,60 82,54 Z" fill="#efe6d2" stroke="#2a2622" strokeWidth="1.4" />
      <path d="M100,54 V210" stroke="#2a2622" strokeOpacity="0.15" strokeDasharray="3 3" />
      <ellipse cx="100" cy="38" rx="12" ry="5" fill="#c9a46a" stroke="#6f5329" />
      {Object.entries(lines).map(([k, l]) => (
        <g key={k} opacity={active === k ? 1 : 0.35}>
          <motion.path d={l.d} fill="none" stroke="#c2432e" strokeWidth={active === k ? 2.4 : 1.4} strokeDasharray="5 3" initial={false} animate={{ pathLength: 1 }} />
          <text x={k === "inseam" ? 106 : 150} y={l.y} fontSize="10" fontFamily="IBM Plex Sans Arabic" fill="#c2432e" textAnchor="start">
            {l.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function FitGuide() {
  useDocumentTitle("دليل المقاسات");
  const [chest, setChest] = useState(96);
  const [waist, setWaist] = useState(80);
  const [pref, setPref] = useState<"neat" | "easy">("easy");
  const [focus, setFocus] = useState("chest");

  return (
    <>
      <PageHeader
        trail={[{ label: "الرئيسية", to: "/" }, { label: "دليل المقاسات" }]}
        kicker="شريط القياس"
        title={
          <>
            نقيس الناس، <em className="text-thread not-italic">لا المقاسات.</em>
          </>
        }
        intro="أدخل قياساتك وسنقترح مقاساً لكل قصّة من قصّاتنا الأربع. وإن ترددت، اكتب لنا — أو تعال إلى أحد محلّاتنا ونقيسك بأنفسنا."
      />

      <section className="wrap grid gap-10 py-14 lg:grid-cols-[1fr_1.3fr]">
        <div className="relative rounded-md bg-mat p-6 ring-1 ring-chalk/20">
          <div className="mx-auto aspect-[200/340] max-h-[460px]">
            <DressForm active={focus} />
          </div>
          <HandNote className="absolute bottom-4 left-4 text-xl">قِس فوق قميص خفيف، لا فوق كنزة</HandNote>
        </div>

        <div>
          <h2 className="font-display text-[2rem]">حاسبة المقاس</h2>
          <div className="mt-6 space-y-6">
            <div onFocus={() => setFocus("chest")} onMouseEnter={() => setFocus("chest")}>
              <div className="flex justify-between">
                <label htmlFor="fg-chest">محيط الصدر — تحت الإبطين، عند أعرض نقطة</label>
                <span className="font-mono">{chest} سم</span>
              </div>
              <input id="fg-chest" type="range" min={76} max={128} value={chest} onChange={(e) => setChest(Number(e.target.value))} className="mt-2 w-full accent-thread" />
            </div>
            <div onFocus={() => setFocus("waist")} onMouseEnter={() => setFocus("waist")}>
              <div className="flex justify-between">
                <label htmlFor="fg-waist">محيط الخصر — حيث يجلس البنطال عادة</label>
                <span className="font-mono">{waist} سم</span>
              </div>
              <input id="fg-waist" type="range" min={60} max={100} value={waist} onChange={(e) => setWaist(Number(e.target.value))} className="mt-2 w-full accent-thread" />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["easy", "neat"] as const).map((p) => (
                <button key={p} onClick={() => setPref(p)} className={`rounded-full px-4 py-2 text-sm ring-1 ${pref === p ? "bg-ink text-paper ring-ink" : "ring-line"}`}>
                  {p === "easy" ? "أحبّ الملابس مريحة" : "أحبّ الملابس مرتّبة"}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-md ring-1 ring-line">
            <table className="w-full text-sm">
              <thead className="bg-paper-2 text-ink-2">
                <tr>
                  <th className="p-3 text-start font-medium">القصّة</th>
                  <th className="p-3 text-start font-medium">القطع العلوية</th>
                  <th className="p-3 text-start font-medium">البناطيل</th>
                </tr>
              </thead>
              <tbody className="bg-tissue">
                {fits.map((f) => {
                  const top = suggestSize({ category: "shirts", chest, fit: f.id, preference: pref });
                  const bottom = suggestSize({ category: "trousers", waist, fit: f.id, preference: pref });
                  return (
                    <tr key={f.id} className="border-t border-dashed border-ink/20">
                      <td className="p-3">
                        <p className="font-display text-lg">{f.name}</p>
                        <p className="text-xs text-ink-3">{fitNotes[f.id].split("—")[1]}</p>
                      </td>
                      <td className="p-3">
                        <motion.span key={top?.size} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="inline-block rounded-md bg-ink px-2.5 py-1 font-mono text-paper">
                          {top?.size}
                        </motion.span>
                      </td>
                      <td className="p-3">
                        <motion.span key={bottom?.size} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="inline-block rounded-md bg-thread px-2.5 py-1 font-mono text-tissue">
                          {bottom?.size}
                        </motion.span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-ink-3">كل صفحة قطعة تذكر قصّتها، وفيها «مساعد مقاس» يستخدم الحسبة نفسها.</p>
        </div>
      </section>

      <section className="wrap py-10">
        <SectionHead no="01" kicker="جدول المقاسات" title={<>الأرقام <em className="text-thread not-italic">كاملة</em></>} aside={<p className="text-ink-2">قياسات الجسم بالسنتيمتر. للقطع نفسها وهي ممدودة، انظر تبويب «القياسات» في صفحة كل قطعة.</p>} />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="overflow-x-auto rounded-md ring-1 ring-line">
            <table className="w-full min-w-[420px] bg-tissue text-sm">
              <caption className="bg-paper-2 p-3 text-start font-display text-lg">القمصان والتريكو والمعاطف والفساتين</caption>
              <thead>
                <tr className="text-ink-3">
                  <th className="p-3 text-start font-medium">المقاس</th>
                  <th className="p-3 text-start font-medium">الصدر</th>
                  <th className="p-3 text-start font-medium">الخصر</th>
                </tr>
              </thead>
              <tbody>
                {topSizes.map((s) => (
                  <tr key={s.size} className="border-t border-dashed border-ink/20" onMouseEnter={() => setFocus("chest")}>
                    <td className="p-3 font-mono font-bold">{s.size}</td>
                    <td className="p-3 text-right font-mono" dir="ltr">{s.chest[0]}–{s.chest[1]}</td>
                    <td className="p-3 text-right font-mono" dir="ltr">{s.waist[0]}–{s.waist[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="overflow-x-auto rounded-md ring-1 ring-line">
            <table className="w-full min-w-[320px] bg-tissue text-sm">
              <caption className="bg-paper-2 p-3 text-start font-display text-lg">البناطيل</caption>
              <thead>
                <tr className="text-ink-3">
                  <th className="p-3 text-start font-medium">المقاس</th>
                  <th className="p-3 text-start font-medium">الخصر</th>
                </tr>
              </thead>
              <tbody>
                {bottomSizes.map((s) => (
                  <tr key={s.size} className="border-t border-dashed border-ink/20" onMouseEnter={() => setFocus("waist")}>
                    <td className="p-3 font-mono font-bold">{s.size}</td>
                    <td className="p-3 text-right font-mono" dir="ltr">{s.waist[0]}–{s.waist[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="wrap py-14">
        <SectionHead no="02" kicker="كيف تقيس" title={<>أربعة قياسات، <em className="text-thread not-italic">ودقيقتان</em></>} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["chest", "الصدر", "لفّ الشريط تحت الإبطين حول أعرض جزء من الصدر، أفقياً، دون أن تشدّ."],
            ["waist", "الخصر", "حول المكان الذي تحب أن يجلس فيه البنطال — عادة فوق عظم الورك بقليل."],
            ["hip", "الورك", "قف بقدمين متلاصقتين وقِس حول أعرض نقطة في الورك."],
            ["inseam", "الطول الداخلي", "من أعلى الفخذ الداخلي حتى حيث تريد أن تنتهي الحاشية. أو قِس بنطالاً تحبّه."],
          ].map(([k, t, d], i) => (
            <button key={k} onMouseEnter={() => setFocus(k)} onFocus={() => setFocus(k)} onClick={() => setFocus(k)} className={`rounded-md p-6 text-start ring-1 transition ${focus === k ? "bg-tissue ring-thread" : "ring-line hover:ring-ink/30"}`}>
              <span className="font-mono text-sm text-thread">0{i + 1}</span>
              <h3 className="mt-2 font-display text-2xl">{t}</h3>
              <p className="mt-2 text-ink-2">{d}</p>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
