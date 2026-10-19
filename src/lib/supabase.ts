import { createClient } from "@supabase/supabase-js";

// المفتاح هون هو المفتاح العام (publishable) — آمن يكون بالكود، والصلاحيات محمية بقاعدة البيانات (RLS).
// بتقدري تغيّريهم من متغيرات البيئة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY.
const url = import.meta.env.VITE_SUPABASE_URL || "https://lghfzsjpukizqrxjjggf.supabase.co";
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_MKSadXSyKwitozZ3dO4spA_Z7UYQgzh";

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: "banan-admin-auth" },
});
