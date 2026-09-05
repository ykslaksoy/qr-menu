import {
  BASKI_DPI,
  BASKI_URUN_GORSEL_MM,
  EKRAN_DPI,
  EKRAN_URUN_GORSEL_MM,
  mmToPx,
} from "./baski-cozunurluk";

function mutlakUrl(url: string): string {
  if (url.startsWith("data:") || url.startsWith("http")) return url;
  const taban = typeof window !== "undefined" ? window.location.origin : "";
  return `${taban}${url.startsWith("/") ? url : `/${url}`}`;
}

/** SVG / görseli belirtilen DPI'da PNG data URL'e rasterize eder. */
export async function gorselRasterize(
  url: string,
  genislikMm: number,
  yukseklikMm: number,
  dpi = BASKI_DPI,
  seffafArkaPlan = false,
): Promise<string> {
  const w = mmToPx(genislikMm, dpi);
  const h = mmToPx(yukseklikMm, dpi);
  const img = await gorselYukleImg(url);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas desteklenmiyor");
  if (seffafArkaPlan) {
    ctx.clearRect(0, 0, w, h);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }

  const oran = Math.min(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * oran;
  const dh = img.naturalHeight * oran;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  return canvas.toDataURL("image/png");
}

/** Dijital menüde gösterilecek URL (72 dpi ekran sürümü). */
export function gorselEkranUrl(gorselUrl: string | null | undefined): string | null {
  if (!gorselUrl) return null;
  return gorselUrl;
}

/** PDF baskı için en iyi kaynak: yüklenen baskı sürümü veya orijinal. */
export function gorselBaskiKaynak(
  gorselUrl: string | null | undefined,
  gorselUrlBaski?: string | null,
): string | null {
  if (gorselUrlBaski) return gorselUrlBaski;
  return gorselUrl ?? null;
}

/** Baskı PDF'ine gömülecek raster görsel (300 dpi). */
export async function gorselBaskiRaster(
  gorselUrl: string | null | undefined,
  gorselUrlBaski?: string | null,
  boyutMm = BASKI_URUN_GORSEL_MM,
): Promise<string | null> {
  const kaynak = gorselBaskiKaynak(gorselUrl, gorselUrlBaski);
  if (!kaynak) return null;
  if (kaynak.startsWith("data:") && kaynak.includes("image/jpeg")) {
    return kaynak;
  }
  return gorselRasterize(kaynak, boyutMm, boyutMm, BASKI_DPI);
}

export const EKRAN_GORSEL_PX = mmToPx(EKRAN_URUN_GORSEL_MM, EKRAN_DPI);
export const BASKI_GORSEL_PX = mmToPx(BASKI_URUN_GORSEL_MM, BASKI_DPI);

function gorselYukleImg(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Görsel yüklenemedi"));
    img.src = mutlakUrl(url);
  });
}

/** Logo için en-boy oranı korunarak baskı rasterı. */
export async function logoBaskiRaster(
  logoUrl: string | null | undefined,
  logoUrlBaski?: string | null,
  maxGenislikMm = 28,
  maxYukseklikMm = 16,
): Promise<{ dataUrl: string; genislikMm: number; yukseklikMm: number } | null> {
  const kaynak = gorselBaskiKaynak(logoUrl, logoUrlBaski);
  if (!kaynak) return null;

  const img = await gorselYukleImg(kaynak);
  const oran = img.naturalWidth / img.naturalHeight;
  let genislikMm = maxGenislikMm;
  let yukseklikMm = genislikMm / oran;
  if (yukseklikMm > maxYukseklikMm) {
    yukseklikMm = maxYukseklikMm;
    genislikMm = yukseklikMm * oran;
  }

  const dataUrl = await gorselRasterize(kaynak, genislikMm, yukseklikMm, BASKI_DPI, true);
  return { dataUrl, genislikMm, yukseklikMm };
}
