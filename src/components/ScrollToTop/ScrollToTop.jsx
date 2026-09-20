import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets the window scroll position to the top on every route change.
 *
 * React Router doesn't touch scroll position when the route changes — the
 * browser just keeps whatever scrollY the previous page was left at. This
 * component has no UI (it renders nothing); it's mounted once inside the
 * Router and its only job is to call window.scrollTo(0, 0) whenever the
 * pathname changes, so every navigation — Navbar links, <Link>, buttons
 * using useNavigate(), programmatic redirects — always lands at the top of
 * the new page.
 *
 * It also switches off the browser's native scroll restoration. Without
 * that, using the back/forward buttons makes the browser try to restore
 * the OLD scroll position for that page at the same time this component's
 * effect is resetting it to the top — the two fight each other and you get
 * a visible jump/flicker. Setting `scrollRestoration` to "manual" hands
 * scroll handling entirely to this component, so every kind of navigation
 * (including back/forward) behaves the same predictable way: always top.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  // Take over scroll restoration from the browser once, on mount.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Reset to the top every time the route changes.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
