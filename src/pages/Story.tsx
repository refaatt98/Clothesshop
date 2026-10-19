import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { Link } from "react-router";
import { Bow, Diamond, Leaf, SewButton, Spool, YarnBall } from "../components/Craft";
import { ProductArt } from "../components/ProductArt";
import { PageHero, Reveal, SectionHeading } from "../components/ui";
import { getStory } from "../lib/api";
import { useAsync, useTitle } from "../lib/hooks";
import { useSite } from "../lib/site";

const numbers = [
  { value: "+500", label: "قطعة وصلت لأصحابها" },
  { value: "+40", label: "ساعة شغل بالأسبوع" },
  { value: "100%", label: "صنع باليد" },
  { value: "∞", label: "حب بكل غرزة" },
];

export default function Story() {
  useTitle("قصتنا");
  const { site } = useSite();
  const { data: story } = useAsync(getStory, []);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  return (
    <>
      <PageHero eyebrow="قصتنا" title="بَنان… بأطراف الأصابع" text="البَنان هي أطراف الأصابع — ومن هون بدأت كل حكايتنا." />

      {/* المقدمة */}
      <section className="container-b grid items-center gap-12 overflow-x-clip py-16 md:grid-cols-2 md:py-24">
        <Reveal className="relative mx-auto w-full max-w-sm">
          <div className="relative aspect-[4/5] -rotate-3 overflow-hidden rounded-[2.5rem] border-[10px] border-linen shadow-[0_30px_60px_-30px_rgba(74,42,24,.5)]">
            <ProductArt kind="hoop" color="#e9c2bb" bg="#f3e1dc" className="size-full" />
          </div>
          <div className="absolute -bottom-6 end-0 w-36 rotate-6 sm:-end-6 sm:w-40 overflow-hidden rounded-3xl border-8 border-linen shadow-xl">
            <ProductArt kind="bag" color="#93a386" bg="#e3e9dc" className="aspect-square w-full" />
          </div>
          <YarnBall className="absolute -top-8 start-0 size-16 animate-float sm:-start-8 sm:size-20" color="#c98f86" />
          <span className="absolute -top-3 left-1/2 h-7 w-24 -translate-x-1/2 rotate-[-4deg] bg-gold-soft/90 shadow-sm" aria-hidden />
        </Reveal>
        <Reveal delay={0.1}>
          <span className="eyebrow"><Diamond className="size-2" /> مين إحنا</span>
          <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">إيدين صغيرة، وأفكار كبيرة</h2>
          <div className="mt-5 space-y-4 leading-9 text-cocoa-2">
            <p>بَنان مشروع صغير بلّش من حب للتفاصيل. كل قطعة عنا بتنعمل بإيدينا، غرزة بغرزة، بدون استعجال.</p>
            <p>منختار الخيوط والخرز والأقمشة بعناية، ومنفكّر بكل قطعة كأنها رح تكون هدية لحدا غالي — لأنها غالباً بتكون هيك.</p>
            <p className="font-display text-2xl text-cocoa">{site.tagline} 🫶🏼</p>
          </div>
        </Reveal>
      </section>

      {/* الخط الزمني */}
      <section className="bg-cream-2/70 py-16 md:py-24">
        <div className="container-b">
          <SectionHeading eyebrow="الحكاية" title="من كبة صوف لمتجر صغير" />
          <div ref={ref} className="relative mx-auto max-w-3xl">
            <div className="absolute inset-y-0 right-5 w-0.5 md:right-1/2" aria-hidden>
              <div className="absolute inset-0 border-r-2 border-dashed border-line" />
              <motion.div className="absolute inset-0 origin-top bg-rose" style={{ scaleY: progress }} />
            </div>
            <ol className="space-y-10">
              {story?.map((m, i) => (
                <li key={m.year} className={`relative pr-14 md:w-1/2 md:pr-0 ${i % 2 ? "md:mr-auto md:pr-12" : "md:pl-12"}`}>
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: "-20%" }}
                    transition={{ type: "spring", damping: 10 }}
                    className={`absolute right-[9px] top-4 size-6 md:top-6 ${i % 2 ? "md:-right-3" : "md:-left-3 md:right-auto"}`}
                  >
                    <SewButton className="size-full" color={["#c98f86", "#93a386", "#c5a46d", "#b9a6c4"][i % 4]} />
                  </motion.span>
                  <Reveal className="stitched rounded-[1.75rem] bg-linen p-6">
                    <span className="text-sm font-semibold text-rose">{m.year}</span>
                    <h3 className="mt-1 font-display text-2xl">{m.title}</h3>
                    <p className="mt-2 leading-8 text-cocoa-2">{m.text}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* أرقام */}
      <section className="container-b py-16 md:py-24">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {numbers.map((n, i) => (
            <Reveal key={n.label} delay={i * 0.08} className="stitched rounded-[1.75rem] bg-linen p-6 text-center">
              <p className="font-display text-4xl text-rose md:text-5xl">{n.value}</p>
              <p className="mt-2 text-sm text-cocoa-2">{n.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* اقتباس */}
      <section className="container-b">
        <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-cocoa px-6 py-16 text-center text-cream md:py-20">
          <div className="pointer-events-none absolute inset-3 rounded-[2rem] border border-dashed border-cream/20" aria-hidden />
          <Spool className="absolute -start-2 top-6 h-20 w-16 -rotate-12 opacity-80" color="#c98f86" />
          <Leaf className="absolute end-6 bottom-6 h-20 w-12 rotate-12 opacity-70" />
          <Bow className="mx-auto h-12 w-16" color="#e9c2bb" />
          <blockquote className="mx-auto mt-6 max-w-2xl font-display text-3xl leading-relaxed md:text-4xl">
            «ما في قطعة بتطلع من عنا إلا وفيها شوية من روحنا»
          </blockquote>
          <p className="mt-4 text-cream/70">— صاحبة بَنان</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/shop" className="btn bg-cream text-cocoa hover:bg-rose hover:text-white">تصفّحي القطع</Link>
            <Link to="/custom" className="btn border border-cream/40 text-cream hover:bg-cream hover:text-cocoa">اطلبي قطعة خاصة</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
