import { motion } from "motion/react";
import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { GarmentFlat } from "../components/GarmentFlat";
import { Button, Field, HandNote, inputCls, PageHeader, Reveal, SectionHead } from "../components/ui";
import { requestMend } from "../lib/api";
import { useDocumentTitle } from "../lib/hooks";
import { useShop } from "../lib/store";

const problems = ["ثقب", "درزة مفتوحة", "زرّ ضائع", "سحّاب", "حاشية", "بقعة عنيدة", "شيء آخر"];

const steps = [
  { t: "اطلب", d: "املأ النموذج أدناه. لا حاجة لإيصال — رقم الإصدار على الملصق يكفي." },
  { t: "أرسل", d: "نرسل لك ملصق شحن مجاني بالبريد. ضع القطعة في أي كيس وأرسلها." },
  { t: "نرفو", d: "سمير على طاولة الرفو يُنزل باترونها عن الجدار ويصلحها بقماشها الأصلي." },
  { t: "تعود", d: "خلال 3 أسابيع تقريباً، مكويّة، مع ملاحظة عمّا فعلناه." },
];

/** رقعة رفو مرسومة: قبل وبعد. */
function DarnPatch({ fixed }: { fixed: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className="w-full" aria-hidden>
      <rect width="120" height="120" rx="6" fill="#A9583A" />
      {Array.from({ length: 30 }).map((_, i) => (
        <rect key={i} x={i * 4} width="1.2" height="120" fill="#6E3523" opacity="0.35" />
      ))}
      {!fixed ? (
        <path d="M48,50 Q60,40 72,52 Q76,66 62,72 Q46,72 48,50 Z" fill="#f6f1e7" stroke="#6E3523" strokeDasharray="2 2" />
      ) : (
        <g>
          {Array.from({ length: 9 }).map((_, i) => (
            <path key={`v${i}`} d={`M${44 + i * 4},42 V78`} stroke="#E9D8A6" strokeWidth="2.4" />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <path key={`h${i}`} d={`M42,${44 + i * 4} H80`} stroke="#ECD9A2" strokeWidth="1.6" strokeDasharray="4 4" strokeDashoffset={i % 2 ? 4 : 0} />
          ))}
        </g>
      )}
    </svg>
  );
}

