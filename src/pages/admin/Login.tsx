import { motion } from "motion/react";
import { LoaderCircle, Lock } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { YarnBall } from "../../components/Craft";
import { adminExists, adminSignIn, adminSignUp, isAdmin } from "../../lib/api";
import { useTitle } from "../../lib/hooks";
import { supabase } from "../../lib/supabase";

export default function AdminLogin() {
  useTitle("دخول الإدارة");
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "setup" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session && (await isAdmin())) return navigate("/admin", { replace: true });
      setMode((await adminExists()) ? "login" : "setup");
    })();
  }, [navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (password.length < 8) return setError("كلمة السر لازم تكون 8 أحرف أو أكتر");
    setBusy(true);
    try {
      if (mode === "setup") {
        const { needsConfirm } = await adminSignUp(email.trim(), password);
        if (needsConfirm) {
          setInfo("بعتنالك رابط تأكيد على الإيميل. افتحيه، وبعدين ارجعي سجّلي دخول من هون.");
          setMode("login");
          return;
        }
      } else {
        await adminSignIn(email.trim(), password);
      }
      if (!(await isAdmin())) {
        await supabase.auth.signOut();
        setError("هالحساب مش حساب الإدارة");
        return;
      }
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "صار خطأ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-cream px-4">
      <YarnBall className="pointer-events-none absolute -end-10 -top-10 size-48 opacity-50" color="#e9c2bb" />
      <YarnBall className="pointer-events-none absolute -bottom-12 -start-12 size-56 opacity-40" color="#e3e9dc" />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="stitched relative w-full max-w-sm rounded-[2rem] bg-linen p-7 shadow-[0_30px_60px_-30px_rgba(74,42,24,.4)]"
      >
        <img src="/logo-600.png" alt="بَنان" className="mx-auto h-20 w-auto" />
        <h1 className="mt-4 text-center font-display text-3xl">{mode === "setup" ? "إنشاء حساب الإدارة" : "دخول الإدارة"}</h1>
        {mode === "setup" && <p className="mt-2 text-center text-sm leading-6 text-cocoa-3">أول حساب بينعمل هون بيصير حساب المديرة. بعدها ما حدا بيقدر يعمل حساب جديد.</p>}
        {mode == null ? (
          <div className="grid place-items-center py-10"><LoaderCircle className="size-7 animate-spin text-rose" /></div>
        ) : (
          <div className="relative z-10 mt-6 space-y-4">
            <div>
              <label htmlFor="em" className="label">الإيميل</label>
              <input id="em" type="email" required autoComplete="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} className="field text-right" />
            </div>
            <div>
              <label htmlFor="pw" className="label">كلمة السر</label>
              <input id="pw" type="password" required autoComplete={mode === "setup" ? "new-password" : "current-password"} dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} className="field text-right" />
            </div>
            {error && <p className="rounded-xl bg-rose-soft p-3 text-sm" role="alert">{error}</p>}
            {info && <p className="rounded-xl bg-sage-soft p-3 text-sm" role="status">{info}</p>}
            <button disabled={busy} className="btn btn-primary w-full">
              {busy ? <LoaderCircle className="size-5 animate-spin" /> : <Lock className="size-4" />}
              {mode === "setup" ? "إنشاء الحساب" : "دخول"}
            </button>
          </div>
        )}
      </motion.form>
    </div>
  );
}
