import { jsPDF } from "jspdf";
import {
  ADISYON_TRIM,
  BASKI_DPI,
  sayfaBoyutuTasmali,
  tasmaOfset,
  TASMA_MM,
} from "./baski-cozunurluk";
import { logoBaskiRaster } from "./gorsel-raster";
import type { SiparisKalemi } from "./store";

type AdisyonPdfOpts = {
  kafeAdi: string;
  logoUrl?: string | null;
  logoUrlBaski?: string | null;
  anaRenk?: string;
};

export type AdisyonCanliPdfOpts = AdisyonPdfOpts & {
  masaAd: string;
  kalemler: SiparisKalemi[];
  olusturulma?: number;
  indirimTl?: number;
  indirimYuzde?: number;
  bahsis?: number;
  odenen?: number;
  kalan?: number;
  araToplam?: number;
  adisyonId?: string;
};

function kesimCizgileri(doc: jsPDF, trim: { genislik: number; yukseklik: number }) {
  const o = tasmaOfset();
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.1);
  doc.setLineDashPattern([1, 1], 0);
  doc.rect(o, o, trim.genislik, trim.yukseklik, "S");
  doc.setLineDashPattern([], 0);
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  if (h.length !== 6) return [31, 111, 91];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function cizgi(doc: jsPDF, x1: number, y: number, x2: number) {
  doc.line(x1, y + 1, x2, y + 1);
}

