import { Plus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminPageHeader, Card, DeleteButton, Toggle, useToast } from "../../components/admin/ui";
import { adminDeleteZone, adminGetSettings, adminListZones, adminSaveSettings, adminSaveZone } from "../../lib/api";
import { useAsync, useTitle } from "../../lib/hooks";
import type { DeliveryZone, SiteInfo } from "../../types";

export default function AdminDelivery() {
  useTitle("التوصيل");
  const toast = useToast();
  const [tick, setTick] = useState(0);
  const { data } = useAsync(adminListZones, [tick]);
  const [zones, setZones] = useState<(Partial<DeliveryZone> & { dirty?: boolean })[]>([]);
  const [settings, setSettings] = useState<SiteInfo | null>(null);

  useEffect(() => {
    if (data) setZones(data);
  }, [data]);
  useEffect(() => {
    adminGetSettings().then(setSettings).catch(() => undefined);
  }, []);

  const update = (i: number, patch: Partial<DeliveryZone>) => setZones((z) => z.map((x, j) => (j === i ? { ...x, ...patch, dirty: true } : x)));

  const saveZone = async (z: Partial<DeliveryZone>) => {
    if (!z.name?.trim()) return toast("اكتبي اسم المنطقة", "err");
    try {
      await adminSaveZone({ ...z, fee: Number(z.fee) || 0 });
      toast("انحفظت المنطقة");
      setTick((t) => t + 1);
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
    }
  };

  const saveFree = async () => {
    if (!settings) return;
    try {
      await adminSaveSettings(settings);
      toast("انحفظت الإعدادات");
    } catch (e) {
      toast(e instanceof Error ? e.message : "خطأ", "err");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="مناطق التوصيل"
        text="كل منطقة إلها سعر ومدة. خيار «استلام» ما إله رسوم وما بيطلب عنوان."
        action={<button onClick={() => setZones((z) => [...z, { name: "", fee: 0, eta: "", isPickup: false, active: true, sort: z.length, dirty: true }])} className="btn btn-primary !py-2.5"><Plus className="size-4" /> منطقة جديدة</button>}
      />

      <div className="space-y-3">
        {zones.map((z, i) => (
          <Card key={z.id ?? `new-${i}`} className={`!p-4 ${z.active ? "" : "opacity-70"}`}>
            <div className="grid gap-3 md:grid-cols-[2fr_1fr_2fr_auto] md:items-end">
              <label><span className="label">اسم المنطقة</span><input value={z.name} onChange={(e) => update(i, { name: e.target.value })} className="field" placeholder="مثلاً: نابلس" /></label>
              <label><span className="label">السعر ₪</span><input type="number" min={0} value={z.fee} disabled={z.isPickup} onChange={(e) => update(i, { fee: Number(e.target.value) })} className="field" /></label>
              <label><span className="label">مدة التوصيل</span><input value={z.eta} onChange={(e) => update(i, { eta: e.target.value })} className="field" placeholder="2 – 3 أيام عمل" /></label>
              <label><span className="label">الترتيب</span><input type="number" value={z.sort} onChange={(e) => update(i, { sort: Number(e.target.value) })} className="field md:w-20" /></label>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-line pt-3">
              <div className="flex flex-wrap gap-5">
                <Toggle checked={!!z.active} onChange={(v) => update(i, { active: v })} label="مفعّلة" />
                <Toggle checked={!!z.isPickup} onChange={(v) => update(i, { isPickup: v, fee: v ? 0 : z.fee })} label="استلام من البيت" />
              </div>
              <div className="flex items-center gap-2">
                {z.id ? (
                  <DeleteButton small onConfirm={async () => { try { await adminDeleteZone(z.id!); toast("انحذفت"); setTick((t) => t + 1); } catch (e) { toast(e instanceof Error ? e.message : "خطأ", "err"); } }} />
                ) : (
                  <button onClick={() => setZones((zs) => zs.filter((_, j) => j !== i))} className="text-sm text-cocoa-3">إلغاء</button>
                )}
                <button onClick={() => saveZone(z)} disabled={!z.dirty} className="btn btn-primary !px-4 !py-2"><Save className="size-4" /> حفظ</button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {settings && (
        <Card className="mt-6">
          <h2 className="font-semibold">التوصيل المجاني</h2>
          <p className="mb-3 text-sm text-cocoa-3">إذا مجموع القطع وصل لهالمبلغ، التوصيل بيصير مجاني. فضّيه لتلغي التوصيل المجاني.</p>
          <div className="flex flex-wrap items-end gap-3">
            <label><span className="label">مجاني فوق (₪)</span><input type="number" min={0} value={settings.freeDeliveryOver ?? ""} onChange={(e) => setSettings({ ...settings, freeDeliveryOver: e.target.value === "" ? null : Number(e.target.value) })} className="field w-40" placeholder="بدون" /></label>
            <label><span className="label">سعر تغليف الهدية (₪)</span><input type="number" min={0} value={settings.giftWrapPrice} onChange={(e) => setSettings({ ...settings, giftWrapPrice: Number(e.target.value) })} className="field w-40" /></label>
            <button onClick={saveFree} className="btn btn-primary !py-2.5"><Save className="size-4" /> حفظ</button>
          </div>
        </Card>
      )}
    </div>
  );
}
