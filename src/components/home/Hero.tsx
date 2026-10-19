import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { PointerEvent, ReactNode } from "react";
import { Link } from "react-router";
import { site } from "../../data/site";
import { Bow, Leaf, Needle, Scissors, SewButton, Spool, YarnBall } from "../Craft";

const ease = [0.22, 1, 0.36, 1] as const;

/** عنصر عائم بيتحرك مع الماوس بعمق مختلف */
function Floater({
  mx,
  my,
  depth,
  className,
  children,
  delay = 0,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
  depth: number;
  className: string;
  children: ReactNode;
  delay?: number;
}) {
  const x = useTransform(mx, (v) => v * depth);
  const y = useTransform(my, (v) => v * depth);
  return (
    <motion.div className={`pointer-events-none absolute ${className}`} style={{ x, y }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.6 + delay, type: "spring", damping: 12 }}
      >
        <div className="animate-float" style={{ animationDelay: `${delay * 2}s` }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

/** إطار تطريز بيطرّز حاله: ورد، أوراق، واسم بَنان */
function EmbroideryHoop() {
  const draw = (d: number, dur = 1.4) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { pathLength: { delay: d, duration: dur, ease: "easeInOut" as const }, opacity: { delay: d, duration: 0.01 } },
  });

  const petals = (cx: number, cy: number, r: number) =>
    [0, 72, 144, 216, 288]
      .map((a) => {
        const rad = ((a - 90) * Math.PI) / 180;
        const px = cx + Math.cos(rad) * r;
        const py = cy + Math.sin(rad) * r;
        return `M${cx} ${cy} Q${px + Math.cos(rad + 1.2) * r * 0.6} ${py + Math.sin(rad + 1.2) * r * 0.6} ${px} ${py} Q${px + Math.cos(rad - 1.2) * r * 0.6} ${py + Math.sin(rad - 1.2) * r * 0.6} ${cx} ${cy}`;
      })
      .join(" ");

  return (
    <svg viewBox="0 0 400 440" className="h-auto w-full" role="img" aria-label="إطار تطريز مكتوب عليه بَنان">
      <defs>
        <radialGradient id="fabric" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#fffdfa" />
          <stop offset="100%" stopColor="#f1e6d8" />
        </radialGradient>
        <pattern id="weave" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 3 H6 M3 0 V6" stroke="#e8dccd" strokeWidth=".6" />
        </pattern>
      </defs>

      {/* المسمار والحلقة الخشبية */}
      <motion.g initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease }}>
        <rect x="186" y="18" width="28" height="34" rx="6" fill="#b88356" stroke="#4a2a18" strokeWidth="2" />
        <circle cx="200" cy="35" r="5" fill="#c5a46d" stroke="#4a2a18" strokeWidth="1.5" />
      </motion.g>
      <motion.g initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.9, ease }} style={{ transformOrigin: "200px 240px" }}>
        <circle cx="200" cy="240" r="178" fill="#c99b6d" />
        <circle cx="200" cy="240" r="178" fill="none" stroke="#4a2a18" strokeWidth="2.5" />
        <circle cx="200" cy="240" r="166" fill="#a87a50" />
        <circle cx="200" cy="240" r="160" fill="url(#fabric)" />
        <circle cx="200" cy="240" r="160" fill="url(#weave)" opacity=".7" />
        <circle cx="200" cy="240" r="148" fill="none" stroke="#e2cfbb" strokeWidth="1.5" strokeDasharray="3 6" />
      </motion.g>

      {/* الإكليل */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <motion.path d="M92 300 C70 240 90 170 150 132" stroke="#7c8f6a" strokeWidth="3.5" {...draw(0.9, 1.6)} />
        <motion.path d="M308 300 C330 240 310 170 250 132" stroke="#7c8f6a" strokeWidth="3.5" {...draw(0.9, 1.6)} />
        {[
          [84, 262, -40],
          [86, 214, -60],
          [106, 172, -80],
          [134, 146, -100],
          [316, 262, 40],
          [314, 214, 60],
          [294, 172, 80],
          [266, 146, 100],
        ].map(([x, y, r], i) => (
          <motion.path
            key={i}
            d={`M${x} ${y} q-14 -10 -26 -4 q12 12 26 4 Z`}
            transform={`rotate(${r} ${x} ${y})`}
            fill="#93a386"
            stroke="#5f7052"
            strokeWidth="1.5"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.6 + i * 0.08, type: "spring", damping: 10 }}
            style={{ transformOrigin: `${x}px ${y}px` }}
          />
        ))}
        {/* ورود */}
        {[
          [200, 118, 20, "#c98f86", 2.2],
          [120, 320, 16, "#e9c2bb", 2.5],
          [280, 320, 16, "#e9c2bb", 2.6],
          [96, 238, 11, "#c5a46d", 2.8],
          [304, 238, 11, "#c5a46d", 2.9],
        ].map(([x, y, r, c, d], i) => (
          <g key={i}>
            <motion.path d={petals(x as number, y as number, r as number)} stroke={c as string} strokeWidth="3.2" fill={`${c}55`} {...draw(d as number, 1)} />
            <motion.circle cx={x as number} cy={y as number} r={(r as number) * 0.28} fill="#c5a46d" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: (d as number) + 0.8 }} style={{ transformOrigin: `${x}px ${y}px` }} />
          </g>
        ))}
      </g>

      {/* الاسم مطرّز */}
      <motion.text
        x="200"
        y="262"
        textAnchor="middle"
        fontFamily="Aref Ruqaa, Amiri, serif"
        fontSize="104"
        fontWeight="700"
        stroke="#4a2a18"
        strokeWidth="1.6"
        strokeDasharray="700"
        initial={{ strokeDashoffset: 700, fill: "rgba(74,42,24,0)" }}
        animate={{ strokeDashoffset: 0, fill: "rgba(74,42,24,1)" }}
        transition={{ strokeDashoffset: { delay: 1.2, duration: 2.6, ease: "easeInOut" }, fill: { delay: 3.1, duration: 0.9 } }}
      >
        بَنان
      </motion.text>
      <motion.path d="M140 292 Q200 306 260 292" fill="none" stroke="#c98f86" strokeWidth="2.5" strokeDasharray="5 5" {...draw(3.4, 1)} />
      <motion.text
        x="200"
        y="330"
        textAnchor="middle"
        fontFamily="IBM Plex Sans Arabic, sans-serif"
        fontSize="15"
        letterSpacing="1"
        fill="#9c8070"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.8 }}
      >
        صُنع باليد · بحب
      </motion.text>

      {/* الخيط والإبرة الخارجين من الإطار */}
      <motion.path d="M330 330 C380 360 380 410 340 432" fill="none" stroke="#c98f86" strokeWidth="2" {...draw(3.6, 1.2)} />
    </svg>
  );
}

