import { ArrowDown, ArrowUp, Pencil } from "lucide-react";
import { useState } from "react";
import { AdminPageHeader, Card, DeleteButton, Field, MediaUploader, Modal, Toggle, useToast } from "../../components/admin/ui";
import { adminDeleteGallery, adminListGallery, adminSaveGallery } from "../../lib/api";
import { useAsync, useTitle } from "../../lib/hooks";
import type { GalleryItem } from "../../types";

const isVideoUrl = (u: string) => /\.(mp4|webm|mov)(\?|$)/i.test(u);

export default function AdminGallery() {
  useTitle("معرض الأعمال");
  const toast = useToast();
  const [tick, setTick] = useState(0);
  const { data } = useAsync(adminListGallery, [tick]);
  const [edit, setEdit] = useState<GalleryItem | null>(null);
  const refresh = () => setTick((t) => t + 1);

  // كل ملف بيترفع بيصير عنصر جديد بالمعرض
  const onUploaded = async (urls: string[]) => {
    const fresh = urls.filter((u) => !data?.some((g) => g.url === u));
    let sort = (data?.length ?? 0) + 1;
    for (const url of fresh) {
      try {
        await adminSaveGallery({ url, type: isVideoUrl(url) ? "video" : "image", sort: sort++, active: true });
      } catch (e) {
        toast(e instanceof Error ? e.message : "خطأ", "err");
      }
    }
    if (fresh.length) toast(`انضاف ${fresh.length} للمعرض ✨`);
    refresh();
  };

  const move = async (i: number, d: number) => {
    if (!data) return;
    const j = i + d;
    if (j < 0 || j >= data.length) return;
    const a = data[i];
    const b = data[j];
    await Promise.all([adminSaveGallery({ id: a.id, sort: j }), adminSaveGallery({ id: b.id, sort: i })]);
    // تثبيت ترتيب الباقي
    await Promise.all(data.map((g, k) => (k !== i && k !== j && g.sort !== k ? adminSaveGallery({ id: g.id, sort: k }) : null)));
    refresh();
  };

  return (
    <div>
      <AdminPageHeader title="معرض الأعمال" text="الصور والفيديوهات هون بتظهر بشريط متحرك بالصفحة الرئيسية" />
      <Card className="mb-6">
        <MediaUploader value={data?.map((g) => g.url) ?? []} onChange={onUploaded} folder="gallery" accept="image/*,video/mp4,video/webm,video/quicktime" label="أضيفي صور أو فيديو" />
        <p className="mt-2 text-xs text-cocoa-3">الفيديو لحد 100MB. الأفضل فيديوهات قصيرة (10–30 ثانية) بصيغة MP4.</p>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data?.map((g, i) => (
          <Card key={g.id} className={`!p-3 ${g.active ? "" : "opacity-60"}`}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream-2">
              {g.type === "video" ? <video src={g.url} poster={g.posterUrl ?? undefined} muted playsInline controls className="size-full object-cover" /> : <img src={g.url} alt="" className="size-full object-cover" />}
              <span className="absolute start-2 top-2 rounded-full bg-cocoa/80 px-2 py-0.5 text-xs text-cream">{g.type === "video" ? "فيديو" : "صورة"}</span>
            </div>
            <p className="mt-2 min-h-5 truncate text-sm">{g.caption || <span className="text-cocoa-3">بدون عنوان</span>}</p>
            <div className="mt-2 flex items-center justify-between border-t border-dashed border-line pt-2">
              <Toggle checked={g.active} onChange={async (v) => { await adminSaveGallery({ id: g.id, active: v }); refresh(); }} />
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} className="grid size-8 place-items-center rounded-full hover:bg-cream-2" aria-label="قدّم"><ArrowUp className="size-4" /></button>
                <button onClick={() => move(i, 1)} className="grid size-8 place-items-center rounded-full hover:bg-cream-2" aria-label="أخّر"><ArrowDown className="size-4" /></button>
                <button onClick={() => setEdit(g)} className="grid size-8 place-items-center rounded-full hover:bg-cream-2" aria-label="تعديل"><Pencil className="size-4" /></button>
                <DeleteButton small label="" onConfirm={async () => { await adminDeleteGallery(g.id); toast("انحذف"); refresh(); }} />
              </div>
            </div>
          </Card>
        ))}
      </div>
      {data && data.length === 0 && <Card className="py-12 text-center text-cocoa-3">ارفعي أول صورة أو فيديو من فوق ☝️</Card>}

      <Modal open={!!edit} onClose={() => setEdit(null)} title="تعديل">
        {edit && (
          <div className="space-y-4">
            <Field label="عنوان (اختياري)"><input value={edit.caption ?? ""} onChange={(e) => setEdit({ ...edit, caption: e.target.value })} className="field" placeholder="مثلاً: شنطة لين قبل التغليف" /></Field>
            {edit.type === "video" && (
              <Field label="صورة غلاف للفيديو (اختياري)">
                <MediaUploader value={edit.posterUrl ? [edit.posterUrl] : []} onChange={(v) => setEdit({ ...edit, posterUrl: v[0] ?? null })} folder="gallery" multiple={false} label="غلاف" />
              </Field>
            )}
            <button onClick={async () => { await adminSaveGallery({ id: edit.id, caption: edit.caption || null, posterUrl: edit.posterUrl }); toast("انحفظ"); setEdit(null); refresh(); }} className="btn btn-primary w-full">حفظ</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
