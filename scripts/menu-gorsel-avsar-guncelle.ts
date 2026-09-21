import { PrismaClient } from "@prisma/client";
import { hazirMenuIlgiliUrunlerle } from "../src/lib/hazir-menu";
import { ornekIsletme, type Isletme } from "../src/lib/store";

const prisma = new PrismaClient();

async function guncelle(slug: string, ad: string) {
  const kayit = await prisma.isletme.findUnique({ where: { slug } });
  if (!kayit) {
    console.log("yok", slug);
    return;
  }
  const mevcut = JSON.parse(kayit.veri) as Isletme;
  const taze = hazirMenuIlgiliUrunlerle(ornekIsletme(ad, slug), "kafe", { gazliLimit: 6 });
  const guncel: Isletme = {
    ...mevcut,
    kafeAdi: ad,
    kategoriler: taze.kategoriler,
    urunler: taze.urunler,
    isletmeTipi: taze.isletmeTipi,
  };
  const adToId = new Map(guncel.urunler.map((u) => [u.ad, u.id]));
  guncel.siparisler = (mevcut.siparisler ?? []).map((s) => ({
    ...s,
    kalemler: s.kalemler.map((k) => ({
      ...k,
      urunId: adToId.get(k.ad) ?? k.urunId,
    })),
  }));
  await prisma.isletme.update({
    where: { id: kayit.id },
    data: { kafeAdi: ad, veri: JSON.stringify(guncel) },
  });
  const avsar = guncel.urunler.filter((u) => /avşar|avsar/i.test(u.ad)).map((u) => u.ad);
  const tatlilar = guncel.urunler
    .filter((u) => ["cheesecake", "brownie", "kruvasan", "cookie"].includes(u.katalogId ?? ""))
    .map((u) => `${u.ad}:${u.gorselUrl}`);
  console.log(slug, {
    urun: guncel.urunler.length,
    siparis: guncel.siparisler.length,
    avsar,
    tatlilar,
  });
}

async function main() {
  await guncelle("demo", "Cafe Ada Kadıköy");
  await guncelle("demo-besiktas", "Cafe Ada Beşiktaş");
  await guncelle("demo-moda", "Cafe Ada Moda");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
