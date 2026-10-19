import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryItem } from "../types";

function Slide({ item, active }: { item: GalleryItem; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) v.play().catch(() => undefined);
    else v.pause();
  }, [active]);

  return (
    <figure className="relative h-full overflow-hidden rounded-[1.75rem] bg-cream-2">
      {item.type === "video" ? (
        <>
          <video ref={ref} src={item.url} poster={item.posterUrl ?? undefined} muted loop playsInline preload="metadata" className="size-full object-cover" />
          {!active && (
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-14 place-items-center rounded-full bg-cream/80 backdrop-blur"><Play className="size-6 fill-cocoa" /></span>
            </span>
          )}
        </>
      ) : (
        <img src={item.url} alt={item.caption ?? "من أعمال بَنان"} loading="lazy" className="size-full object-cover" />
      )}
      {item.caption && (
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cocoa/70 to-transparent p-5 pt-12 font-display text-xl text-cream">{item.caption}</figcaption>
      )}
    </figure>
  );
}

/** معرض الأعمال: صور وفيديوهات بتتقلّب لحالها */
export function WorksCarousel({ items, interval = 4000 }: { items: GalleryItem[]; interval?: number }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);

  const goTo = useCallback(
    (i: number) => {
      const el = track.current;
      if (!el || !items.length) return;
      const n = (i + items.length) % items.length;
      const child = el.children[n] as HTMLElement | undefined;
      if (child) el.scrollTo({ left: child.offsetLeft - (el.clientWidth - child.clientWidth) / 2, behavior: "smooth" });
      setIndex(n);
    },
    [items.length],
  );

  // نعرف أي شريحة بالنص لما المستخدمة تسحب بإيدها
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.6) setIndex(Number((e.target as HTMLElement).dataset.i));
        });
      },
      { root: el, threshold: [0.6] },
    );
    Array.from(el.children).forEach((c) => io.observe(c));
    const vis = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    vis.observe(el);
    return () => {
      io.disconnect();
      vis.disconnect();
    };
  }, [items]);

  useEffect(() => {
    if (paused || !visible || items.length < 2) return;
    const current = items[index];
    const t = setTimeout(() => goTo(index + 1), current?.type === "video" ? interval * 2 : interval);
    return () => clearTimeout(t);
  }, [index, paused, visible, items, interval, goTo]);

  if (!items.length) return null;

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={() => setPaused(true)}>
      <div
        ref={track}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-[8%] pb-2 [scrollbar-width:none] md:px-[18%]"
        aria-roledescription="carousel"
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            data-i={i}
            className={`aspect-[4/5] w-[84%] shrink-0 snap-center transition duration-500 sm:aspect-[4/3] md:w-[64%] ${i === index ? "scale-100 opacity-100" : "scale-[.94] opacity-60"}`}
          >
            <Slide item={item} active={i === index && visible} />
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <>
          <button onClick={() => goTo(index - 1)} className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-cream/90 shadow backdrop-blur hover:bg-cream md:right-6" aria-label="السابق">
            <ChevronRight className="size-5" />
          </button>
          <button onClick={() => goTo(index + 1)} className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-cream/90 shadow backdrop-blur hover:bg-cream md:left-6" aria-label="التالي">
            <ChevronLeft className="size-5" />
          </button>
          <div className="mt-5 flex justify-center gap-2">
            {items.map((it, i) => (
              <button key={it.id} onClick={() => goTo(i)} aria-label={`الشريحة ${i + 1}`} className={`h-2 rounded-full transition-all ${i === index ? "w-7 bg-rose" : "w-2 bg-sand"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
