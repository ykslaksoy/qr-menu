import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ hata: "CRON_SECRET tanımlı değil" }, { status: 503 });
  }

  const url = new URL(req.url);
  const parametre = url.searchParams.get("secret");
  const baslik = req.headers.get("authorization");
  const bearer = baslik?.startsWith("Bearer ") ? baslik.slice(7) : null;
  const gelen = parametre ?? bearer;

  if (gelen !== secret) {
    return NextResponse.json({ hata: "Geçersiz secret" }, { status: 401 });
  }

  const [isletmeSayisi, kullaniciSayisi] = await Promise.all([
    prisma.isletme.count(),
    prisma.user.count(),
  ]);

  return NextResponse.json({
    ok: true,
    zaman: new Date().toISOString(),
    isletmeSayisi,
    kullaniciSayisi,
  });
}
