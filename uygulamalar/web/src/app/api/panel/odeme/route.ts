import { NextResponse } from "next/server";
import { isletmeKaydet, yoneticiModKontrol } from "@/lib/auth-server";
import { odemeBaslat } from "@/lib/odeme";
import { isletmePlanaUyum } from "@/lib/plan-kilit";
import { referans } from "@sofra/tema";
import type { Isletme, OdemeTipi, PlanId } from "@/lib/store";

export async function POST(req: Request) {
  const yetki = await yoneticiModKontrol();
  if (!yetki) {
    return NextResponse.json({ hata: "Şube yönetici oturumu gerekli" }, { status: 403 });
  }
  const { efektif, user } = yetki;

  const body = (await req.json()) as {
    planId: PlanId;
    odemeTipi: OdemeTipi;
    saglayici: "iyzico" | "paytr";
  };

  const isletme = efektif.isletme;

  if (body.planId === "ucretsiz") {
    isletme.abonelik = {
      ...isletme.abonelik,
      planId: "ucretsiz",
      odemeTipi: "aylik",
      odemeSaglayici: null,
      aktif: true,
      baslangic: Date.now(),
    };
    const uyumlu = isletmePlanaUyum(isletme);
    await isletmeKaydet(efektif.kayit.userId, uyumlu);
    return NextResponse.json({ ok: true, isletme: uyumlu, odeme: { mod: "simulasyon" } });
  }

  const qrReferans =
    isletme.abonelik.referansSlug &&
    isletme.abonelik.referansKaynak === referans.referansQr.kaynakDegeri;

  const sonuc = await odemeBaslat(
    body.saglayici,
    isletme.abonelik,
    body.planId,
    body.odemeTipi,
    user.email,
  );

  if (!sonuc.basarili) {
    return NextResponse.json({ hata: sonuc.mesaj }, { status: 402 });
  }

  const kalanIndirimAy =
    body.odemeTipi === "yillik" && qrReferans
      ? Math.max(isletme.abonelik.kalanIndirimAy, referans.referansBasinaAy)
      : isletme.abonelik.kalanIndirimAy;

  isletme.abonelik = {
    ...isletme.abonelik,
    planId: body.planId,
    odemeTipi: body.odemeTipi,
    odemeSaglayici: body.saglayici,
    kalanIndirimAy,
    aktif: true,
    baslangic: Date.now(),
  };

  const uyumlu = isletmePlanaUyum(isletme);
  await isletmeKaydet(efektif.kayit.userId, uyumlu);
  return NextResponse.json({ ok: true, isletme: uyumlu, odeme: sonuc });
}
