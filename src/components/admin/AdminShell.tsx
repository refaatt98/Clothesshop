import { AnimatePresence, motion } from "motion/react";
import {
  ExternalLink,
  FolderTree,
  Gift,
  HelpCircle,
  Images,
  LayoutDashboard,
  ListChecks,
  LoaderCircle,
  LogOut,
  Mail,
  Menu,
  MessageSquareHeart,
  Package,
  ReceiptText,
  Settings,
  Tag,
  Truck,
  X,
} from "lucide-react";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { adminCountNewOrders, adminSignOut, isAdmin } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { StatusesProvider } from "./statuses";
import { ToastProvider, useToast } from "./ui";

const nav = [
  { to: "/admin", label: "لوحة التحكم", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "الطلبات", icon: ReceiptText, badge: "orders" as const },
  { to: "/admin/products", label: "المنتجات", icon: Package },
  { to: "/admin/categories", label: "الأقسام", icon: FolderTree },
  { to: "/admin/statuses", label: "حالات الطلب", icon: ListChecks },
  { to: "/admin/delivery", label: "التوصيل", icon: Truck },
  { to: "/admin/promos", label: "أكواد الخصم", icon: Tag },
  { to: "/admin/gallery", label: "معرض الأعمال", icon: Images },
  { to: "/admin/reviews", label: "الآراء", icon: MessageSquareHeart },
  { to: "/admin/faqs", label: "الأسئلة الشائعة", icon: HelpCircle },
  { to: "/admin/custom", label: "الطلبات الخاصة", icon: Gift },
  { to: "/admin/messages", label: "الرسائل", icon: Mail },
  { to: "/admin/settings", label: "الإعدادات", icon: Settings },
];

/** صوت تنبيه ناعم بدون ملفات */
function ding() {
  try {
    const ctx = new AudioContext();
    [880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      o.type = "sine";
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.18);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + i * 0.18 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.18 + 0.5);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.18);
      o.stop(ctx.currentTime + i * 0.18 + 0.55);
    });
  } catch {
    /* المتصفح منع الصوت */
  }
}

function Sidebar({ newOrders, onNavigate }: { newOrders: number; onNavigate?: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col">
      <Link to="/admin" onClick={onNavigate} className="flex items-center gap-3 px-5 py-5">
        <img src="/logo-light.png" alt="بَنان" className="h-11 w-auto" />
        <span className="rounded-full bg-cream/15 px-2 py-0.5 text-xs">الإدارة</span>
      </Link>
      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="قائمة الإدارة">
        <ul className="space-y-0.5">
          {nav.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                end={n.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[0.95rem] transition ${isActive ? "bg-cream text-cocoa font-semibold" : "text-cream/80 hover:bg-cream/10 hover:text-cream"}`
                }
              >
                <n.icon className="size-5 shrink-0" strokeWidth={1.8} />
                <span className="flex-1">{n.label}</span>
                {n.badge === "orders" && newOrders > 0 && (
                  <span className="grid min-w-6 place-items-center rounded-full bg-rose px-1.5 text-xs font-bold leading-6 text-white">{newOrders}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="space-y-1 border-t border-dashed border-cream/15 p-3">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm text-cream/80 hover:bg-cream/10">
          <ExternalLink className="size-4" /> عرض المتجر
        </a>
        <button
          onClick={async () => {
            await adminSignOut();
            navigate("/admin/login", { replace: true });
          }}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm text-cream/80 hover:bg-cream/10"
        >
          <LogOut className="size-4" /> تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

function ShellInner() {
  const toast = useToast();
  const location = useLocation();
  const [menu, setMenu] = useState(false);
  const [newOrders, setNewOrders] = useState(0);

  const refreshCount = useCallback(() => {
    adminCountNewOrders().then(setNewOrders).catch(() => undefined);
  }, []);

  useEffect(() => {
    refreshCount();
  }, [refreshCount, location.pathname]);

  useEffect(() => setMenu(false), [location.pathname]);

  // تنبيه مباشر لما يوصل طلب جديد
  useEffect(() => {
    const ch = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        const o = payload.new as { number?: string; customer_name?: string; total?: number };
        ding();
        toast(`🛍️ طلب جديد ${o.number ?? ""} من ${o.customer_name ?? ""} — ${o.total ?? ""} ₪`, "info");
        refreshCount();
        window.dispatchEvent(new CustomEvent("banan:new-order"));
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("طلب جديد — بَنان", { body: `${o.customer_name ?? ""} · ${o.total ?? ""} ₪`, icon: "/favicon.svg" });
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, () => refreshCount())
      .subscribe();
    if ("Notification" in window && Notification.permission === "default") Notification.requestPermission().catch(() => undefined);
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [toast, refreshCount]);

  return (
    <div className="min-h-dvh bg-cream lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-dvh bg-cocoa text-cream lg:block">
        <Sidebar newOrders={newOrders} />
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-cream/90 px-4 py-3 backdrop-blur lg:hidden">
        <button onClick={() => setMenu(true)} className="grid size-11 place-items-center rounded-full hover:bg-cream-2" aria-label="القائمة">
          <Menu className="size-6" />
        </button>
        <span className="font-display text-xl">إدارة بَنان</span>
        <Link to="/admin/orders" className="relative grid size-11 place-items-center rounded-full hover:bg-cream-2" aria-label="الطلبات">
          <ReceiptText className="size-5" />
          {newOrders > 0 && <span className="absolute end-1 top-1 grid min-w-5 place-items-center rounded-full bg-rose px-1 text-[11px] font-bold leading-5 text-white">{newOrders}</span>}
        </Link>
      </header>

      <AnimatePresence>
        {menu && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-cocoa/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenu(false)} />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="absolute inset-y-0 right-0 w-[82%] max-w-xs bg-cocoa text-cream"
            >
              <button onClick={() => setMenu(false)} className="absolute end-3 top-4 grid size-10 place-items-center rounded-full hover:bg-cream/10" aria-label="إغلاق">
                <X className="size-5" />
              </button>
              <Sidebar newOrders={newOrders} onNavigate={() => setMenu(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <main className="min-w-0 px-4 py-6 md:px-8 md:py-8">
        <Suspense fallback={<div className="grid min-h-[50vh] place-items-center"><LoaderCircle className="size-8 animate-spin text-rose" /></div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

/** حارس الإدارة: لازم تكوني مسجّلة دخول وحسابك مدير */
export function AdminShell() {
  const [state, setState] = useState<"loading" | "ok" | "no">("loading");

  useEffect(() => {
    let alive = true;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return alive && setState("no");
      const ok = await isAdmin();
      if (alive) setState(ok ? "ok" : "no");
    };
    void check();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setState("no");
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (state === "loading")
    return (
      <div className="grid min-h-dvh place-items-center bg-cream">
        <LoaderCircle className="size-8 animate-spin text-rose" />
      </div>
    );
  if (state === "no") return <Navigate to="/admin/login" replace />;
  return (
    <ToastProvider>
      <StatusesProvider>
        <ShellInner />
      </StatusesProvider>
    </ToastProvider>
  );
}
