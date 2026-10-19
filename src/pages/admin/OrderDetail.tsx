import { ArrowRight } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { OrderPanel } from "../../components/admin/OrderPanel";
import { useTitle } from "../../lib/hooks";

export default function AdminOrderDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  useTitle("تفاصيل الطلب");
  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin/orders" className="mb-3 inline-flex items-center gap-1 text-sm text-cocoa-3 hover:text-cocoa">
        <ArrowRight className="size-4" /> كل الطلبات
      </Link>
      <OrderPanel id={id} onDeleted={() => navigate("/admin/orders", { replace: true })} />
    </div>
  );
}
