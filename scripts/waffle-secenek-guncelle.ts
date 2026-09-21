import { PrismaClient } from "@prisma/client";
import { uruneSecenekleriIsle } from "../src/lib/urun-secenekleri";
import type { Isletme } from "../src/lib/store";

const prisma = new PrismaClient();

async function main() {
  for (const slug of ["demo", "demo-besiktas", "demo-moda"]) {
    const kayit = await prisma.isletme.findUnique({ where: { slug } });
    if (!kayit) continue;
    const isletme = JSON.parse(kayit.veri) as Isletme;
    isletme.urunler = isletme.urunler.map((u) => {
      const guncel = uruneSecenekleriIsle(u);
      if (guncel.katalogId === "waffle" || /^waffle|wafl/i.test(guncel.ad)) {
        return { ...guncel, aciklama: "Üstüne istediğinizi seçin" };
      }
      return guncel;
    });
    await prisma.isletme.update({
      where: { id: kayit.id },
      data: { veri: JSON.stringify(isletme) },
    });
    const w = isletme.urunler.find((u) => u.katalogId === "waffle");
    console.log(
      slug,
      w ? { ad: w.ad, secenek: w.secenekler?.[0]?.secimler.length, aciklama: w.aciklama } : "yok",
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
