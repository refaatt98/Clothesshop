import { Heart } from "lucide-react";
import { Link } from "react-router";
import { YarnLoader } from "../components/Loader";
import { ProductCard } from "../components/ProductCard";
import { EmptyState, PageHero } from "../components/ui";
import { getProductsByIds } from "../lib/api";
import { useAsync, useTitle } from "../lib/hooks";
import { useShop } from "../lib/store";

export default function Wishlist() {
  useTitle("المفضلة");
  const { wishlist } = useShop();
  const { data, loading } = useAsync(() => getProductsByIds(wishlist), [wishlist.join(",")]);
  const list = (data ?? []).filter((p) => wishlist.includes(p.id));

  return (
    <>
      <PageHero eyebrow="المفضلة" title="قطع خطفت قلبك" text="خبّينالك القطع اللي حبّيتيها هون، لترجعيلها وقت ما بدك." />
      <section className="container-b py-10 md:py-14">
        {loading && !data ? (
          <YarnLoader />
        ) : list.length === 0 ? (
          <EmptyState icon={<Heart className="size-14 text-sand" strokeWidth={1.2} />} title="لسا ما حطّيتي قطع بالمفضلة" text="اضغطي على القلب بأي قطعة عجبتك وبتلاقيها هون.">
            <Link to="/shop" className="btn btn-primary mt-2">تصفّحي المتجر</Link>
          </EmptyState>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {list.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </section>
    </>
  );
}
