import katalog from "./katalog.json";
import fiyatlar from "./fiyatlar.json";
import paketServisler from "./paket-servisler.json";
import referans from "./referans.json";
import planKilitleri from "./plan-kilitleri.json";
import adetAltiUcretsiz from "./adet-alti-ucretsiz.json";
import urunGorselleri from "./urun-gorselleri.json";
import isletmeMenuleri from "./isletme-menuleri.json";
import toplamUrunListesi from "./toplam-urun-listesi.json";
import karsilastirma from "./karsilastirma.json";
import superqrOzellikSkorlari from "./superqr-ozellik-skorlari.json";
import superqrEniyiSofra from "./superqr-eniyi-sofra.json";

export type Kategori = (typeof katalog.kategoriler)[number];
export type Sablon = (typeof katalog.sablonlar)[number];
export type PaketFirmasi = (typeof paketServisler.firmalar)[number];
export type PlanKilitOzellik = (typeof planKilitleri.ozellikler)[number];
export type UrunGorsel = (typeof urunGorselleri.gorseller)[number];
export type IsletmeMenuTip = (typeof isletmeMenuleri.tipler)[number];
export type MenuBoyut = (typeof isletmeMenuleri.boyutlar)[number];
export type KatalogUrun = (typeof toplamUrunListesi.urunler)[number];
export type KarsilastirmaKahraman = (typeof karsilastirma.superQrModel.kahramanlar)[number];
export type KarsilastirmaBilesik = (typeof karsilastirma.superQrModel.bilesik);
export type SadeceSofraOzellik = (typeof karsilastirma.sadeceSofrada)[number];

export {
  katalog,
  fiyatlar,
  paketServisler,
  referans,
  planKilitleri,
  adetAltiUcretsiz,
  urunGorselleri,
  isletmeMenuleri,
  toplamUrunListesi,
  karsilastirma,
  superqrOzellikSkorlari,
  superqrEniyiSofra,
};

/** Davet edilen (yeni üye) referans indirimi geçerli mi? */
export function davetEdilenIndirimGecerliMi(
  fromSlug: string | null | undefined,
  kaynak: string | null | undefined,
  yillikPlan: boolean,
) {
  const yeni = referans.yeniUyelikIndirimi;
  if (!referans.aktif || !yeni?.aktif) return false;
  if (yeni.qrZorunlu && !referansQrGecerliMi(fromSlug, kaynak)) return false;
  if (yeni.yillikZorunlu && !yillikPlan) return false;
  return true;
}

export function davetEdilenIndirimOrani(
  fromSlug: string | null | undefined,
  kaynak: string | null | undefined,
  yillikPlan: boolean,
) {
  if (!davetEdilenIndirimGecerliMi(fromSlug, kaynak, yillikPlan)) return 0;
  return referans.yeniUyelikIndirimi?.indirimOrani ?? 0;
}

/** Referans indirimi geçerli mi? (yıllık abonelik — referans olan yer) */
export function referansIndirimGecerliMi(referansVerenYillik: boolean) {
  return referans.aktif && referansVerenYillik && referans.yillikUyelikZorunlu.referansVeren;
}

/** Aktif yıllık referans sayısına göre toplam indirim süresi (ay). */
export function referansIndirimAyHesapla(aktifYillikReferansSayisi: number) {
  if (!referans.aktif || aktifYillikReferansSayisi < 1) return 0;
  return aktifYillikReferansSayisi * referans.referansBasinaAy;
}

/** Geçerli dönemde uygulanacak referans indirim oranı (%15 veya 0). */
export function referansIndirimOraniHesapla(
  aktifYillikReferansSayisi: number,
  referansVerenYillik: boolean,
  kalanIndirimAy: number,
) {
  if (
    !referansIndirimGecerliMi(referansVerenYillik) ||
    aktifYillikReferansSayisi < 1 ||
    kalanIndirimAy < 1
  ) {
    return 0;
  }
  return referans.indirimOrani;
}

export function referansKoduOlustur(slug: string) {
  return `${referans.referansKoduOnek}-${slug}`;
}

export function menuQrYolu(slug: string, masa = "1") {
  const yol = referans.referansQr.menuYolu.replace("{slug}", slug);
  return `${yol}?masa=${masa}`;
}

