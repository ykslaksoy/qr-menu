import type { Urun } from "@/lib/store";

export type BesinDeger = {
  kalori: number;
  protein?: number | null;
  yag?: number | null;
  karbonhidrat?: number | null;
};

export type UrunBesinKayit = {
  alerjenler: string[];
  icerik: string;
  besin: BesinDeger;
};

/** katalogId veya ürün adı anahtarı → alerjen / içerik / besin */
const KATALOG: Record<string, UrunBesinKayit> = {
  "filtre-kahve": {
    alerjenler: [],
    icerik: "Öğütülmüş kahve çekirdeği, sıcak su",
    besin: { kalori: 5, protein: 0.3, yag: 0, karbonhidrat: 0 },
  },
  latte: {
    alerjenler: ["Laktoz"],
    icerik: "Espresso, buharda ısıtılmış süt",
    besin: { kalori: 150, protein: 8, yag: 6, karbonhidrat: 12 },
  },
  cappuccino: {
    alerjenler: ["Laktoz"],
    icerik: "Espresso, süt köpüğü",
    besin: { kalori: 120, protein: 6, yag: 4, karbonhidrat: 10 },
  },
  americano: {
    alerjenler: [],
    icerik: "Espresso, sıcak su",
    besin: { kalori: 10, protein: 0.5, yag: 0, karbonhidrat: 0 },
  },
  espresso: {
    alerjenler: [],
    icerik: "Öğütülmüş kahve, basınçlı su",
    besin: { kalori: 5, protein: 0.2, yag: 0, karbonhidrat: 0 },
  },
  cay: {
    alerjenler: [],
    icerik: "Siyah çay, demlik su",
    besin: { kalori: 2, protein: 0, yag: 0, karbonhidrat: 0 },
  },
  "soguk-kahve": {
    alerjenler: ["Laktoz"],
    icerik: "Espresso, süt, buz, şurup",
    besin: { kalori: 180, protein: 5, yag: 4, karbonhidrat: 28 },
  },
  smoothie: {
    alerjenler: ["Laktoz"],
    icerik: "Mevsim meyve, yoğurt veya süt, bal",
    besin: { kalori: 220, protein: 6, yag: 3, karbonhidrat: 42 },
  },
  limonata: {
    alerjenler: [],
    icerik: "Taze limon, su, şeker veya limonata şurubu",
    besin: { kalori: 110, protein: 0, yag: 0, karbonhidrat: 28 },
  },
  su: {
    alerjenler: [],
    icerik: "Doğal kaynak / şişe suyu",
    besin: { kalori: 0, protein: 0, yag: 0, karbonhidrat: 0 },
  },
  gazoz: {
    alerjenler: [],
    icerik: "Gazoz, şeker, aroma",
    besin: { kalori: 120, protein: 0, yag: 0, karbonhidrat: 30 },
  },
  kola: {
    alerjenler: [],
    icerik: "Karbonatlı kola içeceği",
    besin: { kalori: 140, protein: 0, yag: 0, karbonhidrat: 35 },
  },
  "ice-tea": {
    alerjenler: [],
    icerik: "Soğuk çay, şeker, limon/şeftali aroma",
    besin: { kalori: 90, protein: 0, yag: 0, karbonhidrat: 22 },
  },
  tonik: {
    alerjenler: [],
    icerik: "Tonik suyu, kinin, şeker",
    besin: { kalori: 90, protein: 0, yag: 0, karbonhidrat: 22 },
  },
  "enerji-icecegi": {
    alerjenler: [],
    icerik: "Kafein, taurin, şeker, B vitaminleri",
    besin: { kalori: 110, protein: 0, yag: 0, karbonhidrat: 28 },
  },
  tost: {
    alerjenler: ["Gluten", "Laktoz"],
    icerik: "Tost ekmeği, kaşar peyniri, tereyağı",
    besin: { kalori: 380, protein: 16, yag: 18, karbonhidrat: 36 },
  },
  sandvic: {
    alerjenler: ["Gluten"],
    icerik: "Ekmek, günün malzemeleri (et/sebzeler), sos",
    besin: { kalori: 450, protein: 22, yag: 16, karbonhidrat: 48 },
  },
  omlet: {
    alerjenler: ["Yumurta", "Laktoz"],
    icerik: "Yumurta, süt, tereyağı, tuz",
    besin: { kalori: 280, protein: 18, yag: 20, karbonhidrat: 2 },
  },
  "sucuklu-yumurta": {
    alerjenler: ["Yumurta"],
    icerik: "Yumurta, sucuk, yağ",
    besin: { kalori: 420, protein: 24, yag: 32, karbonhidrat: 3 },
  },
  "granola-bowl": {
    alerjenler: ["Gluten", "Laktoz", "Sert kabuklu yemiş"],
    icerik: "Granola, yoğurt, mevsim meyve, bal, kuruyemiş",
    besin: { kalori: 390, protein: 12, yag: 14, karbonhidrat: 52 },
  },
  cheesecake: {
    alerjenler: ["Gluten", "Laktoz", "Yumurta"],
    icerik: "Krem peynir, bisküvi tabanı, şeker, yumurta, frambuaz sos",
    besin: { kalori: 420, protein: 7, yag: 26, karbonhidrat: 38 },
  },
  brownie: {
    alerjenler: ["Gluten", "Laktoz", "Yumurta"],
    icerik: "Çikolata, un, tereyağı, şeker, yumurta",
    besin: { kalori: 420, protein: 5, yag: 22, karbonhidrat: 48 },
  },
  kruvasan: {
    alerjenler: ["Gluten", "Laktoz"],
    icerik: "Un, tereyağı, süt, maya, tuz",
    besin: { kalori: 280, protein: 5, yag: 15, karbonhidrat: 30 },
  },
  cookie: {
    alerjenler: ["Gluten", "Laktoz", "Yumurta"],
    icerik: "Un, tereyağı, şeker, yumurta, çikolata parçaları",
    besin: { kalori: 220, protein: 3, yag: 11, karbonhidrat: 28 },
  },
  dondurma: {
    alerjenler: ["Laktoz"],
    icerik: "Süt, krema, şeker, seçilen aroma",
    besin: { kalori: 240, protein: 4, yag: 12, karbonhidrat: 28 },
  },
  waffle: {
    alerjenler: ["Gluten", "Laktoz", "Yumurta"],
    icerik: "Un, yumurta, süt, tereyağı, şeker; üst malzemeler seçime göre",
    besin: { kalori: 520, protein: 10, yag: 22, karbonhidrat: 68 },
  },
  "sicak-cikolata": {
    alerjenler: ["Laktoz"],
    icerik: "Süt, kakao, şeker",
    besin: { kalori: 260, protein: 8, yag: 10, karbonhidrat: 32 },
  },
  salata: {
    alerjenler: [],
    icerik: "Mevsim yeşillikleri, sebze, zeytinyağı, limon",
    besin: { kalori: 180, protein: 4, yag: 12, karbonhidrat: 14 },
  },
  corba: {
    alerjenler: [],
    icerik: "Günün sebze/et suyu, baharat (içerik güne göre değişir)",
    besin: { kalori: 160, protein: 6, yag: 5, karbonhidrat: 20 },
  },
  pizza: {
    alerjenler: ["Gluten", "Laktoz"],
    icerik: "Pizza hamuru, domates sosu, mozzarella, malzemeler",
    besin: { kalori: 680, protein: 28, yag: 24, karbonhidrat: 78 },
  },
  hamburger: {
    alerjenler: ["Gluten", "Laktoz"],
    icerik: "Burger ekmeği, köfte, marul, domates, sos, peynir",
    besin: { kalori: 650, protein: 32, yag: 30, karbonhidrat: 52 },
  },
  menemen: {
    alerjenler: ["Yumurta"],
    icerik: "Yumurta, domates, biber, soğan, yağ",
    besin: { kalori: 320, protein: 14, yag: 22, karbonhidrat: 12 },
  },
  baklava: {
    alerjenler: ["Gluten", "Sert kabuklu yemiş"],
    icerik: "Yufka, fıstık/ceviz, tereyağı, şerbet",
    besin: { kalori: 480, protein: 8, yag: 28, karbonhidrat: 52 },
  },
  ayran: {
    alerjenler: ["Laktoz"],
    icerik: "Yoğurt, su, tuz",
    besin: { kalori: 70, protein: 3, yag: 2, karbonhidrat: 6 },
  },
};

