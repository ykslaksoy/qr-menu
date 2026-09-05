"use client";

import { useEffect } from "react";
import { referansMenuQrKaydet } from "@/lib/referans";

/** Menü QR sayfası açılınca referans oturumunu kaydeder. */
export function MenuReferansKaydet({ slug }: { slug: string }) {
  useEffect(() => {
    referansMenuQrKaydet(slug);
  }, [slug]);
  return null;
}
