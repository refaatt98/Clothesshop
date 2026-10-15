import { lazy } from "react";
import { Route, Routes } from "react-router";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";

// كل صفحة غير الرئيسية تُحمَّل عند الحاجة فقط
const Shop = lazy(() => import("./pages/Shop"));
const Product = lazy(() => import("./pages/Product"));
const Rail = lazy(() => import("./pages/Rail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderDone = lazy(() => import("./pages/OrderDone"));
const Pinned = lazy(() => import("./pages/Pinned"));
const DressingTable = lazy(() => import("./pages/DressingTable"));
const Chapters = lazy(() => import("./pages/Chapters"));
const Chapter = lazy(() => import("./pages/Chapter"));
const Fabrics = lazy(() => import("./pages/Fabrics"));
const Journal = lazy(() => import("./pages/Journal"));
const JournalPost = lazy(() => import("./pages/JournalPost"));
const Atelier = lazy(() => import("./pages/Atelier"));
const FitGuide = lazy(() => import("./pages/FitGuide"));
const Care = lazy(() => import("./pages/Care"));
const Shipping = lazy(() => import("./pages/Shipping"));
const Mending = lazy(() => import("./pages/Mending"));
const Help = lazy(() => import("./pages/Help"));
const Contact = lazy(() => import("./pages/Contact"));
const Visit = lazy(() => import("./pages/Visit"));
const Legal = lazy(() => import("./pages/Legal"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="piece/:slug" element={<Product />} />
        <Route path="rail" element={<Rail />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="checkout/done" element={<OrderDone />} />
        <Route path="pinned" element={<Pinned />} />
        <Route path="dressing-table" element={<DressingTable />} />
        <Route path="chapters" element={<Chapters />} />
        <Route path="chapters/:slug" element={<Chapter />} />
        <Route path="fabrics" element={<Fabrics />} />
        <Route path="journal" element={<Journal />} />
        <Route path="journal/:slug" element={<JournalPost />} />
        <Route path="atelier" element={<Atelier />} />
        <Route path="fit-guide" element={<FitGuide />} />
        <Route path="care" element={<Care />} />
        <Route path="shipping" element={<Shipping />} />
        <Route path="mending" element={<Mending />} />
        <Route path="help" element={<Help />} />
        <Route path="contact" element={<Contact />} />
        <Route path="visit" element={<Visit />} />
        <Route path="legal/:doc" element={<Legal />} />
        <Route path="*" element={<NotFound />} />
      </Route>
  </Routes>
);
}
