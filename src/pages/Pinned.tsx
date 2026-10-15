import { Link } from "react-router";
import { GarmentFlat } from "../components/GarmentFlat";
import { ProductCard } from "../components/ProductCard";
import { Button, EmptyState, PageHeader, Skeleton } from "../components/ui";
import { getProductsBySlugs } from "../lib/api";
import { formatDate, useAsync, useDocumentTitle } from "../lib/hooks";
import { useShop } from "../lib/store";

export default function Pinned() {
  useDocumentTitle("Pinboard");
  const { pinned, looks, deleteLook, money, bySlug } = useShop();
  const { data, loading } = useAsync(() => getProductsBySlugs(pinned), [pinned.join()]);

  return (
    <>
      <PageHeader
        trail={[{ label: "Home", to: "/" }, { label: "Pinboard" }]}
        kicker="Your corkboard"
        title={
          <>
            Pinned <em>for later</em>
          </>
        }
        intro="Pieces you've pinned and looks you've saved from the dressing table. Kept on this device — no account needed."
      />
      <div className="wrap py-12">
        <h2 className="font-display text-3xl">
          Pieces <sup className="font-mono text-sm text-thread">{pinned.length}</sup>
        </h2>
        {loading && !data ? (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {pinned.map((p) => (
              <Skeleton key={p} className="aspect-[4/5]" />
            ))}
          </div>
        ) : data && data.length ? (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {data.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState title="No pins yet." text="Tap the pin on any piece to keep it here while you think." action={<Button to="/shop">Browse the shop</Button>} />
        )}

        <h2 className="mt-20 font-display text-3xl">
          Saved looks <sup className="font-mono text-sm text-thread">{looks.length}</sup>
        </h2>
        {looks.length === 0 ? (
          <p className="mt-4 text-ink-2">
            Nothing saved. <Link to="/dressing-table" className="underline decoration-dashed underline-offset-4 hover:text-thread">Compose a look on the dressing table</Link> and save it.
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {looks.map((look) => {
              const items = look.slugs.map(bySlug).filter((p) => p !== undefined);
              return (
                <div key={look.id} className="rounded-md bg-tissue p-5 ring-1 ring-line">
                  <div className="grid grid-cols-4 gap-2 rounded bg-[#e9dfcd] p-3">
                    {items.map((p) => (
                      <GarmentFlat key={p.slug} kind={p.garment} {...p.colorways[0]} className="w-full" shadow={false} />
                    ))}
                  </div>
                  <p className="mt-4 font-display text-xl">{look.name}</p>
                  <p className="label text-ink-3">
                    {formatDate(look.createdAt)} · {money(items.reduce((s, p) => s + p.price, 0))}
                  </p>
                  <div className="mt-4 flex gap-3 text-sm">
                    <Link to={`/dressing-table?look=${look.slugs.join(",")}`} className="underline decoration-dashed underline-offset-4 hover:text-thread">
                      Open on the table
                    </Link>
                    <button onClick={() => deleteLook(look.id)} className="text-ink-3 underline decoration-dashed underline-offset-4 hover:text-thread">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
