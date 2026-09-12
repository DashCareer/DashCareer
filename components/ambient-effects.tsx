"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const REVEAL_SELECTOR = [
  ".hero-copy", ".today-card", ".page-intro", ".section-heading", ".subject-card",
  ".topic-card", ".tool-panel", ".control-card", ".dashboard-panel", ".stat-grid article",
  ".price-card", ".review-card", ".coverage-cta", ".founder-card", ".faq-module",
].join(",");

export function AmbientEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const updatePointer = (event: PointerEvent) => {
      root.style.setProperty("--pointer-x", `${event.clientX}px`);
      root.style.setProperty("--pointer-y", `${event.clientY}px`);
    };
    const updateScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      root.style.setProperty("--scroll-progress", `${max > 0 ? (window.scrollY / max) * 100 : 0}%`);
    };

    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    const revealItems = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR));
    revealItems.forEach((item, index) => {
      item.classList.add("reveal-item");
      item.style.setProperty("--reveal-delay", `${Math.min(index % 8, 5) * 45}ms`);
    });

    let observer: IntersectionObserver | null = null;
    if (!reducedMotion) {
      observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer?.unobserve(entry.target);
        }
      }), { threshold: 0.08, rootMargin: "0px 0px -28px" });
    }
    revealItems.forEach((item) => reducedMotion ? item.classList.add("is-visible") : observer?.observe(item));

    const tiltItems = Array.from(document.querySelectorAll<HTMLElement>("[data-tilt]"));
    const cleanups = tiltItems.map((item) => {
      const move = (event: PointerEvent) => {
        if (reducedMotion || event.pointerType === "touch") return;
        const rect = item.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        item.style.setProperty("--tilt-x", `${y * -4}deg`);
        item.style.setProperty("--tilt-y", `${x * 5}deg`);
      };
      const leave = () => {
        item.style.setProperty("--tilt-x", "0deg");
        item.style.setProperty("--tilt-y", "0deg");
      };
      item.addEventListener("pointermove", move);
      item.addEventListener("pointerleave", leave);
      return () => {
        item.removeEventListener("pointermove", move);
        item.removeEventListener("pointerleave", leave);
      };
    });

    return () => {
      observer?.disconnect();
      cleanups.forEach((cleanup) => cleanup());
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("scroll", updateScroll);
    };
  }, [pathname]);

  return (
    <div className="ambient-effects" aria-hidden="true">
      <span className="ambient-orb orb-one" />
      <span className="ambient-orb orb-two" />
      <span className="ambient-grid" />
      <span className="scroll-progress" />
    </div>
  );
}
