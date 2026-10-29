import { useEffect, useRef, useState } from "react";

/**
 * Scroll-aware visibility for the header.
 *
 *  - `atTop`  true while the page is within `topOffset` px of the top.
 *  - `hidden` true after the user has scrolled DOWN by more than
 *             `downThreshold` px since the last turning point, and false again
 *             as soon as they scroll UP by more than `upThreshold` px — from
 *             anywhere on the page, not only the top.
 *
 * Small movements (touchpad jitter, iOS rubber-banding at the top/bottom) are
 * ignored: the reference position only moves once a threshold is crossed.
 * One passive, rAF-throttled listener; cleaned up on unmount.
 *
 * @param {object}  o
 * @param {boolean} [o.disabled]  while true the header is forced visible
 *                                (e.g. the mobile menu is open).
 */
export default function useScrollDirection({
  topOffset = 8,
  downThreshold = 12,
  upThreshold = 6,
  disabled = false,
} = {}) {
  const [state, setState] = useState(() => ({
    atTop: (typeof window === "undefined" ? 0 : window.scrollY) <= topOffset,
    hidden: false,
  }));
  const anchor = useRef(typeof window === "undefined" ? 0 : window.scrollY);
  const ticking = useRef(false);
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  useEffect(() => {
    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const update = () => {
      ticking.current = false;
      // Clamp: iOS overscroll reports < 0 at the top and > max at the bottom.
      const y = Math.min(Math.max(window.scrollY, 0), maxScroll());
      const atTop = y <= topOffset;

      setState((prev) => {
        let hidden = prev.hidden;

        if (disabledRef.current || atTop) {
          hidden = false;
          anchor.current = y;
        } else {
          const delta = y - anchor.current;
          if (delta > downThreshold) { hidden = true;  anchor.current = y; }
          else if (delta < -upThreshold) { hidden = false; anchor.current = y; }
          else if (delta > 0 && !hidden) { /* still below threshold: keep anchor */ }
        }
        return prev.atTop === atTop && prev.hidden === hidden ? prev : { atTop, hidden };
      });
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(update);
    };

    anchor.current = window.scrollY;
    update(); // correct initial state (page reloaded part-way down)
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [topOffset, downThreshold, upThreshold]);

  // Opening the menu (or any interaction that sets `disabled`) shows the header.
  useEffect(() => {
    if (disabled) setState((p) => (p.hidden ? { ...p, hidden: false } : p));
  }, [disabled]);

  return state;
}
