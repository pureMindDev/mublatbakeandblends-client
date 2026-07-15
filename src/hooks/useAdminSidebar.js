import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

/**
 * Shared mobile sidebar logic for all admin pages
 * (Dashboard, AdminOrders, AdminProducts).
 *
 * Returns:
 *   sidebarOpen   - boolean, whether the off-canvas sidebar is open
 *   toggleSidebar - call from the hamburger button
 *   closeSidebar  - call from the overlay / after navigating
 */
export function useAdminSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);
  const closeSidebar  = useCallback(() => setSidebarOpen(false), []);

  /* Close automatically on route change (e.g. tapping a nav link) */
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  /* Lock body scroll while the sidebar is open on mobile */
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return { sidebarOpen, toggleSidebar, closeSidebar };
}