/** Menü QR ile gelen referans geçerli mi? */
export function referansQrGecerliMi(
  fromSlug: string | null | undefined,
  kaynak: string | null | undefined,
) {
  if (!referans.aktif) return false;
  if (!referans.referansQr.zorunlu) return Boolean(fromSlug?.trim());
  if (!fromSlug?.trim()) return false;
  return kaynak === referans.referansQr.kaynakDegeri;
}

/** Anlaşılanlar üstte (tikli), diğerleri altta. */
export function paketFirmalariniGetir() {
  return [...paketServisler.firmalar].sort((a, b) => {
    if (a.anlasildi === b.anlasildi) return a.ad.localeCompare(b.ad, "tr");
    return a.anlasildi ? -1 : 1;
  });
}

export function kategorileriGetir() {
  return [...katalog.kategoriler].sort((a, b) => a.sira - b.sira);
}

export function sablonlariGetir(kategoriId?: string) {
  if (!kategoriId) return katalog.sablonlar;
  return katalog.sablonlar.filter((s) => s.kategoriId === kategoriId);
}

export function sablonBul(id: string) {
  return katalog.sablonlar.find((s) => s.id === id) ?? null;
}

export type MenuDuzen = keyof typeof katalog.duzenEtiketleri;

export const MENU_DUZENLER = Object.keys(katalog.duzenEtiketleri) as MenuDuzen[];

export function menuDuzenGecerliMi(id: string | null | undefined): id is MenuDuzen {
  return Boolean(id && id in katalog.duzenEtiketleri);
}

/** Şablonun kart düzeni — yoksa liste. */
export function sablonDuzen(sablonId: string | null | undefined): MenuDuzen {
  const d = sablonBul(sablonId ?? "")?.duzen;
  return menuDuzenGecerliMi(d) ? d : "list";
}

export function ucretsizSablonlar() {
  return katalog.sablonlar.filter((s) => s.ucretsiz);
}

export function urunGorselleriniGetir(kategori?: string) {
  if (!kategori) return urunGorselleri.gorseller;
  return urunGorselleri.gorseller.filter(
    (g) => g.kategori === kategori || g.kategori === "genel",
  );
}

export function urunGorselBul(id: string) {
  return urunGorselleri.gorseller.find((g) => g.id === id) ?? null;
}

