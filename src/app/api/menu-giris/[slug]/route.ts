import { NextResponse } from "next/server";
import { zincirMenuGirisGetir } from "@/lib/zincir-menu";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const giris = await zincirMenuGirisGetir(slug);
  if (!giris) {
    return NextResponse.json({ hata: "Menü girişi bulunamadı" }, { status: 404 });
  }
  return NextResponse.json(giris);
}
