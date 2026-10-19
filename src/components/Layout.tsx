import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { CartDrawer } from "./CartDrawer";
import { Needle } from "./Craft";
import { FlyLayer } from "./FlyLayer";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { YarnLoader } from "./Loader";

/** خيط بيتخيّط أعلى الشاشة مع السكرول، وإبرة بتقوده */
function ScrollThread() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  const right = useTransform(p, (v) => `calc(${v * 100}% - 18px)`);
  const opacity = useTransform(p, [0, 0.02], [0, 1]);
  return (
    <motion.div className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-3 overflow-hidden" style={{ opacity }} aria-hidden>
      <motion.div className="stitch absolute right-0 top-1 w-full origin-right text-rose" style={{ scaleX: p }} />
      <motion.div className="absolute top-0" style={{ right }}>
        <Needle className="h-2.5 w-10 -scale-x-100" color="#4a2a18" />
      </motion.div>
    </motion.div>
  );
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 300);
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

export function Layout() {
  const location = useLocation();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-[80] focus:rounded-full focus:bg-cocoa focus:px-4 focus:py-2 focus:text-cream">
        تخطّي إلى المحتوى
      </a>
      <ScrollToTop />
      <ScrollThread />
      <Header />
      <main id="main" className="min-h-[60vh]">
        <Suspense fallback={<YarnLoader />}>
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
            <Outlet />
          </motion.div>
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <FlyLayer />
    </>
  );
}
