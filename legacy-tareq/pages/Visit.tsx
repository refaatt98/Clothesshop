import { motion } from "motion/react";
import { Check, Clock, Mail, MapPin, Phone } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Button, Field, HandNote, inputCls, PageHeader, PinHead, Reveal, Skeleton } from "../components/ui";
import { bookFitting, getStores } from "../lib/api";
import { formatDate, useAsync, useDocumentTitle } from "../lib/hooks";

/** Which weekdays each room opens (0 = Sunday). */
const openDays: Record<string, number[]> = {
  bidya: [0, 1, 2, 3, 4, 6], // closed Fridays
};
const slots = ["11:00", "12:30", "14:00", "15:30", "17:00", "18:30"];

/** A little hand-drawn street map for each room. */
function StreetSketch({ seed }: { seed: number }) {
  const r = (n: number) => ((seed * 9301 + n * 49297) % 233280) / 233280;
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" aria-hidden>
      <rect width="200" height="120" fill="#fbf8f2" />
      {Array.from({ length: 6 }).map((_, i) => (
        <path key={i} d={`M0,${20 + i * 18 + r(i) * 8} Q100,${10 + i * 20 + r(i + 9) * 20} 200,${18 + i * 18}`} stroke="#d8ccb7" strokeWidth={i === 2 ? 6 : 2} fill="none" />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <path key={`v${i}`} d={`M${30 + i * 38 + r(i + 3) * 10},0 L${20 + i * 40},120`} stroke="#e5dac6" strokeWidth="2" fill="none" />
      ))}
      <circle cx="104" cy="58" r="14" fill="#c2432e" opacity="0.12" />
      <circle cx="104" cy="58" r="5" fill="#c2432e" />
    </svg>
  );
}

