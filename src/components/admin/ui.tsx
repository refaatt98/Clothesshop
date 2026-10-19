import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowUp, Check, ChevronDown, ImagePlus, LoaderCircle, Trash2, Video, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { uploadMedia } from "../../lib/api";
import { ORDER_STATUSES, type OrderStatus } from "../../types";

// ─── إشعارات صغيرة ────────────────────────────────────────
interface Toast {
  id: number;
  text: string;
  tone: "ok" | "err" | "info";
}
const ToastCtx = createContext<(text: string, tone?: Toast["tone"]) => void>(() => undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "err" ? 6000 : 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              className={`pointer-events-auto max-w-md rounded-2xl px-5 py-3 text-sm font-semibold shadow-xl ${
                t.tone === "err" ? "bg-rose text-white" : t.tone === "info" ? "bg-cocoa text-cream" : "bg-sage text-white"
              }`}
              role="status"
            >
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastCtx);

// ─── عناصر عامة ───────────────────────────────────────────
export function AdminPageHeader({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
        {text && <p className="mt-1 text-sm text-cocoa-3">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-line bg-linen p-5 ${className}`}>{children}</div>;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-sage" : "bg-sand"}`}
      >
        <motion.span className="absolute top-1 size-4 rounded-full bg-white shadow" animate={{ right: checked ? 24 : 4 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
      </button>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}

export function Modal({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div className="absolute inset-0 bg-cocoa/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className={`relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[2rem] bg-cream p-5 shadow-2xl sm:rounded-[2rem] sm:p-7 ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"}`}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl">{title}</h2>
              <button onClick={onClose} className="grid size-10 place-items-center rounded-full hover:bg-cream-2" aria-label="إغلاق">
                <X className="size-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** زر حذف بيطلب ضغطة تأكيد تانية */
export function DeleteButton({ onConfirm, label = "حذف", small = false }: { onConfirm: () => void | Promise<void>; label?: string; small?: boolean }) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      type="button"
      onClick={async () => {
        if (!armed) return setArmed(true);
        setBusy(true);
        try {
          await onConfirm();
        } finally {
          setBusy(false);
          setArmed(false);
        }
      }}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition ${small ? "px-2.5 py-1.5 text-xs" : "px-4 py-2 text-sm"} ${
        armed ? "bg-rose text-white" : "text-cocoa-3 hover:bg-rose-soft hover:text-cocoa"
      }`}
    >
      {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
      {armed ? "متأكدة؟" : label}
    </button>
  );
}

// ─── حالة الطلب (قائمة ملونة) ──────────────────────────────
export function statusInfo(s: string) {
  return ORDER_STATUSES.find((x) => x.id === s) ?? { id: s, label: s, color: "#9c8070" };
}

export function StatusBadge({ status }: { status: string }) {
  const s = statusInfo(status);
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: `${s.color}1f`, color: s.color }}>
      <span className="size-2 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

export function StatusSelect({ value, onChange, disabled }: { value: OrderStatus; onChange: (s: OrderStatus) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const cur = statusInfo(value);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full min-w-48 items-center justify-between gap-3 rounded-2xl border-2 bg-linen px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60"
        style={{ borderColor: `${cur.color}66` }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ background: cur.color }} />
          {cur.label}
        </span>
        <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute inset-x-0 z-40 mt-2 min-w-56 overflow-hidden rounded-2xl border border-line bg-linen py-1.5 shadow-2xl"
            role="listbox"
          >
            {ORDER_STATUSES.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={s.id === value}
                  onClick={() => {
                    setOpen(false);
                    if (s.id !== value) onChange(s.id);
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-start text-sm transition hover:bg-cream-2 ${s.id === value ? "font-bold" : ""}`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                    {s.label}
                  </span>
                  {s.id === value && <Check className="size-4" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── رفع الصور والفيديو ───────────────────────────────────
interface UploadingFile {
  id: number;
  name: string;
  progress: number;
}

export function MediaUploader({
  value,
  onChange,
  folder,
  multiple = true,
  accept = "image/*",
  label = "أضيفي صور",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string;
  multiple?: boolean;
  accept?: string;
  label?: string;
}) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const latest = useRef(value);
  latest.current = value;
  const [drag, setDrag] = useState(false);

  const handle = async (files: FileList | File[]) => {
    const list = Array.from(files).slice(0, multiple ? 20 : 1);
    for (const file of list) {
      if (file.size > 100 * 1024 * 1024) {
        toast(`الملف ${file.name} أكبر من 100MB`, "err");
        continue;
      }
      const id = Date.now() + Math.random();
      setUploading((u) => [...u, { id, name: file.name, progress: 0 }]);
      try {
        const url = await uploadMedia(file, folder, (p) => setUploading((u) => u.map((x) => (x.id === id ? { ...x, progress: p } : x))));
        onChange(multiple ? [...latest.current, url] : [url]);
      } catch (e) {
        toast(e instanceof Error ? e.message : "فشل الرفع", "err");
      } finally {
        setUploading((u) => u.filter((x) => x.id !== id));
      }
    }
  };

  const move = (i: number, d: number) => {
    const next = [...value];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const isVideo = (u: string) => /\.(mp4|webm|mov)(\?|$)/i.test(u);

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((url, i) => (
          <div key={url + i} className="group relative aspect-square overflow-hidden rounded-2xl border border-line bg-cream-2">
            {isVideo(url) ? <video src={url} muted className="size-full object-cover" /> : <img src={url} alt="" className="size-full object-cover" />}
            {i === 0 && multiple && <span className="absolute start-2 top-2 rounded-full bg-cocoa px-2 py-0.5 text-[10px] font-bold text-cream">الرئيسية</span>}
            <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
              {multiple && (
                <span className="flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} className="grid size-7 place-items-center rounded-full bg-cream/90" aria-label="قدّم"><ArrowUp className="size-3.5 rotate-90" /></button>
                  <button type="button" onClick={() => move(i, 1)} className="grid size-7 place-items-center rounded-full bg-cream/90" aria-label="أخّر"><ArrowDown className="size-3.5 rotate-90" /></button>
                </span>
              )}
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="grid size-7 place-items-center rounded-full bg-rose text-white" aria-label="حذف">
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
        {uploading.map((u) => (
          <div key={u.id} className="relative grid aspect-square place-items-center overflow-hidden rounded-2xl border border-dashed border-rose bg-rose-soft/40 p-2 text-center">
            <LoaderCircle className="size-6 animate-spin text-rose" />
            <span className="absolute inset-x-2 bottom-2 h-1.5 overflow-hidden rounded-full bg-cream">
              <span className="block h-full bg-rose transition-all" style={{ width: `${Math.max(8, u.progress * 100)}%` }} />
            </span>
          </div>
        ))}
        {(multiple || value.length + uploading.length === 0) && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              void handle(e.dataTransfer.files);
            }}
            className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-2 text-center text-xs font-semibold transition ${drag ? "border-rose bg-rose-soft" : "border-line hover:border-cocoa-3 hover:bg-cream-2"}`}
          >
            {accept.includes("video") ? <Video className="size-6 text-cocoa-3" /> : <ImagePlus className="size-6 text-cocoa-3" />}
            {label}
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void handle(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-cocoa-3">{hint}</span>}
    </label>
  );
}

/** حقل قائمة كلمات (مواد، مقاسات...) */
export function TagsInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [text, setText] = useState("");
  const add = () => {
    const t = text.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setText("");
  };
  return (
    <div className="field flex flex-wrap items-center gap-2 !p-2">
      {value.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 rounded-full bg-cream-2 py-1 pe-1.5 ps-3 text-sm">
          {v}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== v))} className="grid size-5 place-items-center rounded-full hover:bg-rose-soft" aria-label={`حذف ${v}`}>
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder={placeholder}
        className="min-w-24 flex-1 bg-transparent px-2 py-1 outline-none"
      />
    </div>
  );
}

export function slugify(s: string): string {
  const latin = s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return latin || `item-${Date.now().toString(36)}`;
}

export function fmtDate(iso: string, withTime = true): string {
  const d = new Date(iso);
  return d.toLocaleString("ar", {
    day: "numeric",
    month: "short",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    numberingSystem: "latn",
  } as Intl.DateTimeFormatOptions);
}
