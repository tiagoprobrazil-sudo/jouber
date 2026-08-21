import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PageLoader } from "@/components/layout/PageLoader";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";

const Home = lazy(() => import("@/pages/Home"));
const Shop = lazy(() => import("@/pages/Shop"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Artist = lazy(() => import("@/pages/Artist"));
const Journal = lazy(() => import("@/pages/Journal"));
const JournalPost = lazy(() => import("@/pages/JournalPost"));
const Contact = lazy(() => import("@/pages/Contact"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const PolicyPage = lazy(() => import("@/pages/PolicyPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const AdminLogin = lazy(() => import("@/pages/admin/Login"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminPosts = lazy(() => import("@/pages/admin/Posts"));
const AdminPostEditor = lazy(() => import("@/pages/admin/PostEditor"));
const AdminProducts = lazy(() => import("@/pages/admin/Products"));
const AdminProductEditor = lazy(() => import("@/pages/admin/ProductEditor"));
const AdminMedia = lazy(() => import("@/pages/admin/Media"));
const AdminOrders = lazy(() => import("@/pages/admin/Orders"));
const AdminCategories = lazy(() => import("@/pages/admin/Categories"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:category" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/artist" element={<Artist />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/journal/:slug" element={<JournalPost />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/shipping" element={<PolicyPage topic="shipping" />} />
            <Route path="/returns" element={<PolicyPage topic="returns" />} />
            <Route path="/privacy" element={<PolicyPage topic="privacy" />} />
            <Route path="/terms" element={<PolicyPage topic="terms" />} />
            <Route path="/faq" element={<PolicyPage topic="faq" />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="posts/new" element={<AdminPostEditor />} />
            <Route path="posts/:id" element={<AdminPostEditor />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductEditor />} />
            <Route path="products/:id" element={<AdminProductEditor />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
