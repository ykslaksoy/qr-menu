import type { Urun, UrunSecenekGrup } from "@/lib/store";
import { uruneDilIsle } from "@/lib/menu-dil";
import { uruneBesinAlerjenIsle } from "@/lib/urun-besin";
import type { MenuDil } from "@/lib/menu-dil";

export { uruneDilIsle } from "@/lib/menu-dil";
export { uruneBesinAlerjenIsle } from "@/lib/urun-besin";

/** Waffle üst malzemeleri — müşteri ne konmasını isterse seçer. */
export const WAFFLE_SEGENEKLER: UrunSecenekGrup[] = [
  {
    id: "waffle-ustu",
    ad: "Üstüne ne konulsun?",
    zorunlu: false,
    coklu: true,
    min: 0,
    max: 8,
    secimler: [
      { id: "muz", ad: "Muz", fiyatEk: 0 },
      { id: "cilek", ad: "Çilek", fiyatEk: 15 },
      { id: "cikolata", ad: "Çikolata sos", fiyatEk: 0 },
      { id: "nutella", ad: "Nutella", fiyatEk: 20 },
      { id: "bal", ad: "Bal", fiyatEk: 10 },
      { id: "findik", ad: "Fındık", fiyatEk: 15 },
      { id: "ceviz", ad: "Ceviz", fiyatEk: 15 },
      { id: "dondurma", ad: "Dondurma", fiyatEk: 25 },
      { id: "krem-santi", ad: "Krem şanti", fiyatEk: 10 },
      { id: "lotus", ad: "Lotus sos", fiyatEk: 20 },
    ],
  },
];

export const KAHVE_BOYUT: UrunSecenekGrup[] = [
  {
    id: "kahve-boyut",
    ad: "Boyut",
    zorunlu: true,
    coklu: false,
    min: 1,
    max: 1,
    secimler: [
      { id: "kucuk", ad: "Küçük", fiyatEk: 0 },
      { id: "orta", ad: "Orta", fiyatEk: 10 },
      { id: "buyuk", ad: "Büyük", fiyatEk: 20 },
    ],
  },
  {
    id: "kahve-sut",
    ad: "Süt",
    zorunlu: false,
    coklu: false,
    min: 0,
    max: 1,
    secimler: [
      { id: "normal", ad: "Normal süt", fiyatEk: 0 },
      { id: "laktozsuz", ad: "Laktozsuz", fiyatEk: 5 },
      { id: "bitkisel", ad: "Badem / yulaf", fiyatEk: 10 },
    ],
  },
];

export const BURGER_EKSTRA: UrunSecenekGrup[] = [
  {
    id: "burger-ekstra",
    ad: "Ekstra",
    zorunlu: false,
    coklu: true,
    min: 0,
    max: 6,
    secimler: [
      { id: "peynir", ad: "Ekstra peynir", fiyatEk: 15 },
      { id: "bacon", ad: "Bacon", fiyatEk: 25 },
      { id: "sogan", ad: "Karamelize soğan", fiyatEk: 10 },
      { id: "patates", ad: "Patates kızartması", fiyatEk: 40 },
    ],
  },
];

export const PIZZA_BOYUT: UrunSecenekGrup[] = [
  {
    id: "pizza-boyut",
    ad: "Boyut",
    zorunlu: true,
    coklu: false,
    min: 1,
    max: 1,
    secimler: [
      { id: "kucuk", ad: "Küçük", fiyatEk: 0 },
      { id: "orta", ad: "Orta", fiyatEk: 40 },
      { id: "buyuk", ad: "Büyük", fiyatEk: 80 },
    ],
  },
];

export const TOST_SEGENEKLER: UrunSecenekGrup[] = [
  {
    id: "tost-ekstra",
    ad: "Ekstra",
    zorunlu: false,
    coklu: true,
    min: 0,
    max: 4,
    secimler: [
      { id: "ekstra-kasar", ad: "Ekstra kaşar", fiyatEk: 20 },
      { id: "sucuk", ad: "Sucuk", fiyatEk: 25 },
      { id: "domates", ad: "Domates", fiyatEk: 5 },
      { id: "zeytin", ad: "Zeytin", fiyatEk: 10 },
    ],
  },
];

export const SMOOTHIE_SEGENEKLER: UrunSecenekGrup[] = [
  {
    id: "smoothie-boyut",
    ad: "Boyut",
    zorunlu: true,
    coklu: false,
    min: 1,
    max: 1,
    secimler: [
      { id: "kucuk", ad: "Küçük", fiyatEk: 0 },
      { id: "buyuk", ad: "Büyük", fiyatEk: 20 },
    ],
  },
  {
    id: "smoothie-ekstra",
    ad: "Ekstra",
    zorunlu: false,
    coklu: true,
    min: 0,
    max: 3,
    secimler: [
      { id: "protein", ad: "Protein tozu", fiyatEk: 25 },
      { id: "bal", ad: "Bal", fiyatEk: 10 },
      { id: "granola", ad: "Granola", fiyatEk: 15 },
    ],
  },
];

