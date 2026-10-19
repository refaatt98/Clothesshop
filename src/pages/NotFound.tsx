import { motion } from "motion/react";
import { Link } from "react-router";
import { useTitle } from "../lib/hooks";

/** كبة صوف انفكّت خيوطها */
export default function NotFound() {
  useTitle("الصفحة مش موجودة");
  return (
    <section className="container-b flex flex-col items-center py-20 text-center md:py-28">
      <svg viewBox="0 0 420 200" className="w-full max-w-lg" aria-hidden>
        <motion.path
          d="M10 150 C60 60 110 190 160 120 S250 40 280 120 S330 170 330 120"
          fill="none"
          stroke="#c98f86"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.g initial={{ x: -260, rotate: -720 }} animate={{ x: 0, rotate: 0 }} transition={{ duration: 2, ease: "easeOut" }} style={{ transformOrigin: "370px 120px" }}>
          <circle cx="370" cy="120" r="40" fill="#c98f86" />
          <g fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2.5">
            <path d="M338 104 C356 96 384 98 404 116" />
            <path d="M334 124 C354 112 386 116 406 134" />
            <path d="M360 82 C346 104 350 136 366 158" />
          </g>
        </motion.g>
        <text x="170" y="70" textAnchor="middle" fontSize="64" fontFamily="Aref Ruqaa, serif" fill="#4a2a18">404</text>
      </svg>
      <h1 className="mt-6 font-display text-4xl">يا خسارة، الخيط انفكّ!</h1>
      <p className="mt-3 max-w-md leading-8 text-cocoa-2">الصفحة اللي بتدوري عليها مش موجودة، أو يمكن انتقلت لمكان تاني.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn btn-primary">رجوع للرئيسية</Link>
        <Link to="/shop" className="btn btn-ghost">تصفّحي المتجر</Link>
      </div>
    </section>
  );
}
