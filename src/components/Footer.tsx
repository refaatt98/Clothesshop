import { ArrowUp, Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { subscribeToLetters } from "../lib/api";
import { currencies, useShop } from "../lib/store";
import type { Currency } from "../types";

const links = [
  { label: "المتجر", to: "/shop" },
  { label: "الفصول", to: "/chapters" },
  { label: "الأقمشة", to: "/fabrics" },
  { label: "طاولة التنسيق", to: "/dressing-table" },
  { label: "اليوميات", to: "/journal" },
  { label: "المشغل", to: "/atelier" },
  { label: "الرفو", to: "/mending" },
  { label: "المقاسات", to: "/fit-guide" },
  { label: "العناية", to: "/care" },
  { label: "الشحن والإرجاع", to: "/shipping" },
  { label: "أسئلة شائعة", to: "/help" },
  { label: "زورونا", to: "/visit" },
  { label: "راسلنا", to: "/contact" },
];

const socials = [
  { label: "إنستغرام", href: "https://www.instagram.com/" },
  { label: "بنترست", href: "https://www.pinterest.com/" },
];

const currencyNames: Record<Currency, string> = { USD: "دولار", EUR: "يورو", GBP: "جنيه", JOD: "دينار", AED: "درهم" };

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

  if (state === "done")
    return (
      <p className="flex items-center gap-2 text-sm" role="status">
        <Check className="h-4 w-4 text-sage" /> أنت على القائمة. أول رسالة تصلك أول أحد من الشهر.
      </p>
    );

  return (
    <form onSubmit={onSubmit} className="w-full md:max-w-sm">
      <label htmlFor="letters-email" className="text-sm text-ink-2">
        رسائل من طاولة القصّ — مرة في الشهر، بلا أكواد خصم.
      </label>
      <div className="mt-2 flex gap-2">
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
          placeholder="you@email.com"
          className="min-w-0 flex-1 rounded-full bg-tissue px-4 py-2.5 text-end font-mono text-sm ring-1 ring-line outline-none focus:ring-thread"
        />
        <button disabled={state === "sending"} className="shrink-0 rounded-full bg-ink px-5 text-sm text-paper transition hover:bg-ink-2 disabled:opacity-50">
          {state === "sending" ? "…" : "اشترك"}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-2 text-sm text-thread" role="alert">
          {msg}
        </p>
      )}
    </form>
  );
}

export function Footer() {
  const { currency, setCurrency } = useShop();
  return (
    <footer className="mt-24 border-t border-line bg-paper-2/50">
      <div className="wrap flex flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between">
        <div>
          <Link to="/" className="font-display text-[2rem] font-bold leading-none">
            أورليه<span className="text-thread">.</span>
          </Link>
          <p className="mt-2 max-w-xs text-sm text-ink-2">ملابس تُرسم على الورق، تُقصّ باليد، وتُرفأ مجاناً مدى الحياة.</p>
        </div>
        <Letters />
      </div>

      <nav aria-label="روابط الموقع" className="wrap">
        <ul className="flex flex-wrap gap-x-6 gap-y-3 border-t border-dashed border-ink/20 py-6 text-[0.92rem] text-ink-2">
          {links.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="transition hover:text-thread">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-line">
        <div className="wrap flex flex-col gap-4 py-5 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>© 2026 أورليه</span>
            <Link to="/legal/privacy" className="hover:text-thread">الخصوصية</Link>
            <Link to="/legal/terms" className="hover:text-thread">الشروط</Link>
            <Link to="/legal/accessibility" className="hover:text-thread">إمكانية الوصول</Link>
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="hover:text-thread">
                {s.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="currency" className="sr-only">
              العملة
            </label>
            <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="rounded-full bg-paper px-3 py-1.5 ring-1 ring-line outline-none focus:ring-thread">
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {currencyNames[c]} ({c})
                </option>
              ))}
            </select>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 ring-1 ring-line transition hover:bg-ink hover:text-paper" aria-label="العودة للأعلى">
              <ArrowUp className="h-3 w-3" /> للأعلى
            </button>
          </div>
        </div>
      </div>

      {/* حافة السِّلفدج */}
      <div className="h-1 bg-thread" />
    </footer>
  );
}
