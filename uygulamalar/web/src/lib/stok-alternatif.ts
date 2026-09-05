import type { Urun } from "./store";
import { urunTukendiMi } from "./store";

export type AlternatifUrun = Pick<Urun, "id" | "ad" | "kategoriId" | "fiyat" | "aktif" | "stokTakibi" | "kalanAdet">;

function normalize(metin: string) {
  return metin
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function kelimeler(metin: string) {
  return normalize(metin).split(" ").filter(Boolean);
}

function benzerlikSkoru(a: string, b: string) {
  const ka = kelimeler(a);
  const kb = kelimeler(b);
  if (!ka.length || !kb.length) return 0;
  let ortak = 0;
  for (const k of ka) {
    if (kb.some((x) => x.includes(k) || k.includes(x))) ortak++;
  }
  const tamEslesme = normalize(a) === normalize(b) ? 1 : 0;
  const icerme = normalize(b).includes(normalize(a)) || normalize(a).includes(normalize(b)) ? 0.5 : 0;
  return Math.max(tamEslesme, icerme, ortak / Math.max(ka.length, kb.length));
}

/** Stok yok / bulunamadı → aynı kategoride veya benzer isimde alternatifler. */
export function stokAlternatifleriBul(
  aranan: string,
  urunler: AlternatifUrun[],
  haricId?: string,
  kategoriId?: string,
  limit = 3,
): AlternatifUrun[] {
  const uygun = urunler.filter((u) => u.aktif && !urunTukendiMi(u as Urun) && u.id !== haricId);

  const skorlu = uygun
    .map((u) => ({
      u,
      skor:
        benzerlikSkoru(aranan, u.ad) +
        (kategoriId && u.kategoriId === kategoriId ? 0.35 : 0) +
        (kelimeler(aranan).some((k) => kelimeler(u.ad).includes(k)) ? 0.2 : 0),
    }))
    .filter((x) => x.skor > 0.15)
    .sort((a, b) => b.skor - a.skor);

  const sonuc = skorlu.slice(0, limit).map((x) => x.u);
  if (sonuc.length > 0) return sonuc;
  if (kategoriId) return uygun.filter((u) => u.kategoriId === kategoriId).slice(0, limit);
  return uygun.slice(0, limit);
}
