import { NextResponse } from "next/server";
import { adminOrnekSiparisEkle } from "@/lib/admin-server";
import { adminYetkiKontrol } from "@/lib/auth-server";

type Params = { params: Promise<{ slug: string }> };

export async function POST(_req: Request, { params }: Params) {
  const user = await adminYetkiKontrol();
  if (!user) {
    return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });
  }

  const { slug } = await params;
  const sonuc = await adminOrnekSiparisEkle(slug);

  if ("hata" in sonuc) {
    return NextResponse.json({ hata: sonuc.hata }, { status: sonuc.kod });
  }

  return NextResponse.json(sonuc);
}
