"use client";

import { useEffect, useRef } from "react";
import { siparisBipCal } from "@/lib/siparis-bip";
import type { CanliOlay } from "@/lib/canli-bus";

type Opts = {
  slug: string | undefined;
  enabled?: boolean;
  onOlay?: (olay: CanliOlay) => void;
  /** Yeni sipariş / çağrıda bip + toast callback */
  onBildirim?: (mesaj: string, tur: CanliOlay["tur"]) => void;
};

/** SSE + gizli sekmede Notification; bip farklı olaylarda. */
export function usePersonelCanli({ slug, enabled = true, onOlay, onBildirim }: Opts) {
  const onOlayRef = useRef(onOlay);
  const onBildirimRef = useRef(onBildirim);
  onOlayRef.current = onOlay;
  onBildirimRef.current = onBildirim;

  useEffect(() => {
    if (!slug || !enabled || typeof window === "undefined") return;

    let es: EventSource | null = null;
    let kapali = false;

    function baglan() {
      if (kapali) return;
      es = new EventSource(`/api/m/${slug}/canli`);
      es.onmessage = (ev) => {
        try {
          const olay = JSON.parse(ev.data) as CanliOlay;
          onOlayRef.current?.(olay);
          if (olay.tur === "ping") return;

          if (olay.tur === "siparis" || olay.tur === "cagri" || olay.tur === "hazir") {
            siparisBipCal();
            const mesaj =
              olay.tur === "cagri"
                ? `${olay.masaAd ?? "Masa"} çağrı`
                : olay.tur === "hazir"
                  ? `${olay.masaAd ?? "Masa"} hazır`
                  : `${olay.masaAd ?? "Masa"} yeni sipariş`;
            onBildirimRef.current?.(mesaj, olay.tur);

            if (document.visibilityState === "hidden" && "Notification" in window) {
              if (Notification.permission === "granted") {
                try {
                  new Notification("Sofra", { body: mesaj, tag: `sofra-${olay.tur}` });
                } catch {
                  /* */
                }
              } else if (Notification.permission === "default") {
                void Notification.requestPermission();
              }
            }
          }
        } catch {
          /* */
        }
      };
      es.onerror = () => {
        es?.close();
        es = null;
        if (!kapali) setTimeout(baglan, 3000);
      };
    }

    baglan();
    return () => {
      kapali = true;
      es?.close();
    };
  }, [slug, enabled]);
}
