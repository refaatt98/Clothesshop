import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { ArrowUpLeft, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { useLockBody } from "../lib/hooks";
import { useShop } from "../lib/store";
import type { Category } from "../types";
import { GarmentFlat } from "./GarmentFlat";
import { PinHead } from "./ui";

const notices = [
  { text: "رفو مجاني طوال عمر كل قطعة", to: "/mending" },
  { text: "لن نقيم تخفيضات أبداً — وهذا السبب", to: "/journal/why-we-never-have-sales" },
  { text: "بروفات في عمّان ولشبونة وكيوتو", to: "/visit" },
  { text: "شحن مجاني فوق 250$ · الجمارك مشمولة", to: "/shipping" },
];

export const categoryNames: Record<Category, string> = {
  outerwear: "معاطف وجاكيتات",
  shirts: "قمصان",
  knitwear: "تريكو",
  tees: "تيشيرتات",
  trousers: "بناطيل",
  dresses: "فساتين",
  skirts: "تنانير",
  accessories: "إكسسوارات",
};

const startNav = [
  { to: "/shop", label: "المتجر" },
  { to: "/chapters", label: "الفصول" },
  { to: "/fabrics", label: "مكتبة الأقمشة" },
  { to: "/dressing-table", label: "طاولة التنسيق" },
];
const endNav = [
  { to: "/journal", label: "اليوميات" },
  { to: "/atelier", label: "المشغل" },
];

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex flex-col items-center leading-none ${className}`} aria-label="أورليه — الرئيسية">
      <span className="font-display text-[2rem] font-bold leading-none md:text-[2.3rem]">
        أورليه<span className="text-thread">.</span>
      </span>
      <span className="mt-1.5 flex items-center gap-1.5 font-mono text-[0.58rem] uppercase text-ink-3" dir="ltr">
        <span className="h-px w-3 bg-thread transition-all group-hover:w-6" />
        OURLET · EST. 2014
        <span className="h-px w-3 bg-thread transition-all group-hover:w-6" />
      </span>
    </Link>
  );
}

export function RailIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 8 V6.5 a2 2 0 1 1 2 -2" />
      <path d="M2.5 17 L12 8 L21.5 17 Q22 18.5 20.5 18.5 H3.5 Q2 18.5 2.5 17 Z" />
    </svg>
  );
}

/** شريط القياس تحت الهيدر — يمتلئ بالخيط الأحمر كلما نزلت في الصفحة. */
function MeasuringTape() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  return (
    <div className="relative h-[9px] overflow-hidden border-t border-[#d9c58f] bg-[#efdcaa]" aria-hidden>
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: "repeating-linear-gradient(to left, #1e1c19 0 1px, transparent 1px 8px), repeating-linear-gradient(to left, #1e1c19 0 1px, transparent 1px 40px)",
          backgroundSize: "100% 3px, 100% 6px",
          backgroundRepeat: "repeat-x",
        }}
      />
      <motion.div className="absolute inset-y-0 right-0 w-full origin-right bg-thread/80 mix-blend-multiply" style={{ scaleX: x }} />
    </div>
  );
}

function ShopPanel({ onClose }: { onClose: () => void }) {
  const { catalog, chapters, bySlug } = useShop();
  const products = catalog ?? [];
  const counts = products.reduce<Record<string, number>>((acc, p) => ((acc[p.category] = (acc[p.category] ?? 0) + 1), acc), {});
  const current = chapters?.find((c) => c.status === "current");
  const feature = bySlug("orchard-midi-dress");
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-x-0 top-full z-40 hidden border-y border-line bg-paper/97 shadow-[0_30px_60px_-30px_#1e1c1940] backdrop-blur lg:block"
    >
      <div className="wrap grid grid-cols-12 gap-8 py-10">
        <div className="col-span-4">
          <p className="label text-ink-3">حسب القطعة</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1">
            <li>
              <Link onClick={onClose} to="/shop" className="flex items-baseline justify-between border-b border-dashed border-line py-2 font-display text-lg hover:text-thread">
                كل شيء <span className="font-mono text-xs text-ink-3">{products.length}</span>
              </Link>
            </li>
            {(Object.keys(categoryNames) as Category[]).map((c) => (
              <li key={c}>
                <Link onClick={onClose} to={`/shop?category=${c}`} className="flex items-baseline justify-between border-b border-dashed border-line py-2 font-display text-lg hover:text-thread">
                  {categoryNames[c]} <span className="font-mono text-xs text-ink-3">{counts[c] ?? 0}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-3">
          <p className="label text-ink-3">طرق للدخول</p>
          <ul className="mt-4 space-y-3 text-[0.95rem]">
            <li><Link onClick={onClose} className="hover:text-thread" to="/shop?sort=new">الأحدث على الراف</Link></li>
            <li><Link onClick={onClose} className="hover:text-thread" to="/shop?sort=slowest">الأبطأ صنعاً (أكثر ساعات)</Link></li>
            <li><Link onClick={onClose} className="hover:text-thread" to="/dressing-table">نسّق إطلالة</Link></li>
            <li><Link onClick={onClose} className="hover:text-thread" to="/fabrics">تسوّق حسب القماش</Link></li>
            <li><Link onClick={onClose} className="hover:text-thread" to="/fit-guide">اعرف مقاسك</Link></li>
            <li><Link onClick={onClose} className="hover:text-thread" to="/pinned">لوحتك المثبّتة</Link></li>
          </ul>
        </div>
        {current && feature && (
          <Link onClick={onClose} to={`/chapters/${current.slug}`} className="group col-span-5 grid grid-cols-5 items-center gap-6 rounded-md bg-tissue p-5 ring-1 ring-line transition hover:ring-ink/30">
            <div className="col-span-2 rounded bg-mat p-3">
              <GarmentFlat kind={feature.garment} {...feature.colorways[0]} className="w-full" />
            </div>
            <div className="col-span-3">
              <p className="label text-thread">الفصل {current.numeral} · يُعرض الآن</p>
              <p className="mt-2 font-display text-3xl leading-tight">{current.title}</p>
              <p className="mt-2 text-sm text-ink-2">{current.intro}</p>
              <div className="mt-4 flex gap-1">
                {current.palette.map((p) => (
                  <span key={p.hex} className="h-4 w-4 rounded-full ring-1 ring-ink/15" style={{ background: p.hex }} title={p.name} />
                ))}
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-sm underline decoration-dashed underline-offset-4 group-hover:text-thread">
                اقرأ الفصل <ArrowUpLeft className="h-4 w-4" />
              </span>
            </div>
          </Link>
        )}
      </div>
    </motion.div>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  useLockBody(open);
  const links = [...startNav, ...endNav, { to: "/pinned", label: "اللوحة المثبّتة" }, { to: "/visit", label: "زيارة وبروفات" }];
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] overflow-y-auto bg-paper lg:hidden"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pointer-events-none absolute inset-0 bg-mat opacity-50" />
          <div className="wrap relative flex min-h-full flex-col pb-10 pt-5">
            <div className="flex items-center justify-between">
              <Logo />
              <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-ink/20" aria-label="إغلاق القائمة">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="label mt-10 text-ink-3">ظرف الباترون · المحتويات</p>
            <ul className="mt-4">
              {links.map((l, i) => (
                <motion.li key={l.to} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.04 }} className="border-b border-dashed border-ink/20">
                  <Link to={l.to} onClick={onClose} className="flex items-baseline gap-4 py-3">
                    <span className="font-mono text-xs text-thread">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-[2rem] leading-snug">{l.label}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="mt-auto pt-10 text-sm text-ink-2">
              <p className="font-hand text-2xl text-chalk">كل قطعة تُرفأ مدى الحياة ↓</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                <Link onClick={onClose} to="/mending" className="underline decoration-dashed underline-offset-4">الرفو</Link>
                <Link onClick={onClose} to="/fit-guide" className="underline decoration-dashed underline-offset-4">دليل المقاسات</Link>
                <Link onClick={onClose} to="/help" className="underline decoration-dashed underline-offset-4">المساعدة</Link>
                <Link onClick={onClose} to="/contact" className="underline decoration-dashed underline-offset-4">تواصل</Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Header() {
  const { railCount, setRailOpen, setSearchOpen, pinned } = useShop();
  const [notice, setNotice] = useState(0);
  const [panel, setPanel] = useState(false);
  const [menu, setMenu] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const t = setInterval(() => setNotice((n) => (n + 1) % notices.length), 4200);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    setPanel(false);
    setMenu(false);
  }, [pathname]);

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `relative py-2 text-[0.95rem] transition-colors hover:text-thread ${isActive ? "text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-thread" : "text-ink-2"}`;

  return (
    <>
      <div className="bg-ink text-paper">
        <div className="wrap flex h-9 items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={notice} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.35 }}>
              <Link to={notices[notice].to} className="flex items-center gap-2 text-[0.8rem] hover:text-butter">
                <span className="text-thread">✂</span> {notices[notice].text} <ArrowUpLeft className="h-3 w-3" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-paper/92 backdrop-blur-md" onMouseLeave={() => setPanel(false)}>
        <div className="wrap grid h-[72px] grid-cols-[1fr_auto_1fr] items-center gap-4 md:h-[84px]">
          <div className="flex items-center gap-2">
            <button onClick={() => setMenu(true)} className="-ms-2 grid h-11 w-11 place-items-center lg:hidden" aria-label="فتح القائمة">
              <Menu className="h-5 w-5" />
            </button>
            <nav className="hidden items-center gap-6 lg:flex" aria-label="التنقّل الرئيسي">
              {startNav.map((l) => (
                <NavLink key={l.to} to={l.to} className={navCls} onMouseEnter={() => setPanel(l.to === "/shop")}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <Logo />

          <div className="flex items-center justify-end gap-1 md:gap-2">
            <nav className="me-3 hidden items-center gap-6 lg:flex" aria-label="تنقّل ثانوي">
              {endNav.map((l) => (
                <NavLink key={l.to} to={l.to} className={navCls} onMouseEnter={() => setPanel(false)}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <button onClick={() => setSearchOpen(true)} className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-paper-2" aria-label="بحث">
              <Search className="h-[19px] w-[19px]" strokeWidth={1.6} />
            </button>
            <Link to="/pinned" className="relative hidden h-11 w-11 place-items-center rounded-full transition hover:bg-paper-2 sm:grid" aria-label={`اللوحة المثبّتة، ${pinned.length} قطع`}>
              <PinHead className="h-6 w-6" colour={pinned.length ? "#c2432e" : "#b9b0a2"} />
              {pinned.length > 0 && <span className="absolute end-1 top-1 font-mono text-[0.6rem] font-bold">{pinned.length}</span>}
            </Link>
            <button onClick={() => setRailOpen(true)} className="relative flex h-11 items-center gap-2 rounded-full pe-3 ps-2.5 transition hover:bg-paper-2" aria-label={`افتح الراف، ${railCount} قطع`}>
              <RailIcon className="h-6 w-6" />
              <span className="hidden text-sm md:inline">الراف</span>
              <motion.span
                key={railCount}
                initial={{ scale: 1.6 }}
                animate={{ scale: 1 }}
                className={`grid h-5 min-w-5 place-items-center rounded-full px-1 font-mono text-[0.65rem] font-bold ${railCount ? "bg-thread text-tissue" : "bg-paper-3 text-ink-3"}`}
              >
                {railCount}
              </motion.span>
            </button>
          </div>
        </div>
        <MeasuringTape />
        <AnimatePresence>{panel && <ShopPanel onClose={() => setPanel(false)} />}</AnimatePresence>
      </header>
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
    </>
  );
}
