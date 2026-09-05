import { NextResponse } from "next/server";
import { isletmeAtomikGuncelle, isletmeSlugIleGetir } from "@/lib/auth-server";
import { masaOdemeBaslat, masaOdemeSaglayici } from "@/lib/odeme";
import { siparisKabulEdilirMi } from "@/lib/plan-kilit";
import { adisyonKalan, masaAcikAdisyonlar, masaOnlineOde } from "@/lib/store";

type Params = { params: Promise<{ slug: string }> };

/** Açık masa hesabı (müşteri QR — kimlik doğrulama yok, yalnızca masaId). */
export async function GET(req: Request, { params }: Params) {
  const { slug } = await params;
  const mevcut = await isletmeSlugIleGetir(slug);
  if (!mevcut) {
    return NextResponse.json({ hata: "İşletme bulunamadı" }, { status: 404 });
  }

  const masaId = new URL(req.url).searchParams.get("masaId");
  if (!masaId) {
    return NextResponse.json({ hata: "masaId gerekli" }, { status: 400 });
  }

  const masa = mevcut.isletme.masalar.find((m) => m.id === masaId);
  if (!masa) {
    return NextResponse.json({ hata: "Masa bulunamadı" }, { status: 404 });
  }

  const aciklar = masaAcikAdisyonlar(mevcut.isletme, masaId);
  const acik = aciklar[0] ?? null;
  const araToplam = aciklar.reduce((a, s) => a + adisyonKalan(s), 0);
  const kalemler = aciklar.flatMap((s) => s.kalemler);

  return NextResponse.json({
    masaId: masa.id,
    masaAd: masa.ad,
    bos: !acik,
    siparisId: acik?.id ?? null,
    durum: acik?.durum ?? null,
    kalemler,
    araToplam,
    saglayici: masaOdemeSaglayici(),
    simulasyon: !process.env.IYZICO_API_KEY && !process.env.PAYTR_MERCHANT_ID,
  });
}

/** Masada kartla online ödeme. */
export async function POST(req: Request, { params }: Params) {
  const { slug } = await params;
  const mevcut = await isletmeSlugIleGetir(slug);
  if (!mevcut) {
    return NextResponse.json({ hata: "İşletme bulunamadı" }, { status: 404 });
  }

  const kabul = siparisKabulEdilirMi(mevcut.isletme);
  if (!kabul.ok) {
    return NextResponse.json({ hata: kabul.hata }, { status: 403 });
  }

  const body = (await req.json()) as {
    masaId?: string;
    bahsis?: number;
    saglayici?: "iyzico" | "paytr";
  };

  if (!body.masaId) {
    return NextResponse.json({ hata: "masaId gerekli" }, { status: 400 });
  }

  const aciklar = masaAcikAdisyonlar(mevcut.isletme, body.masaId);
  if (aciklar.length === 0) {
    return NextResponse.json({ hata: "Açık hesap yok" }, { status: 404 });
  }

  const bahsis = Math.max(0, Number(body.bahsis) || 0);
  const araToplam = aciklar.reduce((a, s) => a + adisyonKalan(s), 0);
  const toplam = araToplam + bahsis;

  const odeme = await masaOdemeBaslat(toplam, {
    saglayici: body.saglayici ?? masaOdemeSaglayici(),
    referans: `masa-${slug}-${aciklar[0]!.id}-${Date.now()}`,
  });

  if (!odeme.basarili) {
    return NextResponse.json({ hata: odeme.mesaj, odeme }, { status: 402 });
  }

  try {
    const kayit = await isletmeAtomikGuncelle(slug, (isletme) => {
      const sonuc = masaOnlineOde(isletme, body.masaId!, {
        bahsis,
        islemId: odeme.islemId,
        mod: odeme.mod,
        saglayici: odeme.saglayici,
      });
      if (sonuc.hata) throw new Error(sonuc.hata);
      return sonuc.isletme;
    });
    if (!kayit) return NextResponse.json({ hata: "İşletme bulunamadı" }, { status: 404 });

    return NextResponse.json({
      ok: true,
      araToplam,
      bahsis,
      toplam,
      odeme: {
        islemId: odeme.islemId,
        mod: odeme.mod,
        saglayici: odeme.saglayici,
        mesaj: odeme.mesaj,
      },
      uyari: kabul.uyari,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ödeme kaydedilemedi";
    if (msg === "Açık hesap yok") {
      return NextResponse.json({ hata: msg }, { status: 404 });
    }
    return NextResponse.json({ hata: "Ödeme kaydedilemedi — tekrar deneyin" }, { status: 409 });
  }
}
