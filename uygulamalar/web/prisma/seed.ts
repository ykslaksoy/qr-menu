import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ornekSiparislerEkle } from "../src/lib/admin-server";
import { hazirMenuIlgiliUrunlerle } from "../src/lib/hazir-menu";
import { idUret, ornekIsletme, type Isletme, type Siparis } from "../src/lib/store";
import { uruneSecenekleriIsle } from "../src/lib/urun-secenekleri";

const prisma = new PrismaClient();

function zenginSiparisler(isletme: Isletme, indeks: number): Isletme {
  let guncel = ornekSiparislerEkle(isletme, 4);
  guncel = {
    ...guncel,
    urunler: guncel.urunler.map((u) => {
      const s = uruneSecenekleriIsle(u);
      if (s.katalogId === "waffle") {
        return { ...s, aciklama: "Üstüne istediğinizi seçin" };
      }
      return s;
    }),
  };
  if (!guncel.urunler.length || !guncel.masalar.length) return guncel;

  const ekstra: Siparis[] = [];
  const simdi = Date.now();
  const durumlar = ["servis", "odendi", "odendi", "hazir", "odendi"] as const;
  for (let i = 0; i < 5; i++) {
    const urun = guncel.urunler[(i + indeks) % guncel.urunler.length];
    const urun2 = guncel.urunler[(i + indeks + 2) % guncel.urunler.length];
    const masa = guncel.masalar[(i + indeks) % guncel.masalar.length];
    ekstra.push({
      id: idUret("sip"),
      masaId: masa.id,
      masaAd: masa.ad,
      kalemler: [
        { urunId: urun.id, ad: urun.ad, fiyat: urun.fiyat, adet: 1 + (i % 3) },
        { urunId: urun2.id, ad: urun2.ad, fiyat: urun2.fiyat, adet: 1 },
      ],
      durum: durumlar[i % durumlar.length],
      olusturulma: simdi - (i + 1) * 2_700_000 - indeks * 600_000,
      stokDusuldu: true,
      tur: "siparis",
    });
  }

  // Demo Masa 1 — online ödeme denemesi için açık çok kalemli adisyon
  const masa1 = guncel.masalar[0];
  if (masa1 && indeks === 0) {
    const u0 = guncel.urunler.find((u) => /tost|latte|filtre/i.test(u.ad)) ?? guncel.urunler[0];
    const u1 = guncel.urunler.find((u) => /sandvi|omlet|çay|cay/i.test(u.ad)) ?? guncel.urunler[1];
    const u2 = guncel.urunler.find((u) => /cheesecake|brownie|waffle/i.test(u.ad)) ?? guncel.urunler[2];
    ekstra.unshift({
      id: idUret("sip"),
      masaId: masa1.id,
      masaAd: masa1.ad,
      kalemler: [
        { urunId: u0.id, ad: u0.ad, fiyat: u0.fiyat, adet: 2 },
        { urunId: u1.id, ad: u1.ad, fiyat: u1.fiyat, adet: 1 },
        { urunId: u2.id, ad: u2.ad, fiyat: u2.fiyat, adet: 1 },
      ],
      durum: "servis",
      olusturulma: simdi - 900_000,
      stokDusuldu: true,
      tur: "siparis",
    });
  }

  let siparisler = [...ekstra, ...guncel.siparisler];
  // Masa 1'de tek açık adisyon kalsın (ödeme demosu net olsun)
  if (masa1 && indeks === 0) {
    let masa1AcikTutuldu = false;
    siparisler = siparisler.map((s) => {
      if (s.masaId !== masa1.id || s.tur === "garson" || s.tur === "hesap" || s.tur === "odeme") {
        return s;
      }
      if (["yeni", "mutfak", "hazir", "servis"].includes(s.durum)) {
        if (!masa1AcikTutuldu) {
          masa1AcikTutuldu = true;
          return s;
        }
        return { ...s, durum: "odendi" as const };
      }
      return s;
    });
  }

  return { ...guncel, siparisler };
}


const URUN_FOTO: Record<string, string> = {
  "Filtre Kahve": "/gorseller/foto/filtre-kahve.jpg",
  Latte: "/gorseller/foto/latte.jpg",
  Americano: "/gorseller/foto/americano.jpg",
  Cappuccino: "/gorseller/foto/cappuccino.jpg",
  "Çay": "/gorseller/foto/cay.jpg",
  "Soğuk Kahve": "/gorseller/foto/soguk-kahve.jpg",
  Smoothie: "/gorseller/foto/smoothie.jpg",
  Limonata: "/gorseller/foto/limonata.jpg",
  Su: "/gorseller/foto/su.jpg",
  Tost: "/gorseller/foto/tost.jpg",
  "Sandviç": "/gorseller/foto/sandvic.jpg",
  Omlet: "/gorseller/foto/omlet.jpg",
  "Sucuklu Yumurta": "/gorseller/foto/sucuklu-yumurta.jpg",
  "Granola Bowl": "/gorseller/foto/granola-bowl.jpg",
  Cheesecake: "/gorseller/foto/cheesecake.jpg",
  Brownie: "/gorseller/foto/brownie.jpg",
  Kruvasan: "/gorseller/foto/kruvasan.jpg",
  Cookie: "/gorseller/foto/cookie.jpg",
  Dondurma: "/gorseller/foto/dondurma.jpg",
  Waffle: "/gorseller/foto/waffle.jpg",
  Espresso: "/gorseller/foto/espresso.jpg",
  "Sıcak Çikolata": "/gorseller/foto/sicak-cikolata.jpg",
  Salata: "/gorseller/foto/salata.jpg",
  "Çorba": "/gorseller/foto/corba.jpg",
};

