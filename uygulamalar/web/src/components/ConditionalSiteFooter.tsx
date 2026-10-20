"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";

/** Pazarlama / genel sayfalarda alt bilgi; panel, menü ve istasyon ekranlarında gizli. */
export function ConditionalSiteFooter() {
  const pathname = usePathname() ?? "";

  const garsonEkrani = pathname === "/g" || pathname.startsWith("/g/");
  const mutfakEkrani = pathname === "/k" || pathname.startsWith("/k/");

  const gizle =
    pathname.startsWith("/panel") ||
    pathname.startsWith("/m/") ||
    garsonEkrani ||
    mutfakEkrani ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/subeler") ||
    pathname === "/mod";

  if (gizle) return null;
  return <SiteFooter />;
}
