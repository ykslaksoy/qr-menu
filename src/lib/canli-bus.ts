/** SSE / canlı olay otobüsü — personel ekranları (garson / mutfak). */

export type CanliOlay =
  | { tur: "siparis"; masaAd?: string; durum?: string; ts: number }
  | { tur: "cagri"; masaAd?: string; ts: number }
  | { tur: "hazir"; masaAd?: string; ts: number }
  | { tur: "ping"; ts: number };

type Dinleyici = (olay: CanliOlay) => void;

const aboneler = new Map<string, Set<Dinleyici>>();

export function canliAbone(slug: string, dinleyici: Dinleyici) {
  let set = aboneler.get(slug);
  if (!set) {
    set = new Set();
    aboneler.set(slug, set);
  }
  set.add(dinleyici);
  return () => {
    set!.delete(dinleyici);
    if (set!.size === 0) aboneler.delete(slug);
  };
}

export function canliYayin(slug: string, olay: CanliOlay) {
  const set = aboneler.get(slug);
  if (!set) return;
  for (const d of set) {
    try {
      d(olay);
    } catch {
      /* dinleyici hatası yayını bozmasın */
    }
  }
}
