// رفع الصور والفيديوهات على Cloudflare R2 (للمديرة بس)
// بيرجع رابط رفع مؤقت (presigned PUT). المفاتيح بتضل على السيرفر وما بتوصل للمتصفح.
//
// ⚠️ النسخة المنشورة على Supabase فيها مفاتيح R2 (مش موجودة هون بقصد، لأنها سرية).
// إذا بدك تنشري من هالملف، ضيفي هالأسرار بـ Supabase → Edge Functions → Secrets:
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { AwsClient } from "npm:aws4fetch@1.0.20";

const R2 = {
  accountId: Deno.env.get("R2_ACCOUNT_ID") ?? "",
  accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID") ?? "",
  secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY") ?? "",
  bucket: Deno.env.get("R2_BUCKET") ?? "banan",
  publicUrl: Deno.env.get("R2_PUBLIC_URL") ?? "",
};

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const ALLOWED = /^(image\/(jpeg|png|webp|gif|avif)|video\/(mp4|webm|quicktime))$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) return json({ error: "غير مسموح" }, 403);

  let body: { filename?: string; contentType?: string; folder?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad json" }, 400);
  }
  const contentType = String(body.contentType ?? "");
  if (!ALLOWED.test(contentType)) return json({ error: "نوع الملف غير مدعوم" }, 400);
  const folder = String(body.folder ?? "misc").replace(/[^a-z0-9-]/gi, "").slice(0, 30) || "misc";
  const ext = (String(body.filename ?? "").split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
  const d = new Date();
  const key = `${folder}/${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${ext}`;

  // بدون مفاتيح R2 → الموقع بيرفع على Supabase Storage كبديل
  if (!R2.accountId || !R2.accessKeyId || !R2.secretAccessKey || !R2.publicUrl) return json({ provider: "supabase", key });

  const aws = new AwsClient({ accessKeyId: R2.accessKeyId, secretAccessKey: R2.secretAccessKey, service: "s3", region: "auto" });
  const url = new URL(`https://${R2.accountId}.r2.cloudflarestorage.com/${R2.bucket}/${key}`);
  url.searchParams.set("X-Amz-Expires", "900");
  const signed = await aws.sign(new Request(url, { method: "PUT", headers: { "Content-Type": contentType } }), {
    aws: { signQuery: true },
  });
  return json({ provider: "r2", key, uploadUrl: signed.url, publicUrl: `${R2.publicUrl.replace(/\/$/, "")}/${key}` });
});
