"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AnalyticsTracker({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  useEffect(() => {
    if (!signedIn) return;
    const timer = window.setTimeout(() => void fetch("/api/learning", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "track", event: "page_view", path: pathname }), keepalive: true }).catch(() => undefined), 800);
    return () => window.clearTimeout(timer);
  }, [pathname, signedIn]);
  return null;
}
