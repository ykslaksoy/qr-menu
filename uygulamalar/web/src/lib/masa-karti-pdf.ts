import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import {
  BASKI_DPI,
  MASA_KARTI_TRIM,
  mmToPx,
  sayfaBoyutuTasmali,
  tasmaOfset,
  TASMA_MM,
} from "./baski-cozunurluk";
import { logoBaskiRaster } from "./gorsel-raster";

const QR_BOYUT_MM = 50;

function kesimCizgileri(doc: jsPDF, trim: { genislik: number; yukseklik: number }) {
  const o = tasmaOfset();
  const w = trim.genislik;
  const h = trim.yukseklik;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.1);
  doc.setLineDashPattern([1, 1], 0);
  doc.rect(o, o, w, h, "S");
  doc.setLineDashPattern([], 0);
}

function tasmaArkaPlan(doc: jsPDF, sayfa: ReturnType<typeof sayfaBoyutuTasmali>, renk: [number, number, number]) {
  doc.setFillColor(...renk);
  doc.rect(0, 0, sayfa.genislik, sayfa.yukseklik, "F");
}

export async function masaKartiPdfOlustur(opts: {
  kafeAdi: string;
  logoUrl?: string | null;
  logoUrlBaski?: string | null;
  masaAd: string;
  qrUrl: string;
  anaRenk?: string;
}) {
  const sayfa = sayfaBoyutuTasmali(MASA_KARTI_TRIM);
  const o = tasmaOfset();
  const trim = sayfa.trim;

  const qrPx = mmToPx(QR_BOYUT_MM, BASKI_DPI);
  const qrDataUrl = await QRCode.toDataURL(opts.qrUrl, {
    width: qrPx,
    margin: 2,
    color: { dark: "#1c1917", light: "#ffffff" },
  });

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [sayfa.genislik, sayfa.yukseklik],
  });

  tasmaArkaPlan(doc, sayfa, [243, 239, 230]);

  let baslikY = o + 12;
  const logo = await logoBaskiRaster(opts.logoUrl, opts.logoUrlBaski, 24, 12);
  if (logo) {
    const logoX = o + (trim.genislik - logo.genislikMm) / 2;
    doc.addImage(logo.dataUrl, "PNG", logoX, baslikY, logo.genislikMm, logo.yukseklikMm);
    baslikY += logo.yukseklikMm + 4;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(28, 25, 23);
  doc.text(opts.kafeAdi, o + trim.genislik / 2, baslikY + 6, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(opts.masaAd, o + trim.genislik / 2, baslikY + 14, { align: "center" });

  const qrX = o + (trim.genislik - QR_BOYUT_MM) / 2;
  const qrY = logo ? baslikY + 20 : o + 35;
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, QR_BOYUT_MM, QR_BOYUT_MM);

  doc.setFontSize(9);
  doc.text("Menüyü okutun", o + trim.genislik / 2, qrY + QR_BOYUT_MM + 10, { align: "center" });
  doc.setFontSize(7);
  doc.setTextColor(120, 113, 108);
  const kirpilmis = opts.qrUrl.length > 42 ? opts.qrUrl.slice(0, 40) + "…" : opts.qrUrl;
  doc.text(kirpilmis, o + trim.genislik / 2, qrY + QR_BOYUT_MM + 17, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(31, 111, 91);
  doc.text("Sofra", o + trim.genislik / 2, o + 128, { align: "center" });

  doc.setFontSize(6);
  doc.setTextColor(160, 160, 160);
  doc.text(
    `Baskı: ${BASKI_DPI} dpi · taşma payı ${TASMA_MM} mm · kesim ${trim.genislik}×${trim.yukseklik} mm`,
    o + trim.genislik / 2,
    o + trim.yukseklik - 4,
    { align: "center" },
  );

  kesimCizgileri(doc, trim);

  return doc;
}

export async function masaKartiPdfIndir(opts: {
  kafeAdi: string;
  logoUrl?: string | null;
  logoUrlBaski?: string | null;
  masaAd: string;
  qrUrl: string;
  anaRenk?: string;
}) {
  const doc = await masaKartiPdfOlustur(opts);
  doc.save(`${opts.kafeAdi.replace(/\s+/g, "-")}-${opts.masaAd.replace(/\s+/g, "-")}.pdf`);
}
