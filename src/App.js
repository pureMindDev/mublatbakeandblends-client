import React from "react";
import { useLocation } from "react-router-dom";
import Navbar        from "./components/Navbar/Navbar";
import Footer        from "./components/Footer/Footer";
import AppRoutes     from "./routes/AppRoutes";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import "./styles/global.css";

function App() {
  const { pathname } = useLocation();

  /* Hide Navbar and Footer on all /admin routes */
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <ErrorBoundary>
      {!isAdminPage && <Navbar />}
      <AppRoutes />
      {!isAdminPage && <Footer />}
    </ErrorBoundary>
  );
}

export default App;
