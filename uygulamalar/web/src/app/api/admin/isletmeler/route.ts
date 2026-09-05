import { NextResponse } from "next/server";
import { adminIsletmeOlustur, tumIsletmelerOzet } from "@/lib/admin-server";
import { adminYetkiKontrol } from "@/lib/auth-server";
import type { PlanId } from "@/lib/store";

export async function GET() {
  const user = await adminYetkiKontrol();
  if (!user) {
    return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });
  }

  const { isletmeler, ozet } = await tumIsletmelerOzet();
  return NextResponse.json({ isletmeler, ozet });
}

export async function POST(req: Request) {
  const user = await adminYetkiKontrol();
  if (!user) {
    return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });
  }

  const body = (await req.json()) as {
    kafeAdi?: string;
    slug?: string;
    email?: string;
    sifre?: string;
    planId?: PlanId;
    ornekSiparis?: boolean;
  };

  if (!body.kafeAdi?.trim() || !body.slug?.trim() || !body.email?.trim() || !body.sifre) {
    return NextResponse.json({ hata: "Kafe adı, slug, e-posta ve şifre gerekli" }, { status: 400 });
  }

  if (body.sifre.length < 6) {
    return NextResponse.json({ hata: "Şifre en az 6 karakter olmalı" }, { status: 400 });
  }

  const sonuc = await adminIsletmeOlustur({
    kafeAdi: body.kafeAdi,
    slug: body.slug,
    email: body.email,
    sifre: body.sifre,
    planId: body.planId,
    ornekSiparis: body.ornekSiparis ?? true,
  });

  if ("hata" in sonuc) {
    return NextResponse.json({ hata: sonuc.hata }, { status: sonuc.kod });
  }

  return NextResponse.json(sonuc);
}
