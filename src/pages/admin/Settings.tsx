import { LoaderCircle, Plus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminPageHeader, Card, Field, useToast } from "../../components/admin/ui";
import { adminGetSettings, adminSaveSettings } from "../../lib/api";
import { useTitle } from "../../lib/hooks";
import type { SiteInfo } from "../../types";

export default function AdminSettings() {
  useTitle("الإعدادات");
  const toast = useToast();
  const [s, setS] = useState<SiteInfo | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    adminGetSettings().then(setS).catch((e) => toast(e.message, "err"));
  }, [toast]);
  if (!s) return <div className="grid min-h-[40vh] place-items-center"><LoaderCircle className="size-8 animate-spin text-rose" /></div>;

  const save = async () => {
    if (!/^\d{10,15}$/.test(s.whatsapp.replace(/\D/g, ""))) return toast("رقم الواتساب لازم يكون دولي، مثلاً 972504590153", "err");
    setSaving(true);
    try {
      await adminSaveSettings(s);
      toast("انحفظت الإعدادات ✨");
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <AdminPageHeader title="الإعدادات" />
      <div className="space-y-4">
        <Card className="space-y-4">
          <h2 className="font-semibold">التواصل</h2>
          <Field label="رقم الواتساب (الطلبات بتوصل عليه)" hint="بالصيغة الدولية بدون + — مثلاً 972504590153">
            <input value={s.whatsapp} dir="ltr" onChange={(e) => setS({ ...s, whatsapp: e.target.value })} className="field text-right" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="رقم الهاتف المعروض"><input value={s.phone} dir="ltr" onChange={(e) => setS({ ...s, phone: e.target.value })} className="field text-right" /></Field>
            <Field label="إنستغرام (بدون @)"><input value={s.instagram} dir="ltr" onChange={(e) => setS({ ...s, instagram: e.target.value })} className="field text-right" /></Field>
            <Field label="الإيميل"><input value={s.email} dir="ltr" onChange={(e) => setS({ ...s, email: e.target.value })} className="field text-right" /></Field>
            <Field label="ساعات العمل"><input value={s.hours} onChange={(e) => setS({ ...s, hours: e.target.value })} className="field" /></Field>
          </div>
        </Card>
        <Card className="space-y-4">
          <h2 className="font-semibold">النصوص</h2>
          <Field label="الجملة الرئيسية"><input value={s.tagline} onChange={(e) => setS({ ...s, tagline: e.target.value })} className="field" /></Field>
          <Field label="التعريف"><textarea rows={2} value={s.intro} onChange={(e) => setS({ ...s, intro: e.target.value })} className="field resize-none" /></Field>
          <div>
            <p className="label">الشريط العلوي (بيتبدّل كل كم ثانية)</p>
            <div className="space-y-2">
              {s.announcements.map((a, i) => (
                <div key={i} className="flex gap-2">
                  <input value={a} onChange={(e) => setS({ ...s, announcements: s.announcements.map((x, j) => (j === i ? e.target.value : x)) })} className="field" />
                  <button onClick={() => setS({ ...s, announcements: s.announcements.filter((_, j) => j !== i) })} className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-rose-soft" aria-label="حذف"><X className="size-4" /></button>
                </div>
              ))}
              <button onClick={() => setS({ ...s, announcements: [...s.announcements, ""] })} className="btn btn-ghost !py-2"><Plus className="size-4" /> سطر</button>
            </div>
          </div>
        </Card>
        <Card className="space-y-4">
          <h2 className="font-semibold">الأسعار</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="توصيل مجاني فوق (₪)" hint="فضّيه لتلغيه"><input type="number" min={0} value={s.freeDeliveryOver ?? ""} onChange={(e) => setS({ ...s, freeDeliveryOver: e.target.value === "" ? null : Number(e.target.value) })} className="field" /></Field>
            <Field label="سعر تغليف الهدية (₪)"><input type="number" min={0} value={s.giftWrapPrice} onChange={(e) => setS({ ...s, giftWrapPrice: Number(e.target.value) })} className="field" /></Field>
          </div>
        </Card>
        <button onClick={save} disabled={saving} className="btn btn-primary">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />} حفظ الإعدادات</button>
      </div>
    </div>
  );
}
