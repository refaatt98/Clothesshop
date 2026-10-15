import { ArrowUp, ArrowUpRight, Check, Scissors } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { subscribeToLetters } from "../lib/api";
import { currencies, useShop } from "../lib/store";
import type { Currency } from "../types";

const columns: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Everything", to: "/shop" },
      { label: "Newest on the rail", to: "/shop?sort=new" },
      { label: "Outerwear", to: "/shop?category=outerwear" },
      { label: "Knitwear", to: "/shop?category=knitwear" },
      { label: "Shirts", to: "/shop?category=shirts" },
      { label: "Trousers", to: "/shop?category=trousers" },
      { label: "Dresses & skirts", to: "/shop?category=dresses" },
      { label: "Accessories", to: "/shop?category=accessories" },
    ],
  },
  {
    title: "The House",
    links: [
      { label: "Atelier & makers", to: "/atelier" },
      { label: "Chapters", to: "/chapters" },
      { label: "Fabric Library", to: "/fabrics" },
      { label: "Dressing Table", to: "/dressing-table" },
      { label: "Journal", to: "/journal" },
      { label: "Your pinboard", to: "/pinned" },
    ],
  },
  {
    title: "Care & help",
    links: [
      { label: "Mending for life", to: "/mending" },
      { label: "Fit guide", to: "/fit-guide" },
      { label: "Caring for cloth", to: "/care" },
      { label: "Shipping & returns", to: "/shipping" },
      { label: "Questions", to: "/help" },
      { label: "Write to us", to: "/contact" },
    ],
  },
  {
    title: "Visit",
    links: [
      { label: "Amman studio", to: "/visit#amman" },
      { label: "Lisbon shop", to: "/visit#lisbon" },
      { label: "Kyoto room", to: "/visit#kyoto" },
      { label: "Book a fitting", to: "/visit#book" },
    ],
  },
];

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/" },
  { label: "Pinterest", href: "https://www.pinterest.com/" },
  { label: "Are.na", href: "https://www.are.na/" },
  { label: "Spotify — studio radio", href: "https://open.spotify.com/" },
];

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
      setMsg(err instanceof Error ? err.message : "Try again");
    }
  }

  return (
    <div className="relative rounded-md bg-tissue p-6 ring-1 ring-line md:p-10">
      {/* the cut line along the top of the envelope */}
      <div className="absolute inset-x-6 -top-px flex items-center gap-2 md:inset-x-10">
        <Scissors className="-mt-px h-4 w-4 -rotate-90 text-ink-3" />
        <div className="cut-line h-px flex-1" />
      </div>
      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-end">
        <div>
          <p className="label text-thread">Envelope No. 77 · monthly-ish</p>
          <h3 className="mt-3 font-display text-[2rem] leading-[1.02] md:text-[2.8rem]">
            Letters from <em>the cutting table</em>
          </h3>
          <p className="mt-3 max-w-md text-ink-2">
            New chapters before they're sewn, fabric stories, mending tips. Written by the people who make the clothes. No discount codes — we don't have any.
          </p>
        </div>
        {state === "done" ? (
          <div className="flex items-start gap-3 rounded-md bg-paper-2 p-5" role="status">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sage text-tissue">
              <Check className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-xl">You're on the list.</p>
              <p className="text-sm text-ink-2">The next letter goes out on the first Sunday of the month, written by hand, typed by Rania.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="w-full">
            <label htmlFor="letters-email" className="label text-ink-3">
              Your email
            </label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                id="letters-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === "error") setState("idle");
                }}
                placeholder="you@somewhere.com"
                className="min-w-0 flex-1 border-b-2 border-ink/80 bg-transparent px-1 py-3 font-mono text-[0.95rem] outline-none placeholder:text-ink-3/70 focus:border-thread"
              />
              <button
                disabled={state === "sending"}
                className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-ink-2 disabled:opacity-50"
              >
                {state === "sending" ? "Sealing…" : "Send me letters"}
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

      <div className="wrap grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="max-w-xs">
          <p className="font-display text-[1.6rem] italic leading-tight">
            <span className="text-thread">ourlet</span> <span className="not-italic text-ink-3">(n.)</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            French for <em>hem</em>: the last thing sewn and the first thing to wear out. We make clothes slowly, number every one, and mend them for life.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 underline decoration-dashed decoration-ink/30 underline-offset-4 hover:text-thread">
                {s.label} <ArrowUpRight className="h-3 w-3" />
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
                  <Link to={l.to} className="text-[0.93rem] text-ink-2 transition hover:text-thread">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* the selvedge — a woven edge with a red identifying thread */}
      <div className="border-y border-line bg-tissue">
        <div className="wrap flex flex-col gap-4 py-5 text-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-ink-2">
            <span className="font-mono text-xs">© 2026 Ourlet Atelier · Amman · Lisbon · Kyoto</span>
            <Link to="/legal/privacy" className="hover:text-thread">Privacy</Link>
            <Link to="/legal/terms" className="hover:text-thread">Terms</Link>
            <Link to="/legal/accessibility" className="hover:text-thread">Accessibility</Link>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="currency" className="label text-ink-3">
              Prices in
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="rounded-full bg-paper px-3 py-1.5 font-mono text-xs ring-1 ring-line outline-none focus:ring-thread"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="ml-2 inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-mono text-xs ring-1 ring-line transition hover:bg-ink hover:text-paper"
            >
              <ArrowUp className="h-3 w-3" /> Top
            </button>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="wrap relative">
          <p
            aria-hidden
            className="select-none whitespace-nowrap pt-6 text-center font-display text-[24vw] italic leading-[0.78] tracking-[-0.05em] text-ink/[0.07] lg:text-[17rem]"
          >
            Ourlet
          </p>
        </div>
        <div className="flex h-5 items-center bg-ink">
          <div className="h-[3px] w-full bg-thread" style={{ maskImage: "repeating-linear-gradient(to right, #000 0 14px, transparent 14px 20px)", WebkitMaskImage: "repeating-linear-gradient(to right, #000 0 14px, transparent 14px 20px)" }} />
        </div>
      </div>
    </footer>
  );
}
