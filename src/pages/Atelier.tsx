import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { RotatingStamp, ScrollThread } from "../components/Decor";
import { GarmentFlat } from "../components/GarmentFlat";
import { Button, HandNote, PageHeader, PinHead, Reveal, SectionHead, Skeleton } from "../components/ui";
import { getHouseTimeline, getMakers } from "../lib/api";
import { useAsync, useDocumentTitle } from "../lib/hooks";

const promises = [
  { t: "لا تخفيضات. أبداً.", d: "نصنع إصدارات مرقّمة بقدر ما نستطيع بيعه بسعر عادل، فلا يتراكم فائض نحتاج لتصريفه." },
  { t: "رفو مدى الحياة", d: "ثقب، زرّ، حاشية، سحّاب — كل قطعة من أورليه تُصلح مجاناً طوال عمرها، أيّاً كان مالكها." },
  { t: "صانع واحد لكل قطعة", d: "من يبدأ القطعة يُنهيها. لا خطوط إنتاج، ولا أيادٍ مجهولة." },
  { t: "صفر بلاستيك", d: "ورق باترون، كرتون مُعاد تدويره، وشريط قطني. والبطاقة مكتوبة باليد." },
  { t: "أجور معلنة", d: "كل من في المشغل يتقاضى 22% فوق أجر المعيشة على الأقل. ننشر الرقم كل سنة." },
  { t: "باترونات لا تُرمى", d: "كل باترون رسمناه ما زال معلّقاً على الجدار، لنقصّ منه رقعة مطابقة بعد عشرين سنة." },
];

/** بطاقة اسم مطرّزة، كالتي تُخاط داخل الياقة. */
function NameLabel({ name, index }: { name: string; index: number }) {
  const tints = ["#f3e9d2", "#e9efe6", "#f1e4dc", "#e6ebf1", "#efe9f3", "#f3efe0"];
  return (
    <div className="relative mx-auto w-full max-w-[220px] rotate-[-1.5deg] rounded-sm px-4 py-5 text-center shadow-[0_8px_16px_-10px_#1e1c1966]" style={{ background: tints[index % tints.length] }}>
      <div className="pointer-events-none absolute inset-1.5 rounded-sm border border-dashed border-ink/30" />
      <p className="font-hand text-[2rem] leading-none text-thread">{name.split(" ")[0]}</p>
      <p className="mt-1 font-mono text-[0.6rem] uppercase text-ink-3" dir="ltr">
        OURLET · HAND-MADE
      </p>
    </div>
  );
}

