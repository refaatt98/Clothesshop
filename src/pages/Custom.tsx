import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Needle } from "../components/Craft";
import { WhatsappIcon } from "../components/Icons";
import { ProductArt } from "../components/ProductArt";
import { PageHero } from "../components/ui";
import { submitCustomRequest, whatsappLink } from "../lib/api";
import { useTitle } from "../lib/hooks";
import type { ArtKind } from "../types";

const pieceTypes: { id: string; label: string; art: ArtKind }[] = [
  { id: "شنطة", label: "شنطة", art: "bag" },
  { id: "إطار تطريز", label: "إطار تطريز", art: "hoop" },
  { id: "إكسسوار", label: "حلق أو عقد", art: "earrings" },
  { id: "إسوارة", label: "إسوارة", art: "bracelet" },
  { id: "علبة هدية", label: "علبة هدية", art: "giftbox" },
  { id: "شي تاني", label: "فكرة تانية", art: "pouch" },
];

const palette = [
  { name: "كريمي", hex: "#efe2cf" },
  { name: "أبيض", hex: "#f8f4ee" },
  { name: "وردي ترابي", hex: "#c98f86" },
  { name: "زهري فاتح", hex: "#e9c2bb" },
  { name: "ليلكي", hex: "#b9a6c4" },
  { name: "سماوي باهت", hex: "#a9bfc9" },
  { name: "مريمية", hex: "#93a386" },
  { name: "زيتي", hex: "#7c7f55" },
  { name: "ذهبي", hex: "#c5a46d" },
  { name: "كراميل", hex: "#b88356" },
  { name: "بني", hex: "#6e4c38" },
];

const budgets = ["أقل من 50 ₪", "50 – 100 ₪", "100 – 200 ₪", "أكثر من 200 ₪"];
const steps = ["نوع القطعة", "الألوان", "التفاصيل", "معلوماتك"];

