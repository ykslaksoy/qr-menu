import { NextResponse } from "next/server";
import { isletmeAtomikGuncelle, isletmePersonelKontrol, isletmeSlugIleGetir } from "@/lib/auth-server";
import {
  masaCihazBagla,
  masaCihazKontrol,
  masaCihazOnayla,
  masaGarsonAc,
  masaGarsonKapat,
  masaGuvenlikAl,
} from "@/lib/masa-guvenlik";

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: Request, { params }: Params) {
  const { slug } = await params;
  const mevcut = await isletmeSlugIleGetir(slug);
  if (!mevcut) return NextResponse.json({ hata: "İşletme bulunamadı" }, { status: 404 });

  const url = new URL(req.url);
  const masaId = url.searchParams.get("masaId");
  const cihazId = url.searchParams.get("cihazId");
  if (!masaId || !cihazId) {
    return NextResponse.json({ hata: "masaId ve cihazId gerekli" }, { status: 400 });
  }

  const sonuc = masaCihazKontrol(mevcut.isletme, masaId, cihazId);
  return NextResponse.json({ ...sonuc, aktif: masaGuvenlikAl(mevcut.isletme).aktif });
}

export async function POST(req: Request, { params }: Params) {
  const { slug } = await params;
  const body = (await req.json()) as {
    islem: "bagla" | "garson-ac" | "garson-kapat" | "garson-onay";
    masaId: string;
    cihazId?: string;
  };

  if (!body.masaId) return NextResponse.json({ hata: "masaId gerekli" }, { status: 400 });

  if (body.islem === "bagla") {
    if (!body.cihazId) return NextResponse.json({ hata: "cihazId gerekli" }, { status: 400 });
    const mevcut = await isletmeSlugIleGetir(slug);
    if (!mevcut) return NextResponse.json({ hata: "İşletme bulunamadı" }, { status: 404 });

    const kontrol = masaCihazKontrol(mevcut.isletme, body.masaId, body.cihazId);
    if (kontrol.durum === "reddedildi") {
      return NextResponse.json({ hata: kontrol.mesaj }, { status: 403 });
    }
    if (kontrol.durum === "beklemede") {
      await isletmeAtomikGuncelle(slug, (i) => masaCihazBagla(i, body.masaId, body.cihazId!));
      return NextResponse.json({ ok: true, durum: "beklemede", mesaj: kontrol.mesaj });
    }

    await isletmeAtomikGuncelle(slug, (i) => masaCihazBagla(i, body.masaId, body.cihazId!));
    return NextResponse.json({ ok: true, durum: "izinli" });
  }

  const yetki = await isletmePersonelKontrol(slug, ["yonetici", "garson"]);
  if (!yetki) return NextResponse.json({ hata: "Garson oturumu gerekli" }, { status: 401 });

  if (body.islem === "garson-ac") {
    await isletmeAtomikGuncelle(slug, (i) => masaGarsonAc(i, body.masaId));
    return NextResponse.json({ ok: true });
  }
  if (body.islem === "garson-kapat") {
    await isletmeAtomikGuncelle(slug, (i) => masaGarsonKapat(i, body.masaId));
    return NextResponse.json({ ok: true });
  }
  if (body.islem === "garson-onay" && body.cihazId) {
    await isletmeAtomikGuncelle(slug, (i) => masaCihazOnayla(i, body.masaId, body.cihazId!));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ hata: "Geçersiz işlem" }, { status: 400 });
}
