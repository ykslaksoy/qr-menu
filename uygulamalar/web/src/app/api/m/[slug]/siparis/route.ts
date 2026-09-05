import { NextResponse } from "next/server";
import {
  isletmeAtomikGuncelle,
  isletmePersonelKontrol,
  isletmeSlugIleGetir,
} from "@/lib/auth-server";
import { canliYayin } from "@/lib/canli-bus";
import { GARSON_DURUMLAR, MUTFAK_DURUMLAR, siparisApiModu } from "@/lib/mod";
import { siparisKabulEdilirMi } from "@/lib/plan-kilit";
import {
  adisyonaKalemEkle,
  adisyonaSerbestKalemEkle,
  adisyonKalemGuncelle,
  adisyonKalemSil,
  adisyonKalemIkram,
  adisyonIndirimUygula,
  adisyonTasi,
  adisyonBirlestir,
  adisyonBol,
  kasaOde,
  masaAcikAdisyon,
  masaCagriOlustur,
  stokGeriEkle,
  type OdemeKanal,
  type SiparisKanal,
  type SiparisKalemi,
} from "@/lib/store";

type Params = { params: Promise<{ slug: string }> };

export async function POST(req: Request, { params }: Params) {
  const { slug } = await params;
  const mevcut = await isletmeSlugIleGetir(slug);
  if (!mevcut) {
    return NextResponse.json({ hata: "İşletme bulunamadı" }, { status: 404 });
  }

  const body = (await req.json()) as {
    masaId: string;
    kalemler?: SiparisKalemi[];
    adisyonaEkle?: boolean;
    siparisId?: string;
    kanal?: SiparisKanal;
    serbestKalem?: {
      ad: string;
      fiyat: number;
      adet: number;
      not?: string;
      istasyon?: "bar" | "mutfak" | "tatli";
    };
    cagri?: "garson" | "hesap";
  };

  const personelIslem = Boolean(body.adisyonaEkle || body.serbestKalem);
  let mod = null;

  if (personelIslem) {
    const yetki = await isletmePersonelKontrol(slug, ["yonetici", "garson"]);
    if (!yetki) {
      return NextResponse.json({ hata: "Garson veya yönetici oturumu gerekli" }, { status: 401 });
    }
    mod = yetki.mod;
  }

  const kabul = siparisKabulEdilirMi(mevcut.isletme);
  if (!kabul.ok) {
    return NextResponse.json({ hata: kabul.hata }, { status: 403 });
  }

  if (body.cagri) {
    if (!body.masaId || (body.cagri !== "garson" && body.cagri !== "hesap")) {
      return NextResponse.json({ hata: "Geçersiz çağrı" }, { status: 400 });
    }
    try {
      const kayit = await isletmeAtomikGuncelle(slug, (isletme) =>
        masaCagriOlustur(isletme, body.masaId, body.cagri!),
      );
      if (!kayit) return NextResponse.json({ hata: "İşletme bulunamadı" }, { status: 404 });
      const masa = kayit.isletme.masalar.find((m) => m.id === body.masaId);
      canliYayin(slug, { tur: "cagri", masaAd: masa?.ad, ts: Date.now() });
      return NextResponse.json({ ok: true, tur: body.cagri, uyari: kabul.uyari });
    } catch {
      return NextResponse.json({ hata: "Çağrı kaydedilemedi — tekrar deneyin" }, { status: 409 });
    }
  }

  if (body.serbestKalem) {
    if (!siparisApiModu(mod, "serbestKalem")) {
      return NextResponse.json({ hata: "Serbest kalem yetkisi yok" }, { status: 403 });
    }
    if (!body.masaId || !body.serbestKalem.ad?.trim() || body.serbestKalem.fiyat < 0) {
      return NextResponse.json({ hata: "Geçersiz serbest kalem" }, { status: 400 });
    }
    try {
      const kayit = await isletmeAtomikGuncelle(slug, (isletme) =>
        adisyonaSerbestKalemEkle(
          isletme,
          body.masaId,
          body.serbestKalem!.ad,
          body.serbestKalem!.fiyat,
          body.serbestKalem!.adet || 1,
          body.siparisId,
          { not: body.serbestKalem!.not, istasyon: body.serbestKalem!.istasyon },
        ),
      );
      if (!kayit) return NextResponse.json({ hata: "İşletme bulunamadı" }, { status: 404 });
      const acik = masaAcikAdisyon(kayit.isletme, body.masaId);
      canliYayin(slug, { tur: "siparis", masaAd: acik?.masaAd, durum: acik?.durum, ts: Date.now() });
      return NextResponse.json({ ok: true, siparisId: acik?.id, uyari: kabul.uyari });
    } catch {
      return NextResponse.json({ hata: "Sipariş kaydedilemedi — tekrar deneyin" }, { status: 409 });
    }
  }

  if (!body.masaId || !body.kalemler?.length) {
    return NextResponse.json({ hata: "Sipariş boş" }, { status: 400 });
  }

  for (const k of body.kalemler) {
    const u = mevcut.isletme.urunler.find((x) => x.id === k.urunId);
    if (!u) continue;
    if (u.stokTakibi && u.kalanAdet < k.adet) {
      return NextResponse.json({ hata: `${u.ad} için yeterli stok yok` }, { status: 400 });
    }
  }

  const varsayilanKanal: SiparisKanal = body.adisyonaEkle
    ? body.kanal ?? "dokun"
    : body.kanal ?? "qr";
  const kalemler = body.kalemler.map((k) => ({
    ...k,
    kanal: k.kanal ?? varsayilanKanal,
  }));

  try {
    const kayit = await isletmeAtomikGuncelle(slug, (isletme) => {
      for (const k of kalemler) {
        const u = isletme.urunler.find((x) => x.id === k.urunId);
        if (u?.stokTakibi && u.kalanAdet < k.adet) {
          throw new Error(`STOK:${u.ad}`);
        }
      }
      // QR + garson + ses → aynı açık adisyona birleşir
      return adisyonaKalemEkle(isletme, body.masaId, kalemler, body.siparisId);
    });
    if (!kayit) return NextResponse.json({ hata: "İşletme bulunamadı" }, { status: 404 });
    const acik = masaAcikAdisyon(kayit.isletme, body.masaId);
    canliYayin(slug, { tur: "siparis", masaAd: acik?.masaAd, durum: acik?.durum, ts: Date.now() });
    return NextResponse.json({
      ok: true,
      siparisId: acik?.id ?? kayit.isletme.siparisler[0]?.id,
      uyari: kabul.uyari,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.startsWith("STOK:")) {
      return NextResponse.json({ hata: `${msg.slice(5)} için yeterli stok yok` }, { status: 400 });
    }
    return NextResponse.json({ hata: "Sipariş kaydedilemedi — tekrar deneyin" }, { status: 409 });
  }
}

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const yetki = await isletmePersonelKontrol(slug, ["yonetici", "garson", "mutfak"]);
  if (!yetki) {
    return NextResponse.json({ hata: "Personel oturumu gerekli" }, { status: 401 });
  }

  const aktif = yetki.efektif.isletme.siparisler.filter(
    (s) => !["iptal", "odendi"].includes(s.durum),
  );
  return NextResponse.json({ siparisler: aktif });
}