export default function Custom() {
  useTitle("اطلبي قطعتك");
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState({ pieceType: "", colors: [] as string[], budget: "", deadline: "", details: "", name: "", phone: "" });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const set = <K extends keyof typeof data>(k: K, v: (typeof data)[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    setError("");
  };

  const check = (): string => {
    if (step === 0 && !data.pieceType) return "اختاري نوع القطعة";
    if (step === 1 && data.colors.length === 0) return "اختاري لون واحد على الأقل";
    if (step === 2 && data.details.trim().length < 10) return "احكيلنا شوي أكتر عن فكرتك (10 أحرف على الأقل)";
    if (step === 3 && data.name.trim().length < 2) return "اكتبي اسمك";
    if (step === 3 && !/^(\+?970|\+?972|0)5\d{8}$/.test(data.phone.replace(/[\s-]/g, ""))) return "رقم الجوال لازم يكون مثل 0591234567";
    return "";
  };

  const go = async (delta: number) => {
    if (delta > 0) {
      const e = check();
      if (e) return setError(e);
    }
    setError("");
    if (delta > 0 && step === steps.length - 1) {
      setSending(true);
      const res = await submitCustomRequest(data);
      setSending(false);
      setDone(res.ref);
      return;
    }
    setDir(delta);
    setStep((s) => s + delta);
  };

  const toggleColor = (name: string) =>
    set("colors", data.colors.includes(name) ? data.colors.filter((c) => c !== name) : data.colors.length >= 3 ? data.colors : [...data.colors, name]);

  const previewColor = palette.find((p) => p.name === data.colors[0])?.hex ?? "#e9c2bb";
  const previewArt = pieceTypes.find((p) => p.id === data.pieceType)?.art ?? "hoop";

  if (done) {
    const msg = `مرحبا بَنان 🤍 بعتلكم طلب قطعة خاصة (${done})\nالقطعة: ${data.pieceType}\nالألوان: ${data.colors.join("، ")}\nالميزانية: ${data.budget || "مش محددة"}\n${data.deadline ? `بدي ياها قبل: ${data.deadline}\n` : ""}الفكرة: ${data.details}\nالاسم: ${data.name}`;
    return (
      <section className="container-b flex flex-col items-center py-16 text-center md:py-24">
        <motion.div initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 10 }} className="size-40 overflow-hidden rounded-full border-4 border-[#c99b6d]">
          <ProductArt kind={previewArt} color={previewColor} className="size-full" />
        </motion.div>
        <h1 className="mt-8 font-display text-4xl md:text-5xl">وصلتنا فكرتك يا {data.name.split(" ")[0]}! ✨</h1>
        <p className="mt-4 max-w-lg leading-8 text-cocoa-2">
          رقم الطلب <b className="text-cocoa">{done}</b>. رح نحكي معك على واتساب خلال 24 ساعة لنحكي بالتفاصيل والسعر، ونبعتلك رسمة أولية قبل ما نبلّش.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={whatsappLink(msg)} target="_blank" rel="noreferrer" className="btn btn-primary"><WhatsappIcon className="size-5" /> كمّلي على واتساب</a>
          <Link to="/shop" className="btn btn-ghost">تصفّحي المتجر</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHero eyebrow="قطعة من خيالك" title="اطلبي قطعتك الخاصة" text="احكيلنا فكرتك بأربع خطوات صغيرة، ونحنا منحوّلها لقطعة بين إيديكِ." />
      <section className="container-b py-10 md:py-14">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            {/* مؤشر الخطوات بخيط وإبرة */}
            <div className="relative mb-10">
              <div className="absolute inset-x-5 top-5 border-t-2 border-dashed border-line" aria-hidden />
              <motion.div
                className="absolute right-5 top-[19px] h-0.5 bg-rose"
                animate={{ width: `calc(${(step / (steps.length - 1)) * 100}% - ${(step / (steps.length - 1)) * 40}px)` }}
                transition={{ type: "spring", damping: 20 }}
                aria-hidden
              />
              <ol className="relative flex justify-between">
                {steps.map((s, i) => (
                  <li key={s} className="flex flex-col items-center gap-2">
                    <span className={`grid size-10 place-items-center rounded-full border-2 text-sm font-bold transition ${i < step ? "border-rose bg-rose text-white" : i === step ? "border-rose bg-cream text-rose" : "border-line bg-cream text-cocoa-3"}`}>
                      {i < step ? <Check className="size-4" /> : i + 1}
                    </span>
                    <span className={`text-xs sm:text-sm ${i === step ? "font-semibold" : "text-cocoa-3"}`}>{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="relative min-h-[22rem] overflow-hidden">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={step}
                  custom={dir}
                  initial={{ opacity: 0, x: dir * -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * 40 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {step === 0 && (
                    <div>
                      <h2 className="mb-5 font-display text-2xl">شو القطعة اللي ببالك؟</h2>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {pieceTypes.map((p) => {
                          const active = data.pieceType === p.id;
                          return (
                            <button
                              key={p.id}
                              onClick={() => set("pieceType", p.id)}
                              aria-pressed={active}
                              className={`group rounded-3xl border-2 p-3 text-center transition ${active ? "border-cocoa bg-linen" : "border-line hover:border-cocoa-3"}`}
                            >
                              <div className="mx-auto aspect-square w-full overflow-hidden rounded-2xl">
                                <ProductArt kind={p.art} color={active ? "#c98f86" : "#e3d4c3"} className="size-full transition-transform duration-500 group-hover:scale-110" />
                              </div>
                              <span className="mt-2 block font-semibold">{p.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div>
                      <h2 className="mb-2 font-display text-2xl">اختاري ألوانك</h2>
                      <p className="mb-6 text-sm text-cocoa-3">لحد 3 ألوان — أول لون رح يكون الأساسي.</p>
                      <div className="flex flex-wrap gap-4">
                        {palette.map((c) => {
                          const idx = data.colors.indexOf(c.name);
                          return (
                            <button key={c.name} onClick={() => toggleColor(c.name)} aria-pressed={idx >= 0} className="flex w-16 flex-col items-center gap-2">
                              <motion.span
                                whileTap={{ scale: 0.85 }}
                                className={`relative grid size-14 place-items-center rounded-full transition ${idx >= 0 ? "ring-2 ring-cocoa ring-offset-2 ring-offset-cream" : "ring-1 ring-line"}`}
                                style={{ background: c.hex }}
                              >
                                {idx >= 0 && <span className="grid size-6 place-items-center rounded-full bg-cream text-xs font-bold">{idx + 1}</span>}
                              </motion.span>
                              <span className="text-xs">{c.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-5">
                      <h2 className="font-display text-2xl">احكيلنا عن فكرتك</h2>
                      <div>
                        <label htmlFor="details" className="label">الفكرة بالتفصيل</label>
                        <textarea id="details" rows={4} value={data.details} onChange={(e) => set("details", e.target.value)} className="field resize-none" placeholder="مثلاً: إطار تطريز لمولودة اسمها جود، مع ورد زهري وتاريخ الولادة..." />
                      </div>
                      <div>
                        <p className="label">الميزانية التقريبية</p>
                        <div className="flex flex-wrap gap-2">
                          {budgets.map((b) => (
                            <button key={b} onClick={() => set("budget", data.budget === b ? "" : b)} aria-pressed={data.budget === b} className={`rounded-full border px-4 py-2 text-sm transition ${data.budget === b ? "border-cocoa bg-cocoa text-cream" : "border-line bg-linen hover:border-cocoa-3"}`}>
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="max-w-xs">
                        <label htmlFor="deadline" className="label">بدك ياها قبل تاريخ معيّن؟ (اختياري)</label>
                        <input id="deadline" type="date" value={data.deadline} min={new Date().toISOString().slice(0, 10)} onChange={(e) => set("deadline", e.target.value)} className="field" />
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-5">
                      <h2 className="font-display text-2xl">كيف منتواصل معك؟</h2>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="cname" className="label">الاسم</label>
                          <input id="cname" value={data.name} onChange={(e) => set("name", e.target.value)} className="field" autoComplete="name" />
                        </div>
                        <div>
                          <label htmlFor="cphone" className="label">رقم الجوال (واتساب)</label>
                          <input id="cphone" value={data.phone} onChange={(e) => set("phone", e.target.value)} className="field text-right" dir="ltr" inputMode="tel" autoComplete="tel" placeholder="059 123 4567" />
                        </div>
                      </div>
                      <div className="rounded-2xl bg-cream-2 p-4 text-sm leading-7">
                        <b>ملخّص:</b> {data.pieceType} · {data.colors.join("، ")} {data.budget && `· ${data.budget}`}
                        <p className="mt-1 text-cocoa-2">{data.details}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <p className="min-h-6 text-sm text-rose" role="alert">{error}</p>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button onClick={() => go(-1)} className={`btn btn-ghost ${step === 0 ? "invisible" : ""}`}>
                <ArrowRight className="size-4" /> رجوع
              </button>
              <button onClick={() => go(1)} disabled={sending} className="btn btn-primary">
                {sending ? (<><LoaderCircle className="size-4 animate-spin" /> عم نرسل...</>) : step === steps.length - 1 ? "أرسلي طلبي ✨" : (<>التالي <ArrowLeft className="size-4" /></>)}
              </button>
            </div>
          </div>

          {/* معاينة حية */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-[2rem] border border-dashed border-line bg-linen p-5 text-center">
              <p className="mb-3 text-sm text-cocoa-3">معاينة قطعتك</p>
              <motion.div key={`${previewArt}-${previewColor}`} initial={{ scale: 0.9, opacity: 0, rotate: -6 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: "spring", damping: 14 }} className="aspect-square overflow-hidden rounded-3xl">
                <ProductArt kind={previewArt} color={previewColor} className="size-full" />
              </motion.div>
              <div className="mt-4 flex justify-center gap-2">
                {data.colors.map((c) => (
                  <motion.span key={c} initial={{ scale: 0 }} animate={{ scale: 1 }} className="size-6 rounded-full ring-1 ring-line" style={{ background: palette.find((p) => p.name === c)?.hex }} />
                ))}
              </div>
              <Needle className="mx-auto mt-5 h-3 w-24 opacity-60" />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
