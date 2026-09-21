import { NextResponse } from "next/server";
import {
  adminYetkiKontrol,
  impersonateBaslat,
  impersonateBitir,
  istekHttpsMi,
  isletmeSlugIleGetir,
  modKaydet,
} from "@/lib/auth-server";

export async function POST(req: Request) {
  const user = await adminYetkiKontrol();
  if (!user) {
    return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });
  }

  const body = (await req.json()) as { slug?: string };
  if (!body.slug) {
    return NextResponse.json({ hata: "slug gerekli" }, { status: 400 });
  }

  const hedef = await isletmeSlugIleGetir(body.slug);
  if (!hedef) {
    return NextResponse.json({ hata: "İşletme bulunamadı" }, { status: 404 });
  }

  const https = istekHttpsMi(req);
  await impersonateBaslat(body.slug, https);
  await modKaydet("yonetici", https);
  return NextResponse.json({
    ok: true,
    slug: hedef.kayit.slug,
    kafeAdi: hedef.kayit.kafeAdi,
    isletme: hedef.isletme,
  });
}

export async function DELETE(req: Request) {
  const user = await adminYetkiKontrol();
  if (!user) {
    return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });
  }

  await impersonateBitir();
  await modKaydet("platform", istekHttpsMi(req));
  return NextResponse.json({ ok: true });
}
