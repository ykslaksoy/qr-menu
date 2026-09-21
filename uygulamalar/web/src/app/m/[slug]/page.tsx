import { Suspense } from "react";
import { isletmeSlugIleGetir } from "@/lib/auth-server";
import { menuPlanBilgi } from "@/lib/plan-kilit";
import { urunuZenginlestir } from "@/lib/urun-secenekleri";
import MusteriMenuClient, { type MenuVeri } from "./MusteriMenu";

type Props = {
  params: Promise<{ slug: string }>;
};

async function menuVerisiGetir(slug: string): Promise<MenuVeri | null> {
  const sonuc = await isletmeSlugIleGetir(slug);
  if (!sonuc) return null;
  const { isletme } = sonuc;
  const plan = menuPlanBilgi(isletme);
  return {
    slug: isletme.slug,
    kafeAdi: isletme.kafeAdi,
    logoUrl: isletme.logoUrl ?? null,
    kapakUrl: isletme.kapakUrl ?? null,
    kategoriler: isletme.kategoriler,
    urunler: isletme.urunler.filter((u) => u.aktif).map(urunuZenginlestir),
    masalar: isletme.masalar,
    tema: isletme.tema,
    planId: plan.planId,
    filigran: plan.filigran,
    siparisAcik: plan.siparisAcik,
    adetAlti: plan.adetAlti,
  };
}

export default async function IsletmeMenuPage({ params }: Props) {
  const { slug } = await params;
  const baslangic = await menuVerisiGetir(slug);

  return (
    <Suspense fallback={<p className="p-8 text-sm opacity-60">Menü yükleniyor…</p>}>
      <MusteriMenuClient baslangicMenu={baslangic} baslangicHata={baslangic ? "" : "Menü bulunamadı"} />
    </Suspense>
  );
}
