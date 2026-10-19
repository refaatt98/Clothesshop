import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { useSite } from "../lib/site";
import { useShop } from "../lib/store";
import { Diamond, YarnBall } from "./Craft";
import { InstagramIcon, WhatsappIcon } from "./Icons";
import { Logo } from "./Logo";

export const navLinks = [
  { to: "/", label: "الرئيسية" },
  { to: "/shop", label: "المتجر" },
  { to: "/custom", label: "اطلبي قطعتك" },
  { to: "/story", label: "قصتنا" },
  { to: "/contact", label: "تواصلي معنا" },
];

function AnnouncementBar() {
  const { site } = useSite();
  const announcements = site.announcements.length ? site.announcements : [site.tagline];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % announcements.length), 4200);
    return () => clearInterval(t);
  }, [announcements.length]);
  return (
    <div className="relative overflow-hidden bg-cocoa text-cream">
      <div className="container-b flex h-9 items-center justify-center text-[0.8rem]">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 truncate"
          >
            <Diamond className="size-2 text-rose" />
            {announcements[i % announcements.length]}
            <Diamond className="size-2 text-rose" />
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

function CartButton() {
  const { count, setDrawerOpen, cartIconRef, bump } = useShop();
  const controls = useAnimationControls();
  useEffect(() => {
    if (bump > 0) void controls.start({ scale: [1, 1.3, 0.9, 1.08, 1], rotate: [0, -10, 8, -4, 0], transition: { duration: 0.6 } });
  }, [bump, controls]);

  return (
    <motion.button
      ref={cartIconRef}
      animate={controls}
      onClick={() => setDrawerOpen(true)}
      className="relative grid size-11 place-items-center rounded-full transition hover:bg-cream-2"
      aria-label={`السلة، فيها ${count} قطع`}
    >
      <ShoppingBag className="size-[22px]" strokeWidth={1.7} />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-0.5 -start-0.5 grid min-w-5 place-items-center rounded-full bg-rose px-1 text-[11px] font-bold leading-5 text-white"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function Header() {
  const { wishlist } = useShop();
  const { site } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
  };

  return (
    <>
      <AnnouncementBar />
      <header
        className={`sticky top-0 z-40 transition-all duration-500 ${
          scrolled ? "bg-cream/85 shadow-[0_8px_30px_-20px_rgba(74,42,24,.35)] backdrop-blur-md" : "bg-cream"
        }`}
      >
        <div className="container-b flex h-[68px] items-center gap-3 md:h-20">
          <button
            onClick={() => setMenuOpen(true)}
            className="grid size-11 place-items-center rounded-full hover:bg-cream-2 lg:hidden"
            aria-label="فتح القائمة"
          >
            <Menu className="size-6" strokeWidth={1.7} />
          </button>

          <Logo className={`transition-all duration-500 ${scrolled ? "h-11 md:h-12" : "h-12 md:h-14"}`} />

          <nav className="ms-6 hidden lg:block" aria-label="القائمة الرئيسية">
            <ul className="flex items-center gap-1">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    end={l.to === "/"}
                    className={({ isActive }) =>
                      `group relative px-3.5 py-2 text-[0.95rem] font-medium transition ${isActive ? "text-cocoa" : "text-cocoa-2 hover:text-cocoa"}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {l.label}
                        <span
                          className={`stitch absolute inset-x-3 -bottom-0.5 origin-right text-rose transition-transform duration-500 ${
                            isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                          }`}
                        />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ms-auto flex items-center gap-0.5">
            <button
              onClick={() => setSearchOpen((s) => !s)}
              className="grid size-11 place-items-center rounded-full hover:bg-cream-2"
              aria-label="بحث"
              aria-expanded={searchOpen}
            >
              <Search className="size-[21px]" strokeWidth={1.7} />
            </button>
            <Link
              to="/wishlist"
              className="relative grid size-11 place-items-center rounded-full hover:bg-cream-2"
              aria-label={`المفضلة (${wishlist.length})`}
            >
              <Heart className="size-[21px]" strokeWidth={1.7} />
              {wishlist.length > 0 && <span className="absolute top-2 end-2 size-2 rounded-full bg-rose" />}
            </Link>
            <CartButton />
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.form
              onSubmit={submitSearch}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-line"
              role="search"
            >
              <div className="container-b flex items-center gap-3 py-3">
                <Search className="size-5 shrink-0 text-cocoa-3" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="شو حابة تلاقي؟ شنطة، حلق، تطريز..."
                  className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-cocoa-3"
                  aria-label="كلمة البحث"
                />
                <button className="btn btn-primary !px-5 !py-2">بحث</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </header>

      {/* قائمة الموبايل */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-cocoa/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col overflow-hidden bg-cream"
              aria-label="القائمة"
            >
              <div className="flex items-center justify-between p-4">
                <Logo className="h-12" />
                <button onClick={() => setMenuOpen(false)} className="grid size-11 place-items-center rounded-full hover:bg-cream-2" aria-label="إغلاق القائمة">
                  <X className="size-6" />
                </button>
              </div>
              <nav className="flex-1 px-6 pt-4">
                <ul className="space-y-1">
                  {navLinks.map((l, i) => (
                    <motion.li
                      key={l.to}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.06 }}
                    >
                      <NavLink
                        to={l.to}
                        end={l.to === "/"}
                        className={({ isActive }) =>
                          `flex items-center justify-between border-b border-dashed border-line py-4 font-display text-2xl ${isActive ? "text-rose" : ""}`
                        }
                      >
                        {l.label}
                        <Diamond className="size-2.5 text-rose" />
                      </NavLink>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <div className="relative p-6">
                <YarnBall className="pointer-events-none absolute -bottom-8 -start-6 size-32 opacity-60" color="#e9c2bb" />
                <p className="relative mb-3 text-sm text-cocoa-2">{site.tagline} 🫶🏼</p>
                <div className="relative flex gap-2">
                  <a href={`https://instagram.com/${site.instagram}`} target="_blank" rel="noreferrer" className="grid size-11 place-items-center rounded-full border border-line bg-linen" aria-label="إنستغرام">
                    <InstagramIcon className="size-5" />
                  </a>
                  <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer" className="grid size-11 place-items-center rounded-full border border-line bg-linen" aria-label="واتساب">
                    <WhatsappIcon className="size-5" />
                  </a>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
