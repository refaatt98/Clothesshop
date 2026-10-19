import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Clock, LoaderCircle, Mail, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { InstagramIcon, WhatsappIcon } from "../components/Icons";
import { PageHero, Reveal, SectionHeading } from "../components/ui";
import { getFaqs, submitContact, whatsappLink } from "../lib/api";
import { useAsync, useTitle } from "../lib/hooks";
import { useSite } from "../lib/site";

const channelsFor = (site: ReturnType<typeof useSite>["site"]) => [
  { icon: WhatsappIcon, title: "واتساب", value: "أسرع طريقة", href: whatsappLink(site.whatsapp, "مرحبا بَنان 🤍"), tint: "bg-sage-soft" },
  { icon: InstagramIcon, title: "إنستغرام", value: `@${site.instagram}`, href: `https://instagram.com/${site.instagram}`, tint: "bg-rose-soft" },
  { icon: Phone, title: "اتصال", value: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}`, tint: "bg-gold-soft" },
  { icon: Mail, title: "البريد", value: site.email, href: `mailto:${site.email}`, tint: "bg-cream-2" },
];

function Faq({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(i === 0);
  return (
    <div className="stitched rounded-3xl bg-linen">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="relative z-10 flex w-full items-center justify-between gap-4 p-5 text-start font-semibold">
        {q}
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="shrink-0"><ChevronDown className="size-5" /></motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="px-5 pb-5 leading-8 text-cocoa-2">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Contact() {
  useTitle("تواصلي معنا");
  const { site } = useSite();
  const channels = channelsFor(site);
  const { data: faqs } = useAsync(getFaqs, []);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2 || form.message.trim().length < 5) {
      setError("اكتبي اسمك ورسالتك لو سمحتِ");
      return;
    }
    setError("");
    setState("sending");
    try {
      await submitContact(form);
      setState("done");
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : "ما وصلت الرسالة، جرّبي كمان مرة");
      return;
    }
    setForm({ name: "", phone: "", message: "" });
  };

  return (
    <>
      <PageHero eyebrow="تواصلي معنا" title="منحب نسمع منك" text="سؤال، فكرة، أو بس بدك تحكي مرحبا — إحنا هون." />

      <section className="container-b py-12 md:py-16">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {channels.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.06}>
              <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={`stitched group flex h-full flex-col items-center gap-3 rounded-[1.75rem] p-5 text-center transition hover:-translate-y-1 ${c.tint}`}>
                <span className="grid size-12 place-items-center rounded-full bg-linen transition group-hover:rotate-12"><c.icon className="size-6" /></span>
                <span className="font-semibold">{c.title}</span>
                <span className="break-all text-sm text-cocoa-2" dir={c.title === "واتساب" ? undefined : "ltr"}>{c.value}</span>
              </a>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <Reveal>
            <form onSubmit={submit} noValidate className="rounded-[2rem] border border-dashed border-line bg-linen p-6 md:p-8">
              <h2 className="font-display text-3xl">ابعتيلنا رسالة</h2>
              <p className="mt-1 text-sm text-cocoa-3"><Clock className="me-1 inline size-4" /> منرد عادةً خلال ساعات — {site.hours}</p>
              <AnimatePresence mode="wait">
                {state === "done" ? (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 flex flex-col items-center gap-3 py-8 text-center">
                    <span className="grid size-16 place-items-center rounded-full bg-sage text-white"><Check className="size-8" /></span>
                    <p className="font-serif text-2xl">وصلت رسالتك! 🤍</p>
                    <p className="text-cocoa-2">رح نرد عليكِ بأقرب وقت.</p>
                    <button type="button" onClick={() => setState("idle")} className="mt-2 text-sm font-semibold text-rose underline underline-offset-4">رسالة جديدة</button>
                  </motion.div>
                ) : (
                  <motion.div key="form" exit={{ opacity: 0 }} className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="cn" className="label">الاسم</label>
                        <input id="cn" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" autoComplete="name" />
                      </div>
                      <div>
                        <label htmlFor="cp" className="label">الجوال (اختياري)</label>
                        <input id="cp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="field text-right" dir="ltr" inputMode="tel" autoComplete="tel" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="cm" className="label">رسالتك</label>
                      <textarea id="cm" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="field resize-none" />
                    </div>
                    <p className="min-h-5 text-sm text-rose" role="alert">{error}</p>
                    <button disabled={state === "sending"} className="btn btn-primary w-full">
                      {state === "sending" ? (<><LoaderCircle className="size-4 animate-spin" /> عم نرسل...</>) : "إرسال"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Reveal>

          <div id="faq" className="scroll-mt-28">
            <SectionHeading eyebrow="أسئلة بتتكرر" title="الأسئلة الشائعة" align="start" />
            <div className="space-y-3">
              {faqs?.map((f, i) => <Faq key={f.id} q={f.question} a={f.answer} i={i} />)}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
