"use client";

import { IsletmeProvider } from "@/lib/IsletmeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <IsletmeProvider>{children}</IsletmeProvider>;
}
