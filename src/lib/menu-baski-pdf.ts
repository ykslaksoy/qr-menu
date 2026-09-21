import { jsPDF } from "jspdf";
import {
  A4_TRIM,
  BASKI_DPI,
  BASKI_URUN_GORSEL_MM,
  sayfaBoyutuTasmali,
  tasmaOfset,
  TASMA_MM,
} from "./baski-cozunurluk";
import { gorselBaskiRaster, logoBaskiRaster } from "./gorsel-raster";
import type { Kategori, Urun } from "./store";

type MenuPdfOpts = {
  kafeAdi: string;
  logoUrl?: string | null;
  logoUrlBaski?: string | null;
  kategoriler: Kategori[];
  urunler: Urun[];
  anaRenk?: string;
};

function kesimCizgileri(doc: jsPDF, trim: { genislik: number; yukseklik: number }) {
  const o = tasmaOfset();
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.1);
  doc.setLineDashPattern([1, 1], 0);
  doc.rect(o, o, trim.genislik, trim.yukseklik, "S");
  doc.setLineDashPattern([], 0);
}

function yeniSayfa(doc: jsPDF, sayfa: ReturnType<typeof sayfaBoyutuTasmali>) {
  doc.addPage([sayfa.genislik, sayfa.yukseklik], "portrait");
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, sayfa.genislik, sayfa.yukseklik, "F");
  kesimCizgileri(doc, sayfa.trim);
}

export async function menuBaskiPdfOlustur(opts: MenuPdfOpts) {
  const sayfa = sayfaBoyutuTasmali(A4_TRIM);
  const o = tasmaOfset();
  const trim = sayfa.trim;
  const kenar = o + 12;
  const icerikGenislik = trim.genislik - 24;
  const gorselMm = BASKI_URUN_GORSEL_MM;
  const satirYukseklik = gorselMm + 6;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [sayfa.genislik, sayfa.yukseklik],
  });

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, sayfa.genislik, sayfa.yukseklik, "F");
  kesimCizgileri(doc, trim);

  let y = kenar;

  const logo = await logoBaskiRaster(opts.logoUrl, opts.logoUrlBaski, 32, 18);
  if (logo) {
    const logoX = o + (trim.genislik - logo.genislikMm) / 2;
    doc.addImage(logo.dataUrl, "PNG", logoX, y, logo.genislikMm, logo.yukseklikMm);
    y += logo.yukseklikMm + 6;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(28, 25, 23);
  doc.text(opts.kafeAdi, o + trim.genislik / 2, y, { align: "center" });
  y += logo ? 10 : 14;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 113, 108);
  doc.text(
    `Menü baskı · ${BASKI_DPI} dpi · taşma payı ${TASMA_MM} mm · A4 kesim`,
    o + trim.genislik / 2,
    y,
    { align: "center" },
  );
  y += 10;

  const siraliKategoriler = [...opts.kategoriler].sort((a, b) => a.sira - b.sira);

  for (const kat of siraliKategoriler) {
    const urunler = opts.urunler.filter((u) => u.aktif && u.kategoriId === kat.id);
    if (urunler.length === 0) continue;

    if (y + 16 > o + trim.yukseklik - kenar) {
      yeniSayfa(doc, sayfa);
      y = kenar;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(31, 111, 91);
    doc.text(kat.ad, kenar, y);
    y += 8;

    for (const urun of urunler) {
      if (y + satirYukseklik > o + trim.yukseklik - kenar) {
        yeniSayfa(doc, sayfa);
        y = kenar;
      }

      if (urun.gorselUrl) {
        const raster = await gorselBaskiRaster(urun.gorselUrl, urun.gorselUrlBaski, gorselMm);
        if (raster) {
          doc.addImage(raster, "PNG", kenar, y - 2, gorselMm, gorselMm);
        }
      }

      const metinX = kenar + (urun.gorselUrl ? gorselMm + 4 : 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(28, 25, 23);
      doc.text(urun.ad, metinX, y + 4);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(31, 111, 91);
      const fiyat = `${urun.fiyat.toLocaleString("tr-TR")} ₺`;
      doc.text(fiyat, o + trim.genislik - kenar, y + 4, { align: "right" });

      if (urun.aciklama?.trim()) {
        doc.setFontSize(8);
        doc.setTextColor(120, 113, 108);
        const satirlar = doc.splitTextToSize(urun.aciklama, icerikGenislik - gorselMm - 30);
        doc.text(satirlar.slice(0, 2), metinX, y + 10);
      }

      y += satirYukseklik;
    }

    y += 4;
  }

  return doc;
}

export async function menuBaskiPdfIndir(opts: MenuPdfOpts) {
  const doc = await menuBaskiPdfOlustur(opts);
  doc.save(`${opts.kafeAdi.replace(/\s+/g, "-")}-menu-baski.pdf`);
}
