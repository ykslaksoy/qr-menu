import QRCode from "qrcode";
import { EKRAN_DPI, mmToPx } from "./baski-cozunurluk";

/** Ekran önizlemesi için QR boyutu (~35 mm @ 72 dpi). */
const EKRAN_QR_MM = 35;

export async function qrDataUrl(metin: string, boyut = mmToPx(EKRAN_QR_MM, EKRAN_DPI)): Promise<string> {
  return QRCode.toDataURL(metin, {
    width: boyut,
    margin: 2,
    color: { dark: "#1c1917", light: "#ffffff" },
  });
}

export function qrIndir(dataUrl: string, dosyaAdi: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = dosyaAdi;
  a.click();
}

export function menuQrUrl(slug: string, masaAd?: string, origin?: string) {
  const taban = origin ?? (typeof window !== "undefined" ? window.location.origin : "https://sofra.app");
  const q = masaAd ? `?masa=${encodeURIComponent(masaAd)}` : "";
  return `${taban}/m/${slug}${q}`;
}
