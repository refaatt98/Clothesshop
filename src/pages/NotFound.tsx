import { Link } from "react-router";
import { GarmentFlat } from "../components/GarmentFlat";
import { Button, HandNote } from "../components/ui";
import { useDocumentTitle } from "../lib/hooks";

export default function NotFound() {
  useDocumentTitle("قطعة باترون مفقودة");
  return (
    <section className="wrap grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
      <div className="relative mx-auto aspect-square w-full max-w-md rounded-md bg-mat ring-1 ring-line">
        <div className="absolute inset-[14%] rounded border-2 border-dashed border-thread/60" />
        <GarmentFlat kind="shirt" hex="#f1eee7" accent="#c2432e" pattern="stripe" className="absolute inset-[18%] opacity-30 grayscale" />
        <HandNote className="absolute bottom-6 left-6">هذه القطعة مفقودة ↑</HandNote>
        <span className="label absolute right-4 top-4 text-chalk">قطعة 404 · ليست على الجدار</span>
      </div>
      <div>
        <p className="label text-thread">خطأ 404</p>
        <h1 className="mt-3 font-display text-[3rem] leading-tight md:text-[4.2rem]">
          سقطت قطعة باترون <em className="text-thread not-italic">عن الجدار.</em>
        </h1>
        <p className="mt-5 max-w-md text-lg text-ink-2">الصفحة التي تبحث عنها ليست هنا. ربما كانت فصلاً نفد، أو رابطاً انفكّت غرزته.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button to="/">العودة إلى طاولة القصّ</Button>
          <Button to="/shop" variant="paper">
            تصفّح المتجر
          </Button>
        </div>
        <p className="mt-8 text-sm text-ink-3">
          ما زلت تائهاً؟{" "}
          <Link to="/contact" className="underline decoration-dashed underline-offset-4 hover:text-thread">
            راسلنا
          </Link>{" "}
          — سيردّ عليك إنسان.
        </p>
      </div>
    </section>
  );
}
