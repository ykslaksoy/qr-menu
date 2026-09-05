"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Görünür ürün fotoğrafları arasında sırayla tek birini "canlı" tutar.
 * Hepsi birden oynamaz — göz yormayan ritim.
 */
export function useSiraliFotoCanli(urunIds: string[], intervalMs = 3800) {
  const [canliId, setCanliId] = useState<string | null>(null);
  const gorunenRef = useRef<Set<string>>(new Set());
  const idxRef = useRef(0);
  const idsRef = useRef(urunIds);
  idsRef.current = urunIds;
  const idsKey = urunIds.join("|");

  useEffect(() => {
    gorunenRef.current = new Set();
    idxRef.current = 0;
    if (!urunIds.length) {
      setCanliId(null);
      return;
    }
    setCanliId(urunIds[0] ?? null);

    const t = window.setInterval(() => {
      const all = idsRef.current;
      const gorunen = all.filter((id) => gorunenRef.current.has(id));
      const havuz = gorunen.length > 0 ? gorunen : all;
      if (!havuz.length) return;
      idxRef.current = (idxRef.current + 1) % havuz.length;
      setCanliId(havuz[idxRef.current] ?? null);
    }, intervalMs);

    return () => window.clearInterval(t);
    // idsKey: kategori değişince sıfırla
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, intervalMs]);

  const gorunurlukBildir = useCallback((id: string, gorunur: boolean) => {
    if (gorunur) gorunenRef.current.add(id);
    else gorunenRef.current.delete(id);
  }, []);

  return { canliId, gorunurlukBildir };
}
