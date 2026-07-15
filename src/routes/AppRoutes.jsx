import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* Public pages */
import Home           from "../pages/Home/Home";
import Menu           from "../pages/Menu/Menu";
import Cart           from "../pages/Cart/Cart";
import Checkout       from "../pages/Checkout/Checkout";
import Success        from "../pages/Success/Success";
import Cancel         from "../pages/Cancel/Cancel";
import ProductDetails from "../pages/ProductDetails/ProductDetails";
import ReviewsPage    from "../pages/Reviews/ReviewsPage";
import SupportPage    from "../pages/Support/SupportPage";
import OrderTracking  from "../pages/OrderTracking/OrderTracking";
import NotFound       from "../pages/NotFound/NotFound";

/* Admin pages */
import AdminLogin    from "../pages/admin/AdminLogin/AdminLogin";
import AdminOrders   from "../pages/admin/Orders/AdminOrders";
import AdminProducts from "../pages/admin/AdminProducts/AdminProducts";
import Dashboard     from "../pages/admin/Dashboard/Dashboard";

/* Loader for auth-check state */
import Loader from "../components/Loader/Loader";

function PrivateRoute({ children }) {
  const { isAuthenticated, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
        <Loader message="Verifying session…" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin" replace />;
}

function AppRoutes() {
  return (
    <Routes>

      {/* ── PUBLIC ── */}
      <Route path="/"            element={<Home />} />
      <Route path="/menu"        element={<Menu />} />
      <Route path="/reviews"     element={<ReviewsPage />} />
      <Route path="/support"     element={<SupportPage />} />
      <Route path="/track"       element={<OrderTracking />} />
      <Route path="/cart"        element={<Cart />} />
      <Route path="/checkout"    element={<Checkout />} />
      <Route path="/success"     element={<Success />} />
      <Route path="/cancel"      element={<Cancel />} />
      <Route path="/product/:id" element={<ProductDetails />} />

      {/* ── ADMIN ── */}
      <Route path="/admin" element={<AdminLogin />} />

      <Route
        path="/admin/dashboard"
        element={<PrivateRoute><Dashboard /></PrivateRoute>}
      />
      <Route
        path="/admin/orders"
        element={<PrivateRoute><AdminOrders /></PrivateRoute>}
      />
      <Route
        path="/admin/products"
        element={<PrivateRoute><AdminProducts /></PrivateRoute>}
      />

      {/* ── 404 ── */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

export default AppRoutes;