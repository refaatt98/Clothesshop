import { motion } from "motion/react";
import { Check, Clock, Mail, MapPin, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { subscribeNewsletter } from "../lib/api";
import { useSite } from "../lib/site";
import { Diamond, SewButton, Spool } from "./Craft";
import { InstagramIcon, WhatsappIcon } from "./Icons";
import { Logo } from "./Logo";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState("loading");
    const res = await subscribeNewsletter(email);
    setState(res.ok ? "done" : "error");
    if (res.ok) setEmail("");
  };

  return (
    <form onSubmit={submit} className="w-full">
      <label htmlFor="nl" className="mb-2 block font-serif text-xl">
        خليكِ قريبة من القطع الجديدة
      </label>
      <p className="mb-4 text-sm text-cream/70">بنبعتلك أول ما تنزل مجموعة جديدة. بدون إزعاج، وعد.</p>
      <div className="flex gap-2 rounded-full border border-dashed border-cream/30 bg-cream/5 p-1.5">
        <input
          id="nl"
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state !== "idle") setState("idle");
          }}
          placeholder="بريدك الإلكتروني"
          dir="ltr"
          className="min-w-0 flex-1 bg-transparent px-4 text-right text-cream outline-none placeholder:text-cream/50"
        />
        <button
          disabled={state === "loading"}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-rose text-white transition hover:bg-cream hover:text-cocoa disabled:opacity-60"
          aria-label="اشتراك"
        >
          {state === "done" ? <Check className="size-5" /> : <Send className="size-5 -scale-x-100" />}
        </button>
      </div>
      <p className="mt-2 min-h-5 text-sm" aria-live="polite">
        {state === "done" && <span className="text-sage-soft">تم! رح توصلك أخبارنا قريباً 🤍</span>}
        {state === "error" && <span className="text-rose-soft">تأكدي من البريد الإلكتروني.</span>}
      </p>
    </form>
  );
}

export function Footer() {
  const { site, categories } = useSite();
  return (
    <footer className="relative mt-24 bg-cocoa text-cream">
      {/* حافة مموّجة مخيطة */}
      <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="absolute -top-[39px] h-10 w-full text-cocoa" aria-hidden>
        <path d="M0 40 V20 Q25 0 50 20 T100 20 T150 20 T200 20 T250 20 T300 20 T350 20 T400 20 T450 20 T500 20 T550 20 T600 20 T650 20 T700 20 T750 20 T800 20 T850 20 T900 20 T950 20 T1000 20 T1050 20 T1100 20 T1150 20 T1200 20 V40 Z" fill="currentColor" />
      </svg>
      <div className="pointer-events-none absolute inset-x-0 top-3 h-px border-t border-dashed border-cream/20" aria-hidden />

      <motion.div
        className="pointer-events-none absolute -top-14 end-[8%] hidden md:block"
        initial={{ y: -20, rotate: -20, opacity: 0 }}
        whileInView={{ y: 0, rotate: 12, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", damping: 10 }}
      >
        <Spool className="h-24 w-20" color="#c98f86" />
      </motion.div>

      <div className="container-b relative grid grid-cols-1 gap-12 pb-10 pt-16 md:grid-cols-12">
        <div className="min-w-0 md:col-span-4">
          <Logo light className="h-20" />
          <p className="mt-5 max-w-xs leading-8 text-cream/80">{site.intro}.</p>
          <p className="mt-2 font-display text-xl text-rose-soft">{site.tagline} 🫶🏼</p>
          <div className="mt-6 flex gap-2">
            <a href={`https://instagram.com/${site.instagram}`} target="_blank" rel="noreferrer" className="grid size-11 place-items-center rounded-full border border-dashed border-cream/30 transition hover:bg-cream hover:text-cocoa" aria-label="إنستغرام">
              <InstagramIcon className="size-5" />
            </a>
            <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer" className="grid size-11 place-items-center rounded-full border border-dashed border-cream/30 transition hover:bg-cream hover:text-cocoa" aria-label="واتساب">
              <WhatsappIcon className="size-5" />
            </a>
            <a href={`mailto:${site.email}`} className="grid size-11 place-items-center rounded-full border border-dashed border-cream/30 transition hover:bg-cream hover:text-cocoa" aria-label="البريد">
              <Mail className="size-5" strokeWidth={1.7} />
            </a>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-8 md:col-span-4">
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-serif text-lg">
              <Diamond className="size-2 text-rose" /> المتجر
            </h3>
            <ul className="space-y-2.5 text-sm text-cream/75">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link to={`/shop?category=${c.slug}`} className="transition hover:text-cream">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-serif text-lg">
              <Diamond className="size-2 text-rose" /> بَنان
            </h3>
            <ul className="space-y-2.5 text-sm text-cream/75">
              <li><Link to="/story" className="hover:text-cream">قصتنا</Link></li>
              <li><Link to="/custom" className="hover:text-cream">اطلبي قطعتك</Link></li>
              <li><Link to="/contact" className="hover:text-cream">تواصلي معنا</Link></li>
              <li><Link to="/contact#faq" className="hover:text-cream">الأسئلة الشائعة</Link></li>
              <li><Link to="/wishlist" className="hover:text-cream">المفضلة</Link></li>
            </ul>
          </div>
        </div>

        <div className="min-w-0 md:col-span-4">
          <Newsletter />
          <ul className="mt-4 space-y-2 text-sm text-cream/70">
            <li className="flex items-center gap-2"><MapPin className="size-4" /> نوصّل لكل فلسطين</li>
            <li className="flex items-center gap-2"><Clock className="size-4" /> {site.hours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-dashed border-cream/15">
        <div className="container-b flex flex-col items-center justify-between gap-2 py-5 text-xs text-cream/60 sm:flex-row">
          <p>© {new Date().getFullYear()} متجر بَنان — كل القطع مصنوعة باليد بحب.</p>
          <p className="flex items-center gap-1.5">
            <SewButton className="size-4" /> الدفع عند الاستلام · توصيل لكل فلسطين
          </p>
        </div>
      </div>
    </footer>
  );
}