export default function Visit() {
  useDocumentTitle("زيارة وبروفات");
  const { data: stores } = useAsync(getStores, []);
  const [storeId, setStoreId] = useState("bidya");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [who, setWho] = useState({ name: "", email: "" });
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const days = useMemo(() => {
    const out: Date[] = [];
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    for (let i = 1; out.length < 12 && i < 30; i++) {
      const x = new Date(d.getTime() + i * 86400000);
      if (openDays[storeId].includes(x.getDay())) out.push(x);
    }
    return out;
  }, [storeId]);

  const chosenDay = days.find((d) => d.toISOString() === date);
  const availableSlots = slots;
  const store = stores?.find((s) => s.id === storeId);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!date || !time) return setError("اختر يوماً وساعة أولاً.");
    setError("");
    setState("busy");
    try {
      const r = await bookFitting({ storeId, date, time, ...who });
      setConfirmation(r.confirmation);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ ما");
      setState("idle");
    }
  }

  return (
    <>
      <PageHeader
        trail={[{ label: "الرئيسية", to: "/" }, { label: "زيارة وبروفات" }]}
        kicker="محلّنا في بديا"
        title={
          <>
            تعال وجرّبها. <em className="text-thread not-italic">القهوة علينا.</em>
          </>
        }
        intro="محلّنا تحت المشغل مباشرة في بديا، محافظة سلفيت. فيه شريط قياس، ومرآة جيدة، وشخص يعرف القماش. نقصّر البناطيل على حذائك وأنت تنتظر — مجاناً."
      />

      <section className="wrap mx-auto grid max-w-3xl gap-6 py-14">
        {!stores && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96" />)}
        {stores?.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.08}>
            <article id={s.id} className="flex h-full scroll-mt-32 flex-col overflow-hidden rounded-md bg-tissue ring-1 ring-line">
              <div className="relative h-40">
                <StreetSketch seed={i + 3} />
                <PinHead className="absolute right-3 top-3 h-7 w-7" />
                <HandNote className="absolute bottom-2 left-3 text-xl">{s.city} ←</HandNote>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="label text-ink-3">{s.country}</p>
                <h2 className="font-display text-[2.2rem] leading-tight">{s.city}</h2>
                <p className="mt-2 text-ink-2">{s.note}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-ink-2">
                  <li className="flex gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-thread" /> {s.address}
                  </li>
                  {s.hours.map((h) => (
                    <li key={h.days} className="flex gap-2">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-thread" /> {h.days}: <span dir="ltr">{h.time}</span>
                    </li>
                  ))}
                  <li className="flex gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-thread" />
                    <a href={`tel:${s.phone.replace(/\s/g, "")}`} dir="ltr" className="hover:text-thread">
                      {s.phone}
                    </a>
                  </li>
                  <li className="flex gap-2">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-thread" />
                    <a href={`mailto:${s.email}`} dir="ltr" className="hover:text-thread">
                      {s.email}
                    </a>
                  </li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {s.services.map((x) => (
                    <span key={x} className="rounded-full bg-paper-2 px-2.5 py-1 text-xs">
                      {x}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex gap-3 pt-6">
                  <a href={`https://www.google.com/maps/search/${encodeURIComponent(s.address + " " + s.city)}`} target="_blank" rel="noreferrer" className="text-sm underline decoration-dashed underline-offset-4 hover:text-thread">
                    افتح الخريطة
                  </a>
                  <a
                    href="#book"
                    onClick={() => {
                      setStoreId(s.id);
                      setDate("");
                      setTime("");
                    }}
                    className="text-sm underline decoration-dashed underline-offset-4 hover:text-thread"
                  >
                    احجز هنا
                  </a>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </section>

      <section id="book" className="wrap scroll-mt-28 py-10">
        <div className="rounded-md bg-ink p-6 text-paper md:p-10">
          <p className="label text-paper/60">دفتر المواعيد</p>
          <h2 className="mt-2 font-display text-[2.4rem] leading-tight">احجز بروفة — 45 دقيقة، مجاناً</h2>

          {state === "done" ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 max-w-xl rounded-md bg-paper p-8 text-ink" role="status">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-sage text-tissue">
                <Check className="h-6 w-6" />
              </span>
              <p className="mt-4 font-display text-3xl">موعدك محجوز.</p>
              <p className="mt-2 text-ink-2">
                {store?.city}، {chosenDay && formatDate(chosenDay.toISOString(), { weekday: "long", day: "numeric", month: "long" })} الساعة <span dir="ltr">{time}</span>. رقم التأكيد{" "}
                <span className="font-mono font-bold">{confirmation}</span>.
              </p>
              <HandNote className="mt-4 text-2xl">أحضر الحذاء الذي ستلبسه مع البنطال</HandNote>
              <Button
                variant="paper"
                className="mt-6"
                onClick={() => {
                  setState("idle");
                  setDate("");
                  setTime("");
                }}
              >
                احجز موعداً آخر
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <div className={stores && stores.length > 1 ? "" : "hidden"}>
                  <p className="label text-paper/60">الغرفة</p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {stores?.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => {
                          setStoreId(s.id);
                          setDate("");
                          setTime("");
                        }}
                        className={`rounded-md py-3 font-display text-lg ring-1 transition ${storeId === s.id ? "bg-paper text-ink ring-paper" : "ring-paper/25 hover:ring-paper/60"}`}
                      >
                        {s.city}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="label text-paper/60">اليوم</p>
                  <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
                    {days.map((d) => {
                      const iso = d.toISOString();
                      return (
                        <button
                          type="button"
                          key={iso}
                          onClick={() => {
                            setDate(iso);
                            setTime("");
                          }}
                          className={`flex w-16 shrink-0 flex-col items-center rounded-md py-2 ring-1 transition ${date === iso ? "bg-thread ring-thread" : "ring-paper/25 hover:ring-paper/60"}`}
                        >
                          <span className="text-[0.7rem] opacity-70">{formatDate(iso, { weekday: "short" })}</span>
                          <span className="font-mono text-xl">{d.getDate()}</span>
                          <span className="text-[0.7rem] opacity-70">{formatDate(iso, { month: "short" })}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="label text-paper/60">الساعة</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {availableSlots.map((s) => (
                      <button type="button" key={s} disabled={!date} onClick={() => setTime(s)} className={`rounded-md py-2 font-mono text-sm ring-1 transition disabled:opacity-30 ${time === s ? "bg-paper text-ink ring-paper" : "ring-paper/25 hover:ring-paper/60"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-5 rounded-md bg-paper p-6 text-ink">
                <Field label="اسمك">
                  <input required value={who.name} onChange={(e) => setWho({ ...who, name: e.target.value })} className={inputCls} autoComplete="name" />
                </Field>
                <Field label="بريدك الإلكتروني" hint="نرسل التأكيد وتذكيراً قبل يوم.">
                  <input required type="email" dir="ltr" value={who.email} onChange={(e) => setWho({ ...who, email: e.target.value })} className={inputCls} autoComplete="email" />
                </Field>
                <p className="text-sm text-ink-2">
                  {date && time ? (
                    <>
                      {store?.city} · {chosenDay && formatDate(chosenDay.toISOString(), { weekday: "long", day: "numeric", month: "long" })} · <span dir="ltr">{time}</span>
                    </>
                  ) : (
                    "اختر الغرفة واليوم والساعة."
                  )}
                </p>
                {error && (
                  <p className="text-sm text-thread" role="alert">
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={state === "busy"} className="w-full">
                  {state === "busy" ? "نكتب اسمك في الدفتر…" : "أكّد الموعد"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