export default function Atelier() {
  useDocumentTitle("المشغل");
  const { data: makers } = useAsync(getMakers, []);
  const { data: timeline } = useAsync(getHouseTimeline, []);

  return (
    <>
      <PageHeader
        trail={[{ label: "الرئيسية", to: "/" }, { label: "المشغل" }]}
        kicker="عن الدار"
        title={
          <>
            بدأ كل شيء <em className="text-thread not-italic">ببطانية عسكرية قديمة.</em>
          </>
        }
        intro="أورليه مشغل صغير في جبل عمّان، وآخر صيفي على ساحل البرتغال. أربعة عشر صانعاً، ماكينات قديمة، وجدار طويل من الباترونات الورقية. نصنع ملابس قليلة، ونعتني بها طويلاً."
      />

      {/* صورة المشغل: طاولة قصّ مرسومة */}
      <section className="wrap py-14">
        <div className="relative grid aspect-[16/9] place-items-center overflow-hidden rounded-[10px] bg-mat ring-1 ring-chalk/20 md:aspect-[21/8]">
          <PinHead className="absolute right-4 top-4 h-7 w-7" />
          <PinHead className="absolute left-4 top-4 h-7 w-7" colour="#3f6a8a" />
          <div className="flex w-[90%] items-end justify-center gap-[3%]">
            {(
              [
                ["coat", "#B08D63", "#5B4630", "solid", -6],
                ["shirt", "#F1EEE7", "#6E8BA6", "stripe", 4],
                ["knit", "#A9583A", "#6E3523", "rib", -3],
                ["dress", "#E9D8A6", "#B9A26A", "check", 5],
                ["trousers", "#2E3F5C", "#4D6383", "denim", -4],
              ] as const
            ).map(([k, hex, acc, pat, r], i) => (
              <motion.div key={k} className="w-[17%]" initial={{ y: 40, opacity: 0, rotate: 0 }} whileInView={{ y: 0, opacity: 1, rotate: r }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.8 }}>
                <GarmentFlat kind={k} hex={hex} accent={acc} pattern={pat} className="w-full" />
              </motion.div>
            ))}
          </div>
          <HandNote className="absolute bottom-4 left-6 hidden text-2xl sm:block">الطاولة الكبيرة، عمّان — صباح الثلاثاء</HandNote>
          <RotatingStamp text="مشغل أورليه · عمّان · منذ 2014 · " className="absolute bottom-4 right-6 hidden h-24 w-24 text-ink/60 md:block">
            <span className="font-display text-xl font-bold">١٤</span>
          </RotatingStamp>
        </div>
      </section>

      <section className="wrap py-10">
        <SectionHead no="01" kicker="ستّة وعود" title={<>ما لا <em className="text-thread not-italic">نتنازل</em> عنه</>} />
        <div className="mt-10 grid gap-px overflow-hidden rounded-md bg-line ring-1 ring-line sm:grid-cols-2 lg:grid-cols-3">
          {promises.map((p, i) => (
            <Reveal key={p.t} delay={i * 0.05} className="h-full">
              <div className="h-full bg-tissue p-7">
                <span className="font-mono text-sm text-thread">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-display text-[1.7rem] leading-snug">{p.t}</h3>
                <p className="mt-2 leading-relaxed text-ink-2">{p.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap py-16">
        <SectionHead no="02" kicker="الأيدي" title={<>من يصنع <em className="text-thread not-italic">ملابسك</em></>} aside={<p className="text-ink-2">كل قطعة يبدؤها ويُنهيها واحد منهم. ويمكنك أن تلقاهم في المشغل.</p>} />
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3">
          {makers?.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.06}>
              <NameLabel name={m.name} index={i} />
              <div className="mt-5 text-center">
                <p className="font-display text-xl">{m.name}</p>
                <p className="text-sm text-ink-3">{m.role}</p>
                <p className="label mt-1 text-ink-3">
                  {m.years} سنوات · {m.city}
                </p>
                <p className="mt-3 font-hand text-xl leading-snug text-chalk">«{m.quote}»</p>
              </div>
            </Reveal>
          ))}
          {!makers && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </section>

      <section className="relative overflow-hidden bg-tissue py-16">
        <div className="wrap">
          <SectionHead no="03" kicker="الخيط الزمني" title={<>اثنا عشر عاماً، <em className="text-thread not-italic">غرزة غرزة</em></>} />
          <div className="relative mt-12">
            <ScrollThread viewBox="0 0 100 1000" d="M50,0 C10,150 90,250 50,400 S10,650 50,800 S90,950 50,1000" className="absolute bottom-0 right-0 top-0 w-10" />
            <ol className="space-y-10 pr-16">
              {timeline?.map((t, i) => (
                <Reveal key={t.year} delay={i * 0.04}>
                  <li className="grid gap-2 md:grid-cols-[140px_1fr] md:gap-8">
                    <span className="font-display text-[2.4rem] leading-none text-thread">{t.year}</span>
                    <p className="max-w-2xl text-lg leading-relaxed text-ink-2">{t.text}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="wrap py-16">
        <div className="grid items-center gap-8 rounded-md bg-ink p-8 text-paper md:grid-cols-[1.5fr_1fr] md:p-12">
          <div>
            <p className="label text-paper/60">تعال وانظر بنفسك</p>
            <h2 className="mt-3 font-display text-[2.4rem] leading-tight">جدار الباترونات مفتوح للزوّار.</h2>
            <p className="mt-3 max-w-lg text-paper/75">احجز بروفة في عمّان واطلب أن نصعد بك إلى الطابق العلوي. وفي أول سبت من كل شهر، مدرسة رفو مجانية.</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button to="/visit#book" variant="thread">
              احجز زيارة <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button to="/mending" variant="paper">
              عن الرفو
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