/** Ürün adına göre hazır görsel önerir. */
export function urunGorselOner(urunAdi: string) {
  const a = urunAdi.toLowerCase();
  const eslesmeler: [RegExp, string][] = [
    [/naneli\s*limonata|limonata.*nane|nane.*limonata/, "limonata-nane"],
    [/çörçil|corcil|churchill/, "corcil"],
    [/avşar tuzlu erikli|avsar tuzlu erikli|tuzlu erikli soda/, "avsar-tuzlu-erikli-soda"],
    [/avşar tuzlu karamel|avsar tuzlu karamel/, "avsar-tuzlu-karamel"],
    [/avşar karadut|avsar karadut/, "avsar-karadut-frenk-uzum"],
    [/avşar mango|avsar mango/, "avsar-mango-ananas"],
    [/avşar mandalin|avsar mandalin/, "avsar-mandalina-c-plus"],
    [/avşar limon c|avsar limon c/, "avsar-limon-c-plus"],
    [/avşar limonata|avsar limonata/, "avsar-limonata"],
    [/avşar limon|avsar limon/, "avsar-limon"],
    [/avşar gazoz|avsar gazoz/, "avsar-gazoz"],
    [/avşar coconut|avsar coconut/, "avsar-coconut"],
    [/avşar tutkumuz|avsar tutkumuz/, "avsar-tutkumuz"],
    [/avşar sirkeli|avsar sirkeli/, "avsar-sirkeli"],
    [/avşar volkanik|avsar volkanik/, "avsar-volkanik"],
    [/avşar karamix|avsar karamix/, "avsar-karamix"],
    [/avşar berry|avsar berry|avşar hibiscus/, "avsar-berry-hibiscus"],
    [/avşar cool lime|avsar cool lime/, "avsar-cool-lime"],
    [/avşar düşeş|avsar duses|avşar armud/, "avsar-duses-armudu-nektarin"],
    [/avşar yeşil elma|avsar yesil elma/, "avsar-yesil-elma"],
    [/avşar kırmızı elma|avsar kirmizi elma/, "avsar-kirmizi-elma"],
    [/avşar karpuz|avsar karpuz/, "avsar-karpuz-cilek"],
    [/avşar kivi|avsar kivi/, "avsar-kivi-limon"],
    [/avşar sade|avsar sade|avşar maden|avsar maden/, "avsar-sade-maden-suyu"],
    [/avşar|avsar/, "avsar-soda"],
    [/limonlu\s*soda|soda.*limon/, "limonlu-soda"],
    [/mandalin.*soda|soda.*mandalin/, "mandalinli-soda"],
    [/portakal.*soda|soda.*portakal/, "portakalli-soda"],
    [/sade\s*soda/, "sade-soda"],
    [/\bsoda\b/, "sade-soda"],
    [/limonata/, "limonata"],
    [/ayran/, "ayran"],
    [/salep/, "salep"],
    [/milkshake/, "milkshake"],
    [/portakal suyu|meyve suyu/, "portakal-suyu"],
    [/şalgam|salgam/, "salgam"],
    [/pepsi/, "pepsi"],
    [/cola turka|cola-turka/, "cola-turka"],
    [/uludağ|uludag/, "uludag-gazoz"],
    [/sarıyer karadut|sariyer karadut/, "sariyer-karadut-gazoz"],
    [/sarıyer mandalin|sariyer mandalin/, "sariyer-mandalina-gazoz"],
    [/sarıyer portakal|sariyer portakal/, "sariyer-portakal-gazoz"],
    [/sarıyer şekersiz|sariyer sekersiz/, "sariyer-sekersiz-gazoz"],
    [/sarıyer|sariyer gazoz/, "sariyer-gazoz"],
    [/limon.*gazoz|sprite|7up|yedi up/, "limon-gazoz"],
    [/mandalina.*gazoz/, "mandalina-gazoz"],
    [/vişne.*gazoz|visne.*gazoz/, "visneli-gazoz"],
    [/elma.*gazoz/, "elma-gazoz"],
    [/klasik gazoz/, "klasik-gazoz"],
    [/sade gazoz/, "sade-gazoz"],
    [/tonik|schweppes/, "tonik"],
    [/ice.?tea.*limon|soğuk çay limon/, "ice-tea-limon"],
    [/ice.?tea.*şeftali|ice.?tea.*seftali|soğuk çay şeftali/, "ice-tea-seftali"],
    [/ice.?tea|soğuk çay|soguk cay/, "ice-tea"],
    [/enerji|red bull|monster|burn/, "enerji-icecegi"],
    [/\bkola\b|coke|coca/, "kola"],
    [/demlik/, "demlik-cay"],
    [/türk kahvesi|turk kahvesi/, "turk-kahvesi"],
    [/espresso/, "espresso"],
    [/cappuccino/, "cappuccino"],
    [/americano/, "americano"],
    [/latte/, "latte"],
    [/filtre kahve/, "kahve"],
    [/soğuk kahve|soguk kahve/, "soguk-kahve"],
    [/sıcak çikolata|sicak cikolata/, "sicak-cikolata"],
    [/smoothie/, "smoothie"],
    [/\bçay\b|\bcay\b|tea/, "cay"],
    [/\bsu\b/, "su"],
    [/iskender/, "iskender"],
    [/döner|doner/, "doner"],
    [/kebap|köfte|kofte|şiş|sis|pirzola|ciğer|ciger/, "kebap"],
    [/lahmacun/, "lahmacun"],
    [/börek|borek/, "borek"],
    [/poğaça|pogaca|simit|açma|acma/, "pogaca-simit"],
    [/menemen/, "menemen"],
    [/tost/, "tost"],
    [/çiğ köfte|cig kofte/, "cig-kofte"],
    [/baklava/, "baklava"],
    [/künefe|kunefe/, "kunefe"],
    [/pilav|bulgur/, "pilav"],
    [/patates|soğan halkası|sogan halkasi|nugget/, "patates"],
    [/waffle/, "waffle"],
    [/yumurta|kahvalt|sucuk|omlet|çılbır|cilbir/, "kahvalti"],
    [/burger|sandviç|sandwich|dürüm|durum/, "burger"],
    [/pizza|pide/, "pizza"],
    [/salata|mezze|cacık|cacik|turşu|tursu/, "salata"],
    [/çorba|corba|soup|mercimek|ezogelin|tarhana|işkembe|iskembe|kelle|yayla|tavuk suyu/, "corba"],
    [/dondurma|ice.?cream/, "dondurma"],
    [/cheesecake|çiizkeyk|ciizkeyk/, "cheesecake"],
    [/brownie|braun|braunie/, "brownie"],
    [/kruvasan|croissant|kroasan/, "kruvasan"],
    [/cookie|kurabiye|çikolatalı kurabiye/, "cookie"],
    [/tatlı|tatli|pasta|kek|tiramisu|sütlaç|sutlac|profiterol|revani|magnolia|ekler|kazandibi/, "tatli"],
  ];
  for (const [re, id] of eslesmeler) {
    if (re.test(a)) return urunGorselBul(id);
  }
  return urunGorselBul("genel");
}

