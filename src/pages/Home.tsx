import { Hero } from "../components/home/Hero";
import {
  CategoriesSection,
  CustomCta,
  FeaturedSection,
  GallerySection,
  WorksSection,
  Marquee,
  ProcessSection,
  ReviewsSection,
  ValuesStrip,
} from "../components/home/Sections";
import { getCategories, getFeaturedProducts, getGallery, getHomeReviews, getProcessSteps, getProducts } from "../lib/api";
import { useAsync, useTitle } from "../lib/hooks";

export default function Home() {
  useTitle("");
  const { data } = useAsync(
    () =>
      Promise.all([
        getCategories().catch(() => []),
        getFeaturedProducts(8).catch(() => []),
        getProcessSteps(),
        getHomeReviews().catch(() => []),
        getProducts({ sort: "new" }).catch(() => []),
        getGallery().catch(() => []),
      ]),
    [],
  );
  const [categories, featured, steps, reviews, latest, gallery] = data ?? [[], [], [], [], [], []];

  return (
    <>
      <Hero />
      <Marquee />
      <CategoriesSection categories={categories} />
      <FeaturedSection products={featured} />
      <ProcessSection steps={steps} />
      <ValuesStrip />
      <CustomCta />
      <WorksSection items={gallery} />
      <ReviewsSection reviews={reviews} />
      {gallery.length === 0 && <GallerySection products={latest} />}
    </>
  );
}
