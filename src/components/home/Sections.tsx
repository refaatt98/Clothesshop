import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowLeft, Gift, Hand, HandHeart, Leaf as LeafIcon, PenLine, Scissors as ScissorsIcon, Sparkles } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router";
import type { Category, GalleryItem, ProcessStep, Product, Review } from "../../types";
import { Diamond, Needle, SewButton, Spool, YarnBall } from "../Craft";
import { ProductArt } from "../ProductArt";
import { ProductMedia } from "../ProductMedia";
import { ProductCard } from "../ProductCard";
import { ReviewsMarquee } from "../ReviewsMarquee";
import { Reveal, SectionHeading } from "../ui";
import { WorksCarousel } from "../WorksCarousel";

// ─── شريط متحرك ───────────────────────────────────────────
const marqueeWords = ["صُنع باليد", "كروشيه", "تطريز", "خرز", "قطعة ما بتتكرر", "تغليف بحب", "تفاصيل صغيرة", "خيوط طبيعية"];

export function Marquee() {
  const row = [...marqueeWords, ...marqueeWords];
  return (
    <div className="relative -rotate-1 overflow-hidden border-y border-dashed border-cocoa/20 bg-cocoa py-4 text-cream" aria-hidden>
      <div className="flex w-max animate-marquee items-center gap-8">
        {[...row, ...row].map((w, i) => (
          <span key={i} className="flex items-center gap-8 font-display text-2xl">
            {w}
            {i % 3 === 0 ? <SewButton className="size-6" /> : <Diamond className="size-3 text-rose" />}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── التصنيفات ────────────────────────────────────────────
export function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section className="container-b py-20 md:py-28">
      <SectionHeading eyebrow="تسوّقي حسب" title="شو بدك تدلّلي حالك اليوم؟" text="ست عوالم صغيرة، كل وحدة فيها قطع معمولة بإيدينا وبحب." />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {categories.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.06}>
            <Link to={`/shop?category=${c.slug}`} className="stitched group relative block overflow-hidden rounded-[1.75rem] p-4 md:p-6" style={{ background: c.tint }}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
                <motion.div
                  className="aspect-square w-full overflow-hidden rounded-2xl md:w-32 md:shrink-0"
                  whileHover={{ rotate: -4, scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 260, damping: 14 }}
                >
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} loading="lazy" className="size-full object-cover" />
                  ) : (
                    <ProductArt kind={c.art} color={["#c98f86", "#c5a46d", "#93a386", "#b9a6c4", "#b88356", "#e9c2bb"][i % 6]} bg={c.tint} className="size-full" />
                  )}
                </motion.div>
                <div className="min-w-0">
                  <h3 className="font-display text-xl md:text-2xl">{c.name}</h3>
                  <p className="mt-1 hidden text-sm leading-6 text-cocoa-2 sm:block">{c.description}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-rose">
                    اكتشفي <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1.5" />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ─── القطع المختارة ───────────────────────────────────────
export function FeaturedSection({ products }: { products: Product[] }) {
  return (
    <section className="relative bg-cream-2/70 py-20 md:py-28">
      <YarnBall className="pointer-events-none absolute -top-10 end-6 size-20 opacity-80 md:end-16 md:size-28" color="#e9c2bb" />
      <div className="container-b">
        <SectionHeading
          eyebrow="مختارات بَنان"
          title="قطع حبّيناها كتير"
          align="start"
          action={
            <Link to="/shop" className="btn btn-ghost self-start md:self-auto">
              كل القطع <ArrowLeft className="size-4" />
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── كيف تُصنع قطعتك (خيط بيرتسم مع السكرول) ──────────────
const stepIcons = { sketch: PenLine, thread: ScissorsIcon, hands: Hand, gift: Gift };

export function ProcessSection({ steps }: { steps: ProcessStep[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  const needleTop = useTransform(progress, (v) => `${v * 100}%`);

  return (
    <section className="container-b py-20 md:py-28">
      <SectionHeading eyebrow="من الإيد للقلب" title="كيف بتنصنع قطعتك؟" text="رحلة صغيرة بتمرّ فيها كل قطعة قبل ما توصل لإيدك." />
      <div ref={ref} className="relative mx-auto max-w-4xl">
        {/* الخيط */}
        <div className="absolute inset-y-0 right-6 w-0.5 translate-x-1/2 md:right-1/2" aria-hidden>
          <div className="absolute inset-0 border-r-2 border-dashed border-line" />
          <motion.div className="absolute inset-0 origin-top bg-rose" style={{ scaleY: progress }} />
          <motion.div className="absolute left-1/2 z-10 -translate-x-1/2 -translate-y-full" style={{ top: needleTop }}>
            <Needle className="h-3 w-12 -rotate-90" />
          </motion.div>
        </div>

        <ol className="space-y-12 md:space-y-20">
          {steps.map((s, i) => {
            const Icon = stepIcons[s.icon];
            const left = i % 2 === 1;
            return (
              <li key={s.id} className="relative grid items-center gap-4 pr-16 md:grid-cols-2 md:gap-16 md:pr-0">
                <div className="absolute right-0 top-0 z-10 md:right-1/2 md:top-1/2 md:-translate-y-1/2 md:translate-x-1/2">
                  <motion.div
                    className="grid size-12 place-items-center rounded-full border-2 border-dashed border-rose bg-cream md:size-14"
                    initial={{ scale: 0.3, rotate: -90, opacity: 0 }}
                    whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                    viewport={{ once: true, margin: "-15%" }}
                    transition={{ type: "spring", damping: 12 }}
                  >
                    <Icon className="size-5 text-rose md:size-6" strokeWidth={1.7} />
                  </motion.div>
                </div>
                <Reveal className={left ? "md:col-start-2" : "md:text-start"} y={30}>
                  <div className="stitched rounded-[1.75rem] bg-linen p-6 shadow-[0_20px_40px_-30px_rgba(74,42,24,.4)] md:p-8">
                    <span className="font-display text-5xl text-rose-soft">0{i + 1}</span>
                    <h3 className="mt-1 font-display text-2xl">{s.title}</h3>
                    <p className="mt-2 leading-8 text-cocoa-2">{s.text}</p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

// ─── ليش بَنان ────────────────────────────────────────────
const values = [
  { icon: HandHeart, title: "كل قطعة إلها روح", text: "ما في آلات، في إيدين وساعات صبر وتفاصيل صغيرة." },
  { icon: LeafIcon, title: "مواد ناعمة وطبيعية", text: "قطن، كتّان وخرز زجاجي مختار ليدوم معك." },
  { icon: Sparkles, title: "قابلة للتخصيص", text: "اسمك، لونك المفضّل أو فكرة ببالك — بنعملها إلك." },
];

export function ValuesStrip() {
  return (
    <section className="container-b">
      <div className="grid gap-4 rounded-[2rem] border border-dashed border-line bg-linen p-6 md:grid-cols-3 md:p-10">
        {values.map((v, i) => (
          <Reveal key={v.title} delay={i * 0.1} className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-rose-soft text-rose">
              <v.icon className="size-6" strokeWidth={1.7} />
            </span>
            <div>
              <h3 className="font-semibold">{v.title}</h3>
              <p className="mt-1 text-sm leading-7 text-cocoa-2">{v.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ─── دعوة لطلب قطعة خاصة ──────────────────────────────────
export function CustomCta() {
  return (
    <section className="container-b py-20 md:py-28">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-cocoa px-6 py-14 text-cream md:px-16 md:py-20">
        <svg className="pointer-events-none absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 800 400" aria-hidden>
          <motion.path
            d="M-20 370 C140 300 240 400 400 350 S640 300 820 340"
            fill="none"
            stroke="#c98f86"
            strokeWidth="2"
            strokeDasharray="8 8"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2.4, ease: "easeInOut" }}
          />
        </svg>
        <div className="pointer-events-none absolute inset-3 rounded-[2rem] border border-dashed border-cream/20" aria-hidden />
        <div className="relative grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <span className="eyebrow !text-rose-soft"><Diamond className="size-2" /> قطعة من خيالك</span>
            <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">عندك فكرة؟ احكيلنا وبنحوّلها لقطعة بين إيديكِ</h2>
            <p className="mt-4 max-w-lg leading-8 text-cream/80">
              اسم مطرّز لمولود جديد، شنطة بلون فستانك، أو هدية لحدا غالي — بنصممها معك خطوة خطوة.
            </p>
            <Link to="/custom" className="btn mt-8 bg-cream text-cocoa hover:bg-rose hover:text-white">
              ابدئي طلبك الخاص <ArrowLeft className="size-4" />
            </Link>
          </Reveal>
          <div className="relative mx-auto h-56 w-56 md:h-72 md:w-72">
            <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 40, ease: "linear" }}>
              <svg viewBox="0 0 200 200" className="size-full" aria-hidden>
                <defs>
                  <path id="circ" d="M100 100 m-82 0 a82 82 0 1 1 164 0 a82 82 0 1 1 -164 0" />
                </defs>
                <text fontSize="13" fill="#f3e1dc" fontFamily="IBM Plex Sans Arabic, sans-serif" letterSpacing="2">
                  <textPath href="#circ">✦ مصمّمة إلك ✦ باسمك ✦ بلونك ✦ بفكرتك ✦ مصمّمة إلك ✦ باسمك ✦</textPath>
                </text>
              </svg>
            </motion.div>
            <div className="absolute inset-10 overflow-hidden rounded-full border-4 border-[#c99b6d]">
              <ProductArt kind="hoop" color="#e9c2bb" bg="#f5ede3" className="size-full scale-125" />
            </div>
            <Spool className="absolute -bottom-2 -start-4 h-20 w-16 rotate-[-15deg]" color="#c98f86" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── آراء الزبائن (شريط متحرك) ────────────────────────────
export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;
  return (
    <section className="relative overflow-hidden bg-cream-2/70 py-20 md:py-28">
      <div className="container-b">
        <SectionHeading eyebrow="من قلوبكم" title="شو حكوا عن بَنان" text="أحلى شي بنستلمه بعد كل طلب: رسالة حلوة متلكم." />
      </div>
      <ReviewsMarquee reviews={reviews} />
    </section>
  );
}

// ─── معرض الأعمال (صور وفيديو) ────────────────────────────
export function WorksSection({ items }: { items: GalleryItem[] }) {
  if (!items.length) return null;
  return (
    <section className="py-20 md:py-28">
      <div className="container-b">
        <SectionHeading eyebrow="معرض الأعمال" title="من إيدينا لبيتكم" text="لقطات من الشغل والقطع اللي وصلت لأصحابها." />
      </div>
      <WorksCarousel items={items} />
    </section>
  );
}

// ─── معرض من الدفتر ───────────────────────────────────────
export function GallerySection({ products }: { products: Product[] }) {
  const tiles = products.slice(0, 6);
  const spans = ["md:row-span-2", "", "", "md:row-span-2", "", ""];
  return (
    <section className="container-b py-20 md:py-28">
      <SectionHeading eyebrow="جديدنا" title="من دفتر بَنان" text="لقطات من الشغل، القطع، والتفاصيل اللي بنحبها." />
      <div className="grid auto-rows-[9rem] grid-cols-2 gap-3 md:auto-rows-[12rem] md:grid-cols-4 md:gap-4">
        {tiles.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.06} className={`${spans[i]} group relative overflow-hidden rounded-3xl`}>
            <Link to={`/product/${p.slug}`} className="block size-full" aria-label={p.name}>
              <ProductMedia image={p.images[0]} art={p.art} color={p.colors[Math.min(1, p.colors.length - 1)].hex} variant={p.images[0] ? 0 : i % 3 === 1 ? 1 : i % 3 === 2 ? 2 : 0} className="size-full transition-transform duration-700 group-hover:scale-110" alt={p.name} />
              <span className="absolute inset-0 flex items-end bg-gradient-to-t from-cocoa/60 via-transparent p-4 text-cream opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <span className="font-display text-lg">{p.name}</span>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
