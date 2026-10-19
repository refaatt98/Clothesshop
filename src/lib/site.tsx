import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { siteDefaults } from "../data/site";
import type { Category, SiteInfo } from "../types";
import { getCategories, getSiteInfo } from "./api";

interface SiteState {
  site: SiteInfo;
  categories: Category[];
}

const SiteContext = createContext<SiteState>({ site: siteDefaults, categories: [] });

/** معلومات المتجر والأقسام — بتنحمّل مرة وحدة لكل الموقع */
export function SiteProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SiteState>({ site: siteDefaults, categories: [] });
  useEffect(() => {
    Promise.all([getSiteInfo(), getCategories().catch(() => [])]).then(([site, categories]) => setState({ site, categories }));
  }, []);
  return <SiteContext.Provider value={state}>{children}</SiteContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSite() {
  return useContext(SiteContext);
}
