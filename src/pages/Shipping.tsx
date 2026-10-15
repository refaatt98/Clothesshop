import { Gift, Package, RotateCcw, Truck } from "lucide-react";
import { Link } from "react-router";
import { PageHeader, Reveal, SectionHead } from "../components/ui";
import { FREE_SHIPPING_FROM } from "../lib/api";
import { useDocumentTitle } from "../lib/hooks";
import { useShop } from "../lib/store";

export default function Shipping() {
  useDocumentTitle("الشحن والإرجاع");
  const { money } = useShop();

  const regions = [
    ["الأردن", "1–2 يوم عمل", "مشمولة", "مجاني فوق " + money(FREE_SHIPPING_FROM)],
    ["دول الخليج", "2–4 أيام عمل", "مشمولة", "مجاني فوق " + money(FREE_SHIPPING_FROM)],
    ["الاتحاد الأوروبي وبريطانيا", "3–5 أيام عمل", "مشمولة", "مجاني فوق " + money(FREE_SHIPPING_FROM)],
    ["بقية الشرق الأوسط", "4–7 أيام عمل", "تُدفع عند الاستلام", money(50)],
    ["أمريكا واليابان وآسيا", "4–8 أيام عمل", "تُدفع عند الاستلام", money(100)],
  ];

  const returnSteps = [
    { i: Package, t: "اطلب الإرجاع", d: "راسلنا من صفحة التواصل برقم طلبك خلال 30 يوماً." },
    { i: Truck, t: "نرسل لك ملصقاً", d: "ملصق شحن مدفوع مسبقاً يصل بريدك خلال يوم عمل." },
    { i: RotateCcw, t: "أعده في ورقه", d: "القطعة غير ملبوسة، مع ملصقها الورقي — وفي ورق الباترون إن أمكن." },
    { i: Gift, t: "يُعاد المبلغ", d: "خلال 5 أيام عمل من وصولها إلينا. أو استبدلها بمقاس آخر مجاناً." },
  ];

  return (
    <>
      <PageHeader
        trail={[{ label: "الرئيسية", to: "/" }, { label: "الشحن والإرجاع" }]}
        kicker="من طاولتنا إلى بابك"
        title={
          <>
            يصل مطويّاً بورق الباترون، <em className="text-thread not-italic">ومعه بطاقة بخط اليد.</em>
          </>
        }
        intro={`شحن مجاني فوق ${money(FREE_SHIPPING_FROM)}. الجمارك مشمولة إلى الأردن والخليج وأوروبا. إرجاع مجاني خلال 30 يوماً.`}
      />

      <section className="wrap py-14">
        <SectionHead no="01" kicker="الوجهات" title={<>كم يستغرق، <em className="text-thread not-italic">وكم يكلّف</em></>} />
        <div className="mt-8 overflow-x-auto rounded-md ring-1 ring-line">
          <table className="w-full min-w-[620px] bg-tissue">
            <thead className="bg-paper-2 text-sm text-ink-2">
              <tr>
                <th className="p-4 text-start font-medium">الوجهة</th>
                <th className="p-4 text-start font-medium">المدة</th>
                <th className="p-4 text-start font-medium">الجمارك</th>
                <th className="p-4 text-start font-medium">الكلفة</th>
              </tr>
            </thead>
            <tbody>
              {regions.map((r) => (
                <tr key={r[0]} className="border-t border-dashed border-ink/20">
                  <td className="p-4 font-display text-lg">{r[0]}</td>
                  <td className="p-4 text-ink-2">{r[1]}</td>
                  <td className="p-4 text-ink-2">{r[2]}</td>
                  <td className="p-4 font-mono text-sm">{r[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-ink-3">الشحن السريع متاح لكل الوجهات بـ {money(100)}. والاستلام من محلّاتنا مجاني دائماً.</p>
      </section>

      <section className="wrap py-10">
        <SectionHead no="02" kicker="الإرجاع" title={<>تغيّر رأيك؟ <em className="text-thread not-italic">لا بأس.</em></>} />
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {returnSteps.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.08}>
              <li className="h-full rounded-md bg-tissue p-6 ring-1 ring-line">
                <div className="flex items-center justify-between">
                  <s.i className="h-6 w-6 text-thread" />
                  <span className="font-mono text-sm text-ink-3">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-2xl">{s.t}</h3>
                <p className="mt-2 text-ink-2">{s.d}</p>
              </li>
            </Reveal>
          ))}
        </ol>
        <p className="mt-6 text-ink-2">القطع المعدّلة (أكمام أو حواشٍ قُصّرت لك) يمكن استبدالها، لا استرداد ثمنها.</p>
      </section>

      <section className="wrap py-10">
        <div className="grid gap-8 rounded-md bg-ink p-8 text-paper md:grid-cols-2 md:p-12">
          <div>
            <p className="label text-paper/60">ماذا يوجد في العلبة</p>
            <h2 className="mt-3 font-display text-[2.2rem] leading-tight">لا بلاستيك. ولا ورق لامع.</h2>
          </div>
          <ul className="space-y-3 text-paper/80">
            <li>— قطعتك، مكويّة ومطويّة بورق مطبوع عليه باترونها الحقيقي.</li>
            <li>— علبة من كرتون مُعاد تدويره، مربوطة بشريط قطني.</li>
            <li>— بطاقة بخط يد من كوى القطعة، ورقمها في الإصدار.</li>
            <li>— ملصق رفو مدى الحياة، للاحتفاظ به.</li>
          </ul>
        </div>
        <p className="mt-6 text-ink-2">
          أسئلة أخرى؟{" "}
          <Link to="/help" className="underline decoration-dashed underline-offset-4 hover:text-thread">
            الأسئلة الشائعة
          </Link>{" "}
          أو{" "}
          <Link to="/contact" className="underline decoration-dashed underline-offset-4 hover:text-thread">
            راسلنا
          </Link>
          .
        </p>
      </section>
    </>
  );
}
