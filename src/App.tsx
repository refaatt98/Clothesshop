import { lazy } from "react";
import { Route, Routes } from "react-router";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";

// الصفحات غير الرئيسية بتتحمّل عند الحاجة بس
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
