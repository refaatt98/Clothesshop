import { Link } from "react-router";
import { GarmentFlat } from "../components/GarmentFlat";
import { Button, HandNote } from "../components/ui";
import { useDocumentTitle } from "../lib/hooks";

export default function NotFound() {
  useDocumentTitle("Missing pattern piece");
  return (
    <section className="wrap grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
      <div className="relative mx-auto aspect-square w-full max-w-md rounded-md bg-mat ring-1 ring-line">
        <div className="absolute inset-[14%] rounded border-2 border-dashed border-thread/60" />
        <GarmentFlat kind="shirt" hex="#f1eee7" accent="#c2432e" pattern="stripe" className="absolute inset-[18%] opacity-30 grayscale" />
        <HandNote className="absolute bottom-6 right-6">this piece is missing ↑</HandNote>
        <span className="label absolute left-4 top-4 text-chalk">Pc. 404 · not on the wall</span>
      </div>
      <div>
        <p className="label text-thread">Error 404</p>
        <h1 className="mt-3 font-display text-[3rem] leading-[0.95] md:text-[4.4rem]">
          A pattern piece <em>fell off the wall.</em>
        </h1>
        <p className="mt-5 max-w-md text-lg text-ink-2">
          The page you were looking for isn't here. Maybe it was a chapter that sold out, or a link that came unstitched.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button to="/">Back to the cutting table</Button>
          <Button to="/shop" variant="paper">Browse the shop</Button>
        </div>
        <p className="mt-8 text-sm text-ink-3">
          Still lost? <Link to="/contact" className="underline decoration-dashed underline-offset-4 hover:text-thread">Write to us</Link> — a human will answer.
        </p>
      </div>
    </section>
  );
}
