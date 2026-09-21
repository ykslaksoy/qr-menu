import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tumIsletmelerOzet } from "@/lib/admin-server";
import {
  efektifIsletmeGetir,
  efektifMod,
  isletmeAtomikGuncelle,
  isletmeKaydet,
  isletmeVeriParse,
  istekHttpsMi,
  mevcutKullanici,
  modDegistirebilirMi,
  modKaydet,
  modYonlendirmeYolu,
  oturumAc,
  oturumCookieleriniYaz,
  oturumKapat,
  oturumTokenOlustur,
  platformAdminMi,
  sifreDogrula,
  sifreHash,
  varsayilanMod,
  aktifSubeBitir,
} from "@/lib/auth-server";
import { MOD_ETIKET, type SofraMod } from "@/lib/mod";
import { efektifPlanId, isletmePlanaUyum, temaKaydetIzinli } from "@/lib/plan-kilit";
import { ornekIsletme, type Isletme } from "@/lib/store";

export async function GET() {
  const user = await mevcutKullanici();
  if (!user) {
    return NextResponse.json({ user: null, isletme: null });
  }

  const efektif = await efektifIsletmeGetir(user);
  const admin = platformAdminMi(user);
  const mod = await efektifMod(user);

  let adminOzet = null;
  if (admin && !efektif?.impersonating) {
    const { ozet } = await tumIsletmelerOzet();
    adminOzet = ozet;
  }

  const varsayilan = varsayilanMod(user);
  const modSecenekleri: SofraMod[] = [];
  if (admin) {
    if (efektif?.impersonating) {
      modSecenekleri.push("platform", "yonetici", "garson", "mutfak");
    } else {
      modSecenekleri.push("platform");
    }
  } else if (user.zincir) {
    if (efektif?.subeden) {
      modSecenekleri.push("zincir", "yonetici", "garson", "mutfak");
    } else {
      modSecenekleri.push("zincir");
    }
  } else if (user.isletmeler.length > 0) {
    modSecenekleri.push("yonetici", "garson", "mutfak");
  } else if (varsayilan === "garson") {
    modSecenekleri.push("garson");
  } else if (varsayilan === "mutfak") {
    modSecenekleri.push("mutfak");
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email, platformAdmin: admin },
    isletme: efektif?.isletme ?? null,
    mod,
    modEtiket: mod ? MOD_ETIKET[mod] : null,
    modSecenekleri: [...new Set(modSecenekleri)],
    impersonating:
      efektif?.impersonating || efektif?.subeden
        ? {
            slug: efektif.kayit.slug,
            kafeAdi: efektif.kayit.kafeAdi,
            subeden: efektif.subeden,
          }
        : null,
    adminOzet,
  });
}

