import {
  BASKI_DPI,
  BASKI_URUN_GORSEL_MM,
  EKRAN_DPI,
  EKRAN_URUN_GORSEL_MM,
  mmToPx,
} from "./baski-cozunurluk";

async function gorseliBoyutlandir(
  dosya: File,
  maxKenar: number,
  kalite: number,
  maxBytes = 350_000,
): Promise<string> {
  if (!dosya.type.startsWith("image/")) {
    throw new Error("Sadece görsel dosyası yükleyin");
  }
  if (dosya.size > 8 * 1024 * 1024) {
    throw new Error("Dosya en fazla 8 MB olmalı");
  }

  const bitmap = await createImageBitmap(dosya);
  const oran = Math.min(1, maxKenar / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * oran));
  const h = Math.max(1, Math.round(bitmap.height * oran));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas desteklenmiyor");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", kalite);
  if (dataUrl.length > maxBytes) {
    throw new Error("Görsel çok büyük; daha küçük bir fotoğraf deneyin");
  }
  return dataUrl;
}

/** Dijital menü için 72 dpi eşdeğeri (~22 mm). */
export async function gorseliSikistir(
  dosya: File,
  maxKenar = mmToPx(EKRAN_URUN_GORSEL_MM, EKRAN_DPI),
  kalite = 0.78,
): Promise<string> {
  return gorseliBoyutlandir(dosya, maxKenar, kalite, 180_000);
}

/** Baskı PDF için 300 dpi eşdeğeri (~18 mm ürün görseli). */
export async function gorseliBaskiSurumu(
  dosya: File,
  maxKenar = mmToPx(BASKI_URUN_GORSEL_MM, BASKI_DPI),
  kalite = 0.92,
): Promise<string> {
  return gorseliBoyutlandir(dosya, maxKenar, kalite, 900_000);
}

async function gorseliBoyutlandirPng(
  dosya: File,
  maxKenar: number,
  maxBytes = 400_000,
): Promise<string> {
  if (!dosya.type.startsWith("image/")) {
    throw new Error("Sadece görsel dosyası yükleyin");
  }
  if (dosya.size > 8 * 1024 * 1024) {
    throw new Error("Dosya en fazla 8 MB olmalı");
  }

  const bitmap = await createImageBitmap(dosya);
  const oran = Math.min(1, maxKenar / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * oran));
  const h = Math.max(1, Math.round(bitmap.height * oran));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas desteklenmiyor");
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/png");
  if (dataUrl.length > maxBytes) {
    throw new Error("Logo çok büyük; daha küçük bir görsel deneyin");
  }
  return dataUrl;
}

/** İşletme logosu — şeffaflık korunur (PNG). */
export async function logoYukle(dosya: File): Promise<{ ekran: string; baski: string }> {
  const [ekran, baski] = await Promise.all([
    gorseliBoyutlandirPng(dosya, 256, 200_000),
    gorseliBoyutlandirPng(dosya, 900, 1_200_000),
  ]);
  return { ekran, baski };
}

/** Ekran + baskı sürümlerini birlikte üretir. */
export async function gorselYukle(dosya: File): Promise<{ ekran: string; baski: string }> {
  const [ekran, baski] = await Promise.all([
    gorseliSikistir(dosya),
    gorseliBaskiSurumu(dosya),
  ]);
  return { ekran, baski };
}
