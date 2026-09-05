/** Ekran (dijital menü) ve baskı (PDF) çözünürlük sabitleri. */

export const EKRAN_DPI = 72;
export const BASKI_DPI = 300;

/** Baskı taşma payı — her kenardan (mm). */
export const TASMA_MM = 3;

/** Dijital menüde ürün görseli fiziksel boyutu (mm @ 72 dpi). */
export const EKRAN_URUN_GORSEL_MM = 22;

/** Baskı PDF'de ürün görseli boyutu (mm @ 300 dpi). */
export const BASKI_URUN_GORSEL_MM = 18;

export const MASA_KARTI_TRIM = { genislik: 100, yukseklik: 140 } as const;
export const A4_TRIM = { genislik: 210, yukseklik: 297 } as const;
/** Masa adisyon fişi — A4 değil; blok / masa üstü baskı. */
export const ADISYON_TRIM = { genislik: 148, yukseklik: 210 } as const;

export function mmToPx(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi);
}

export function pxToMm(px: number, dpi: number): number {
  return (px / dpi) * 25.4;
}

/** Kesim ölçüsü + taşma payı ile PDF sayfa boyutu (mm). */
export function sayfaBoyutuTasmali(trim: { genislik: number; yukseklik: number }) {
  return {
    genislik: trim.genislik + TASMA_MM * 2,
    yukseklik: trim.yukseklik + TASMA_MM * 2,
    trim,
  };
}

/** Taşma paylı sayfada kesim alanı ofseti. */
export function tasmaOfset() {
  return TASMA_MM;
}
