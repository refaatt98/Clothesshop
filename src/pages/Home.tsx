import { Hero } from "../components/home/Hero";
import {
  CategoriesSection,
  CustomCta,
  FeaturedSection,
  GallerySection,
  Marquee,
  ProcessSection,
  ReviewsSection,
  ValuesStrip,
} from "../components/home/Sections";
import { getCategories, getFeaturedProducts, getProcessSteps, getProducts, getReviews } from "../lib/api";
import { useAsync, useTitle } from "../lib/hooks";

export default function Home() {
  useTitle("");
  const { data } = useAsync(
    () => Promise.all([getCategories(), getFeaturedProducts(8), getProcessSteps(), getReviews(), getProducts({ sort: "new" })]),
    [],
  );
  const [categories, featured, steps, reviews, latest] = data ?? [[], [], [], [], []];

  return (
    <>
      <Hero />
      <Marquee />
      <CategoriesSection categories={categories} />
      <FeaturedSection products={featured} />
      <ProcessSection steps={steps} />
      <ValuesStrip />
      <CustomCta />
      <ReviewsSection reviews={reviews} />
      <GallerySection products={latest} />
    </>
  );
}
