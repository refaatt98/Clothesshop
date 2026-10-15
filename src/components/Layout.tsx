import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { useShop } from "../lib/store";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { RailDrawer } from "./RailDrawer";
import { SearchOverlay } from "./SearchOverlay";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }), 350);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

function Toasts() {
  const { toasts } = useShop();
  return (
    <div className="pointer-events-none fixed top-3 left-1/2 z-[99] md:top-auto md:bottom-4 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-3 rounded-md bg-ink px-4 py-3 text-paper shadow-xl"
          >
            <span className="text-thread">✂</span>
            <div className="min-w-0">
              <p className="text-sm font-medium">{t.text}</p>
              {t.sub && <p className="truncate font-mono text-xs text-paper/60">{t.sub}</p>}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
        Skip to content
      </a>
      <ScrollManager />
      <Header />
      <motion.main
        id="main"
        key={pathname}
        className="flex-1"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Outlet />
      </motion.main>
      <Footer />
      <RailDrawer />
      <SearchOverlay />
      <Toasts />
    </div>
  );
}
