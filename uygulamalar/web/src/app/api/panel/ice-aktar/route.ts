import { NextResponse } from "next/server";
import { isletmeKaydet, yoneticiModKontrol } from "@/lib/auth-server";
import { ozellikAcikMiIsletme } from "@/lib/plan-kilit";
import { menuMetniAiParse } from "@/lib/menu-ai-parse";
import { menuMetniParse, pdfUrunleriIsletmeyeEkle } from "@/lib/pdf-menu-parser";
import { idUret, type Isletme } from "@/lib/store";

export async function POST(req: Request) {
  const yetki = await yoneticiModKontrol();
  if (!yetki) {
    return NextResponse.json({ hata: "Şube yönetici oturumu gerekli" }, { status: 403 });
  }
  const { efektif } = yetki;

  const form = await req.formData();
  const dosya = form.get("dosya") as File | null;
  const yapistir = form.get("metin") as string | null;

  let metin = yapistir?.trim() ?? "";

  if (dosya && dosya.size > 0) {
    const buf = Buffer.from(await dosya.arrayBuffer());
    if (dosya.type === "application/pdf" || dosya.name.endsWith(".pdf")) {
      try {
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse({ data: buf });
        const parsed = await parser.getText();
        metin = parsed.text;
        await parser.destroy();
      } catch {
        return NextResponse.json({ hata: "PDF okunamadı" }, { status: 400 });
      }
    } else {
      metin = buf.toString("utf-8");
    }
  }

  if (!metin) {
    return NextResponse.json({ hata: "Metin veya dosya gerekli" }, { status: 400 });
  }

  const aiUrunler = await menuMetniAiParse(metin);
  const bulunan = aiUrunler?.length ? aiUrunler : menuMetniParse(metin);
  if (!bulunan.length) {
    return NextResponse.json(
      { hata: "Ürün bulunamadı. Satır sonunda fiyat olmalı (ör. 90 TL)." },
      { status: 422 },
    );
  }

  const isletme = efektif.isletme;
  if (!ozellikAcikMiIsletme(isletme, "pdfIceAktar")) {
    return NextResponse.json(
      { hata: "PDF içe aktarma Menü planında" },
      { status: 403 },
    );
  }
  const katId = isletme.kategoriler[0]?.id;
  if (!katId) {
    return NextResponse.json({ hata: "Önce kategori ekleyin" }, { status: 400 });
  }

  const kategoriIdleri = new Map(
    isletme.kategoriler.map((k) => [k.ad.toLowerCase(), k.id]),
  );
  for (const u of bulunan) {
    if (!u.kategoriAd) continue;
    const key = u.kategoriAd.toLowerCase();
    if (!kategoriIdleri.has(key)) {
      const yeni = { id: idUret("kat"), ad: u.kategoriAd, sira: isletme.kategoriler.length + 1 };
      isletme.kategoriler.push(yeni);
      kategoriIdleri.set(key, yeni.id);
    }
  }

  const yeniUrunler = pdfUrunleriIsletmeyeEkle(katId, bulunan, kategoriIdleri);
  isletme.urunler = [...isletme.urunler, ...yeniUrunler];
  await isletmeKaydet(efektif.kayit.userId, isletme);

  return NextResponse.json({
    ok: true,
    eklenen: yeniUrunler.length,
    urunler: yeniUrunler,
    hamSatir: metin.split("\n").length,
    ai: Boolean(aiUrunler?.length),
    kategoriSayisi: isletme.kategoriler.length,
  });
}
