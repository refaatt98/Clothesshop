import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Gift, Lock } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { GarmentFlat } from "../components/GarmentFlat";
import { useRailTotals } from "../components/RailDrawer";
import { Button, EmptyState } from "../components/ui";
import { FREE_SHIPPING_FROM, placeOrder } from "../lib/api";
import { useDocumentTitle } from "../lib/hooks";
import { useShop } from "../lib/store";
import type { CheckoutDetails } from "../types";

const steps = ["Who", "Where", "How it arrives", "Pay"] as const;

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label text-ink-3">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-3">{hint}</span>}
    </label>
  );
}
const inputCls =
  "mt-1.5 w-full rounded-md bg-tissue px-3.5 py-3 text-[0.95rem] ring-1 ring-line outline-none transition placeholder:text-ink-3/60 focus:ring-2 focus:ring-thread";

export default function Checkout() {
  useDocumentTitle("Checkout");
  const navigate = useNavigate();
  const { rail, money, clearRail } = useShop();
  const { lines, subtotal, ready } = useRailTotals();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [d, setD] = useState<CheckoutDetails>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Jordan",
    postcode: "",
    delivery: "standard",
    giftNote: "",
    tissueWrap: true,
  });
  const [card, setCard] = useState({ number: "", exp: "", cvc: "" });
  const up = (k: keyof CheckoutDetails, v: string | boolean) => setD((x) => ({ ...x, [k]: v }));

  const shipping = d.delivery === "collect" ? 0 : d.delivery === "express" ? 28 : subtotal >= FREE_SHIPPING_FROM ? 0 : 14;

  if (!ready) return <div className="wrap py-24 text-center font-hand text-3xl text-chalk">laying out your pieces…</div>;
  if (!lines.length)
    return (
      <EmptyState
        title="Your rail is empty."
        text="Hang something on it first — then come back to the fitting room."
        action={<Button to="/shop">Browse the shop</Button>}
      />
    );

  async function next(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (card.number.replace(/\s/g, "").length < 15) return setError("That card number looks short.");
    setBusy(true);
    try {
      const order = await placeOrder(rail, d);
      sessionStorage.setItem("ourlet.lastOrder", JSON.stringify(order));
      clearRail();
      navigate("/checkout/done", { state: order });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap py-10">
      <Link to="/rail" className="label inline-flex items-center gap-1 text-ink-3 hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to your rail
      </Link>
      <h1 className="mt-4 font-display text-[2.6rem] leading-none md:text-[3.6rem]">
        The <em>fitting room</em>
      </h1>

      {/* stepper as a tape measure */}
      <ol className="mt-8 grid grid-cols-4 gap-1">
        {steps.map((s, i) => (
          <li key={s}>
            <button type="button" onClick={() => i < step && setStep(i)} disabled={i > step} className="w-full text-left disabled:cursor-default">
              <div className={`h-2 rounded-full transition-colors ${i <= step ? "bg-thread" : "bg-ink/10"}`} />
              <p className={`label mt-2 ${i === step ? "text-ink" : "text-ink-3"}`}>
                {String(i + 1).padStart(2, "0")} <span className="hidden sm:inline">· {s}</span>
              </p>
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        <form onSubmit={next} className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-5">
              {step === 0 && (
                <>
                  <h2 className="font-display text-2xl">Who are we making the card out to?</h2>
                  <Field label="Full name">
                    <input required value={d.name} onChange={(e) => up("name", e.target.value)} className={inputCls} placeholder="Hala Nasser" autoComplete="name" />
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Email" hint="For your fitting slip and the mending label, should you ever need it.">
                      <input required type="email" value={d.email} onChange={(e) => up("email", e.target.value)} className={inputCls} placeholder="you@somewhere.com" autoComplete="email" />
                    </Field>
                    <Field label="Phone" hint="Only for the courier.">
                      <input required type="tel" value={d.phone} onChange={(e) => up("phone", e.target.value)} className={inputCls} placeholder="+962 7…" autoComplete="tel" />
                    </Field>
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <h2 className="font-display text-2xl">Where should it go?</h2>
                  <Field label="Address">
                    <input required value={d.address} onChange={(e) => up("address", e.target.value)} className={inputCls} placeholder="Street, building, floor" autoComplete="street-address" />
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-3">
                    <Field label="City">
                      <input required value={d.city} onChange={(e) => up("city", e.target.value)} className={inputCls} autoComplete="address-level2" />
                    </Field>
                    <Field label="Postcode">
                      <input value={d.postcode} onChange={(e) => up("postcode", e.target.value)} className={inputCls} autoComplete="postal-code" />
                    </Field>
                    <Field label="Country">
                      <select value={d.country} onChange={(e) => up("country", e.target.value)} className={inputCls}>
                        {["Jordan", "United Arab Emirates", "Saudi Arabia", "Lebanon", "Portugal", "United Kingdom", "Germany", "France", "Japan", "United States", "Other"].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <h2 className="font-display text-2xl">How would you like it to arrive?</h2>
                  <div className="grid gap-3">
                    {(
                      [
                        ["standard", "Standard", "5–8 working days, tracked", subtotal >= FREE_SHIPPING_FROM ? "Free" : money(14)],
                        ["express", "Express", "2–3 working days, tracked", money(28)],
                        ["collect", "Collect in a shop", "Amman, Lisbon or Kyoto — we'll check the fit with you", "Free"],
                      ] as const
                    ).map(([id, t, s, p]) => (
                      <label key={id} className={`flex cursor-pointer items-center gap-4 rounded-md p-4 ring-1 transition ${d.delivery === id ? "bg-tissue ring-2 ring-ink" : "ring-line hover:ring-ink/30"}`}>
                        <input type="radio" name="delivery" checked={d.delivery === id} onChange={() => up("delivery", id)} className="accent-thread" />
                        <span className="flex-1">
                          <span className="block font-medium">{t}</span>
                          <span className="text-sm text-ink-2">{s}</span>
                        </span>
                        <span className="font-mono text-sm">{p}</span>
                      </label>
                    ))}
                  </div>
                  <label className="flex cursor-pointer items-start gap-3 rounded-md bg-paper-2 p-4">
                    <input type="checkbox" checked={d.tissueWrap} onChange={(e) => up("tissueWrap", e.target.checked)} className="mt-1 accent-thread" />
                    <span>
                      <span className="block font-medium">Wrap in pattern tissue (free)</span>
                      <span className="text-sm text-ink-2">Printed with the actual pattern piece of your garment. Most people keep it.</span>
                    </span>
                  </label>
                  <Field label="A note for the card (optional)" hint="If it's a gift, we'll leave the price off and write this by hand.">
                    <div className="relative">
                      <Gift className="absolute left-3 top-[1.15rem] h-4 w-4 text-ink-3" />
                      <textarea value={d.giftNote} onChange={(e) => up("giftNote", e.target.value)} rows={3} maxLength={240} className={`${inputCls} pl-9 font-hand text-xl`} placeholder="for long walks — happy birthday" />
                    </div>
                  </Field>
                </>
              )}
              {step === 3 && (
                <>
                  <h2 className="font-display text-2xl">Payment</h2>
                  <p className="rounded-md bg-butter/40 p-3 text-sm text-ink-2">
                    This is a demo storefront — no real payment is taken. Any 16 digits will do.
                  </p>
                  <Field label="Card number">
                    <input
                      required
                      inputMode="numeric"
                      value={card.number}
                      onChange={(e) =>
                        setCard((c) => ({
                          ...c,
                          number: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 16)
                            .replace(/(.{4})/g, "$1 ")
                            .trim(),
                        }))
                      }
                      className={`${inputCls} font-mono tracking-widest`}
                      placeholder="4242 4242 4242 4242"
                      autoComplete="cc-number"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-5">
                    <Field label="Expiry">
                      <input
                        required
                        value={card.exp}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setCard((c) => ({ ...c, exp: v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v }));
                        }}
                        className={`${inputCls} font-mono`}
                        placeholder="MM/YY"
                        autoComplete="cc-exp"
                      />
                    </Field>
                    <Field label="CVC">
                      <input required value={card.cvc} onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))} className={`${inputCls} font-mono`} placeholder="123" autoComplete="cc-csc" />
                    </Field>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <p className="mt-4 text-sm text-thread" role="alert">
              {error}
            </p>
          )}

          <div className="mt-8 flex items-center justify-between gap-4">
            {step > 0 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-1 text-sm underline decoration-dashed underline-offset-4">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={busy} className="min-w-48">
              {busy ? (
                "Pressing your order…"
              ) : step < steps.length - 1 ? (
                <>
                  Continue <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" /> Pay {money(subtotal + shipping)}
                </>
              )}
            </Button>
          </div>
        </form>

        <aside className="h-fit rounded-md bg-tissue p-6 ring-1 ring-line lg:sticky lg:top-28">
          <p className="label text-ink-3">On the rail</p>
          <ul className="mt-4 space-y-3">
            {lines.map(({ line, product }) => {
              const c = product.colorways.find((x) => x.name === line.colorway) ?? product.colorways[0];
              return (
                <li key={line.key} className="flex items-center gap-3">
                  <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded bg-mat">
                    <GarmentFlat kind={product.garment} {...c} className="h-12" shadow={false} />
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink font-mono text-[0.6rem] text-paper">{line.qty}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display">{product.name}</p>
                    <p className="label text-ink-3">
                      {line.colorway} · {line.size}
                    </p>
                  </div>
                  <span className="font-mono text-sm">{money(product.price * line.qty)}</span>
                </li>
              );
            })}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-dashed border-ink/20 pt-4 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="font-mono">{money(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd className="font-mono">{shipping ? money(shipping) : "free"}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Duties & taxes</dt>
              <dd className="font-mono">included</dd>
            </div>
            <div className="flex items-baseline justify-between pt-2">
              <dt className="font-display text-xl">Total</dt>
              <dd className="font-mono text-2xl font-bold">{money(subtotal + shipping)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
