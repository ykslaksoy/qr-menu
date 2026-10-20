import { NextResponse } from "next/server";
import { isletmeAtomikGuncelle } from "@/lib/auth-server";
import { menuGoruntulenmeKaydet } from "@/lib/menu-goruntulenme";

type Params = { params: Promise<{ slug: string }> };

export async function POST(req: Request, { params }: Params) {
  const { slug } = await params;
  let masa: string | null = null;
  try {
    const govde = (await req.json()) as { masa?: string | null };
    masa = govde.masa ?? null;
  } catch {
    masa = null;
  }

  try {
    const sonuc = await isletmeAtomikGuncelle(slug, (onceki) =>
      menuGoruntulenmeKaydet(onceki, masa),
    );
    if (!sonuc) {
      return NextResponse.json({ hata: "İşletme bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ hata: "Kayıt başarısız" }, { status: 503 });
  }
}
