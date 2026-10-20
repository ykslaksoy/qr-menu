import { urunGorselOner } from "@sofra/tema";
import { idUret } from "@/lib/store";

export type PdfUrun = {
  ad: string;
  fiyat: number;
  aciklama?: string;
  kategoriAd?: string;
};

const KATEGORI_BASLIK_RE =
  /^(içecekler?|icecekler?|yemekler?|tatlılar?|tatlilar?|atıştırmalık|atistirmalik|kahvaltı|kahvalti|salatalar|pizzalar|burgerler|ana yemek|başlangıç|baslangic|sıcak|sicak|soğuk|soguk)\s*[:\-]?\s*$/i;

function kategoriBasligiMi(satir: string) {
  const s = satir.trim();
  if (s.length < 3 || s.length > 48) return false;
  if (KATEGORI_BASLIK_RE.test(s)) return true;
  if (/^\p{Lu}[\p{L}\s&'’-]{2,40}$/u.test(s) && !/\d/.test(s) && !/[₺$]/.test(s)) {
    const kelime = s.split(/\s+/).length;
    if (kelime <= 5) return true;
  }
  return false;
}

/** PDF/metin satırlarından menü çıkarımı (kural tabanlı + isteğe bağlı AI). */
export function menuMetniParse(metin: string): PdfUrun[] {
  const satirlar = metin
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const urunler: PdfUrun[] = [];
  const fiyatRe = /(\d{1,4}(?:[.,]\d{1,2})?)\s*(?:₺|TL|tl)?\s*$/;
  const noktaRe = /[\.\·…\-–—]{2,}\s*(\d{1,4}(?:[.,]\d{1,2})?)\s*(?:₺|TL|tl)?\s*$/;

  let aktifKategori: string | undefined;

  for (const satir of satirlar) {
    if (satir.length < 3) continue;
    if (kategoriBasligiMi(satir)) {
      aktifKategori = satir.replace(/[:\-]\s*$/, "").trim();
      continue;
    }
    if (/^(kategori|category|menü|menu)\b/i.test(satir) && satir.length < 40) {
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
      urunler.push({ ad, fiyat, aciklama: "", kategoriAd: aktifKategori });
    }
  }

  return urunler;
}

export function pdfUrunleriIsletmeyeEkle(
  varsayilanKategoriId: string,
  urunler: PdfUrun[],
  kategoriIdleri?: Map<string, string>,
) {
  return urunler.map((u) => {
    const oneri = urunGorselOner(u.ad);
    let kategoriId = varsayilanKategoriId;
    if (u.kategoriAd && kategoriIdleri?.has(u.kategoriAd.toLowerCase())) {
      kategoriId = kategoriIdleri.get(u.kategoriAd.toLowerCase())!;
    }
    return {
      id: idUret("urun"),
      kategoriId,
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