export async function adisyonBaskiPdfOlustur(opts: AdisyonPdfOpts) {
  const sayfa = sayfaBoyutuTasmali(ADISYON_TRIM);
  const o = tasmaOfset();
  const trim = sayfa.trim;
  const kenar = o + 10;
  const sag = o + trim.genislik - 10;
  const genislik = sag - kenar;
  const markaRenk = hexToRgb(opts.anaRenk ?? "#1f6f5b");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [sayfa.genislik, sayfa.yukseklik],
  });

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, sayfa.genislik, sayfa.yukseklik, "F");
  kesimCizgileri(doc, trim);

  let y = kenar;

  const logo = await logoBaskiRaster(opts.logoUrl, opts.logoUrlBaski, 22, 12);
  if (logo) {
    const logoX = o + (trim.genislik - logo.genislikMm) / 2;
    doc.addImage(logo.dataUrl, "PNG", logoX, y, logo.genislikMm, logo.yukseklikMm);
    y += logo.yukseklikMm + 3;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(28, 25, 23);
  doc.text(opts.kafeAdi, o + trim.genislik / 2, y, { align: "center" });
  y += 6;

  doc.setFontSize(11);
  doc.setTextColor(...markaRenk);
  doc.text("ADİSYON", o + trim.genislik / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(68, 64, 60);

  doc.text("Masa:", kenar, y);
  cizgi(doc, kenar + 10, y, kenar + 38);
  doc.text("Garson:", kenar + 42, y);
  cizgi(doc, kenar + 56, y, sag);
  y += 7;

  doc.text("Tarih:", kenar, y);
  cizgi(doc, kenar + 10, y, kenar + 38);
  doc.text("Saat:", kenar + 42, y);
  cizgi(doc, kenar + 52, y, sag);
  y += 8;

  const kolonlar = [
    { etiket: "Ürün", x: kenar, w: genislik * 0.46 },
    { etiket: "Adet", x: kenar + genislik * 0.46, w: genislik * 0.14 },
    { etiket: "Fiyat", x: kenar + genislik * 0.6, w: genislik * 0.18 },
    { etiket: "Tutar", x: kenar + genislik * 0.78, w: genislik * 0.22 },
  ];

  doc.setFillColor(...markaRenk);
  doc.rect(kenar, y, genislik, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  for (const k of kolonlar) {
    const hiz = k.etiket === "Ürün" ? "left" : "right";
    const tx = k.etiket === "Ürün" ? k.x + 1.5 : k.x + k.w - 1.5;
    doc.text(k.etiket, tx, y + 4.2, { align: hiz });
  }

  y += 6;

  const satirSayisi = 12;
  const satirYukseklik = 7;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.15);

  for (let i = 0; i < satirSayisi; i++) {
    const satirY = y + i * satirYukseklik;
    doc.setFillColor(i % 2 === 0 ? 252 : 255, i % 2 === 0 ? 250 : 255, i % 2 === 0 ? 247 : 255);
    doc.rect(kenar, satirY, genislik, satirYukseklik, "F");
    doc.rect(kenar, satirY, genislik, satirYukseklik, "S");

    for (let c = 1; c < kolonlar.length; c++) {
      doc.line(kolonlar[c].x, satirY, kolonlar[c].x, satirY + satirYukseklik);
    }
  }

  y += satirSayisi * satirYukseklik + 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(68, 64, 60);

  const toplamEtiketleri = ["Ara Toplam", "İndirim", "Genel Toplam"];
  for (const etiket of toplamEtiketleri) {
    doc.text(`${etiket}:`, sag - 42, y);
    cizgi(doc, sag - 28, y, sag);
    y += 6;
  }

  y += 2;
  doc.text("Ödeme:", kenar, y);
  doc.text("☐ Nakit", kenar + 14, y);
  doc.text("☐ Kart", kenar + 34, y);
  doc.text("☐ Diğer", kenar + 52, y);
  y += 6;

  doc.text("Not:", kenar, y);
  cizgi(doc, kenar + 8, y, sag);

  doc.setFontSize(6.5);
  doc.setTextColor(168, 162, 158);
  doc.text(
    `Adisyon fişi · ${ADISYON_TRIM.genislik}×${ADISYON_TRIM.yukseklik} mm · ${BASKI_DPI} dpi · taşma ${TASMA_MM} mm`,
    o + trim.genislik / 2,
    o + trim.yukseklik - 6,
    { align: "center" },
  );

  return doc;
}

export async function adisyonBaskiPdfIndir(opts: AdisyonPdfOpts) {
  const doc = await adisyonBaskiPdfOlustur(opts);
  doc.save(`${opts.kafeAdi.replace(/\s+/g, "-")}-adisyon-baski.pdf`);
}

function tarihFormat(ts?: number) {
  const d = ts ? new Date(ts) : new Date();
  return {
    tarih: d.toLocaleDateString("tr-TR"),
    saat: d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
  };
}

function tlMetin(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺";
}

/** Açık dijital adisyondan doldurulmuş A5 fiş PDF */
export async function adisyonCanliPdfOlustur(opts: AdisyonCanliPdfOpts) {
  const sayfa = sayfaBoyutuTasmali(ADISYON_TRIM);
  const o = tasmaOfset();
  const trim = sayfa.trim;
  const kenar = o + 10;
  const sag = o + trim.genislik - 10;
  const genislik = sag - kenar;
  const markaRenk = hexToRgb(opts.anaRenk ?? "#1f6f5b");
  const { tarih, saat } = tarihFormat(opts.olusturulma);
  const araToplam =
    opts.araToplam ??
    opts.kalemler.reduce((a, k) => a + (k.ikram ? 0 : k.fiyat * k.adet), 0);
  const indirimTl = opts.indirimTl ?? 0;
  const indirimYuzde = opts.indirimYuzde ?? 0;
  const indirimTutar =
    indirimTl > 0 || indirimYuzde > 0
      ? Math.min(araToplam, (araToplam * indirimYuzde) / 100 + indirimTl)
      : 0;
  const bahsis = opts.bahsis ?? 0;
  const genel = Math.max(0, araToplam - indirimTutar) + bahsis;
  const odenen = opts.odenen;
  const kalan = opts.kalan;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [sayfa.genislik, sayfa.yukseklik],
  });

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, sayfa.genislik, sayfa.yukseklik, "F");
  kesimCizgileri(doc, trim);

  let y = kenar;

  const logo = await logoBaskiRaster(opts.logoUrl, opts.logoUrlBaski, 22, 12);
  if (logo) {
    const logoX = o + (trim.genislik - logo.genislikMm) / 2;
    doc.addImage(logo.dataUrl, "PNG", logoX, y, logo.genislikMm, logo.yukseklikMm);
    y += logo.yukseklikMm + 3;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(28, 25, 23);
  doc.text(opts.kafeAdi, o + trim.genislik / 2, y, { align: "center" });
  y += 6;

  doc.setFontSize(11);
  doc.setTextColor(...markaRenk);
  doc.text("ADİSYON", o + trim.genislik / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(68, 64, 60);
  doc.text(`Masa: ${opts.masaAd}`, kenar, y);
  doc.text(`${tarih}  ${saat}`, sag, y, { align: "right" });
  y += 5;
  if (opts.adisyonId) {
    doc.setFontSize(7);
    doc.setTextColor(120, 113, 108);
    doc.text(`No: ${opts.adisyonId}`, kenar, y);
    y += 5;
    doc.setFontSize(8);
    doc.setTextColor(68, 64, 60);
  } else {
    y += 3;
  }

  const kolonlar = [
    { etiket: "Ürün", x: kenar, w: genislik * 0.46 },
    { etiket: "Adet", x: kenar + genislik * 0.46, w: genislik * 0.14 },
    { etiket: "Fiyat", x: kenar + genislik * 0.6, w: genislik * 0.18 },
    { etiket: "Tutar", x: kenar + genislik * 0.78, w: genislik * 0.22 },
  ];

  doc.setFillColor(...markaRenk);
  doc.rect(kenar, y, genislik, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  for (const k of kolonlar) {
    const hiz = k.etiket === "Ürün" ? "left" : "right";
    const tx = k.etiket === "Ürün" ? k.x + 1.5 : k.x + k.w - 1.5;
    doc.text(k.etiket, tx, y + 4.2, { align: hiz });
  }
  y += 6;

  const satirYukseklik = 7;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(28, 25, 23);

  let satirIndex = 0;
  for (const k of opts.kalemler) {
    const ekler: string[] = [];
    if (k.ikram) ekler.push("ikram");
    if (k.urunId.startsWith("serbest")) ekler.push("serbest");
    const adTam =
      ekler.length > 0 ? `${k.ad} (${ekler.join(", ")})` : k.ad;
    const adSatirlari = doc.splitTextToSize(adTam, kolonlar[0].w - 3) as string[];
    const ozetSatirlari = k.secenekOzet
      ? (doc.splitTextToSize(k.secenekOzet, kolonlar[0].w - 3) as string[])
      : [];
    const satirSayisi = Math.max(1, adSatirlari.length + ozetSatirlari.length);
    const yuk = satirYukseklik * satirSayisi;

    const satirY = y;
    doc.setFillColor(
      satirIndex % 2 === 0 ? 252 : 255,
      satirIndex % 2 === 0 ? 250 : 255,
      satirIndex % 2 === 0 ? 247 : 255,
    );
    doc.rect(kenar, satirY, genislik, yuk, "F");
    doc.rect(kenar, satirY, genislik, yuk, "S");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(28, 25, 23);
    doc.text(adSatirlari[0] ?? adTam, kolonlar[0].x + 1.5, satirY + 4.5);
    let altY = satirY + 4.5;
    for (let i = 1; i < adSatirlari.length; i++) {
      altY += 3.5;
      doc.text(adSatirlari[i]!, kolonlar[0].x + 1.5, altY);
    }
    if (ozetSatirlari.length) {
      doc.setFontSize(6.5);
      doc.setTextColor(100, 100, 100);
      for (const os of ozetSatirlari) {
        altY += 3.5;
        doc.text(os, kolonlar[0].x + 1.5, altY);
      }
      doc.setFontSize(7.5);
      doc.setTextColor(28, 25, 23);
    }

    doc.text(String(k.adet), kolonlar[1].x + kolonlar[1].w - 1.5, satirY + 4.5, { align: "right" });
    doc.text(tlMetin(k.fiyat), kolonlar[2].x + kolonlar[2].w - 1.5, satirY + 4.5, {
      align: "right",
    });
    doc.text(
      tlMetin(k.ikram ? 0 : k.fiyat * k.adet),
      kolonlar[3].x + kolonlar[3].w - 1.5,
      satirY + 4.5,
      { align: "right" },
    );

    y += yuk;
    satirIndex++;
  }

  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(28, 25, 23);

  const ozetSatirlari: { etiket: string; deger: string; bold?: boolean }[] = [];
  if (opts.araToplam != null || indirimTutar > 0 || bahsis > 0 || odenen != null || kalan != null) {
    ozetSatirlari.push({ etiket: "Ara Toplam", deger: tlMetin(araToplam) });
  }
  if (indirimTutar > 0) {
    const etiket =
      indirimYuzde > 0 && indirimTl > 0
        ? `İndirim (%${indirimYuzde} + ${tlMetin(indirimTl)})`
        : indirimYuzde > 0
          ? `İndirim (%${indirimYuzde})`
          : "İndirim";
    ozetSatirlari.push({ etiket, deger: `−${tlMetin(indirimTutar)}` });
  }
  if (bahsis > 0) {
    ozetSatirlari.push({ etiket: "Bahşiş", deger: tlMetin(bahsis) });
  }
  if (odenen != null && odenen > 0) {
    ozetSatirlari.push({ etiket: "Ödenen", deger: tlMetin(odenen) });
  }
  if (kalan != null && (odenen ?? 0) > 0) {
    ozetSatirlari.push({ etiket: "Kalan", deger: tlMetin(kalan), bold: true });
  }
  ozetSatirlari.push({
    etiket: "Genel Toplam",
    deger: tlMetin(genel),
    bold: true,
  });

  for (const s of ozetSatirlari) {
    if (s.bold) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(s.etiket === "Genel Toplam" ? 10 : 8);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    }
    doc.text(`${s.etiket}:`, sag - 42, y);
    doc.text(s.deger, sag, y, { align: "right" });
    y += s.etiket === "Genel Toplam" ? 7 : 5.5;
  }

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(168, 162, 158);
  doc.text(
    `Dijital adisyon · ${ADISYON_TRIM.genislik}×${ADISYON_TRIM.yukseklik} mm`,
    o + trim.genislik / 2,
    o + trim.yukseklik - 6,
    { align: "center" },
  );

  return doc;
}

export async function adisyonCanliPdfIndir(opts: AdisyonCanliPdfOpts) {
  const doc = await adisyonCanliPdfOlustur(opts);
  const dosya = `${opts.kafeAdi.replace(/\s+/g, "-")}-${opts.masaAd.replace(/\s+/g, "-")}-adisyon.pdf`;
  doc.save(dosya);
}

export async function adisyonCanliPdfYazdir(opts: AdisyonCanliPdfOpts) {
  const doc = await adisyonCanliPdfOlustur(opts);
  doc.autoPrint();
  window.open(doc.output("bloburl"), "_blank");
}
