import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { subscribeToLetters } from "../lib/api";

/** Small inline email form — used for upcoming chapters and the newsletter. */
export function NotifyForm({ cta = "Tell me first", dark = false }: { cta?: string; dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("busy");
    try {
      await subscribeToLetters(email);
      setState("done");
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Try again");
    }
  }

  if (state === "done")
    return (
      <p className={`flex items-center gap-2 ${dark ? "text-butter" : "text-ink"}`} role="status">
        <Check className="h-4 w-4" /> Noted. You'll hear from us before anyone else.
      </p>
    );

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
      <label className="sr-only" htmlFor="notify-email">
        Email
      </label>
      <input
        id="notify-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@somewhere.com"
        className={`min-w-0 flex-1 rounded-full px-4 py-2.5 font-mono text-sm outline-none ring-1 focus:ring-2 focus:ring-thread ${dark ? "bg-paper/10 text-paper ring-paper/20 placeholder:text-paper/40" : "bg-tissue ring-line"}`}
      />
      <button disabled={state === "busy"} className={`rounded-full px-5 py-2.5 text-sm font-medium ${dark ? "bg-paper text-ink" : "bg-ink text-paper"} disabled:opacity-50`}>
        {state === "busy" ? "…" : cta}
      </button>
      {state === "error" && <p className="text-sm text-thread sm:hidden">{msg}</p>}
    </form>
  );
}
