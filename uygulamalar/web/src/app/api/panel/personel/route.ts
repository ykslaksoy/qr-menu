import { NextResponse } from "next/server";
import type { IsletmeRol } from "@prisma/client";
import { sifreHash, yoneticiModKontrol } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

const IZINLI_ROLLER: IsletmeRol[] = ["GARSON", "MUTFAK", "YONETICI"];

export async function GET() {
  const yetki = await yoneticiModKontrol();
  if (!yetki) {
    return NextResponse.json({ hata: "Şube yönetici oturumu gerekli" }, { status: 403 });
  }
  const uyeler = await prisma.isletmeUye.findMany({
    where: { isletmeId: yetki.efektif.kayit.id },
    include: { user: { select: { id: true, email: true } } },
    orderBy: { rol: "asc" },
  });
  return NextResponse.json({
    uyeler: uyeler.map((u) => ({
      id: u.id,
      rol: u.rol,
      email: u.user.email,
      userId: u.user.id,
    })),
  });
}

/** Yeni personel daveti — kullanıcı yoksa oluşturur, şifre döner (ilk giriş). */
export async function POST(req: Request) {
  const yetki = await yoneticiModKontrol();
  if (!yetki) {
    return NextResponse.json({ hata: "Şube yönetici oturumu gerekli" }, { status: 403 });
  }

  const body = (await req.json()) as { email?: string; rol?: IsletmeRol; sifre?: string };
  const email = body.email?.trim().toLowerCase();
  const rol = body.rol;
  if (!email || !email.includes("@")) {
    return NextResponse.json({ hata: "Geçerli e-posta gerekli" }, { status: 400 });
  }
  if (!rol || !IZINLI_ROLLER.includes(rol)) {
    return NextResponse.json({ hata: "Rol: GARSON, MUTFAK veya YONETICI" }, { status: 400 });
  }

  const isletmeId = yetki.efektif.kayit.id;
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const geciciSifre = body.sifre?.trim() || `sofra-${Math.random().toString(36).slice(2, 10)}`;
    user = await prisma.user.create({
      data: {
        email,
        passwordHash: await sifreHash(geciciSifre),
      },
    });
    await prisma.isletmeUye.create({
      data: { isletmeId, userId: user.id, rol },
    });
    return NextResponse.json({
      ok: true,
      email,
      rol,
      yeniKullanici: true,
      geciciSifre,
      mesaj: "Kullanıcı oluşturuldu — geçici şifreyi personelle paylaşın",
    });
  }

  await prisma.isletmeUye.upsert({
    where: { isletmeId_userId: { isletmeId, userId: user.id } },
    create: { isletmeId, userId: user.id, rol },
    update: { rol },
  });

  return NextResponse.json({
    ok: true,
    email,
    rol,
    yeniKullanici: false,
    mesaj: "Personel rolü güncellendi",
  });
}
