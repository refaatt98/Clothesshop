import { lazy, Suspense } from "react";
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

// لوحة الإدارة — بتتحمّل بس لما تفتحيها
const AdminShell = lazy(() => import("./components/admin/AdminShell").then((m) => ({ default: m.AdminShell })));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminOrderDetail = lazy(() => import("./pages/admin/OrderDetail"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminProductEdit = lazy(() => import("./pages/admin/ProductEdit"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminDelivery = lazy(() => import("./pages/admin/Delivery"));
const AdminPromos = lazy(() => import("./pages/admin/Promos"));
const AdminGallery = lazy(() => import("./pages/admin/Gallery"));
const AdminReviews = lazy(() => import("./pages/admin/Reviews"));
const AdminFaqs = lazy(() => import("./pages/admin/Faqs"));
const AdminCustomRequests = lazy(() => import("./pages/admin/CustomRequests"));
const AdminMessages = lazy(() => import("./pages/admin/Messages"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));

const adminFallback = <div className="grid min-h-dvh place-items-center bg-cream text-cocoa-3">...</div>;

export default function App() {
  return (
    <Routes>
      <Route path="admin/login" element={<Suspense fallback={adminFallback}><AdminLogin /></Suspense>} />
      <Route path="admin" element={<Suspense fallback={adminFallback}><AdminShell /></Suspense>}>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/:id" element={<AdminProductEdit />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="delivery" element={<AdminDelivery />} />
        <Route path="promos" element={<AdminPromos />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="faqs" element={<AdminFaqs />} />
        <Route path="custom" element={<AdminCustomRequests />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
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