export async function PATCH(req: Request, { params }: Params) {
  const { slug } = await params;
  const yetki = await isletmePersonelKontrol(slug, ["yonetici", "garson", "mutfak"]);
  if (!yetki) {
    return NextResponse.json({ hata: "Personel oturumu gerekli" }, { status: 401 });
  }

  const { mod } = yetki;

  const body = (await req.json()) as {
    siparisId: string;
    durum?: string;
    kalemGuncelle?: { urunId: string; adet: number };
    kalemSil?: string;
    ikram?: { urunId: string; ikram: boolean };
    indirim?: { yuzde?: number; tl?: number };
    kasa?: { odemeler: { kanal: OdemeKanal; tutar: number }[]; bahsis?: number };
    tasi?: { masaId: string };
    birlestir?: { kaynakSiparisId: string };
    bol?: { kalemler: { urunId: string; adet: number }[]; masaId?: string };
  };

  if (!body.siparisId) {
    return NextResponse.json({ hata: "Sipariş kimliği gerekli" }, { status: 400 });
  }

  try {
    const kayit = await isletmeAtomikGuncelle(slug, (isletme) => {
      const siparis = isletme.siparisler.find((s) => s.id === body.siparisId);
      if (!siparis) throw new Error("YOK");

      if (body.kalemGuncelle) {
        if (!siparisApiModu(mod, "kalemDuzenle")) throw new Error("YETKI_KALEM");
        const sonucGuncelle = adisyonKalemGuncelle(
          isletme,
          body.siparisId,
          body.kalemGuncelle.urunId,
          body.kalemGuncelle.adet,
        );
        if (sonucGuncelle.hata) throw new Error(`HATA:${sonucGuncelle.hata}`);
        return sonucGuncelle.isletme;
      }

      if (body.kalemSil) {
        if (!siparisApiModu(mod, "kalemDuzenle")) throw new Error("YETKI_KALEM");
        const sonucSil = adisyonKalemSil(isletme, body.siparisId, body.kalemSil);
        if (sonucSil.hata) throw new Error(`HATA:${sonucSil.hata}`);
        return sonucSil.isletme;
      }

      if (body.ikram) {
        if (!siparisApiModu(mod, "kalemDuzenle")) throw new Error("YETKI_KALEM");
        const sonuc = adisyonKalemIkram(
          isletme,
          body.siparisId,
          body.ikram.urunId,
          body.ikram.ikram,
        );
        if (sonuc.hata) throw new Error(`HATA:${sonuc.hata}`);
        return sonuc.isletme;
      }

      if (body.indirim) {
        if (!siparisApiModu(mod, "kalemDuzenle")) throw new Error("YETKI_KALEM");
        const sonuc = adisyonIndirimUygula(isletme, body.siparisId, body.indirim);
        if (sonuc.hata) throw new Error(`HATA:${sonuc.hata}`);
        return sonuc.isletme;
      }

      if (body.kasa) {
        if (!siparisApiModu(mod, "kalemDuzenle")) throw new Error("YETKI_KALEM");
        const sonuc = kasaOde(isletme, body.siparisId, body.kasa);
        if (sonuc.hata) throw new Error(`HATA:${sonuc.hata}`);
        return sonuc.isletme;
      }

      if (body.tasi) {
        if (!siparisApiModu(mod, "kalemDuzenle")) throw new Error("YETKI_KALEM");
        const sonuc = adisyonTasi(isletme, body.siparisId, body.tasi.masaId);
        if (sonuc.hata) throw new Error(`HATA:${sonuc.hata}`);
        return sonuc.isletme;
      }

      if (body.birlestir) {
        if (!siparisApiModu(mod, "kalemDuzenle")) throw new Error("YETKI_KALEM");
        const sonuc = adisyonBirlestir(isletme, body.birlestir.kaynakSiparisId, body.siparisId);
        if (sonuc.hata) throw new Error(`HATA:${sonuc.hata}`);
        return sonuc.isletme;
      }

      if (body.bol) {
        if (!siparisApiModu(mod, "kalemDuzenle")) throw new Error("YETKI_KALEM");
        const sonuc = adisyonBol(isletme, body.siparisId, body.bol.kalemler, body.bol.masaId);
        if (sonuc.hata) throw new Error(`HATA:${sonuc.hata}`);
        return sonuc.isletme;
      }

      if (!body.durum) throw new Error("PARAM");

      if (mod === "mutfak") {
        if (!MUTFAK_DURUMLAR.has(body.durum) && body.durum !== "yeni") {
          throw new Error("YETKI_MUTFAK");
        }
      } else if (mod === "garson") {
        if (!GARSON_DURUMLAR.has(body.durum) && body.durum !== "hazir") {
          throw new Error("YETKI_GARSON");
        }
      }

      if (body.durum === "iptal" && siparis.stokDusuldu) {
        const geri = stokGeriEkle(isletme, siparis.kalemler);
        return {
          ...geri,
          siparisler: geri.siparisler.map((s) =>
            s.id === body.siparisId ? { ...s, durum: "iptal" as const, stokDusuldu: false } : s,
          ),
        };
      }

      return {
        ...isletme,
        siparisler: isletme.siparisler.map((s) =>
          s.id === body.siparisId ? { ...s, durum: body.durum as typeof s.durum } : s,
        ),
      };
    });

    if (!kayit) return NextResponse.json({ hata: "İşletme bulunamadı" }, { status: 404 });
    if (body.durum === "hazir") {
      const s = kayit.isletme.siparisler.find((x) => x.id === body.siparisId);
      canliYayin(slug, { tur: "hazir", masaAd: s?.masaAd, ts: Date.now() });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "YOK") return NextResponse.json({ hata: "Sipariş bulunamadı" }, { status: 404 });
    if (msg === "YETKI_KALEM") {
      return NextResponse.json({ hata: "Kalem düzenleme yetkisi yok" }, { status: 403 });
    }
    if (msg === "YETKI_MUTFAK") {
      return NextResponse.json({ hata: "Mutfak yalnızca al/hazır güncelleyebilir" }, { status: 403 });
    }
    if (msg === "YETKI_GARSON") {
      return NextResponse.json({ hata: "Geçersiz durum geçişi" }, { status: 403 });
    }
    if (msg === "PARAM") {
      return NextResponse.json({ hata: "Güncelleme parametresi gerekli" }, { status: 400 });
    }
    if (msg.startsWith("HATA:")) {
      return NextResponse.json({ hata: msg.slice(5) }, { status: 400 });
    }
    return NextResponse.json({ hata: "Sipariş kaydedilemedi — tekrar deneyin" }, { status: 409 });
  }
}
