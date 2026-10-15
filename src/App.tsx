import { Route, Routes } from "react-router";
import { Layout } from "./components/Layout";
import Chapter from "./pages/Chapter";
import Chapters from "./pages/Chapters";
import Checkout from "./pages/Checkout";
import DressingTable from "./pages/DressingTable";
import Fabrics from "./pages/Fabrics";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import OrderDone from "./pages/OrderDone";
import Pinned from "./pages/Pinned";
import Product from "./pages/Product";
import Rail from "./pages/Rail";
import Shop from "./pages/Shop";

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
        <Route path="dressing-table" element={<DressingTable />} />
        <Route path="chapters" element={<Chapters />} />
        <Route path="chapters/:slug" element={<Chapter />} />
        <Route path="fabrics" element={<Fabrics />} />
        <Route path="pinned" element={<Pinned />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
