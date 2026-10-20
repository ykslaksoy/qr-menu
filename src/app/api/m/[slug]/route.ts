import { NextResponse } from "next/server";
import { isletmeSlugIleGetir } from "@/lib/auth-server";
import { menuPlanBilgi } from "@/lib/plan-kilit";
import { varsayilanParaBirimiAyarlari } from "@/lib/para-birimi";
import { kvkkBirlestir } from "@/lib/kvkk-sablonlari";

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
    kapakUrl: isletme.kapakUrl ?? null,
    kategoriler: isletme.kategoriler,
    urunler: isletme.urunler.filter((u) => u.aktif),
    masalar: isletme.masalar,
    tema: isletme.tema,
    planId: plan.planId,
    odemePlanId: plan.odemePlanId,
    filigran: plan.filigran,
    siparisAcik: plan.siparisAcik,
    adetAlti: plan.adetAlti,
    paraBirimi: isletme.paraBirimi ?? varsayilanParaBirimiAyarlari(),
    kvkk: (() => {
      const k = kvkkBirlestir(isletme.kvkk);
      return k.yayinda
        ? { aydinlatmaMetni: k.aydinlatmaMetni, cerezMetni: k.cerezMetni }
        : null;
    })(),
  });
}