const AD_ESLESME: [RegExp, string][] = [
  [/filtre\s*kahve/, "filtre-kahve"],
  [/\blatte\b/, "latte"],
  [/cappuccino/, "cappuccino"],
  [/americano/, "americano"],
  [/espresso/, "espresso"],
  [/\bçay\b|\bcay\b/, "cay"],
  [/soğuk\s*kahve|soguk\s*kahve|buzlu/, "soguk-kahve"],
  [/smoothie/, "smoothie"],
  [/limonata/, "limonata"],
  [/sucuklu/, "sucuklu-yumurta"],
  [/\bsu\b(?!cuk)/, "su"],
  [/gazoz|avşar|avsar|soda/, "gazoz"],
  [/kola|cola|pepsi/, "kola"],
  [/ice\s*tea|soğuk\s*çay|soguk\s*cay/, "ice-tea"],
  [/tonik/, "tonik"],
  [/enerji/, "enerji-icecegi"],
  [/\btost\b/, "tost"],
  [/sandvi[cç]/, "sandvic"],
  [/omlet/, "omlet"],
  [/granola/, "granola-bowl"],
  [/cheesecake/, "cheesecake"],
  [/brownie/, "brownie"],
  [/kruvasan|croissant/, "kruvasan"],
  [/cookie|kurabiye/, "cookie"],
  [/dondurma/, "dondurma"],
  [/waffle|wafl/, "waffle"],
  [/sıcak\s*çikolata|sicak\s*cikolata/, "sicak-cikolata"],
  [/salata/, "salata"],
  [/çorba|corba/, "corba"],
  [/pizza/, "pizza"],
  [/burger|hamburger/, "hamburger"],
  [/menemen/, "menemen"],
  [/baklava/, "baklava"],
  [/ayran/, "ayran"],
];