export async function POST(req: Request) {
  const https = istekHttpsMi(req);
  const body = (await req.json()) as {
    action: "kayit" | "giris" | "cikis" | "mod";
    email?: string;
    sifre?: string;
    kafeAdi?: string;
    slug?: string;
    referansSlug?: string;
    referansKaynak?: string;
    mod?: SofraMod;
  };

  if (body.action === "cikis") {
    await oturumKapat();
    return NextResponse.json({ ok: true });
  }

  if (body.action === "mod") {
    const user = await mevcutKullanici();
    if (!user) {
      return NextResponse.json({ hata: "Oturum gerekli" }, { status: 401 });
    }
    if (!body.mod) {
      return NextResponse.json({ hata: "Mod gerekli" }, { status: 400 });
    }
    if (!(await modDegistirebilirMi(user, body.mod))) {
      return NextResponse.json({ hata: "Bu moda geçemezsiniz" }, { status: 403 });
    }
    if (body.mod === "zincir" || body.mod === "platform") {
      await aktifSubeBitir();
    }
    await modKaydet(body.mod, https);
    return NextResponse.json({
      ok: true,
      mod: body.mod,
      yonlendir: modYonlendirmeYolu(body.mod),
    });
  }

  if (body.action === "giris") {
    if (!body.email || !body.sifre) {
      return NextResponse.json({ hata: "E-posta ve şifre gerekli" }, { status: 400 });
    }
    const email = body.email.trim().toLowerCase();
    const sifre = body.sifre;
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        isletmeler: true,
        zincir: { include: { subeler: true } },
        uyelikler: { include: { isletme: true } },
      },
    });
    if (!user || !(await sifreDogrula(sifre, user.passwordHash))) {
      return NextResponse.json({ hata: "Geçersiz giriş" }, { status: 401 });
    }
    const mod = varsayilanMod(user);
    if (!mod) {
      return NextResponse.json({ hata: "Hesaba bağlı rol bulunamadı" }, { status: 403 });
    }
    const { token, expiresAt } = await oturumTokenOlustur(user.id);
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        isletmeler: true,
        zincir: { include: { subeler: true } },
        uyelikler: { include: { isletme: true } },
      },
    });
    const efektif = fullUser ? await efektifIsletmeGetir(fullUser) : null;
    const res = NextResponse.json({
      ok: true,
      isletme: efektif?.isletme ?? null,
      platformAdmin: platformAdminMi(user),
      mod,
      yonlendir: modYonlendirmeYolu(mod),
    });
    oturumCookieleriniYaz(res, token, expiresAt, mod, https);
    return res;
  }

  if (body.action === "kayit") {
    if (!body.email || !body.sifre || !body.kafeAdi || !body.slug) {
      return NextResponse.json({ hata: "Tüm alanlar gerekli" }, { status: 400 });
    }
    const email = body.email.toLowerCase();
    const mevcut = await prisma.user.findUnique({ where: { email } });
    if (mevcut) {
      return NextResponse.json({ hata: "Bu e-posta kayıtlı" }, { status: 409 });
    }
    const slugVar = await prisma.isletme.findUnique({ where: { slug: body.slug } });
    if (slugVar) {
      return NextResponse.json({ hata: "Bu slug kullanımda" }, { status: 409 });
    }

    const isletme = ornekIsletme(body.kafeAdi, body.slug, {
      abonelik: {
        planId: "ucretsiz",
        odemeTipi: "aylik",
        odemeSaglayici: null,
        kalanIndirimAy: 0,
        aktif: true,
        baslangic: null,
        referansSlug: body.referansSlug,
        referansKaynak: body.referansKaynak,
      },
    });

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await sifreHash(body.sifre),
        isletmeler: {
          create: {
            slug: body.slug,
            kafeAdi: body.kafeAdi,
            veri: JSON.stringify(isletme),
          },
        },
      },
      include: { isletmeler: true },
    });

    await oturumAc(user.id, "yonetici", https);
    return NextResponse.json({ ok: true, isletme });
  }

  return NextResponse.json({ hata: "Geçersiz işlem" }, { status: 400 });
}

export async function PUT(req: Request) {
  const user = await mevcutKullanici();
  if (!user) {
    return NextResponse.json({ hata: "Oturum gerekli" }, { status: 401 });
  }

  const mod = await efektifMod(user);
  if (mod !== "yonetici") {
    return NextResponse.json({ hata: "Yalnızca şube yönetici düzenleyebilir" }, { status: 403 });
  }

  const efektif = await efektifIsletmeGetir(user);
  if (!efektif) {
    return NextResponse.json({ hata: "İşletme bulunamadı" }, { status: 401 });
  }

  const isletme = (await req.json()) as Isletme;
  if (isletme.slug !== efektif.kayit.slug) {
    const baska = await prisma.isletme.findUnique({ where: { slug: isletme.slug } });
    if (baska) {
      return NextResponse.json({ hata: "Slug kullanımda" }, { status: 409 });
    }
  }
  // Siparişleri istemci gövdesinden alma — taze DB kaydı (deneme siparişleri silinmesin)
  const taze = await prisma.isletme.findUnique({ where: { id: efektif.kayit.id } });
  const mevcut = taze ? isletmeVeriParse(taze.veri) : efektif.isletme;
  const birlesik = { ...isletme, abonelik: mevcut.abonelik, siparisler: mevcut.siparisler };
  const planId = efektifPlanId(birlesik);
  const uyumluTema = temaKaydetIzinli(planId, mevcut.tema, isletme.tema);
  const kaydedilecek = isletmePlanaUyum({
    ...birlesik,
    tema: uyumluTema,
    kategoriler: isletme.kategoriler,
    urunler: isletme.urunler,
    masalar: isletme.masalar,
    kafeAdi: isletme.kafeAdi,
    slug: isletme.slug,
  });
  await isletmeKaydet(efektif.kayit.id, kaydedilecek);
  return NextResponse.json({ ok: true, isletme: kaydedilecek });
}
