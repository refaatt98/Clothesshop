import { Quote } from "lucide-react";
import { Link } from "react-router";
import type { Review } from "../types";
import { Stars } from "./ui";

const tints = ["#fffdfa", "#f3e1dc", "#e3e9dc", "#f3e8d2"];

function ReviewCard({ r, i }: { r: Review; i: number }) {
  return (
    <figure
      className="relative flex w-[280px] shrink-0 flex-col rounded-2xl p-5 pt-7 shadow-[0_18px_30px_-22px_rgba(74,42,24,.45)] sm:w-[320px]"
      style={{ background: tints[i % 4], rotate: `${[-1.5, 1.2, -0.8, 1.6][i % 4]}deg` }}
    >
      <span className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-[-3deg] bg-gold-soft/80 shadow-sm" aria-hidden />
      {r.imageUrl ? (
        <img src={r.imageUrl} alt={`رأي ${r.name}`} loading="lazy" className="mb-3 max-h-64 w-full rounded-xl object-cover object-top" />
      ) : (
        <Quote className="size-5 text-rose" />
      )}
      {r.text && <blockquote className="mt-2 line-clamp-5 font-serif text-[1.05rem] leading-8">{r.text}</blockquote>}
      <figcaption className="mt-auto flex items-center justify-between gap-2 border-t border-dashed border-cocoa/15 pt-3 text-sm">
        <span className="min-w-0">
          <b>{r.name}</b> {r.city && <span className="text-cocoa-3">· {r.city}</span>}
          {r.productName && (
            <span className="mt-0.5 block truncate text-xs text-cocoa-3">
              {r.productSlug ? <Link to={`/product/${r.productSlug}`} className="hover:text-rose">{r.productName}</Link> : r.productName}
            </span>
          )}
        </span>
        <Stars value={r.rating} />
      </figcaption>
    </figure>
  );
}

/** شريط آراء بيتحرك لحاله، وبيوقف لما تمرري الماوس عليه */
export function ReviewsMarquee({ reviews, speed = 45 }: { reviews: Review[]; speed?: number }) {
  if (!reviews.length) return null;
  // بنكرر القائمة لتعبّي الشريط وبعدين بنضاعفها للحركة اللانهائية
  const base = reviews.length < 5 ? [...reviews, ...reviews, ...reviews].slice(0, Math.max(5, reviews.length)) : reviews;
  const row = [...base, ...base];
  return (
    <div className="group relative overflow-hidden py-6 [mask-image:linear-gradient(to_left,transparent,#000_6%,#000_94%,transparent)]">
      <div
        className="flex w-max animate-marquee items-stretch gap-6 px-3 group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${base.length * (speed / 5)}s` }}
      >
        {row.map((r, i) => (
          <ReviewCard key={`${r.id}-${i}`} r={r} i={i} />
        ))}
      </div>
    </div>
  );
}
