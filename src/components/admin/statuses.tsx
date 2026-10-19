import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { adminListStatuses } from "../../lib/api";
import type { StatusDef } from "../../types";

// احتياطي لحد ما تنحمّل الحالات من قاعدة البيانات
export const FALLBACK_STATUSES: StatusDef[] = [
  { key: "new", label: "جديد", color: "#22c55e", sort: 0, active: true, isSystem: true, customerMessage: "" },
  { key: "pickup", label: "الإستلام من البيت", color: "#eab308", sort: 7, active: true, isSystem: true, customerMessage: "" },
  { key: "cancelled", label: "ملغى", color: "#ef4444", sort: 8, active: true, isSystem: true, customerMessage: "" },
];

interface Ctx {
  statuses: StatusDef[];
  refresh: () => void;
}
const StatusesCtx = createContext<Ctx>({ statuses: FALLBACK_STATUSES, refresh: () => undefined });

export function StatusesProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<StatusDef[]>(FALLBACK_STATUSES);
  const refresh = useCallback(() => {
    adminListStatuses().then((s) => s.length && setStatuses(s)).catch(() => undefined);
  }, []);
  useEffect(refresh, [refresh]);
  return <StatusesCtx.Provider value={{ statuses, refresh }}>{children}</StatusesCtx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStatuses = () => useContext(StatusesCtx);
