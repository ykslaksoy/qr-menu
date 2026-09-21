import {
  adisyonToplam,
  siparisAktifMi,
  type Isletme,
  type Siparis,
  type SiparisKanal,
} from "@/lib/store";

export type RaporAralik = "bugun" | "7g" | "30g" | "tumu";

export function raporBaslangic(aralik: RaporAralik, simdi = Date.now()) {
  if (aralik === "bugun") {
    const d = new Date(simdi);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  if (aralik === "7g") return simdi - 7 * 86400000;
  if (aralik === "30g") return simdi - 30 * 86400000;
  return 0;
}

export function raporSiparisleri(isletme: Isletme, aralik: RaporAralik, simdi = Date.now()) {
  const bas = raporBaslangic(aralik, simdi);
  return isletme.siparisler.filter(
    (s) => (!s.tur || s.tur === "siparis") && s.olusturulma >= bas,
  );
}

function kalemCiro(s: Siparis) {
  return s.kalemler.reduce((a, k) => {
    if (k.ikram || k.urunId.startsWith("_")) return a;
    return a + k.fiyat * k.adet;
  }, 0);
}

export function satisOzet(siparisler: Siparis[]) {
  const odendi = siparisler.filter((s) => s.durum === "odendi");
  const acik = siparisler.filter(siparisAktifMi);
  const ciro = odendi.reduce((a, s) => a + adisyonToplam(s), 0);
  const brut = siparisler.reduce((a, s) => a + kalemCiro(s), 0);
  const ort = odendi.length ? ciro / odendi.length : 0;
  return {
    siparis: siparisler.length,
    odendi: odendi.length,
    acik: acik.length,
    ciro,
    brut,
    ortAdisyon: Math.round(ort * 100) / 100,
  };
}

export function urunSirasi(siparisler: Siparis[], limit = 10) {
  const map = new Map<string, { ad: string; adet: number; tutar: number }>();
  for (const s of siparisler) {
    for (const k of s.kalemler) {
      if (k.urunId.startsWith("_")) continue;
      const onceki = map.get(k.urunId) ?? { ad: k.ad, adet: 0, tutar: 0 };
      onceki.adet += k.adet;
      onceki.tutar += k.fiyat * k.adet * (k.ikram ? 0 : 1);
      map.set(k.urunId, onceki);
    }
  }
  return [...map.values()].sort((a, b) => b.adet - a.adet).slice(0, limit);
}

export function masaSirasi(siparisler: Siparis[]) {
  const map = new Map<string, { ad: string; adet: number; tutar: number }>();
  for (const s of siparisler) {
    const onceki = map.get(s.masaId) ?? { ad: s.masaAd, adet: 0, tutar: 0 };
    onceki.adet += 1;
    onceki.tutar += kalemCiro(s);
    map.set(s.masaId, onceki);
  }
  return [...map.values()].sort((a, b) => b.tutar - a.tutar);
}

export function kanalSirasi(siparisler: Siparis[]) {
  const map = new Map<string, { kanal: string; adet: number; tutar: number }>();
  for (const s of siparisler) {
    for (const k of s.kalemler) {
      if (k.urunId.startsWith("_")) continue;
      const kanal = k.kanal ?? "bilinmiyor";
      const onceki = map.get(kanal) ?? { kanal, adet: 0, tutar: 0 };
      onceki.adet += k.adet;
      onceki.tutar += k.ikram ? 0 : k.fiyat * k.adet;
      map.set(kanal, onceki);
    }
  }
  return [...map.values()].sort((a, b) => b.tutar - a.tutar);
}

export function odemeSirasi(siparisler: Siparis[]) {
  const map = new Map<string, number>();
  for (const s of siparisler) {
    if (s.durum !== "odendi") continue;
    for (const o of s.odemeler ?? []) {
      map.set(o.kanal, (map.get(o.kanal) ?? 0) + o.tutar);
    }
    if (!s.odemeler?.length && s.odemeKanal) {
      map.set(s.odemeKanal, (map.get(s.odemeKanal) ?? 0) + adisyonToplam(s));
    }
  }
  return [...map.entries()]
    .map(([kanal, tutar]) => ({ kanal, tutar }))
    .sort((a, b) => b.tutar - a.tutar);
}

/** Son 24 saatin saatlik ciro çubukları (ödendi). */
export function saatlikCiro(siparisler: Siparis[], simdi = Date.now()) {
  const bas = simdi - 24 * 3600000;
  const buckets = Array.from({ length: 24 }, (_, i) => ({ saat: i, tutar: 0, adet: 0 }));
  for (const s of siparisler) {
    if (s.durum !== "odendi" || s.olusturulma < bas) continue;
    const idx = Math.min(23, Math.floor((s.olusturulma - bas) / 3600000));
    const b = buckets[idx]!;
    b.tutar += adisyonToplam(s);
    b.adet += 1;
  }
  return buckets;
}

export function kanalEtiket(k: string) {
  const map: Record<string, string> = {
    qr: "QR",
    dokun: "Garson dokun",
    ses: "Sesli",
    serbest: "Serbest",
    bilinmiyor: "—",
    nakit: "Nakit",
    "kart-masa": "Kart",
    online: "Online",
  };
  return map[k] ?? k;
}

export function raporCsv(siparisler: Siparis[]) {
  const satirlar = [["masa", "durum", "zaman", "kalem", "adet", "fiyat", "kanal", "tutar"]];
  for (const s of siparisler) {
    for (const k of s.kalemler) {
      satirlar.push([
        s.masaAd,
        s.durum,
        new Date(s.olusturulma).toISOString(),
        k.ad,
        String(k.adet),
        String(k.fiyat),
        k.kanal ?? "",
        String(k.ikram ? 0 : k.fiyat * k.adet),
      ]);
    }
  }
  return satirlar.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}

export type { SiparisKanal };
