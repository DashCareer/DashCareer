"use client";
import { useEffect } from "react";
export function ThemeBoot() {
  useEffect(() => {
    const applyTheme = () => { document.documentElement.dataset.theme = localStorage.getItem("dashcareer-theme") || "light"; };
    applyTheme();
    window.addEventListener("storage", applyTheme);
    window.addEventListener("dashcareer-theme", applyTheme);
    return () => { window.removeEventListener("storage", applyTheme); window.removeEventListener("dashcareer-theme", applyTheme); };
  }, []);
  return null;
}