export function isletmeTipleriniGetir() {
  return isletmeMenuleri.tipler;
}

export function menuBoyutlariniGetir() {
  return isletmeMenuleri.boyutlar;
}

export function isletmeTipBul(id: string) {
  return isletmeMenuleri.tipler.find((t) => t.id === id) ?? null;
}

export function menuBoyutBul(id: string) {
  return isletmeMenuleri.boyutlar.find((b) => b.id === id) ?? null;
}

export function varsayilanMenuBoyutId() {
  return isletmeMenuleri.varsayilanMenuBoyut ?? "8";
}

export function toplamUrunKatalogu() {
  return toplamUrunListesi.urunler;
}

export function katalogUrunBul(id: string) {
  return toplamUrunListesi.urunler.find((u) => u.id === id) ?? null;
}

export function katalogUrunleriGetir(ids: string[]) {
  return ids.map((id) => katalogUrunBul(id)).filter((u): u is KatalogUrun => u != null);
}

export type HazirMenuUrun = KatalogUrun & {
  kategori: string;
  sayfa: "on" | "arka" | null;
};

/** Tip için varsayılan menü şablonu (standart 8 ürün). */
export function varsayilanMenuSablonu(tipId: string) {
  const tip = isletmeTipBul(tipId);
  if (!tip) return null;
  const ids = tip.varsayilanMenuIds ?? tip.urunIds.slice(0, 8);
  const urunler: HazirMenuUrun[] = katalogUrunleriGetir(ids).map((u) => ({
    ...u,
    kategori: u.kategoriEtiket,
    sayfa: null,
  }));
  return {
    tip,
    boyut: menuBoyutBul(tip.varsayilanBoyut ?? varsayilanMenuBoyutId()),
    kategoriler: tip.kategoriler,
    urunler,
  };
}

/**
 * Tip + boyuttan ürün listesi üretir (toplam katalogdan).
 * Varsayılan boyut (8) = tip.varsayilanMenuIds; diğer boyutlar = havuzdan sırayla kesilir.
 */
export function hazirMenuUrunleriSec(tipId: string, boyutId: string) {
  const tip = isletmeTipBul(tipId);
  const boyut = menuBoyutBul(boyutId);
  if (!tip || !boyut) return null;

  const varsayilanId = tip.varsayilanBoyut ?? varsayilanMenuBoyutId();
  let ids: string[];

  if (boyutId === varsayilanId && tip.varsayilanMenuIds?.length) {
    ids = tip.varsayilanMenuIds;
  } else {
    const adet = Math.min(boyut.adet, tip.urunIds.length);
    ids = tip.urunIds.slice(0, adet);
  }

  const onAdet = "on" in boyut && typeof boyut.on === "number" ? boyut.on : null;

  const urunler: HazirMenuUrun[] = katalogUrunleriGetir(ids).map((u, i) => ({
    ...u,
    kategori: u.kategoriEtiket,
    sayfa: onAdet == null ? null : i < onAdet ? ("on" as const) : ("arka" as const),
  }));

  return {
    tip,
    boyut,
    kategoriler: tip.kategoriler,
    urunler,
  };
}
