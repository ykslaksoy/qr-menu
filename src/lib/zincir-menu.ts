import { prisma } from "@/lib/prisma";
import { isletmeVeriParse } from "@/lib/auth-server";

export type MenuGirisSube = {
  slug: string;
  kafeAdi: string;
  logoUrl: string | null;
};

export type MenuGirisZincir = {
  menuSlug: string;
  markaAd: string;
  subeler: MenuGirisSube[];
};

export async function zincirMenuGirisGetir(menuSlug: string): Promise<MenuGirisZincir | null> {
  const zincir = await prisma.zincir.findFirst({
    where: { menuSlug },
    include: {
      subeler: { orderBy: { kafeAdi: "asc" } },
    },
  });
  if (!zincir || zincir.subeler.length < 2) return null;

  const subeler: MenuGirisSube[] = zincir.subeler.map((s) => {
    const veri = isletmeVeriParse(s.veri);
    return {
      slug: s.slug,
      kafeAdi: s.kafeAdi,
      logoUrl: veri.logoUrl ?? null,
    };
  });

  return {
    menuSlug,
    markaAd: zincir.ad,
    subeler,
  };
}