export function Hero() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const hoopX = useTransform(sx, (v) => v * -14);
  const hoopY = useTransform(sy, (v) => v * -14);
  const words = site.tagline.split(" ");

  return (
    <section onPointerMove={onMove} className="relative overflow-hidden">
      {/* بقع لونية ناعمة */}
      <div className="pointer-events-none absolute -end-40 -top-40 size-[34rem] rounded-full bg-rose-soft/70 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 -start-40 size-[30rem] rounded-full bg-sage-soft/80 blur-3xl" aria-hidden />

      <div className="container-b relative grid items-center gap-10 pb-16 pt-10 md:pt-14 lg:min-h-[calc(100dvh-7.25rem)] lg:grid-cols-2 lg:gap-6 lg:pb-20">
        <div className="relative z-10 text-center lg:text-start">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-dashed border-rose/60 bg-linen/70 px-4 py-1.5 text-sm text-cocoa-2"
          >
            <Sparkles className="size-4 text-rose" /> قطع يدوية · مختارة بعناية
          </motion.span>

          <h1 className="font-display text-[2.9rem] leading-[1.25] sm:text-6xl lg:text-[4.6rem] lg:leading-[1.2]">
            {words.map((w, i) => (
              <motion.span
                key={i}
                className="me-3 inline-block"
                initial={{ opacity: 0, y: 30, rotate: -4 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: 0.15 + i * 0.14, duration: 0.7, ease }}
              >
                {i === words.length - 1 ? <span className="text-rose">{w}</span> : w}
              </motion.span>
            ))}
            <motion.span
              className="inline-block"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring", damping: 8 }}
            >
              🫶🏼
            </motion.span>
          </h1>

          {/* إبرة بتخيّط تحت الجملة */}
          <div className="relative mx-auto mt-4 h-6 max-w-md lg:mx-0" aria-hidden>
            <motion.div
              className="stitch absolute right-0 top-1/2 text-rose"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ delay: 1, duration: 1.8, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-1/2 -translate-y-1/2"
              initial={{ right: "0%", opacity: 0 }}
              animate={{ right: "100%", opacity: [0, 1, 1, 0] }}
              transition={{ delay: 1, duration: 1.8, ease: "easeInOut" }}
            >
              <motion.div animate={{ y: [0, -6, 0, 6, 0] }} transition={{ repeat: 4, duration: 0.45 }}>
                <Needle className="h-3 w-14 -scale-x-100" />
              </motion.div>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7 }}
            className="mx-auto mt-5 max-w-md text-lg leading-9 text-cocoa-2 lg:mx-0"
          >
            {site.intro}.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.7 }}
            className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
          >
            <Link to="/shop" className="btn btn-primary group">
              تسوّقي القطع
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            </Link>
            <Link to="/custom" className="btn btn-ghost">اطلبي قطعة باسمك</Link>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-cocoa-3 lg:justify-start"
          >
            <li>✦ +500 قطعة وصلت لأصحابها</li>
            <li>✦ دفع عند الاستلام</li>
            <li>✦ تغليف هدية</li>
          </motion.ul>
        </div>

        <div className="relative mx-auto w-full max-w-[22rem] sm:max-w-md lg:max-w-[30rem]">
          <motion.div style={{ x: hoopX, y: hoopY }}>
            <EmbroideryHoop />
          </motion.div>

          <Floater mx={sx} my={sy} depth={40} className="-start-4 top-[8%] sm:-start-10" delay={0}>
            <YarnBall className="size-16 sm:size-24" color="#c98f86" />
          </Floater>
          <Floater mx={sx} my={sy} depth={-30} className="-end-2 top-[2%] sm:-end-6" delay={0.2}>
            <Spool className="h-16 w-12 sm:h-20 sm:w-16" color="#93a386" />
          </Floater>
          <Floater mx={sx} my={sy} depth={55} className="-start-2 bottom-[14%] sm:-start-8" delay={0.35}>
            <SewButton className="size-10 sm:size-12" />
          </Floater>
          <Floater mx={sx} my={sy} depth={-50} className="-end-3 bottom-[24%]" delay={0.5}>
            <SewButton className="size-8" color="#e9c2bb" />
          </Floater>
          <Floater mx={sx} my={sy} depth={25} className="bottom-[-2%] end-[18%]" delay={0.65}>
            <Scissors className="h-10 w-16 rotate-[-20deg] sm:h-12 sm:w-20" />
          </Floater>
          <Floater mx={sx} my={sy} depth={-20} className="start-[12%] -top-2 hidden sm:block" delay={0.8}>
            <Bow className="h-10 w-14" color="#e9c2bb" />
          </Floater>
          <Floater mx={sx} my={sy} depth={35} className="end-[-6%] top-[44%] hidden sm:block" delay={0.9}>
            <Leaf className="h-16 w-10 rotate-12" />
          </Floater>
        </div>
      </div>
    </section>
  );
}
