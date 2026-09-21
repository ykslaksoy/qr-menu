/**
 * Seed Neşe Çay Evi (Rize → Rize) into the active sqlite DB without wiping Cafe Ada demos.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { idUret, varsayilanTema, type Isletme, type Kategori, type Urun } from "../src/lib/store";

const prisma = new PrismaClient();

type SeedUrun = { ad: string; fiyat: number; aciklama: string | null };
type SeedKat = { ad: string; urunler: SeedUrun[] };
type SeedFile = {
  isletme: string;
  sube: string;
  slug: string;
  tip: string;
  yonetici: { email: string; sifre: string; ad: string };
  kategoriler: SeedKat[];
};

function logoDataUrl(path: string): string {
  const buf = readFileSync(path);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

function buildIsletme(seed: SeedFile, logoUrl: string | null): Isletme {
  const kategoriler: Kategori[] = [];
  const urunler: Urun[] = [];

  seed.kategoriler.forEach((kat, i) => {
    const katId = idUret("kat");
    kategoriler.push({ id: katId, ad: kat.ad, sira: i + 1 });
    for (const u of kat.urunler) {
      urunler.push({
        id: idUret("urun"),
        kategoriId: katId,
        ad: u.ad,
        fiyat: u.fiyat,
        aciklama: u.aciklama ?? "",
        stokTakibi: false,
        kalanAdet: 0,
        kritikSeviye: 0,
        aktif: true,
        gorselUrl: null,
        gorselKaynak: null,
      });
    }
  });

  const kafeAdi = seed.isletme; // Neşe Çay Evi
  const tema = {
    ...varsayilanTema(),
    // Soft tea-house greens
    anaRenk: "#2d5a3d",
    vurguRengi: "#c4a35a",
    metinRengi: "#1c1917",
    zeminRengi: "#f7f3ea",
    zeminStili: "solid-warm",
    duzenId: "list" as const,
  };

  const isletme: Isletme = {
    kafeAdi,
    slug: seed.slug,
    logoUrl,
    logoUrlBaski: logoUrl,
    isletmeTipi: seed.tip || "kafe",
    menuBoyutId: null,
    kategoriler,
    urunler,
    masalar: [
      { id: idUret("masa"), ad: "Masa 1", sira: 1 },
      { id: idUret("masa"), ad: "Masa 2", sira: 2 },
      { id: idUret("masa"), ad: "Masa 3", sira: 3 },
      { id: idUret("masa"), ad: "Masa 4", sira: 4 },
      { id: idUret("masa"), ad: "Masa 5", sira: 5 },
      { id: idUret("masa"), ad: "Masa 6", sira: 6 },
    ],
    tema,
    siparisler: [],
    baskiTalepleri: [],
    stokHareketleri: [],
    abonelik: {
      planId: "tam",
      odemeTipi: "aylik",
      odemeSaglayici: null,
      kalanIndirimAy: 0,
      aktif: true,
      baslangic: Date.now(),
    },
    olusturulma: Date.now(),
  };

  return isletme;
}

async function main() {
  const seedPath = process.env.NESE_SEED ?? "/workspace/nese-cay-evi-rize-sofra-seed.json";
  const logoPath = process.env.NESE_LOGO ?? "/workspace/nese-cay-logo.png";

  const seed = JSON.parse(readFileSync(seedPath, "utf8")) as SeedFile;
  // Force branch to Rize (correct Rory typo in older seed copies)
  seed.sube = "R" + "ize";

  console.log("Seed meta:", {
    isletme: seed.isletme,
    sube: seed.sube,
    slug: seed.slug,
    cats: seed.kategoriler.map((k) => k.ad),
    nUrun: seed.kategoriler.reduce((n, k) => n + k.urunler.length, 0),
  });

  let logoUrl: string | null = null;
  try {
    logoUrl = logoDataUrl(logoPath);
    console.log("Logo OK, data URL length:", logoUrl.length);
  } catch (e) {
    console.warn("Logo missing, continuing without:", e);
  }

  const veri = buildIsletme(seed, logoUrl);
  // Embed sube note into kafeAdi display if useful — keep brand name clean
  // Optionally show "Neşe Çay Evi · Rize"
  veri.kafeAdi = seed.isletme;

  const email = seed.yonetici.email.toLowerCase().trim();
  const sifre = seed.yonetici.sifre;
  const slug = seed.slug.trim().toLowerCase();
  const kafeAdi = seed.isletme.trim();
  const passwordHash = await bcrypt.hash(sifre, 10);

  const mevcut = await prisma.isletme.findUnique({ where: { slug } });
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: { email, passwordHash },
    });
    console.log("Created user", email, user.id);
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    console.log("Updated user password", email, user.id);
  }

  const payload = {
    slug,
    kafeAdi,
    veri: JSON.stringify(veri),
    userId: user.id,
  };

  if (mevcut) {
    await prisma.isletme.update({
      where: { slug },
      data: { kafeAdi, veri: payload.veri, userId: user.id },
    });
    console.log("Updated isletme", slug, mevcut.id);
  } else {
    const created = await prisma.isletme.create({ data: payload });
    console.log("Created isletme", slug, created.id);
  }

  // Ensure membership as YONETICI
  const kayit = await prisma.isletme.findUnique({ where: { slug } });
  if (kayit) {
    await prisma.isletmeUye.upsert({
      where: { isletmeId_userId: { isletmeId: kayit.id, userId: user.id } },
      create: { isletmeId: kayit.id, userId: user.id, rol: "YONETICI" },
      update: { rol: "YONETICI" },
    });
  }

  const check = await prisma.isletme.findUnique({ where: { slug } });
  const parsed = JSON.parse(check!.veri) as Isletme;
  console.log("VERIFY:", {
    slug: check!.slug,
    kafeAdi: check!.kafeAdi,
    subeSeed: seed.sube,
    catCount: parsed.kategoriler.length,
    firstCats: parsed.kategoriler.slice(0, 3).map((k) => `${k.sira}:${k.ad}`),
    urunCount: parsed.urunler.length,
    hasLogo: Boolean(parsed.logoUrl),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
