"use client";

import { IsletmeProvider, type IsletmeBaslangic } from "@/lib/IsletmeProvider";

/** Panel sunucu oturumunu client context'e aktarır — Yükleniyor beklemesi yok. */
export function PanelIsletmeProvider({
  children,
  baslangic,
}: {
  children: React.ReactNode;
  baslangic: IsletmeBaslangic;
}) {
  return <IsletmeProvider baslangic={baslangic}>{children}</IsletmeProvider>;
}
