import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { GarmentFlat } from "../components/GarmentFlat";
import { NotifyForm } from "../components/NotifyForm";
import { HandNote, PageHeader, Reveal, Skeleton } from "../components/ui";
import { getChapters, getProducts } from "../lib/api";
import { useAsync, useDocumentTitle } from "../lib/hooks";

export default function Chapters() {
  useDocumentTitle("Chapters");
  const { data: chapters } = useAsync(getChapters, []);
  const { data: products } = useAsync(() => getProducts(), []);

  return (
    <>
      <PageHeader
        trail={[{ label: "Home", to: "/" }, { label: "Chapters" }]}
        kicker="Chapters, not seasons"
        title={
          <>
            We publish clothes <em>like a book</em>
          </>
        }
        intro="Instead of a spring and an autumn collection, we write chapters — each one drafted in a particular place, with its own palette and a handful of cloths. Old chapters stay on the rail until their numbered editions run out."
      />

      <div className="wrap space-y-6 py-14">
        {!chapters && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
        {chapters?.map((c, i) => {
          const pieces = products?.filter((p) => p.chapter === c.slug) ?? [];
          const upcoming = c.status === "upcoming";
          return (
            <Reveal key={c.slug} delay={0.05}>
              <article
                className={`relative grid overflow-hidden rounded-md ring-1 md:grid-cols-[200px_1fr_1.1fr] ${c.status === "current" ? "bg-ink text-paper ring-ink" : "bg-tissue ring-line"}`}
              >
                {/* envelope flap */}
                <div className={`flex items-center justify-between border-b border-dashed p-6 md:flex-col md:items-start md:border-b-0 md:border-r ${c.status === "current" ? "border-paper/20" : "border-ink/20"}`}>
                  <span className="font-display text-[4.5rem] italic leading-none md:text-[6rem]">{c.numeral}</span>
                  <span
                    className={`label rounded-full px-2.5 py-1 ${c.status === "current" ? "bg-thread text-tissue" : upcoming ? "bg-butter text-ink" : "ring-1 ring-current/30"}`}
                  >
                    {c.status === "current" ? "On the rail now" : upcoming ? "Drafting now" : "Archive · still on sale"}
                  </span>
                </div>
                <div className="p-6 md:p-8">
                  <p className={`label ${c.status === "current" ? "text-paper/60" : "text-ink-3"}`}>{c.season}</p>
                  <h2 className="mt-2 font-display text-[2.4rem] leading-none md:text-[3rem]">{c.title}</h2>
                  <p className={`mt-4 max-w-md ${c.status === "current" ? "text-paper/80" : "text-ink-2"}`}>{c.intro}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {c.moods.map((m) => (
                      <span key={m} className={`font-hand text-xl ${c.status === "current" ? "text-butter" : "text-chalk"}`}>
                        #{m.replace(/\s/g, "")}
                      </span>
                    ))}
                  </div>
                  {upcoming ? (
                    <div className="mt-6 max-w-md">
                      <p className="mb-2 text-sm">Get the first fitting notes before anything goes on sale:</p>
                      <NotifyForm />
                    </div>
                  ) : (
                    <Link
                      to={`/chapters/${c.slug}`}
                      className={`mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition hover:-translate-y-0.5 ${c.status === "current" ? "bg-paper text-ink" : "bg-ink text-paper"}`}
                    >
                      Read the chapter · {pieces.length} pieces <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
                <div className="relative min-h-56 p-6">
                  {/* palette as cloth strips */}
                  <div className="absolute inset-y-6 right-6 flex w-24 gap-1 md:w-32">
                    {c.palette.map((p) => (
                      <span key={p.hex} className="flex-1 rounded-sm" style={{ background: p.hex }} title={p.name} />
                    ))}
                  </div>
                  <div className="relative flex h-full items-end gap-2 pr-28 md:pr-40">
                    {upcoming ? (
                      <div className="flex gap-2 opacity-70">
                        {(["dress", "camp-shirt"] as const).map((k) => (
                          <GarmentFlat key={k} kind={k} hex="#efe6d2" accent="#c9bb9c" pattern="linen" className="w-24" />
                        ))}
                      </div>
                    ) : (
                      pieces.slice(0, 3).map((p, n) => (
                        <GarmentFlat key={p.slug} kind={p.garment} {...p.colorways[0]} className="w-[32%] max-w-28" shadow={n === 0} />
                      ))
                    )}
                  </div>
                  {upcoming && <HandNote className="absolute left-6 top-6 text-2xl">still in calico ✂</HandNote>}
                </div>
                <span className={`label absolute bottom-3 left-6 hidden md:block ${c.status === "current" ? "text-paper/40" : "text-ink-3/60"}`}>chapter {i + 1} of {chapters.length}</span>
              </article>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
