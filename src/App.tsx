import { lazy } from "react";
import { Route, Routes } from "react-router";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";

// الصفحات غير الرئيسية بتتحمّل عند الحاجة بس
const Shop = lazy(() => import("./pages/Shop"));
const Product = lazy(() => import("./pages/Product"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderDone = lazy(() => import("./pages/OrderDone"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Custom = lazy(() => import("./pages/Custom"));
const Story = lazy(() => import("./pages/Story"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:slug" element={<Product />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="order/:id" element={<OrderDone />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="custom" element={<Custom />} />
        <Route path="story" element={<Story />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
