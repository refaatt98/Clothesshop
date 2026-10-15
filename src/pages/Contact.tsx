import { motion } from "motion/react";
import { Check, Mail, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { Button, Field, HandNote, inputCls, PageHeader, Skeleton } from "../components/ui";
import { getStores, sendContactMessage } from "../lib/api";
import { useAsync, useDocumentTitle } from "../lib/hooks";

const topics = ["سؤال عن قطعة", "طلبي", "المقاسات", "الرفو", "إرجاع أو استبدال", "طلب قطعة خاصة", "صحافة وتعاون", "شيء آخر"];

export default function Contact() {
  useDocumentTitle("راسلنا");
  const { data: stores } = useAsync(getStores, []);
  const [form, setForm] = useState({ name: "", email: "", topic: topics[0], message: "" });
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setState("busy");
    try {
      const r = await sendContactMessage(form);
      setTicket(r.ticket);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ ما");
      setState("idle");
    }
  }

  return (
    <>
      <PageHeader
        trail={[{ label: "الرئيسية", to: "/" }, { label: "راسلنا" }]}
        kicker="ورقة رسائل"
        title={
          <>
            اكتب لنا. <em className="text-thread not-italic">يقرأ رسالتك إنسان.</em>
          </>
        }
        intro="نردّ عادة خلال يوم عمل واحد، من المشغل في عمّان. للأسئلة السريعة، اطّلع أولاً على الأسئلة الشائعة."
      />

      <section className="wrap grid gap-10 py-14 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-md bg-tissue bg-ruled p-6 ring-1 ring-line md:p-10">
          {state === "done" ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} role="status">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-sage text-tissue">
                <Check className="h-6 w-6" />
              </span>
              <h2 className="mt-4 font-display text-3xl">وصلت رسالتك، {form.name.split(" ")[0]}.</h2>
              <p className="mt-2 text-ink-2">
                رقم التذكرة <span className="font-mono font-bold text-ink">{ticket}</span>. سنردّ على <span dir="ltr">{form.email}</span> خلال يوم عمل.
              </p>
              <HandNote className="mt-4 text-2xl">— رانيا، من طاولة الرسائل</HandNote>
              <div className="mt-6 flex gap-3">
                <Button
                  variant="paper"
                  onClick={() => {
                    setState("idle");
                    setForm({ ...form, message: "" });
                  }}
                >
                  رسالة أخرى
                </Button>
                <Button to="/shop">عُد إلى المتجر</Button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="اسمك">
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} autoComplete="name" />
                </Field>
                <Field label="بريدك الإلكتروني">
                  <input required type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} autoComplete="email" />
                </Field>
              </div>
              <div>
                <span className="label text-ink-3">الموضوع</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {topics.map((t) => (
                    <button type="button" key={t} onClick={() => setForm({ ...form, topic: t })} className={`rounded-full px-3 py-1.5 text-sm ring-1 ${form.topic === t ? "bg-ink text-paper ring-ink" : "bg-paper ring-line hover:ring-ink/40"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="رسالتك" hint="إن كان الأمر عن طلب، أضف رقمه (يبدأ بـ OU-).">
                <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputCls} />
              </Field>
              {error && (
                <p className="text-sm text-thread" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={state === "busy"}>
                {state === "busy" ? "نطوي الرسالة…" : "أرسل الرسالة"}
              </Button>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          <p className="label text-ink-3">أو تواصل مع محلّ مباشرة</p>
          {!stores && <Skeleton className="h-40" />}
          {stores?.map((s) => (
            <div key={s.id} className="rounded-md p-5 ring-1 ring-line">
              <p className="font-display text-2xl">
                {s.city} <span className="text-base text-ink-3">· {s.country}</span>
              </p>
              <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="mt-3 flex items-center gap-2 text-ink-2 hover:text-thread">
                <Phone className="h-4 w-4" /> <span dir="ltr">{s.phone}</span>
              </a>
              <a href={`mailto:${s.email}`} className="mt-1 flex items-center gap-2 text-ink-2 hover:text-thread">
                <Mail className="h-4 w-4" /> <span dir="ltr">{s.email}</span>
              </a>
            </div>
          ))}
          <p className="text-sm text-ink-2">
            تبحث عن جواب سريع؟{" "}
            <Link to="/help" className="underline decoration-dashed underline-offset-4 hover:text-thread">
              الأسئلة الشائعة
            </Link>
          </p>
        </aside>
      </section>
    </>
  );
}
