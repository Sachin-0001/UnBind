"use client";

import { useEffect } from "react";

/**
 * Adds `.is-visible` to every `.reveal` element inside `root` (or the whole
 * document) as it scrolls into view, driving the CSS entrance animations in
 * globals.css. Runs once per element (unobserves after revealing) so content
 * doesn't re-animate on scroll-back.
 *
 * Pass a ref to scope it to one subtree; omit to scan the document. The
 * dependency list lets callers re-run the scan after conditional content
 * (e.g. a tab switch) mounts new `.reveal` nodes.
 */
export function useScrollReveal(
  ref?: React.RefObject<HTMLElement | null>,
  deps: unknown[] = [],
): void {
  useEffect(() => {
    const root = ref?.current ?? document;
    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)"),
    );
    if (nodes.length === 0) return;

    // Fallback: if IntersectionObserver is unavailable, just reveal everything.
    if (typeof IntersectionObserver === "undefined") {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
