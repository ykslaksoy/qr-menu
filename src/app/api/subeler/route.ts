import { NextResponse } from "next/server";
import {
  aktifSubeBaslat,
  aktifSubeBitir,
  istekHttpsMi,
  mevcutKullanici,
  modKaydet,
  zincirModKontrol,
} from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

/** Zincir yöneticisi şubeye girer → şube yönetici modu. */
export async function POST(req: Request) {
  const user = await mevcutKullanici();
  if (!user?.zincir) {
    return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });
  }

  const body = (await req.json()) as { slug?: string };
  if (!body.slug) {
    return NextResponse.json({ hata: "slug gerekli" }, { status: 400 });
  }

  const hedef = await prisma.isletme.findFirst({
    where: { slug: body.slug, zincirId: user.zincir.id },
  });
  if (!hedef) {
    return NextResponse.json({ hata: "Şube bulunamadı" }, { status: 404 });
  }

  const https = istekHttpsMi(req);
  await aktifSubeBaslat(body.slug, https);
  await modKaydet("yonetici", https);
  return NextResponse.json({
    ok: true,
    slug: hedef.slug,
    kafeAdi: hedef.kafeAdi,
  });
}

/** Şubeden çık → zincir paneline dön. */
export async function DELETE(req: Request) {
  const user = await mevcutKullanici();
  if (!user?.zincir) {
    return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });
  }

  await aktifSubeBitir();
  await modKaydet("zincir", istekHttpsMi(req));
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const sonuc = await zincirModKontrol();
  if (!sonuc) {
    return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });
  }
  const subeler = sonuc.zincir.subeler.map((s) => ({
    id: s.id,
    slug: s.slug,
    kafeAdi: s.kafeAdi,
  }));
  return NextResponse.json({
    zincir: {
      id: sonuc.zincir.id,
      ad: sonuc.zincir.ad,
      menuSlug: sonuc.zincir.menuSlug,
    },
    subeler,
  });
}

/** Zincir menü giriş adresi (şube seçim ekranı). */
export async function PATCH(req: Request) {
  const user = await mevcutKullanici();
  if (!user?.zincir) {
    return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });
  }

  const body = (await req.json()) as { menuSlug?: string | null };
  const ham = (body.menuSlug ?? "").trim().toLowerCase();
  const menuSlug = ham.length ? ham.replace(/[^a-z0-9-]/g, "-") : null;

  if (menuSlug) {
    const cakisma = await prisma.zincir.findFirst({
      where: { menuSlug, NOT: { id: user.zincir.id } },
    });
    if (cakisma) {
      return NextResponse.json({ hata: "Bu menü adresi kullanılıyor" }, { status: 409 });
    }
    const isletmeCakisma = await prisma.isletme.findUnique({ where: { slug: menuSlug } });
    if (isletmeCakisma) {
      return NextResponse.json({ hata: "Bu adres bir şube slug ile çakışıyor" }, { status: 409 });
    }
  }

  const subeSay = await prisma.isletme.count({ where: { zincirId: user.zincir.id } });
  if (menuSlug && subeSay < 2) {
    return NextResponse.json(
      { hata: "Şube seçimi için en az 2 şube gerekir" },
      { status: 400 },
    );
  }

  const zincir = await prisma.zincir.update({
    where: { id: user.zincir.id },
    data: { menuSlug },
  });

  return NextResponse.json({
    ok: true,
    menuSlug: zincir.menuSlug,
    menuUrl: menuSlug ? `/m/${menuSlug}` : null,
  });
}
