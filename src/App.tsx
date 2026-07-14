import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { AppProvider } from "./contexts/AppContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { AuthModal } from "./components/AuthModal";

// public pages
import { Home } from "./pages/Home";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { RFQ } from "./pages/RFQ";
import { Orders } from "./pages/Orders";
import { Favorites } from "./pages/Favorites";
import { BuyerRFQs } from "./pages/BuyerRFQs";
import { Profile } from "./pages/Profile";

// admin
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProducts, AdminRequestedProducts, AdminSupplierProducts } from "./pages/admin/AdminProducts";
import { AdminSellers } from "./pages/admin/AdminSellers";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminReports } from "./pages/admin/AdminReports";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { AdminRFQs } from "./pages/admin/AdminRFQs";

// seller
import { SellerLayout } from "./pages/seller/SellerLayout";
import { SellerDashboard } from "./pages/seller/SellerDashboard";
import { SellerProducts } from "./pages/seller/SellerProducts";
import { SellerAdminRequests } from "./pages/seller/SellerAdminRequests";
import { SellerProductForm } from "./pages/seller/SellerProductForm";
import { SellerOrders } from "./pages/seller/SellerOrders";
import { SellerProfile } from "./pages/seller/SellerProfile";
import { SellerRFQs } from "./pages/seller/SellerRFQs";

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  return null;
}

function PublicLayout({ onOpenAuth }: { onOpenAuth: () => void }) {
  return (
    <>
      <Navbar onOpenAuth={onOpenAuth} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/categories" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/rfq" element={<RFQ />} />
          <Route path="/my-rfqs" element={<BuyerRFQs />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function AppContent() {
  const [authOpen, setAuthOpen] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const handler = () => setAuthOpen(true);
    window.addEventListener("openAuthModal", handler);
    return () => window.removeEventListener("openAuthModal", handler);
  }, []);

  // اگر در مسیر ادمین یا فروشنده هستیم، layout متفاوت
  const isAdminRoute = loc.pathname.startsWith("/admin");
  const isSellerRoute = loc.pathname.startsWith("/seller");

  if (loc.pathname === "/admin/login") {
    return <AdminLogin />;
  }

  if (isAdminRoute) {
    return (
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/requests" element={<AdminRequestedProducts />} />
          <Route path="/admin/products/suppliers" element={<AdminSupplierProducts />} />
          <Route path="/admin/sellers" element={<AdminSellers />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/rfqs" element={<AdminRFQs />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    );
  }

  if (isSellerRoute) {
    return (
      <Routes>
        <Route element={<SellerLayout />}>
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/seller/products" element={<SellerProducts />} />
          <Route path="/seller/admin-requests" element={<SellerAdminRequests />} />
          <Route path="/seller/products/new" element={<SellerProductForm />} />
          <Route path="/seller/products/edit/:id" element={<SellerProductForm />} />
          <Route path="/seller/rfqs" element={<SellerRFQs />} />
          <Route path="/seller/orders" element={<SellerOrders />} />
          <Route path="/seller/profile" element={<SellerProfile />} />
        </Route>
      </Routes>
    );
  }

  return (
    <>
      <PublicLayout onOpenAuth={() => setAuthOpen(true)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}
