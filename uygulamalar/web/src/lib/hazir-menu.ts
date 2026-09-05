import {
  hazirMenuUrunleriSec,
  isletmeTipBul,
  katalogUrunleriGetir,
  urunGorselBul,
  urunGorselOner,
} from "@sofra/tema";
import { idUret, type Isletme, type Kategori, type Urun } from "@/lib/store";
import {
  urunFromOzel,
  type OzelUrunTaslak,
} from "@/components/KatalogVeOzelUrunEkle";
import { uruneSecenekleriIsle } from "@/lib/urun-secenekleri";

/** Seçilen tip + boyuttan işletme menüsünü üretir (kategori + ürün + görsel). */
export function hazirMenuUygula(
  isletme: Isletme,
  tipId: string,
  boyutId: string,
  secenek: { mevcutuKoruyarakEkle?: boolean; ozelUrunler?: OzelUrunTaslak[] } = {},
): Isletme {
  const secim = hazirMenuUrunleriSec(tipId, boyutId);
  if (!secim) return isletme;

  const katMap = new Map<string, string>();
  const kategoriler: Kategori[] = secim.kategoriler.map((k, i) => {
    const id = idUret("kat");
    katMap.set(k.id, id);
    return { id, ad: k.ad, sira: i + 1 };
  });

  const yeniUrunler: Urun[] = secim.urunler.map((u) => {
    const gorsel = urunGorselBul(u.gorselId) ?? urunGorselOner(u.ad);
    const kategoriId =
      katMap.get(u.kategori) ??
      (u.kategori === "gazli" ? katMap.get("icecek") : undefined) ??
      kategoriler[0]!.id;
    return uruneSecenekleriIsle({
      id: idUret("urun"),
      kategoriId,
      ad: u.ad,
      fiyat: u.fiyat,
      aciklama: u.aciklama || "",
      stokTakibi: false,
      kalanAdet: 0,
      kritikSeviye: 5,
      aktif: true,
      gorselUrl: gorsel?.yol ?? null,
      gorselKaynak: gorsel ? "hazir" : null,
      katalogId: u.id,
      sayfa: u.sayfa,
    });
  });

  const ozelKat = kategoriler[0]!.id;
  const ozelEklenen: Urun[] = (secenek.ozelUrunler ?? []).map((t) =>
    urunFromOzel(t, ozelKat, idUret("urun")),
  );

  const tumUrunler = [...yeniUrunler, ...ozelEklenen];

  if (secenek.mevcutuKoruyarakEkle) {
    return {
      ...isletme,
      isletmeTipi: tipId,
      menuBoyutId: boyutId,
      kategoriler: [...isletme.kategoriler, ...kategoriler],
      urunler: [...isletme.urunler, ...tumUrunler],
    };
  }

  return {
    ...isletme,
    isletmeTipi: tipId,
    menuBoyutId: boyutId,
    kategoriler,
    urunler: tumUrunler,
  };
}

export function hazirMenuOnizleme(tipId: string, boyutId: string) {
  return hazirMenuUrunleriSec(tipId, boyutId);
}

/**
 * İşletme tipinin kategorilerine uyan ürünlerle menü doldurur.
 * Tip havuzundaki gazlı/yan ürün selini almaz — yalnızca ilgili kategoriler.
 * Avşar sodaları gazlı limitinde önceliklidir.
 */
export function hazirMenuIlgiliUrunlerle(
  isletme: Isletme,
  tipId: string,
  secenek: { gazliLimit?: number; oncelikliGazli?: string[] } = {},
): Isletme {
  const tip = isletmeTipBul(tipId);
  if (!tip) return isletme;

  const tipKatIds = new Set(tip.kategoriler.map((k) => k.id));
  const gazliLimit = secenek.gazliLimit ?? 4;
  const oncelik = secenek.oncelikliGazli ?? [
    "avsar-tuzlu-erikli-soda",
    "avsar-sade-maden-suyu",
    "avsar-limonata",
    "avsar-gazoz",
    "avsar-cool-lime",
    "avsar-karpuz-cilek",
  ];

  const havuz = katalogUrunleriGetir(tip.urunIds);
  const ilgili = havuz.filter((u) => tipKatIds.has(u.kategoriEtiket));
  const gazliHavuz = havuz.filter(
    (u) => u.kategoriEtiket === "gazli" && !tipKatIds.has("gazli"),
  );
  const oncelikli = oncelik
    .map((id) => gazliHavuz.find((u) => u.id === id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u));
  const diger = gazliHavuz.filter((u) => !oncelik.includes(u.id));
  const gazlilar = [...oncelikli, ...diger].slice(0, gazliLimit);

  const seciliIds = [
    ...ilgili.map((u) => u.id),
    ...gazlilar.map((u) => u.id),
  ];

  // Tip sırasını koru
  const siraliIds = tip.urunIds.filter((id) => seciliIds.includes(id));
  return hazirMenuUygulaSecili(isletme, tipId, siraliIds);
}

/** Seçili katalog id’lerinden menü üretir (havuz sırası korunur). */
export function hazirMenuUygulaSecili(
  isletme: Isletme,
  tipId: string,
  seciliIds: string[],
  secenek: { mevcutuKoruyarakEkle?: boolean; ozelUrunler?: OzelUrunTaslak[] } = {},
): Isletme {
  const tip = isletmeTipBul(tipId);
  if (!tip) return isletme;

  const siraliIds = tip.urunIds.filter((id) => seciliIds.includes(id));
  const katMap = new Map<string, string>();
  const kategoriler: Kategori[] = tip.kategoriler.map((k, i) => {
    const id = idUret("kat");
    katMap.set(k.id, id);
    return { id, ad: k.ad, sira: i + 1 };
  });

  const yeniUrunler: Urun[] = katalogUrunleriGetir(siraliIds).map((u) => {
    const gorsel = urunGorselBul(u.gorselId) ?? urunGorselOner(u.ad);
    const kategoriId =
      katMap.get(u.kategoriEtiket) ??
      (u.kategoriEtiket === "gazli" ? katMap.get("icecek") : undefined) ??
      kategoriler[0]!.id;
    return uruneSecenekleriIsle({
      id: idUret("urun"),
      kategoriId,
      ad: u.ad,
      fiyat: u.fiyat,
      aciklama: u.aciklama || "",
      stokTakibi: false,
      kalanAdet: 0,
      kritikSeviye: 5,
      aktif: true,
      gorselUrl: gorsel?.yol ?? null,
      gorselKaynak: gorsel ? "hazir" : null,
      katalogId: u.id,
      sayfa: null,
    });
  });

  const ozelKat = kategoriler[0]!.id;
  const ozelEklenen: Urun[] = (secenek.ozelUrunler ?? []).map((t) =>
    urunFromOzel(t, ozelKat, idUret("urun")),
  );

  const tumUrunler = [...yeniUrunler, ...ozelEklenen];

  if (secenek.mevcutuKoruyarakEkle) {
    return {
      ...isletme,
      isletmeTipi: tipId,
      menuBoyutId: isletme.menuBoyutId,
      kategoriler: [...isletme.kategoriler, ...kategoriler],
      urunler: [...isletme.urunler, ...tumUrunler],
    };
  }

  return {
    ...isletme,
    isletmeTipi: tipId,
    kategoriler,
    urunler: tumUrunler,
  };
}

export function seciliIdsSablonu(tipId: string, boyutId: string): string[] {
  const onizleme = hazirMenuUrunleriSec(tipId, boyutId);
  return onizleme?.urunler.map((u) => u.id) ?? [];
}

export { varsayilanMenuSablonu } from "@sofra/tema";
