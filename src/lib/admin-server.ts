import { prisma } from "@/lib/prisma";
import { isletmeVeriParse, sifreHash } from "@/lib/auth-server";
import { adetAltiDurum, aylikSiparisSayisi, efektifPlanId } from "@/lib/plan-kilit";
import { idUret, ornekIsletme, type Isletme, type PlanId, type Siparis } from "@/lib/store";

export type IsletmeOzet = {
  id: string;
  slug: string;
  kafeAdi: string;
  email: string;
  planId: string;
  efektifPlan: string;
  aylikSiparis: number;
  kotaLimit: number;
  kotaAsildi: boolean;
  urunSayisi: number;
  masaSayisi: number;
  kayitTarihi: string;
};

export type AdminOzet = {
  toplamIsletme: number;
  toplamSiparisBuAy: number;
  kotaAsan: number;
  ucretsiz: number;
  odemeli: number;
};

function isletmeOzetUret(
  kayit: { id: string; slug: string; kafeAdi: string; createdAt: Date; veri: string },
  email: string,
): IsletmeOzet {
  const isletme = isletmeVeriParse(kayit.veri) as Isletme;
  const adet = adetAltiDurum(isletme);
  return {
    id: kayit.id,
    slug: kayit.slug,
    kafeAdi: kayit.kafeAdi,
    email,
    planId: isletme.abonelik.planId,
    efektifPlan: efektifPlanId(isletme),
    aylikSiparis: aylikSiparisSayisi(isletme.siparisler),
    kotaLimit: adet.limit,
    kotaAsildi: adet.limitAsildi,
    urunSayisi: isletme.urunler.length,
    masaSayisi: isletme.masalar.length,
    kayitTarihi: kayit.createdAt.toISOString(),
  };
}

export async function tumIsletmelerOzet(): Promise<{ isletmeler: IsletmeOzet[]; ozet: AdminOzet }> {
  const kayitlar = await prisma.isletme.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const isletmeler = kayitlar.map((k) => isletmeOzetUret(k, k.user.email));

  const ozet: AdminOzet = {
    toplamIsletme: isletmeler.length,
    toplamSiparisBuAy: isletmeler.reduce((a, i) => a + i.aylikSiparis, 0),
    kotaAsan: isletmeler.filter((i) => i.kotaAsildi && i.planId === "ucretsiz").length,
    ucretsiz: isletmeler.filter((i) => i.planId === "ucretsiz").length,
    odemeli: isletmeler.filter((i) => i.planId !== "ucretsiz").length,
  };

  return { isletmeler, ozet };
}

export type AdminIsletmeOlusturGirdi = {
  kafeAdi: string;
  slug: string;
  email: string;
  sifre: string;
  planId?: PlanId;
  ornekSiparis?: boolean;
};

export async function adminIsletmeOlustur(girdi: AdminIsletmeOlusturGirdi) {
  const email = girdi.email.toLowerCase().trim();
  const slug = girdi.slug.trim().toLowerCase();
  const planId = girdi.planId ?? "ucretsiz";

  const emailVar = await prisma.user.findUnique({ where: { email } });
  if (emailVar) {
    return { hata: "Bu e-posta kayıtlı", kod: 409 as const };
  }

  const slugVar = await prisma.isletme.findUnique({ where: { slug } });
  if (slugVar) {
    return { hata: "Bu slug kullanımda", kod: 409 as const };
  }

  let isletme = ornekIsletme(girdi.kafeAdi.trim(), slug, {
    abonelik: {
      planId,
      odemeTipi: "aylik",
      odemeSaglayici: null,
      kalanIndirimAy: 0,
      aktif: true,
      baslangic: planId !== "ucretsiz" ? Date.now() : null,
    },
  });

  if (girdi.ornekSiparis) {
    isletme = ornekSiparislerEkle(isletme, 3);
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await sifreHash(girdi.sifre),
      isletmeler: {
        create: {
          slug,
          kafeAdi: girdi.kafeAdi.trim(),
          veri: JSON.stringify(isletme),
        },
      },
    },
    include: { isletmeler: true },
  });

  return {
    ok: true as const,
    userId: user.id,
    email: user.email,
    slug,
    kafeAdi: girdi.kafeAdi.trim(),
    isletme,
  };
}

/** Admin panelinden demo sipariş verisi ekler (metrik testi). */
export function ornekSiparislerEkle(isletme: Isletme, adet = 3): Isletme {
  if (!isletme.urunler.length || !isletme.masalar.length) return isletme;

  const siparisler: Siparis[] = [];
  const simdi = Date.now();

  for (let i = 0; i < adet; i++) {
    const urun = isletme.urunler[i % isletme.urunler.length];
    const masa = isletme.masalar[i % isletme.masalar.length];
    siparisler.push({
      id: idUret("sip"),
      masaId: masa.id,
      masaAd: masa.ad,
      kalemler: [{ urunId: urun.id, ad: urun.ad, fiyat: urun.fiyat, adet: 1 + (i % 2) }],
      durum: i === 0 ? "yeni" : i === 1 ? "mutfak" : "odendi",
      olusturulma: simdi - i * 3600000,
      stokDusuldu: true,
    });
  }

  return { ...isletme, siparisler: [...siparisler, ...isletme.siparisler] };
}

export async function adminOrnekSiparisEkle(slug: string) {
  const kayit = await prisma.isletme.findUnique({ where: { slug } });
  if (!kayit) return { hata: "İşletme bulunamadı", kod: 404 as const };

  const mevcut = isletmeVeriParse(kayit.veri);
  const guncel = ornekSiparislerEkle(mevcut, 3);

  await prisma.isletme.update({
    where: { slug },
    data: { veri: JSON.stringify(guncel) },
  });

  return { ok: true as const, eklenen: 3, slug, isletme: guncel };
}