export const CAY_SEGENEKLER: UrunSecenekGrup[] = [
  {
    id: "cay-sekil",
    ad: "Şeker",
    zorunlu: false,
    coklu: false,
    min: 0,
    max: 1,
    secimler: [
      { id: "sekerli", ad: "Şekerli", fiyatEk: 0 },
      { id: "az-seker", ad: "Az şeker", fiyatEk: 0 },
      { id: "sekersiz", ad: "Şekersiz", fiyatEk: 0 },
    ],
  },
];

export const SANDVIC_SEGENEKLER: UrunSecenekGrup[] = [
  {
    id: "sandvic-ekmek",
    ad: "Ekmek",
    zorunlu: true,
    coklu: false,
    min: 1,
    max: 1,
    secimler: [
      { id: "beyaz", ad: "Beyaz", fiyatEk: 0 },
      { id: "tam-bugday", ad: "Tam buğday", fiyatEk: 5 },
      { id: "ciabatta", ad: "Ciabatta", fiyatEk: 10 },
    ],
  },
  {
    id: "sandvic-ekstra",
    ad: "Ekstra",
    zorunlu: false,
    coklu: true,
    min: 0,
    max: 4,
    secimler: [
      { id: "peynir", ad: "Ekstra peynir", fiyatEk: 15 },
      { id: "avokado", ad: "Avokado", fiyatEk: 20 },
      { id: "turşu", ad: "Turşu", fiyatEk: 5 },
    ],
  },
];

export const DONDURMA_SEGENEKLER: UrunSecenekGrup[] = [
  {
    id: "dondurma-top",
    ad: "Top sayısı",
    zorunlu: true,
    coklu: false,
    min: 1,
    max: 1,
    secimler: [
      { id: "1-top", ad: "1 top", fiyatEk: 0 },
      { id: "2-top", ad: "2 top", fiyatEk: 30 },
      { id: "3-top", ad: "3 top", fiyatEk: 55 },
    ],
  },
];

/** Katalog / ürün adına göre varsayılan seçenek grupları. */
export function urunVarsayilanSecenekler(katalogId?: string | null, ad?: string): UrunSecenekGrup[] | null {
  const kid = (katalogId ?? "").toLowerCase();
  const a = (ad ?? "").toLocaleLowerCase("tr-TR");
  if (kid === "waffle" || /^waffle|wafl/.test(a)) return WAFFLE_SEGENEKLER;
  if (
    /latte|cappuccino|americano|espresso|filtre kahve|mocha|flat white|cold brew|türk kahvesi|turk kahvesi|sıcak çikolata|sicak cikolata/.test(
      a,
    ) ||
    /kahve|coffee|sicak-cikolata/.test(kid)
  ) {
    return KAHVE_BOYUT;
  }
  if (/burger|hamburger|cheeseburger/.test(a) || /burger/.test(kid)) return BURGER_EKSTRA;
  if (/pizza/.test(a) || /pizza/.test(kid)) return PIZZA_BOYUT;
  if (/\btost\b/.test(a) || kid === "tost") return TOST_SEGENEKLER;
  if (/smoothie|milkshake/.test(a) || /smoothie|milkshake/.test(kid)) return SMOOTHIE_SEGENEKLER;
  if (/\bçay\b|\bcay\b|demlik/.test(a) || kid === "cay" || kid === "demlik-cay") return CAY_SEGENEKLER;
  if (/sandvi[cç]/.test(a) || /sandvic/.test(kid)) return SANDVIC_SEGENEKLER;
  if (/dondurma/.test(a) || /dondurma/.test(kid)) return DONDURMA_SEGENEKLER;
  return null;
}

export function uruneSecenekleriIsle(urun: Urun): Urun {
  if (urun.secenekler?.length) return urun;
  const varsayilan = urunVarsayilanSecenekler(urun.katalogId, urun.ad);
  if (!varsayilan) return urun;
  return { ...urun, secenekler: varsayilan };
}

/** @deprecated — uruneBesinAlerjenIsle kullan */
export function uruneAlerjenKaloriIsle(urun: Urun): Urun {
  return uruneBesinAlerjenIsle(urun);
}

export function urunuZenginlestir(urun: Urun): Urun {
  return uruneDilIsle(uruneBesinAlerjenIsle(uruneSecenekleriIsle(urun)));
}

