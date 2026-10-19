import { LoaderCircle, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { adminListProducts, adminListZones, adminUpdateOrder, createOrder } from "../../lib/api";
import { formatPrice } from "../../lib/format";
import { NO_COLOR, type CartItem, type DeliveryZone, type Product } from "../../types";
import { useStatuses } from "./statuses";
import { Field, Modal, useToast } from "./ui";

interface Line {
  productId: string;
  qty: number;
  note: string;
}

/** إضافة طلب يدوي (طلب وصل على واتساب أو إنستغرام) */
export function NewOrderModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const toast = useToast();
  const { statuses } = useStatuses();
  const [products, setProducts] = useState<Product[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [f, setF] = useState({ name: "", phone: "", zoneId: "", city: "", address: "", notes: "", status: "" });
  const [lines, setLines] = useState<Line[]>([{ productId: "", qty: 1, note: "" }]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    adminListProducts().then((p) => setProducts(p.filter((x) => x.active))).catch(() => undefined);
    adminListZones().then((z) => {
      const act = z.filter((x) => x.active);
      setZones(act);
      setF((s) => (s.zoneId ? s : { ...s, zoneId: act.find((x) => !x.isPickup)?.id ?? act[0]?.id ?? "" }));
    }).catch(() => undefined);
  }, [open]);

  const zone = zones.find((z) => z.id === f.zoneId);
  const subtotal = lines.reduce((s, l) => s + (products.find((p) => p.id === l.productId)?.price ?? 0) * l.qty, 0);

  const submit = async () => {
    const items: CartItem[] = lines
      .filter((l) => l.productId)
      .map((l) => {
        const p = products.find((x) => x.id === l.productId)!;
        return { key: `${p.id}|${l.note}`, productId: p.id, slug: p.slug, name: p.name, price: p.price, art: p.art, color: NO_COLOR, qty: l.qty, note: l.note || undefined };
      });
    if (!items.length) return toast("اختاري منتج واحد على الأقل", "err");
    setBusy(true);
    try {
      const order = await createOrder({
        name: f.name,
        phone: f.phone,
        zoneId: f.zoneId,
        city: zone?.isPickup ? "" : f.city || zone?.name || "",
        address: zone?.isPickup ? "" : f.address,
        notes: f.notes,
        giftWrap: false,
        items,
      });
      if (f.status && f.status !== order.status) await adminUpdateOrder(order.id, { status: f.status });
      toast(`انضاف الطلب #${order.number}`);
      setF({ name: "", phone: "", zoneId: f.zoneId, city: "", address: "", notes: "", status: "" });
      setLines([{ productId: "", qty: 1, note: "" }]);
      onCreated(order.id);
    } catch (e) {
      toast(e instanceof Error ? e.message : "ما انضاف الطلب", "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="طلب جديد" wide>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="اسم الزبونة"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="field" /></Field>
          <Field label="رقم الجوال"><input value={f.phone} dir="ltr" inputMode="tel" onChange={(e) => setF({ ...f, phone: e.target.value })} className="field text-right" placeholder="05X XXX XXXX" /></Field>
          <Field label="المنطقة">
            <select value={f.zoneId} onChange={(e) => setF({ ...f, zoneId: e.target.value })} className="field">
              {zones.map((z) => <option key={z.id} value={z.id}>{z.name} — {z.isPickup ? "استلام" : formatPrice(z.fee)}</option>)}
            </select>
          </Field>
          {!zone?.isPickup && <Field label="المدينة / البلدة"><input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} className="field" placeholder={zone?.name} /></Field>}
          {!zone?.isPickup && <div className="sm:col-span-2"><Field label="العنوان"><input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} className="field" /></Field></div>}
        </div>

        <div>
          <p className="label">القطع</p>
          <div className="space-y-2">
            {lines.map((l, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-linen p-2">
                <select value={l.productId} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, productId: e.target.value } : x)))} className="field min-w-0 flex-1 !py-2">
                  <option value="">اختاري منتج…</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {formatPrice(p.price)}</option>)}
                </select>
                <input type="number" min={1} value={l.qty} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, qty: Math.max(1, Number(e.target.value) || 1) } : x)))} className="field !w-20 !py-2" aria-label="الكمية" />
                <input value={l.note} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))} className="field min-w-0 flex-1 !py-2" placeholder="تخصيص (اختياري)" />
                {lines.length > 1 && <button onClick={() => setLines(lines.filter((_, j) => j !== i))} className="grid size-9 place-items-center rounded-full hover:bg-rose-soft" aria-label="حذف"><X className="size-4" /></button>}
              </div>
            ))}
          </div>
          <button onClick={() => setLines([...lines, { productId: "", qty: 1, note: "" }])} className="btn btn-ghost mt-2 !px-4 !py-2"><Plus className="size-4" /> قطعة تانية</button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="ملاحظات"><input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} className="field" /></Field>
          <Field label="الحالة">
            <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} className="field">
              <option value="">تلقائي (جديد)</option>
              {statuses.filter((s) => s.active).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-line pt-4">
          <p className="text-sm">المجموع: <b className="tabular-nums">{formatPrice(subtotal)}</b> {zone && !zone.isPickup && <span className="text-cocoa-3">+ توصيل {formatPrice(zone.fee)}</span>}</p>
          <button onClick={submit} disabled={busy} className="btn btn-primary">{busy && <LoaderCircle className="size-4 animate-spin" />} إضافة الطلب</button>
        </div>
      </div>
    </Modal>
  );
}
