import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import { SiteProvider } from "./lib/site";
import { ShopProvider } from "./lib/store";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <SiteProvider>
        <ShopProvider>
          <App />
        </ShopProvider>
      </SiteProvider>
    </BrowserRouter>
  </StrictMode>,
);