function anahtarBul(urun: Urun): string | null {
  if (urun.katalogId && KATALOG[urun.katalogId]) return urun.katalogId;
  const a = urun.ad.toLocaleLowerCase("tr-TR");
  for (const [re, id] of AD_ESLESME) {
    if (re.test(a) && KATALOG[id]) return id;
  }
  return null;
}

/** İsimden kaba alerjen tahmini (katalog dışı ürünler). */
function kabaAlerjen(ad: string): string[] {
  const a = ad.toLocaleLowerCase("tr-TR");
  const out: string[] = [];
  if (/süt|sut|latte|cappuccino|milkshake|cheesecake|dondurma|krema|yogurt|yoğurt|kaşar|kasar|peynir|ayran/.test(a)) {
    out.push("Laktoz");
  }
  if (/ekmek|burger|pizza|waffle|kruvasan|toast|tost|sandvi[cç]|pasta|brownie|cookie|kurabiye|granola|baklava/.test(a)) {
    out.push("Gluten");
  }
  if (/fındık|findik|ceviz|fıstık|fistık|nutella|badem|granola/.test(a)) {
    out.push("Sert kabuklu yemiş");
  }
  if (/yumurta|omlet|menemen|sucuklu/.test(a)) out.push("Yumurta");
  return out;
}

/** Eksik alanları doldurur; mevcut dolu alanları bozmaz. Eski "Süt" → "Laktoz". */
export function uruneBesinAlerjenIsle(urun: Urun): Urun {
  const kayit = anahtarBul(urun) ? KATALOG[anahtarBul(urun)!] : null;

  let alerjenler = (urun.alerjenler ?? []).map((a) => (a === "Süt" ? "Laktoz" : a));
  if (!alerjenler.length) {
    alerjenler = kayit?.alerjenler?.length ? [...kayit.alerjenler] : kabaAlerjen(urun.ad);
  } else if (kayit?.alerjenler?.length) {
    // eksik bilinen alerjenleri ekle
    for (const a of kayit.alerjenler) {
      if (!alerjenler.includes(a)) alerjenler.push(a);
    }
  }

  const icerik = urun.icerik?.trim() || kayit?.icerik || null;
  const besin =
    urun.besin ??
    kayit?.besin ??
    (urun.kalori != null
      ? { kalori: urun.kalori, protein: null, yag: null, karbonhidrat: null }
      : null);
  const kalori = urun.kalori ?? besin?.kalori ?? null;

  return {
    ...urun,
    alerjenler: alerjenler.length ? alerjenler : null,
    icerik,
    besin,
    kalori,
  };
}
