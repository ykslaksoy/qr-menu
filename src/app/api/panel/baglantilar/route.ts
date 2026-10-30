import { NextResponse } from "next/server";
import { yoneticiModKontrol } from "@/lib/auth-server";
import { BAGLANTI_ADLARI } from "@/lib/baglanti-adlari";

/** Yalnızca "tanımlı mı" bilgisini döner; değerler istemciye gönderilmez. */
export async function GET() {
  const yetki = await yoneticiModKontrol();
  if (!yetki) return NextResponse.json({ hata: "Şube yönetici oturumu gerekli" }, { status: 403 });
  const durum: Record<string, boolean> = {};
  for (const ad of BAGLANTI_ADLARI) durum[ad] = Boolean(process.env[ad]?.trim());
  durum.DATABASE_URL = process.env.DATABASE_URL?.startsWith("postgres") ?? false;
  return NextResponse.json(durum);
}
