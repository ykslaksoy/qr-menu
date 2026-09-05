import { NextResponse } from "next/server";
import { isletmeSlugIleGetir } from "@/lib/auth-server";
import { menuPlanBilgi } from "@/lib/plan-kilit";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const sonuc = await isletmeSlugIleGetir(slug);
  if (!sonuc) {
    return NextResponse.json({ hata: "İşletme bulunamadı" }, { status: 404 });
  }
  const { isletme } = sonuc;
  const plan = menuPlanBilgi(isletme);
  return NextResponse.json({
    slug: isletme.slug,
    kafeAdi: isletme.kafeAdi,
    logoUrl: isletme.logoUrl ?? null,
    kategoriler: isletme.kategoriler,
    urunler: isletme.urunler.filter((u) => u.aktif),
    masalar: isletme.masalar,
    tema: isletme.tema,
    planId: plan.planId,
    odemePlanId: plan.odemePlanId,
    filigran: plan.filigran,
    siparisAcik: plan.siparisAcik,
    adetAlti: plan.adetAlti,
  });
}