const KAT_FOTO: Record<string, string> = {
  "Atıştırmalık": "/gorseller/foto/kat-atistirmalik.jpg",
  "İçecekler": "/gorseller/foto/kat-icecekler.jpg",
  Tatlılar: "/gorseller/foto/kat-tatlilar.jpg",
};

const KAT_SIRA: Record<string, number> = {
  "Atıştırmalık": 1,
  "İçecekler": 2,
  Tatlılar: 3,
};

/** Cafe Ada demo: Havanna kapak + foto kategori/ürün + ızgara varsayılan. */
function havannaDemoMenusu(isletme: Isletme): Isletme {
  const kategoriler = isletme.kategoriler
    .map((k) => ({
      ...k,
      gorselUrl: KAT_FOTO[k.ad] ?? k.gorselUrl ?? null,
      sira: KAT_SIRA[k.ad] ?? k.sira,
    }))
    .sort((a, b) => a.sira - b.sira);
  const urunler = isletme.urunler.map((u) => {
    const yol = URUN_FOTO[u.ad];
    return yol ? { ...u, gorselUrl: yol, gorselKaynak: "hazir" as const } : u;
  });
  return {
    ...isletme,
    kapakUrl: "/gorseller/foto/kapak-cafe.jpg",
    kategoriler,
    urunler,
    tema: {
      ...isletme.tema,
      duzenId: "photo-grid",
      anaRenk: "#1f6f5b",
      vurguRengi: "#c45c26",
      zeminRengi: "#f3efe6",
      zeminStili: "solid-warm",
    },
  };
}

async function main() {
  const email = "demo@sofra.app";
  const sifre = "demo1234";
  const slug = "demo";
  const kafeAdi = "Cafe Ada Kadıköy";

  const zincirEmail = "zincir@demo.sofra.app";
  const zincirSifre = "demo1234";

  const adminEmail = process.env.SOFRA_ADMIN_EMAIL ?? "admin@sofra.app";
  const adminSifre = "admin1234";

  const garsonEmail = "garson@demo.sofra.app";
  const mutfakEmail = "mutfak@demo.sofra.app";
  const personelSifre = "demo1234";

  await prisma.session.deleteMany({});
  await prisma.isletmeUye.deleteMany({});
  await prisma.isletme.deleteMany({});
  await prisma.zincir.deleteMany({});
  await prisma.user.deleteMany({});

  const menu = (ad: string, s: string, indeks: number) =>
    zenginSiparisler(
      hazirMenuIlgiliUrunlerle(ornekIsletme(ad, s), "kafe", { gazliLimit: 6 }),
      indeks,
    );

  const zincirUser = await prisma.user.create({
    data: {
      email: zincirEmail,
      passwordHash: await bcrypt.hash(zincirSifre, 10),
      zincir: {
        create: { ad: "Cafe Ada" },
      },
    },
    include: { zincir: true },
  });
  const zincirId = zincirUser.zincir!.id;

  const isletmeVeri = havannaDemoMenusu(menu(kafeAdi, slug, 0));
  const subeUser = await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(sifre, 10),
      isletmeler: {
        create: {
          slug,
          kafeAdi,
          veri: JSON.stringify(isletmeVeri),
          zincirId,
        },
      },
    },
    include: { isletmeler: true },
  });
  const isletmeId = subeUser.isletmeler[0]!.id;

  const besiktasVeri = menu("Cafe Ada Beşiktaş", "demo-besiktas", 1);
  await prisma.isletme.create({
    data: {
      slug: "demo-besiktas",
      kafeAdi: "Cafe Ada Beşiktaş",
      veri: JSON.stringify(besiktasVeri),
      userId: zincirUser.id,
      zincirId,
    },
  });

  const modaVeri = menu("Cafe Ada Moda", "demo-moda", 2);
  await prisma.isletme.create({
    data: {
      slug: "demo-moda",
      kafeAdi: "Cafe Ada Moda",
      veri: JSON.stringify(modaVeri),
      userId: zincirUser.id,
      zincirId,
    },
  });

  const garson = await prisma.user.create({
    data: {
      email: garsonEmail,
      passwordHash: await bcrypt.hash(personelSifre, 10),
      uyelikler: {
        create: { isletmeId, rol: "GARSON" },
      },
    },
  });

  const mutfak = await prisma.user.create({
    data: {
      email: mutfakEmail,
      passwordHash: await bcrypt.hash(personelSifre, 10),
      uyelikler: {
        create: { isletmeId, rol: "MUTFAK" },
      },
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminSifre, 10),
      platformAdmin: true,
    },
  });

  console.log("Seed OK:", {
    email,
    sifre,
    slug,
    urun: isletmeVeri.urunler.length,
    siparis: isletmeVeri.siparisler.length,
    kategori: isletmeVeri.kategoriler.map((k) => k.ad),
    userId: subeUser.id,
  });
  console.log("Zincir OK:", {
    email: zincirEmail,
    sifre: zincirSifre,
    zincir: "Cafe Ada",
    subeler: ["demo", "demo-besiktas", "demo-moda"],
    userId: zincirUser.id,
  });
  console.log("Garson OK:", { email: garsonEmail, sifre: personelSifre, userId: garson.id });
  console.log("Mutfak OK:", { email: mutfakEmail, sifre: personelSifre, userId: mutfak.id });
  console.log("Admin OK:", { email: adminEmail, sifre: adminSifre, userId: admin.id });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