/** Seçenek grubu / seçim adlarını diline çevir (TR anahtar). */
const SEGENEK_CEVIR: Record<string, Partial<Record<Exclude<MenuDil, "tr">, string>>> = {
  Boyut: { en: "Size", de: "Größe", fr: "Taille", es: "Tamaño", ru: "Размер", ar: "الحجم", zh: "份量", ja: "サイズ" },
  Süt: { en: "Milk", de: "Milch", fr: "Lait", es: "Leche", ru: "Молоко", ar: "حليب", zh: "奶", ja: "ミルク" },
  Ekstra: { en: "Extras", de: "Extras", fr: "Extras", es: "Extras", ru: "Допы", ar: "إضافات", zh: "加料", ja: "トッピング" },
  "Üstüne ne konulsun?": {
    en: "Toppings",
    de: "Belag",
    fr: "Garnitures",
    es: "Toppings",
    ru: "Топпинги",
    ar: "إضافات",
    zh: "配料",
    ja: "トッピング",
  },
  Şeker: { en: "Sugar", de: "Zucker", fr: "Sucre", es: "Azúcar", ru: "Сахар", ar: "سكر", zh: "糖", ja: "砂糖" },
  Ekmek: { en: "Bread", de: "Brot", fr: "Pain", es: "Pan", ru: "Хлеб", ar: "خبز", zh: "面包", ja: "パン" },
  "Top sayısı": { en: "Scoops", de: "Kugeln", fr: "Boules", es: "Bolas", ru: "Шарики", ar: "كرات", zh: "球数", ja: "スクープ" },
  Küçük: { en: "Small", de: "Klein", fr: "Petit", es: "Pequeño", ru: "Маленький", ar: "صغير", zh: "小", ja: "S" },
  Orta: { en: "Medium", de: "Mittel", fr: "Moyen", es: "Mediano", ru: "Средний", ar: "وسط", zh: "中", ja: "M" },
  Büyük: { en: "Large", de: "Groß", fr: "Grand", es: "Grande", ru: "Большой", ar: "كبير", zh: "大", ja: "L" },
  "Normal süt": { en: "Regular milk", de: "Normale Milch", fr: "Lait normal", es: "Leche normal", ru: "Обычное молоко", ar: "حليب عادي", zh: "普通奶", ja: "普通ミルク" },
  Laktozsuz: { en: "Lactose-free", de: "Laktosefrei", fr: "Sans lactose", es: "Sin lactosa", ru: "Без лактозы", ar: "خالي من اللاكتوز", zh: "无乳糖", ja: "乳糖オフ" },
  "Badem / yulaf": { en: "Almond / oat", de: "Mandel / Hafer", fr: "Amande / avoine", es: "Almendra / avena", ru: "Миндаль / овёс", ar: "لوز / شوفان", zh: "杏仁/燕麦", ja: "アーモンド／オーツ" },
  "Ekstra peynir": { en: "Extra cheese", de: "Extra Käse", fr: "Fromage extra", es: "Queso extra", ru: "Доп. сыр", ar: "جبن إضافي", zh: "加芝士", ja: "チーズ多め" },
  Bacon: { en: "Bacon", de: "Bacon", fr: "Bacon", es: "Bacon", ru: "Бекон", ar: "بيكون", zh: "培根", ja: "ベーコン" },
  "Karamelize soğan": { en: "Caramelized onion", de: "Karamellisierte Zwiebel", fr: "Oignon caramélisé", es: "Cebolla caramelizada", ru: "Карамелиз. лук", ar: "بصل مكرمل", zh: "焦糖洋葱", ja: "飴色玉ねぎ" },
  "Patates kızartması": { en: "French fries", de: "Pommes", fr: "Frites", es: "Patatas fritas", ru: "Картофель фри", ar: "بطاطس مقلية", zh: "薯条", ja: "フライドポテト" },
  Muz: { en: "Banana", de: "Banane", fr: "Banane", es: "Plátano", ru: "Банан", ar: "موز", zh: "香蕉", ja: "バナナ" },
  Çilek: { en: "Strawberry", de: "Erdbeere", fr: "Fraise", es: "Fresa", ru: "Клубника", ar: "فراولة", zh: "草莓", ja: "イチゴ" },
  "Çikolata sos": { en: "Chocolate sauce", de: "Schokosauce", fr: "Sauce chocolat", es: "Salsa de chocolate", ru: "Шоколадный соус", ar: "صلصة شوكولاتة", zh: "巧克力酱", ja: "チョコソース" },
  Nutella: { en: "Nutella", de: "Nutella", fr: "Nutella", es: "Nutella", ru: "Nutella", ar: "نوتيلا", zh: "能多益", ja: "ヌテラ" },
  Bal: { en: "Honey", de: "Honig", fr: "Miel", es: "Miel", ru: "Мёд", ar: "عسل", zh: "蜂蜜", ja: "はちみつ" },
  Fındık: { en: "Hazelnut", de: "Haselnuss", fr: "Noisette", es: "Avellana", ru: "Фундук", ar: "بندق", zh: "榛子", ja: "ヘーゼルナッツ" },
  Ceviz: { en: "Walnut", de: "Walnuss", fr: "Noix", es: "Nuez", ru: "Грецкий орех", ar: "جوز", zh: "核桃", ja: "クルミ" },
  Dondurma: { en: "Ice cream", de: "Eis", fr: "Glace", es: "Helado", ru: "Мороженое", ar: "آيس كريم", zh: "冰淇淋", ja: "アイス" },
  "Krem şanti": { en: "Whipped cream", de: "Sahne", fr: "Chantilly", es: "Nata montada", ru: "Взбитые сливки", ar: "كريمة مخفوقة", zh: "鲜奶油", ja: "ホイップ" },
  "Lotus sos": { en: "Lotus sauce", de: "Lotus-Sauce", fr: "Sauce Lotus", es: "Salsa Lotus", ru: "Соус Lotus", ar: "صلصة لوتس", zh: "Lotus酱", ja: "ロータスソース" },
  "Ekstra kaşar": { en: "Extra kashar", de: "Extra Kashar", fr: "Kashar extra", es: "Kashar extra", ru: "Доп. кашар", ar: "قشّار إضافي", zh: "加卡沙尔", ja: "カシャル多め" },
  Sucuk: { en: "Sucuk", de: "Sucuk", fr: "Sucuk", es: "Sucuk", ru: "Суджук", ar: "سجق", zh: "苏朱克", ja: "スジュク" },
  Domates: { en: "Tomato", de: "Tomate", fr: "Tomate", es: "Tomate", ru: "Томат", ar: "طماطم", zh: "番茄", ja: "トマト" },
  Zeytin: { en: "Olive", de: "Olive", fr: "Olive", es: "Aceituna", ru: "Олива", ar: "زيتون", zh: "橄榄", ja: "オリーブ" },
  "Protein tozu": { en: "Protein powder", de: "Proteinpulver", fr: "Protéine en poudre", es: "Proteína en polvo", ru: "Протеин", ar: "بروتين", zh: "蛋白粉", ja: "プロテイン" },
  Granola: { en: "Granola", de: "Granola", fr: "Granola", es: "Granola", ru: "Гранола", ar: "جرانولا", zh: "格兰诺拉", ja: "グラノーラ" },
  Şekerli: { en: "With sugar", de: "Mit Zucker", fr: "Sucré", es: "Con azúcar", ru: "С сахаром", ar: "بسكر", zh: "加糖", ja: "砂糖あり" },
  "Az şeker": { en: "Less sugar", de: "Weniger Zucker", fr: "Peu de sucre", es: "Poco azúcar", ru: "Меньше сахара", ar: "قليل السكر", zh: "少糖", ja: "微糖" },
  Şekersiz: { en: "No sugar", de: "Ohne Zucker", fr: "Sans sucre", es: "Sin azúcar", ru: "Без сахара", ar: "بدون سكر", zh: "无糖", ja: "無糖" },
  Beyaz: { en: "White", de: "Weiß", fr: "Blanc", es: "Blanco", ru: "Белый", ar: "أبيض", zh: "白面包", ja: "ホワイト" },
  "Tam buğday": { en: "Whole wheat", de: "Vollkorn", fr: "Complet", es: "Integral", ru: "Цельнозерновой", ar: "قمح كامل", zh: "全麦", ja: "全粒粉" },
  Ciabatta: { en: "Ciabatta", de: "Ciabatta", fr: "Ciabatta", es: "Ciabatta", ru: "Чиабатта", ar: "تشاباتا", zh: "恰巴塔", ja: "チャバタ" },
  Avokado: { en: "Avocado", de: "Avocado", fr: "Avocat", es: "Aguacate", ru: "Авокадо", ar: "أفوكادو", zh: "牛油果", ja: "アボカド" },
  Turşu: { en: "Pickle", de: "Gurke", fr: "Cornichon", es: "Pepinillo", ru: "Соленье", ar: "مخلل", zh: "泡菜", ja: "ピクルス" },
  "1 top": { en: "1 scoop", de: "1 Kugel", fr: "1 boule", es: "1 bola", ru: "1 шарик", ar: "كرة واحدة", zh: "1球", ja: "1スクープ" },
  "2 top": { en: "2 scoops", de: "2 Kugeln", fr: "2 boules", es: "2 bolas", ru: "2 шарика", ar: "كرتان", zh: "2球", ja: "2スクープ" },
  "3 top": { en: "3 scoops", de: "3 Kugeln", fr: "3 boules", es: "3 bolas", ru: "3 шарика", ar: "3 كرات", zh: "3球", ja: "3スクープ" },
};

export function secenekMetinCevir(metin: string, dil: MenuDil): string {
  if (dil === "tr") return metin;
  return SEGENEK_CEVIR[metin]?.[dil] ?? metin;
}