export default function Mending() {
  useDocumentTitle("الرفو مدى الحياة");
  const { catalog } = useShop();
  const [fixed, setFixed] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", piece: "", problem: problems[0], details: "" });
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ reference: string; labelSentTo: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setState("busy");
    try {
      const r = await requestMend({ name: form.name, email: form.email, piece: form.piece, problem: `${form.problem}: ${form.details}` });
      setResult(r);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ ما");
      setState("idle");
    }
  }

  return (
    <>
      <PageHeader
        trail={[{ label: "الرئيسية", to: "/" }, { label: "الرفو مدى الحياة" }]}
        kicker="الوعد الذي بُنيت عليه الدار"
        title={
          <>
            ما دامت القطعة موجودة، <em className="text-thread not-italic">نرفوها مجاناً.</em>
          </>
        }
        intro="لا تاريخ انتهاء. لا شروط صغيرة. ولو اشتريتها مستعملة. أرسلها لنا، نصلحها، ونعيدها — هذا بدل التخفيضات."
      >
        <div className="mt-8 flex flex-wrap gap-8">
          {[
            ["1,204", "قطعة رُفيت في 2026"],
            ["19", "يوماً متوسط العودة"],
            ["0 ₪", "دفعها أحد مقابل الرفو"],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="font-display text-[2.4rem] leading-none">{n}</p>
              <p className="label mt-1 text-ink-3">{l}</p>
            </div>
          ))}
        </div>
      </PageHeader>

      <section className="wrap grid items-center gap-10 py-14 md:grid-cols-[1fr_1.2fr]">
        <div className="relative mx-auto w-full max-w-sm">
          <motion.div key={String(fixed)} initial={{ rotate: -4, opacity: 0.4 }} animate={{ rotate: -2, opacity: 1 }} className="overflow-hidden rounded-md ring-1 ring-line">
            <DarnPatch fixed={fixed} />
          </motion.div>
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-full bg-paper-2 p-1">
            <button onClick={() => setFixed(false)} className={`rounded-full py-2 text-sm ${!fixed ? "bg-ink text-paper" : ""}`}>
              قبل
            </button>
            <button onClick={() => setFixed(true)} className={`rounded-full py-2 text-sm ${fixed ? "bg-ink text-paper" : ""}`}>
              بعد
            </button>
          </div>
          <HandNote className="mt-4 text-xl">كوع كنزة الفانوس، 2025 — رفو بلون الزبدة</HandNote>
        </div>
        <div>
          <SectionHead no="01" kicker="كيف يعمل" title={<>أربع خطوات، <em className="text-thread not-italic">ولا فاتورة</em></>} />
          <ol className="mt-8 space-y-5">
            {steps.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.06}>
                <li className="flex gap-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full font-mono text-sm ring-1 ring-ink/25">0{i + 1}</span>
                  <div>
                    <h3 className="font-display text-2xl">{s.t}</h3>
                    <p className="text-ink-2">{s.d}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section id="request" className="wrap scroll-mt-28 py-10">
        <div className="grid gap-10 rounded-md bg-tissue p-6 ring-1 ring-line md:p-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="label text-thread">بطاقة طلب رفو</p>
            <h2 className="mt-2 font-display text-[2.4rem] leading-tight">ما الذي يحتاج إصلاحاً؟</h2>
            <p className="mt-3 text-ink-2">املأ البطاقة وسنرسل لك ملصق الشحن المجاني فوراً. إن لم تكن متأكّداً من اسم القطعة، اختر «قطعة أخرى من أورليه».</p>
            {form.piece && catalog && (
              <div className="mt-6 grid h-48 place-items-center rounded-md bg-mat">
                {(() => {
                  const p = catalog.find((x) => x.slug === form.piece);
                  return p ? <GarmentFlat kind={p.garment} {...p.colorways[0]} className="h-40" /> : null;
                })()}
              </div>
            )}
          </div>

          {state === "done" && result ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col justify-center rounded-md bg-paper p-8 ring-1 ring-line" role="status">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-sage text-tissue">
                <Check className="h-6 w-6" />
              </span>
              <p className="mt-4 font-display text-3xl">استلمنا طلبك.</p>
              <p className="mt-2 text-ink-2">
                رقم المرجع <span className="font-mono font-bold text-ink">{result.reference}</span>. أرسلنا ملصق الشحن المجاني إلى <span dir="ltr">{result.labelSentTo}</span>.
              </p>
              <HandNote className="mt-4 text-2xl">سمير بانتظار قطعتك ✂</HandNote>
              <Button
                variant="paper"
                className="mt-6 self-start"
                onClick={() => {
                  setState("idle");
                  setForm({ ...form, details: "" });
                }}
              >
                طلب رفو آخر
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="اسمك">
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
                </Field>
                <Field label="بريدك الإلكتروني">
                  <input required type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <Field label="القطعة">
                <select required value={form.piece} onChange={(e) => setForm({ ...form, piece: e.target.value })} className={inputCls}>
                  <option value="">اختر القطعة…</option>
                  {catalog?.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                  <option value="other">قطعة أخرى من أورليه</option>
                </select>
              </Field>
              <div>
                <span className="label text-ink-3">المشكلة</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {problems.map((p) => (
                    <button type="button" key={p} onClick={() => setForm({ ...form, problem: p })} className={`rounded-full px-3 py-1.5 text-sm ring-1 ${form.problem === p ? "bg-ink text-paper ring-ink" : "ring-line hover:ring-ink/40"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="صِف لنا ما حدث" hint="أين المشكلة، وكم حجمها، وهل تحبّ رفواً ظاهراً بلون مختلف أم مخفياً؟">
                <textarea required rows={4} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} className={inputCls} />
              </Field>
              {error && (
                <p className="text-sm text-thread" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={state === "busy"}>
                {state === "busy" ? "نجهّز الملصق…" : "أرسلوا لي ملصق الشحن"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
