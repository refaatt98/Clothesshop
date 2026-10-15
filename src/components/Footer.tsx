import { ArrowUp, ArrowUpLeft, Check, Scissors } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { subscribeToLetters } from "../lib/api";
import { currencies, useShop } from "../lib/store";
import type { Currency } from "../types";

const columns: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "المتجر",
    links: [
      { label: "كل شيء", to: "/shop" },
      { label: "الأحدث على الراف", to: "/shop?sort=new" },
      { label: "معاطف وجاكيتات", to: "/shop?category=outerwear" },
      { label: "تريكو", to: "/shop?category=knitwear" },
      { label: "قمصان", to: "/shop?category=shirts" },
      { label: "بناطيل", to: "/shop?category=trousers" },
      { label: "فساتين", to: "/shop?category=dresses" },
      { label: "إكسسوارات", to: "/shop?category=accessories" },
    ],
  },
  {
    title: "الدار",
    links: [
      { label: "المشغل والصنّاع", to: "/atelier" },
      { label: "الفصول", to: "/chapters" },
      { label: "مكتبة الأقمشة", to: "/fabrics" },
      { label: "طاولة التنسيق", to: "/dressing-table" },
      { label: "اليوميات", to: "/journal" },
      { label: "لوحتك المثبّتة", to: "/pinned" },
    ],
  },
  {
    title: "العناية والمساعدة",
    links: [
      { label: "الرفو مدى الحياة", to: "/mending" },
      { label: "دليل المقاسات", to: "/fit-guide" },
      { label: "العناية بالقماش", to: "/care" },
      { label: "الشحن والإرجاع", to: "/shipping" },
      { label: "أسئلة شائعة", to: "/help" },
      { label: "راسلنا", to: "/contact" },
    ],
  },
  {
    title: "زورونا",
    links: [
      { label: "مشغل عمّان", to: "/visit#amman" },
      { label: "محلّ لشبونة", to: "/visit#lisbon" },
      { label: "غرفة كيوتو", to: "/visit#kyoto" },
      { label: "احجز بروفة", to: "/visit#book" },
    ],
  },
];

const socials = [
  { label: "إنستغرام", href: "https://www.instagram.com/" },
  { label: "بنترست", href: "https://www.pinterest.com/" },
  { label: "Are.na", href: "https://www.are.na/" },
  { label: "راديو المشغل على سبوتيفاي", href: "https://open.spotify.com/" },
];

const currencyNames: Record<Currency, string> = { USD: "دولار", EUR: "يورو", GBP: "جنيه إسترليني", JOD: "دينار أردني", AED: "درهم إماراتي" };

function Letters() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      await subscribeToLetters(email);
      setState("done");
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "حاول مرة أخرى");
    }
  }

  return (
    <div className="relative rounded-md bg-tissue p-6 ring-1 ring-line md:p-10">
      {/* خط القصّ أعلى الظرف */}
      <div className="absolute inset-x-6 -top-px flex items-center gap-2 md:inset-x-10">
        <Scissors className="-mt-px h-4 w-4 rotate-90 text-ink-3" />
        <div className="cut-line h-px flex-1" />
      </div>
      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-end">
        <div>
          <p className="label text-thread">الظرف رقم 77 · كل شهر تقريباً</p>
          <h3 className="mt-3 font-display text-[2rem] leading-[1.25] md:text-[2.7rem]">
            رسائل من <em className="text-thread not-italic">طاولة القصّ</em>
          </h3>
          <p className="mt-3 max-w-md text-ink-2">فصول جديدة قبل أن تُخاط، حكايات الأقمشة، ونصائح الرفو. يكتبها من يصنعون الملابس. بلا أكواد خصم — ليس لدينا أيّ منها.</p>
        </div>
        {state === "done" ? (
          <div className="flex items-start gap-3 rounded-md bg-paper-2 p-5" role="status">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sage text-tissue">
              <Check className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-xl">أنت على القائمة.</p>
              <p className="text-sm text-ink-2">الرسالة القادمة تصل في أول أحد من الشهر، مكتوبة باليد ومطبوعة على يد رانيا.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="w-full">
            <label htmlFor="letters-email" className="label text-ink-3">
              بريدك الإلكتروني
            </label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                id="letters-email"
                type="email"
                required
                dir="ltr"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === "error") setState("idle");
                }}
                placeholder="you@somewhere.com"
                className="min-w-0 flex-1 border-b-2 border-ink/80 bg-transparent px-1 py-3 text-end font-mono text-[0.95rem] outline-none placeholder:text-ink-3/70 focus:border-thread"
              />
              <button disabled={state === "sending"} className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink-2 disabled:opacity-50">
                {state === "sending" ? "نختم الظرف…" : "أرسلوا لي الرسائل"}
              </button>
            </div>
            {state === "error" && (
              <p className="mt-2 text-sm text-thread" role="alert">
                {msg}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export function Footer() {
  const { currency, setCurrency } = useShop();
  return (
    <footer className="relative mt-24 border-t border-line bg-paper-2/60">
      <div className="wrap -translate-y-12">
        <Letters />
      </div>

      <div className="wrap grid grid-cols-2 gap-x-6 gap-y-10 pb-12 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="col-span-2 max-w-xs lg:col-span-1">
          <p className="font-display text-[1.7rem] leading-tight">
            <span className="text-thread">أورليه</span> <span className="font-mono text-base text-ink-3" dir="ltr">(ourlet)</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            كلمة فرنسية تعني <em>الحاشية</em>: آخر ما يُخاط في الثوب وأول ما يبلى. نصنع الملابس ببطء، نرقّم كل واحدة، ونرفوها مدى الحياة.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 underline decoration-ink/30 decoration-dashed underline-offset-4 hover:text-thread">
                {s.label} <ArrowUpLeft className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="label text-ink-3">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-[0.95rem] text-ink-2 transition hover:text-thread">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* السِّلفدج — حافة منسوجة بخيط أحمر مميِّز */}
      <div className="border-y border-line bg-tissue">
        <div className="wrap flex flex-col gap-4 py-5 text-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-ink-2">
            <span className="text-xs">© 2026 مشغل أورليه · عمّان · لشبونة · كيوتو</span>
            <Link to="/legal/privacy" className="hover:text-thread">الخصوصية</Link>
            <Link to="/legal/terms" className="hover:text-thread">شروط البيع</Link>
            <Link to="/legal/accessibility" className="hover:text-thread">إمكانية الوصول</Link>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="currency" className="label text-ink-3">
              الأسعار بـ
            </label>
            <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="rounded-full bg-paper px-3 py-1.5 text-xs ring-1 ring-line outline-none focus:ring-thread">
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {currencyNames[c]} ({c})
                </option>
              ))}
            </select>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="ms-2 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs ring-1 ring-line transition hover:bg-ink hover:text-paper">
              <ArrowUp className="h-3 w-3" /> للأعلى
            </button>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <p aria-hidden className="select-none whitespace-nowrap pt-8 text-center font-display text-[30vw] font-bold leading-[0.9] text-ink/[0.06] lg:text-[19rem]">
          أورليه
        </p>
        <div className="flex h-5 items-center bg-ink">
          <div className="h-[3px] w-full bg-thread" style={{ maskImage: "repeating-linear-gradient(to right, #000 0 14px, transparent 14px 20px)", WebkitMaskImage: "repeating-linear-gradient(to right, #000 0 14px, transparent 14px 20px)" }} />
        </div>
      </div>
    </footer>
  );
}
