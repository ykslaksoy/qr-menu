import { urunGorselOner } from "@sofra/tema";
import { idUret } from "@/lib/store";

export type PdfUrun = {
  ad: string;
  fiyat: number;
  aciklama?: string;
};

/** PDF/metin satırlarından basit menü çıkarımı (AI yok — kural tabanlı). */
export function menuMetniParse(metin: string): PdfUrun[] {
  const satirlar = metin
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const urunler: PdfUrun[] = [];
  const fiyatRe = /(\d{1,4}(?:[.,]\d{1,2})?)\s*(?:₺|TL|tl)?\s*$/;
  const noktaRe = /[\.\·…\-–—]{2,}\s*(\d{1,4}(?:[.,]\d{1,2})?)\s*(?:₺|TL|tl)?\s*$/;

  for (const satir of satirlar) {
    if (satir.length < 3) continue;
    if (/^(kategori|category|menü|menu|içecek|yemek|tatlı)/i.test(satir) && satir.length < 40) {
      continue;
    }

    let ad = satir;
    let fiyat = 0;

    const noktaEslesme = satir.match(noktaRe);
    if (noktaEslesme) {
      fiyat = parseFloat(noktaEslesme[1].replace(",", "."));
      ad = satir.replace(noktaRe, "").trim();
    } else {
      const fiyatEslesme = satir.match(fiyatRe);
      if (fiyatEslesme) {
        fiyat = parseFloat(fiyatEslesme[1].replace(",", "."));
        ad = satir.replace(fiyatRe, "").replace(/[-–—]\s*$/, "").trim();
      }
    }

    if (fiyat > 0 && ad.length >= 2 && fiyat < 10000) {
      urunler.push({ ad, fiyat, aciklama: "" });
    }
  }

  return urunler;
}

export function pdfUrunleriIsletmeyeEkle(
  mevcutKategoriId: string,
  urunler: PdfUrun[],
) {
  return urunler.map((u) => {
    const oneri = urunGorselOner(u.ad);
    return {
      id: idUret("urun"),
      kategoriId: mevcutKategoriId,
      ad: u.ad,
      fiyat: u.fiyat,
      aciklama: u.aciklama ?? "",
      stokTakibi: false,
      kalanAdet: 0,
      kritikSeviye: 5,
      aktif: true,
      gorselUrl: oneri?.yol ?? null,
      gorselKaynak: oneri ? ("hazir" as const) : null,
    };
  });
}
