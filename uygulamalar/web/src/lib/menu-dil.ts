import type { Urun } from "@/lib/store";

export type MenuDil = "tr" | "en" | "de" | "fr" | "es" | "ru" | "ar" | "zh" | "ja";

export const MENU_DILLER: { id: MenuDil; etiket: string; ad: string; bayrak: string }[] = [
  { id: "tr", etiket: "TR", ad: "Türkçe", bayrak: "🇹🇷" },
  { id: "en", etiket: "EN", ad: "English", bayrak: "🇬🇧" },
  { id: "de", etiket: "DE", ad: "Deutsch", bayrak: "🇩🇪" },
  { id: "fr", etiket: "FR", ad: "Français", bayrak: "🇫🇷" },
  { id: "es", etiket: "ES", ad: "Español", bayrak: "🇪🇸" },
  { id: "ru", etiket: "RU", ad: "Русский", bayrak: "🇷🇺" },
  { id: "ar", etiket: "AR", ad: "العربية", bayrak: "🇸🇦" },
  { id: "zh", etiket: "中文", ad: "中文", bayrak: "🇨🇳" },
  { id: "ja", etiket: "日本語", ad: "日本語", bayrak: "🇯🇵" },
];

export function dilRtlMi(dil: MenuDil) {
  return dil === "ar";
}

type Ceviri = Partial<Record<Exclude<MenuDil, "tr">, string>>;

/** TR anahtar → diğer diller */
const URUN_AD: Record<string, Ceviri> = {
  latte: { en: "Latte", de: "Latte", fr: "Latte", es: "Latte", ru: "Латте", ar: "لاتيه", zh: "拿铁", ja: "ラテ" },
  cappuccino: { en: "Cappuccino", de: "Cappuccino", fr: "Cappuccino", es: "Capuchino", ru: "Капучино", ar: "كابتشينو", zh: "卡布奇诺", ja: "カプチーノ" },
  americano: { en: "Americano", de: "Americano", fr: "Americano", es: "Americano", ru: "Американо", ar: "أمريكانو", zh: "美式咖啡", ja: "アメリカーノ" },
  espresso: { en: "Espresso", de: "Espresso", fr: "Espresso", es: "Espresso", ru: "Эспрессо", ar: "إسبريسو", zh: "意式浓缩", ja: "エスプレッソ" },
  waffle: { en: "Waffle", de: "Waffel", fr: "Gaufre", es: "Gofre", ru: "Вафля", ar: "وافل", zh: "华夫饼", ja: "ワッフル" },
  cheesecake: { en: "Cheesecake", de: "Käsekuchen", fr: "Cheesecake", es: "Tarta de queso", ru: "Чизкейк", ar: "تشيز كيك", zh: "芝士蛋糕", ja: "チーズケーキ" },
  brownie: { en: "Brownie", de: "Brownie", fr: "Brownie", es: "Brownie", ru: "Брауни", ar: "براوني", zh: "布朗尼", ja: "ブラウニー" },
  pizza: { en: "Pizza", de: "Pizza", fr: "Pizza", es: "Pizza", ru: "Пицца", ar: "بيتزا", zh: "披萨", ja: "ピザ" },
  hamburger: { en: "Hamburger", de: "Hamburger", fr: "Hamburger", es: "Hamburguesa", ru: "Гамбургер", ar: "همبرغر", zh: "汉堡", ja: "ハンバーガー" },
  cheeseburger: { en: "Cheeseburger", de: "Cheeseburger", fr: "Cheeseburger", es: "Hamburguesa con queso", ru: "Чизбургер", ar: "تشيز برغر", zh: "芝士汉堡", ja: "チーズバーガー" },
  "filtre kahve": { en: "Filter coffee", de: "Filterkaffee", fr: "Café filtre", es: "Café de filtro", ru: "Фильтр-кофе", ar: "قهوة مفلترة", zh: "滴滤咖啡", ja: "フィルターコーヒー" },
  "türk kahvesi": { en: "Turkish coffee", de: "Türkischer Kaffee", fr: "Café turc", es: "Café turco", ru: "Турецкий кофе", ar: "قهوة تركية", zh: "土耳其咖啡", ja: "トルココーヒー" },
  "turk kahvesi": { en: "Turkish coffee", de: "Türkischer Kaffee", fr: "Café turc", es: "Café turco", ru: "Турецкий кофе", ar: "قهوة تركية", zh: "土耳其咖啡", ja: "トルココーヒー" },
  çay: { en: "Tea", de: "Tee", fr: "Thé", es: "Té", ru: "Чай", ar: "شاي", zh: "茶", ja: "お茶" },
  cay: { en: "Tea", de: "Tee", fr: "Thé", es: "Té", ru: "Чай", ar: "شاي", zh: "茶", ja: "お茶" },
  su: { en: "Water", de: "Wasser", fr: "Eau", es: "Agua", ru: "Вода", ar: "ماء", zh: "水", ja: "水" },
  ayran: { en: "Ayran", de: "Ayran", fr: "Ayran", es: "Ayran", ru: "Айран", ar: "عيران", zh: "艾兰", ja: "アイラン" },
  limonata: { en: "Lemonade", de: "Limonade", fr: "Limonade", es: "Limonada", ru: "Лимонад", ar: "ليموناضة", zh: "柠檬水", ja: "レモネード" },
  kruvasan: { en: "Croissant", de: "Croissant", fr: "Croissant", es: "Cruasán", ru: "Круассан", ar: "كرواسون", zh: "可颂", ja: "クロワッサン" },
  croissant: { en: "Croissant", de: "Croissant", fr: "Croissant", es: "Cruasán", ru: "Круассан", ar: "كرواسون", zh: "可颂", ja: "クロワッサン" },
  cookie: { en: "Cookie", de: "Keks", fr: "Cookie", es: "Galleta", ru: "Печенье", ar: "كوكي", zh: "曲奇", ja: "クッキー" },
  "sıcak çikolata": { en: "Hot chocolate", de: "Heiße Schokolade", fr: "Chocolat chaud", es: "Chocolate caliente", ru: "Горячий шоколад", ar: "شوكولاتة ساخنة", zh: "热巧克力", ja: "ホットチョコレート" },
  "sicak cikolata": { en: "Hot chocolate", de: "Heiße Schokolade", fr: "Chocolat chaud", es: "Chocolate caliente", ru: "Горячий шоколад", ar: "شوكولاتة ساخنة", zh: "热巧克力", ja: "ホットチョコレート" },
  smoothie: { en: "Smoothie", de: "Smoothie", fr: "Smoothie", es: "Batido", ru: "Смузи", ar: "سموذي", zh: "冰沙", ja: "スムージー" },
  milkshake: { en: "Milkshake", de: "Milchshake", fr: "Milk-shake", es: "Batido de leche", ru: "Молочный коктейль", ar: "ميلك شيك", zh: "奶昔", ja: "ミルクシェイク" },
  salata: { en: "Salad", de: "Salat", fr: "Salade", es: "Ensalada", ru: "Салат", ar: "سلطة", zh: "沙拉", ja: "サラダ" },
  "patates kızartması": { en: "French fries", de: "Pommes", fr: "Frites", es: "Patatas fritas", ru: "Картофель фри", ar: "بطاطس مقلية", zh: "薯条", ja: "フライドポテト" },
  tost: { en: "Toast", de: "Toast", fr: "Toast", es: "Tostada", ru: "Тост", ar: "توست", zh: "吐司", ja: "トースト" },
  sandviç: { en: "Sandwich", de: "Sandwich", fr: "Sandwich", es: "Sándwich", ru: "Сэндвич", ar: "ساندويتش", zh: "三明治", ja: "サンドイッチ" },
  sandvic: { en: "Sandwich", de: "Sandwich", fr: "Sandwich", es: "Sándwich", ru: "Сэндвич", ar: "ساندويتش", zh: "三明治", ja: "サンドイッチ" },
  omlet: { en: "Omelette", de: "Omelett", fr: "Omelette", es: "Tortilla francesa", ru: "Омлет", ar: "أومليت", zh: "煎蛋卷", ja: "オムレツ" },
  "sucuklu yumurta": {
    en: "Eggs with sucuk",
    de: "Eier mit Sucuk",
    fr: "Œufs au sucuk",
    es: "Huevos con sucuk",
    ru: "Яйца с суджуком",
    ar: "بيض مع سجق",
    zh: "苏朱克煎蛋",
    ja: "スジュク入り卵",
  },
  granola: { en: "Granola bowl", de: "Granola-Bowl", fr: "Bol granola", es: "Bowl de granola", ru: "Гранола", ar: "جرانولا", zh: "格兰诺拉", ja: "グラノーラ" },
  "granola bowl": { en: "Granola bowl", de: "Granola-Bowl", fr: "Bol granola", es: "Bowl de granola", ru: "Гранола", ar: "جرانولا", zh: "格兰诺拉", ja: "グラノーラ" },
  menemen: { en: "Menemen", de: "Menemen", fr: "Menemen", es: "Menemen", ru: "Менемен", ar: "مينيمين", zh: "梅内门蛋", ja: "メネメン" },
  baklava: { en: "Baklava", de: "Baklava", fr: "Baklava", es: "Baklava", ru: "Пахлава", ar: "بقلاوة", zh: "果仁蜜饼", ja: "バクラヴァ" },
  künefe: { en: "Kunefe", de: "Künefe", fr: "Künefe", es: "Künefe", ru: "Кюнефе", ar: "كنافة", zh: "库奈菲", ja: "キュネフェ" },
  kunefe: { en: "Kunefe", de: "Künefe", fr: "Künefe", es: "Künefe", ru: "Кюнефе", ar: "كنافة", zh: "库奈菲", ja: "キュネフェ" },
  dondurma: { en: "Ice cream", de: "Eis", fr: "Glace", es: "Helado", ru: "Мороженое", ar: "آيس كريم", zh: "冰淇淋", ja: "アイスクリーム" },
  soda: { en: "Soda", de: "Soda", fr: "Soda", es: "Soda", ru: "Содовая", ar: "صودا", zh: "苏打", ja: "ソーダ" },
  kola: { en: "Cola", de: "Cola", fr: "Cola", es: "Cola", ru: "Кола", ar: "كولا", zh: "可乐", ja: "コーラ" },
  "soğuk kahve": { en: "Iced coffee", de: "Eiskaffee", fr: "Café glacé", es: "Café helado", ru: "Айс-кофе", ar: "قهوة مثلجة", zh: "冰咖啡", ja: "アイスコーヒー" },
  "soguk kahve": { en: "Iced coffee", de: "Eiskaffee", fr: "Café glacé", es: "Café helado", ru: "Айс-кофе", ar: "قهوة مثلجة", zh: "冰咖啡", ja: "アイスコーヒー" },
  "demlik çay": { en: "Pot of tea", de: "Teekanne", fr: "Théière", es: "Tetera", ru: "Чайник", ar: "إبريق شاي", zh: "一壶茶", ja: "ポットティー" },
  "çiğ köfte": { en: "Cig kofte", de: "Cig köfte", fr: "Cig köfte", es: "Cig köfte", ru: "Чиг кёфте", ar: "تشيغ كفتة", zh: "生肉丸", ja: "チグ・キョフテ" },
};

const ACIKLAMA: Record<string, Ceviri> = {
  frambuaz: { en: "Raspberry", de: "Himbeere", fr: "Framboise", es: "Frambuesa", ru: "Малина", ar: "توت العليق", zh: "覆盆子", ja: "ラズベリー" },
  "frambuaz sos": {
    en: "Raspberry sauce",
    de: "Himbeersauce",
    fr: "Sauce framboise",
    es: "Salsa de frambuesa",
    ru: "Малиновый соус",
    ar: "صلصة توت العليق",
    zh: "覆盆子酱",
    ja: "ラズベリーソース",
  },
  "sıcak servis": { en: "Served hot", de: "Heiß serviert", fr: "Servi chaud", es: "Servido caliente", ru: "Подаётся горячим", ar: "يُقدَّم ساخناً", zh: "热食", ja: "熱々で提供" },
  "sicak servis": { en: "Served hot", de: "Heiß serviert", fr: "Servi chaud", es: "Servido caliente", ru: "Подаётся горячим", ar: "يُقدَّم ساخناً", zh: "热食", ja: "熱々で提供" },
  tereyağlı: { en: "Buttery", de: "Buttrig", fr: "Beurré", es: "Mantecoso", ru: "Сливочный", ar: "بالزبدة", zh: "黄油味", ja: "バター風味" },
  tereyagli: { en: "Buttery", de: "Buttrig", fr: "Beurré", es: "Mantecoso", ru: "Сливочный", ar: "بالزبدة", zh: "黄油味", ja: "バター風味" },
  "günlük çekirdek": { en: "Daily roast", de: "Täglich geröstet", fr: "Torréfaction du jour", es: "Tueste diario", ru: "Свежая обжарка", ar: "تحميص يومي", zh: "当日烘焙", ja: "当日焙煎" },
  "gunluk cekirdek": { en: "Daily roast", de: "Täglich geröstet", fr: "Torréfaction du jour", es: "Tueste diario", ru: "Свежая обжарка", ar: "تحميص يومي", zh: "当日烘焙", ja: "当日焙煎" },
  "ev yapımı": { en: "Homemade", de: "Hausgemacht", fr: "Fait maison", es: "Casero", ru: "Домашний", ar: "منزلي", zh: "自制", ja: "手作り" },
  klasik: { en: "Classic", de: "Klassisch", fr: "Classique", es: "Clásico", ru: "Классический", ar: "كلاسيكي", zh: "经典", ja: "クラシック" },
  "taze sıkılmış": { en: "Freshly squeezed", de: "Frisch gepresst", fr: "Pressé frais", es: "Recién exprimido", ru: "Свежевыжатый", ar: "معصور طازج", zh: "鲜榨", ja: "搾りたて" },
  ballı: { en: "With honey", de: "Mit Honig", fr: "Au miel", es: "Con miel", ru: "С мёдом", ar: "بالعسل", zh: "加蜂蜜", ja: "はちみつ入り" },
  çikolatalı: { en: "Chocolate", de: "Schokolade", fr: "Chocolat", es: "Chocolate", ru: "Шоколад", ar: "شوكولاتة", zh: "巧克力", ja: "チョコレート" },
  vanilyalı: { en: "Vanilla", de: "Vanille", fr: "Vanille", es: "Vainilla", ru: "Ваниль", ar: "فانيليا", zh: "香草", ja: "バニラ" },
  sade: { en: "Plain", de: "Natur", fr: "Nature", es: "Natural", ru: "Простой", ar: "سادة", zh: "原味", ja: "プレーン" },
  şekersiz: { en: "Sugar-free", de: "Zuckerfrei", fr: "Sans sucre", es: "Sin azúcar", ru: "Без сахара", ar: "بدون سكر", zh: "无糖", ja: "砂糖なし" },
  soğuk: { en: "Cold", de: "Kalt", fr: "Froid", es: "Frío", ru: "Холодный", ar: "بارد", zh: "冰", ja: "冷たい" },
  sıcak: { en: "Hot", de: "Heiß", fr: "Chaud", es: "Caliente", ru: "Горячий", ar: "ساخن", zh: "热", ja: "ホット" },
  kaşarlı: { en: "With kashar cheese", de: "Mit Kashar-Käse", fr: "Au fromage kashar", es: "Con queso kashar", ru: "С сыром кашар", ar: "بجبنة قشار", zh: "加卡沙尔芝士", ja: "カシャルチーズ入り" },
  kasarli: { en: "With kashar cheese", de: "Mit Kashar-Käse", fr: "Au fromage kashar", es: "Con queso kashar", ru: "С сыром кашар", ar: "بجبنة قشار", zh: "加卡沙尔芝士", ja: "カシャルチーズ入り" },
  "günün sandviçi": {
    en: "Sandwich of the day",
    de: "Sandwich des Tages",
    fr: "Sandwich du jour",
    es: "Sándwich del día",
    ru: "Сэндвич дня",
    ar: "ساندويتش اليوم",
    zh: "今日三明治",
    ja: "本日のサンドイッチ",
  },
  "gunun sandvici": {
    en: "Sandwich of the day",
    de: "Sandwich des Tages",
    fr: "Sandwich du jour",
    es: "Sándwich del día",
    ru: "Сэндвич дня",
    ar: "ساندويتش اليوم",
    zh: "今日三明治",
    ja: "本日のサンドイッチ",
  },
  "3 yumurta": { en: "3 eggs", de: "3 Eier", fr: "3 œufs", es: "3 huevos", ru: "3 яйца", ar: "3 بيضات", zh: "3个鸡蛋", ja: "卵3個" },
  "köy yumurtası": {
    en: "Farm eggs",
    de: "Hofeier",
    fr: "Œufs de ferme",
    es: "Huevos de granja",
    ru: "Деревенские яйца",
    ar: "بيض بلدي",
    zh: "农场鸡蛋",
    ja: "放し飼い卵",
  },
  "koy yumurtasi": {
    en: "Farm eggs",
    de: "Hofeier",
    fr: "Œufs de ferme",
    es: "Huevos de granja",
    ru: "Деревенские яйца",
    ar: "بيض بلدي",
    zh: "农场鸡蛋",
    ja: "放し飼い卵",
  },
  "yoğurt & meyve": {
    en: "Yogurt & fruit",
    de: "Joghurt & Obst",
    fr: "Yaourt & fruits",
    es: "Yogur y fruta",
    ru: "Йогурт и фрукты",
    ar: "زبادي وفاكهة",
    zh: "酸奶配水果",
    ja: "ヨーグルト＆フルーツ",
  },
  "yogurt & meyve": {
    en: "Yogurt & fruit",
    de: "Joghurt & Obst",
    fr: "Yaourt & fruits",
    es: "Yogur y fruta",
    ru: "Йогурт и фрукты",
    ar: "زبادي وفاكهة",
    zh: "酸奶配水果",
    ja: "ヨーグルト＆フルーツ",
  },
};

const KATEGORI: Record<string, Ceviri> = {
  içecekler: { en: "Drinks", de: "Getränke", fr: "Boissons", es: "Bebidas", ru: "Напитки", ar: "مشروبات", zh: "饮品", ja: "ドリンク" },
  icecekler: { en: "Drinks", de: "Getränke", fr: "Boissons", es: "Bebidas", ru: "Напитки", ar: "مشروبات", zh: "饮品", ja: "ドリンク" },
  atıştırmalık: { en: "Snacks", de: "Snacks", fr: "En-cas", es: "Aperitivos", ru: "Закуски", ar: "وجبات خفيفة", zh: "小食", ja: "スナック" },
  atistirmalik: { en: "Snacks", de: "Snacks", fr: "En-cas", es: "Aperitivos", ru: "Закуски", ar: "وجبات خفيفة", zh: "小食", ja: "スナック" },
  tatlılar: { en: "Desserts", de: "Desserts", fr: "Desserts", es: "Postres", ru: "Десерты", ar: "حلويات", zh: "甜品", ja: "デザート" },
  tatlilar: { en: "Desserts", de: "Desserts", fr: "Desserts", es: "Postres", ru: "Десерты", ar: "حلويات", zh: "甜品", ja: "デザート" },
  yemekler: { en: "Mains", de: "Hauptgerichte", fr: "Plats", es: "Platos", ru: "Основные", ar: "أطباق رئيسية", zh: "主菜", ja: "メイン" },
  salatalar: { en: "Salads", de: "Salate", fr: "Salades", es: "Ensaladas", ru: "Салаты", ar: "سلطات", zh: "沙拉", ja: "サラダ" },
  çorbalar: { en: "Soups", de: "Suppen", fr: "Soupes", es: "Sopas", ru: "Супы", ar: "شوربات", zh: "汤", ja: "スープ" },
  kahvaltı: { en: "Breakfast", de: "Frühstück", fr: "Petit-déjeuner", es: "Desayuno", ru: "Завтрак", ar: "فطور", zh: "早餐", ja: "朝食" },
  kahvalti: { en: "Breakfast", de: "Frühstück", fr: "Petit-déjeuner", es: "Desayuno", ru: "Завтрак", ar: "فطور", zh: "早餐", ja: "朝食" },
};

const ALERJEN: Record<string, Ceviri> = {
  Gluten: { en: "Gluten", de: "Gluten", fr: "Gluten", es: "Gluten", ru: "Глютен", ar: "غلوتين", zh: "麸质", ja: "グルテン" },
  Laktoz: { en: "Lactose", de: "Laktose", fr: "Lactose", es: "Lactosa", ru: "Лактоза", ar: "لاكتوز", zh: "乳糖", ja: "乳糖" },
  Süt: { en: "Lactose", de: "Laktose", fr: "Lactose", es: "Lactosa", ru: "Лактоза", ar: "لاكتوز", zh: "乳糖", ja: "乳糖" },
  Yumurta: { en: "Egg", de: "Ei", fr: "Œuf", es: "Huevo", ru: "Яйцо", ar: "بيض", zh: "蛋", ja: "卵" },
  Balık: { en: "Fish", de: "Fisch", fr: "Poisson", es: "Pescado", ru: "Рыба", ar: "سمك", zh: "鱼", ja: "魚" },
  Susam: { en: "Sesame", de: "Sesam", fr: "Sésame", es: "Sésamo", ru: "Кунжут", ar: "سمسم", zh: "芝麻", ja: "ごま" },
  Soya: { en: "Soy", de: "Soja", fr: "Soja", es: "Soja", ru: "Соя", ar: "صويا", zh: "大豆", ja: "大豆" },
  "Sert kabuklu yemiş": { en: "Tree nuts", de: "Schalenfrüchte", fr: "Fruits à coque", es: "Frutos secos", ru: "Орехи", ar: "مكسرات", zh: "坚果", ja: "ナッツ" },
  "Yer fıstığı": { en: "Peanuts", de: "Erdnüsse", fr: "Arachides", es: "Cacahuetes", ru: "Арахис", ar: "فول سوداني", zh: "花生", ja: "落花生" },
  "Kabuklu deniz": { en: "Shellfish", de: "Schalentiere", fr: "Crustacés", es: "Mariscos", ru: "Моллюски", ar: "محار", zh: "贝类", ja: "甲殻類" },
  Yumuşakça: { en: "Molluscs", de: "Weichtiere", fr: "Mollusques", es: "Moluscos", ru: "Моллюски", ar: "رخويات", zh: "软体动物", ja: "軟体動物" },
  Kereviz: { en: "Celery", de: "Sellerie", fr: "Céleri", es: "Apio", ru: "Сельдерей", ar: "كرفس", zh: "芹菜", ja: "セロリ" },
  Hardal: { en: "Mustard", de: "Senf", fr: "Moutarde", es: "Mostaza", ru: "Горчица", ar: "خردل", zh: "芥末", ja: "マスタード" },
  "Acı bakla": { en: "Lupin", de: "Lupine", fr: "Lupin", es: "Altramuces", ru: "Люпин", ar: " الترمس", zh: "羽扇豆", ja: "ルピン" },
  Sülfit: { en: "Sulphites", de: "Sulfite", fr: "Sulfites", es: "Sulfitos", ru: "Сульфиты", ar: "كبريتيت", zh: "亚硫酸盐", ja: "亜硫酸塩" },
};

const MASA_ONEK: Record<Exclude<MenuDil, "tr">, string> = {
  en: "Table ",
  de: "Tisch ",
  fr: "Table ",
  es: "Mesa ",
  ru: "Стол ",
  ar: "طاولة ",
  zh: "桌号 ",
  ja: "テーブル ",
};

const UI: Record<string, Record<MenuDil, string>> = {
  garson: {
    tr: "Garson çağır",
    en: "Call waiter",
    de: "Kellner rufen",
    fr: "Appeler le serveur",
    es: "Llamar al camarero",
    ru: "Позвать официанта",
    ar: "استدعاء النادل",
    zh: "呼叫服务员",
    ja: "店員を呼ぶ",
  },
  hesap: {
    tr: "Hesap iste",
    en: "Request bill",
    de: "Rechnung bitten",
    fr: "Demander l'addition",
    es: "Pedir la cuenta",
    ru: "Счёт",
    ar: "طلب الفاتورة",
    zh: "买单",
    ja: "お会計",
  },
  sepete: {
    tr: "Sepete ekle",
    en: "Add to cart",
    de: "In den Warenkorb",
    fr: "Ajouter",
    es: "Añadir",
    ru: "В корзину",
    ar: "أضف إلى السلة",
    zh: "加入购物车",
    ja: "カートに追加",
  },
  kapat: {
    tr: "Kapat",
    en: "Close",
    de: "Schließen",
    fr: "Fermer",
    es: "Cerrar",
    ru: "Закрыть",
    ar: "إغلاق",
    zh: "关闭",
    ja: "閉じる",
  },
  dilSec: {
    tr: "Dil",
    en: "Language",
    de: "Sprache",
    fr: "Langue",
    es: "Idioma",
    ru: "Язык",
    ar: "اللغة",
    zh: "语言",
    ja: "言語",
  },
  icerik: {
    tr: "İçerik",
    en: "Ingredients",
    de: "Zutaten",
    fr: "Ingrédients",
    es: "Ingredientes",
    ru: "Состав",
    ar: "المكونات",
    zh: "配料",
    ja: "原材料",
  },
  besin: {
    tr: "Besin değerleri",
    en: "Nutrition",
    de: "Nährwerte",
    fr: "Valeurs nutritionnelles",
    es: "Valores nutricionales",
    ru: "Пищевая ценность",
    ar: "القيم الغذائية",
    zh: "营养成分",
    ja: "栄養成分",
  },
  alerjen: {
    tr: "Alerjenler",
    en: "Allergens",
    de: "Allergene",
    fr: "Allergènes",
    es: "Alérgenos",
    ru: "Аллергены",
    ar: "مسببات الحساسية",
    zh: "过敏原",
    ja: "アレルゲン",
  },
  protein: {
    tr: "Protein",
    en: "Protein",
    de: "Eiweiß",
    fr: "Protéines",
    es: "Proteínas",
    ru: "Белки",
    ar: "بروتين",
    zh: "蛋白质",
    ja: "たんぱく質",
  },
  yag: {
    tr: "Yağ",
    en: "Fat",
    de: "Fett",
    fr: "Lipides",
    es: "Grasas",
    ru: "Жиры",
    ar: "دهون",
    zh: "脂肪",
    ja: "脂質",
  },
  karbonhidrat: {
    tr: "Karbonhidrat",
    en: "Carbs",
    de: "Kohlenhydrate",
    fr: "Glucides",
    es: "Carbohidratos",
    ru: "Углеводы",
    ar: "كربوهيدرات",
    zh: "碳水化合物",
    ja: "炭水化物",
  },
  kalori: {
    tr: "Kalori",
    en: "Calories",
    de: "Kalorien",
    fr: "Calories",
    es: "Calorías",
    ru: "Калории",
    ar: "سعرات",
    zh: "卡路里",
    ja: "カロリー",
  },
  siparisKapali: {
    tr: "Bu işletmede masadan sipariş kapalı. Menüyü görüntüleyebilirsiniz.",
    en: "Table ordering is closed. You can still browse the menu.",
    de: "Tischbestellung ist geschlossen. Sie können die Speisekarte ansehen.",
    fr: "Commande à table fermée. Vous pouvez consulter le menu.",
    es: "Pedidos en mesa cerrados. Puede ver el menú.",
    ru: "Заказ со стола закрыт. Меню доступно для просмотра.",
    ar: "طلب الطاولة مغلق. يمكنك تصفح القائمة.",
    zh: "桌边点餐已关闭。您仍可浏览菜单。",
    ja: "テーブル注文は停止中です。メニューはご覧いただけます。",
  },
  hesabim: {
    tr: "Hesabım",
    en: "My bill",
    de: "Meine Rechnung",
    fr: "Mon addition",
    es: "Mi cuenta",
    ru: "Мой счёт",
    ar: "فاتورتي",
    zh: "我的账单",
    ja: "お会計",
  },
  hesapGor: {
    tr: "Hesabı gör / öde",
    en: "View & pay bill",
    de: "Rechnung ansehen",
    fr: "Voir et payer",
    es: "Ver y pagar",
    ru: "Счёт и оплата",
    ar: "عرض ودفع الفاتورة",
    zh: "查看并支付",
    ja: "会計を見る",
  },
  kartlaOde: {
    tr: "Kartla öde",
    en: "Pay by card",
    de: "Mit Karte zahlen",
    fr: "Payer par carte",
    es: "Pagar con tarjeta",
    ru: "Оплатить картой",
    ar: "الدفع بالبطاقة",
    zh: "刷卡支付",
    ja: "カードで支払う",
  },
  bahsis: {
    tr: "Bahşiş",
    en: "Tip",
    de: "Trinkgeld",
    fr: "Pourboire",
    es: "Propina",
    ru: "Чаевые",
    ar: "بقشيش",
    zh: "小费",
    ja: "チップ",
  },
  bahsisYok: {
    tr: "Yok",
    en: "None",
    de: "Kein",
    fr: "Aucun",
    es: "Ninguna",
    ru: "Нет",
    ar: "بدون",
    zh: "无",
    ja: "なし",
  },
  araToplam: {
    tr: "Ara toplam",
    en: "Subtotal",
    de: "Zwischensumme",
    fr: "Sous-total",
    es: "Subtotal",
    ru: "Подытог",
    ar: "المجموع الفرعي",
    zh: "小计",
    ja: "小計",
  },
  genelToplam: {
    tr: "Toplam",
    en: "Total",
    de: "Gesamt",
    fr: "Total",
    es: "Total",
    ru: "Итого",
    ar: "الإجمالي",
    zh: "合计",
    ja: "合計",
  },
  hesapBos: {
    tr: "Bu masada henüz açık hesap yok. Önce sipariş verin.",
    en: "No open bill on this table yet. Order first.",
    de: "Noch keine offene Rechnung. Bitte zuerst bestellen.",
    fr: "Pas encore d'addition. Commandez d'abord.",
    es: "Aún no hay cuenta abierta. Pida primero.",
    ru: "Открытого счёта пока нет. Сначала закажите.",
    ar: "لا توجد فاتورة مفتوحة بعد. اطلب أولاً.",
    zh: "此桌暂无未结账单。请先点餐。",
    ja: "まだお会計がありません。先にご注文ください。",
  },
  hesapYukleniyor: {
    tr: "Hesap yükleniyor…",
    en: "Loading bill…",
    de: "Rechnung wird geladen…",
    fr: "Chargement de l'addition…",
    es: "Cargando cuenta…",
    ru: "Загрузка счёта…",
    ar: "جاري تحميل الفاتورة…",
    zh: "正在加载账单…",
    ja: "お会計を読み込み中…",
  },
  odemeBasarili: {
    tr: "Ödeme alındı",
    en: "Payment successful",
    de: "Zahlung erfolgreich",
    fr: "Paiement réussi",
    es: "Pago correcto",
    ru: "Оплата прошла",
    ar: "تم الدفع بنجاح",
    zh: "支付成功",
    ja: "お支払い完了",
  },
  odemeTesekkur: {
    tr: "Afiyet olsun — garson bilgilendirildi.",
    en: "Enjoy — your waiter has been notified.",
    de: "Guten Appetit — Kellner wurde benachrichtigt.",
    fr: "Bon appétit — serveur informé.",
    es: "Buen provecho — camarero avisado.",
    ru: "Приятного аппетита — официант уведомлён.",
    ar: "بالهنا — تم إبلاغ النادل.",
    zh: "请慢用——服务员已收到通知。",
    ja: "ありがとうございます。店員に通知しました。",
  },
  odemeIsleniyor: {
    tr: "Ödeme işleniyor…",
    en: "Processing payment…",
    de: "Zahlung wird verarbeitet…",
    fr: "Paiement en cours…",
    es: "Procesando pago…",
    ru: "Обработка платежа…",
    ar: "جاري معالجة الدفع…",
    zh: "正在处理支付…",
    ja: "お支払い処理中…",
  },
  odemeHata: {
    tr: "Ödeme tamamlanamadı — tekrar deneyin.",
    en: "Payment failed — please try again.",
    de: "Zahlung fehlgeschlagen — bitte erneut versuchen.",
    fr: "Échec du paiement — réessayez.",
    es: "Pago fallido — inténtelo de nuevo.",
    ru: "Ошибка оплаты — попробуйте снова.",
    ar: "فشل الدفع — حاول مرة أخرى.",
    zh: "支付失败——请重试。",
    ja: "お支払いに失敗しました。もう一度お試しください。",
  },
  odemeSimulasyon: {
    tr: "Demo modu — kart çekimi simüle edilir (Iyzico / PayTR anahtarı eklenince canlı olur).",
    en: "Demo mode — card charge is simulated until Iyzico/PayTR keys are set.",
    de: "Demo — Kartenzahlung wird simuliert, bis Iyzico/PayTR-Schlüssel gesetzt sind.",
    fr: "Démo — paiement carte simulé jusqu'à la config Iyzico/PayTR.",
    es: "Demo — cobro simulado hasta configurar Iyzico/PayTR.",
    ru: "Демо — оплата картой симулируется без ключей Iyzico/PayTR.",
    ar: "وضع تجريبي — يتم محاكاة الدفع حتى ضبط مفاتيح Iyzico/PayTR.",
    zh: "演示模式——配置 Iyzico/PayTR 密钥后即可真实收款。",
    ja: "デモモード — Iyzico/PayTR 設定までカード決済はシミュレーションです。",
  },
  odemeGuvenli: {
    tr: "Güvenli ödeme · Iyzico / PayTR",
    en: "Secure payment · Iyzico / PayTR",
    de: "Sichere Zahlung · Iyzico / PayTR",
    fr: "Paiement sécurisé · Iyzico / PayTR",
    es: "Pago seguro · Iyzico / PayTR",
    ru: "Безопасная оплата · Iyzico / PayTR",
    ar: "دفع آمن · Iyzico / PayTR",
    zh: "安全支付 · Iyzico / PayTR",
    ja: "安全なお支払い · Iyzico / PayTR",
  },
  alerjenFiltre: {
    tr: "Alerjen filtrele",
    en: "Filter allergens",
    de: "Allergene filtern",
    fr: "Filtrer allergènes",
    es: "Filtrar alérgenos",
    ru: "Фильтр аллергенов",
    ar: "تصفية مسببات الحساسية",
    zh: "过敏原筛选",
    ja: "アレルゲン絞り込み",
  },
  alerjenHaric: {
    tr: "İçermesin",
    en: "Exclude",
    de: "Ohne",
    fr: "Sans",
    es: "Sin",
    ru: "Без",
    ar: "بدون",
    zh: "不含",
    ja: "除外",
  },
  alerjenYok: {
    tr: "Belirtilen alerjen yok",
    en: "No listed allergens",
    de: "Keine angegebenen Allergene",
    fr: "Aucun allergène listé",
    es: "Sin alérgenos indicados",
    ru: "Указанных аллергенов нет",
    ar: "لا مسببات حساسية مذكورة",
    zh: "无列出的过敏原",
    ja: "記載アレルゲンなし",
  },
  filtreSonucYok: {
    tr: "Bu filtreye uyan ürün yok",
    en: "No products match this filter",
    de: "Keine Produkte für diesen Filter",
    fr: "Aucun produit pour ce filtre",
    es: "Ningún producto con este filtro",
    ru: "Нет блюд по этому фильтру",
    ar: "لا منتجات بهذا التصفية",
    zh: "没有符合筛选的产品",
    ja: "条件に合う商品がありません",
  },
  filtreTemizle: {
    tr: "Filtreyi temizle",
    en: "Clear filter",
    de: "Filter löschen",
    fr: "Effacer le filtre",
    es: "Borrar filtro",
    ru: "Сбросить фильтр",
    ar: "مسح التصفية",
    zh: "清除筛选",
    ja: "フィルター解除",
  },
  ara: {
    tr: "Ara",
    en: "Search",
    de: "Suchen",
    fr: "Rechercher",
    es: "Buscar",
    ru: "Поиск",
    ar: "بحث",
    zh: "搜索",
    ja: "検索",
  },
  araPlaceholder: {
    tr: "Ürün veya içerik ara",
    en: "Search dishes or ingredients",
    de: "Gerichte oder Zutaten suchen",
    fr: "Rechercher un plat",
    es: "Buscar plato o ingrediente",
    ru: "Поиск блюда",
    ar: "ابحث عن طبق",
    zh: "搜索菜品或配料",
    ja: "料理・食材を検索",
  },
  paylas: {
    tr: "Paylaş",
    en: "Share",
    de: "Teilen",
    fr: "Partager",
    es: "Compartir",
    ru: "Поделиться",
    ar: "مشاركة",
    zh: "分享",
    ja: "共有",
  },
  linkKopyalandi: {
    tr: "Menü linki kopyalandı",
    en: "Menu link copied",
    de: "Menü-Link kopiert",
    fr: "Lien du menu copié",
    es: "Enlace copiado",
    ru: "Ссылка скопирована",
    ar: "تم نسخ رابط القائمة",
    zh: "菜单链接已复制",
    ja: "メニューのリンクをコピーしました",
  },
  gorunum: {
    tr: "Görünüm",
    en: "Layout",
    de: "Ansicht",
    fr: "Affichage",
    es: "Vista",
    ru: "Вид",
    ar: "العرض",
    zh: "布局",
    ja: "表示",
  },
  duzenListe: {
    tr: "Liste",
    en: "List",
    de: "Liste",
    fr: "Liste",
    es: "Lista",
    ru: "Список",
    ar: "قائمة",
    zh: "列表",
    ja: "リスト",
  },
  duzenIzgara: {
    tr: "Izgara",
    en: "Grid",
    de: "Raster",
    fr: "Grille",
    es: "Cuadrícula",
    ru: "Сетка",
    ar: "شبكة",
    zh: "网格",
    ja: "グリッド",
  },
  duzenDergi: {
    tr: "Dergi",
    en: "Magazine",
    de: "Magazin",
    fr: "Magazine",
    es: "Revista",
    ru: "Журнал",
    ar: "مجلة",
    zh: "杂志",
    ja: "マガジン",
  },
  secenekAciklama: {
    tr: "İstediğiniz seçenekleri işaretleyin",
    en: "Choose your options",
    de: "Optionen wählen",
    fr: "Choisissez vos options",
    es: "Elija opciones",
    ru: "Выберите опции",
    ar: "اختر الخيارات",
    zh: "选择选项",
    ja: "オプションを選んでください",
  },
  secenekCoklu: {
    tr: "birden fazla",
    en: "multi-select",
    de: "mehrere",
    fr: "plusieurs",
    es: "varios",
    ru: "несколько",
    ar: "متعدد",
    zh: "可多选",
    ja: "複数可",
  },
  secenekZorunlu: {
    tr: "zorunlu",
    en: "required",
    de: "pflicht",
    fr: "obligatoire",
    es: "obligatorio",
    ru: "обязательно",
    ar: "إلزامي",
    zh: "必选",
    ja: "必須",
  },
  secenekDahil: {
    tr: "Dahil",
    en: "Included",
    de: "Inklusive",
    fr: "Inclus",
    es: "Incluido",
    ru: "Включено",
    ar: "مشمول",
    zh: "已含",
    ja: "込み",
  },
  secenekOzet: {
    tr: "Seçim",
    en: "Selection",
    de: "Auswahl",
    fr: "Sélection",
    es: "Selección",
    ru: "Выбор",
    ar: "الاختيار",
    zh: "已选",
    ja: "選択",
  },
  secenekBos: {
    tr: "Malzeme seçmeden de ekleyebilirsiniz.",
    en: "You can add without extras.",
    de: "Auch ohne Extras möglich.",
    fr: "Vous pouvez ajouter sans extras.",
    es: "Puede añadir sin extras.",
    ru: "Можно добавить без допов.",
    ar: "يمكنك الإضافة بدون إضافات.",
    zh: "可不加配料直接加入。",
    ja: "トッピングなしでも追加できます。",
  },
  vazgec: {
    tr: "Vazgeç",
    en: "Cancel",
    de: "Abbrechen",
    fr: "Annuler",
    es: "Cancelar",
    ru: "Отмена",
    ar: "إلغاء",
    zh: "取消",
    ja: "キャンセル",
  },
  secenekli: {
    tr: "Seçenekli",
    en: "Customizable",
    de: "Anpassbar",
    fr: "Personnalisable",
    es: "Personalizable",
    ru: "С опциями",
    ar: "قابل للتخصيص",
    zh: "可选配",
    ja: "カスタム可",
  },
  garsonCagrildi: {
    tr: "Garson çağrıldı ✓",
    en: "Waiter called ✓",
    de: "Kellner gerufen ✓",
    fr: "Serveur appelé ✓",
    es: "Camarero llamado ✓",
    ru: "Официант вызван ✓",
    ar: "تم استدعاء النادل ✓",
    zh: "已呼叫服务员 ✓",
    ja: "店員を呼びました ✓",
  },
  hesapIstendi: {
    tr: "Hesap istendi ✓",
    en: "Bill requested ✓",
    de: "Rechnung angefordert ✓",
    fr: "Addition demandée ✓",
    es: "Cuenta solicitada ✓",
    ru: "Счёт запрошен ✓",
    ar: "تم طلب الفاتورة ✓",
    zh: "已请求结账 ✓",
    ja: "お会計を依頼しました ✓",
  },
  suIste: {
    tr: "Su",
    en: "Water",
    de: "Wasser",
    fr: "Eau",
    es: "Agua",
    ru: "Вода",
    ar: "ماء",
    zh: "水",
    ja: "水",
  },
  suIstendi: {
    tr: "Su isteği gönderildi ✓",
    en: "Water requested ✓",
    de: "Wasser angefordert ✓",
    fr: "Eau demandée ✓",
    es: "Agua solicitada ✓",
    ru: "Вода запрошена ✓",
    ar: "تم طلب الماء ✓",
    zh: "已请求水 ✓",
    ja: "水をお願いしました ✓",
  },
  peceteIste: {
    tr: "Peçete",
    en: "Napkins",
    de: "Servietten",
    fr: "Serviettes",
    es: "Servilletas",
    ru: "Салфетки",
    ar: "مناديل",
    zh: "纸巾",
    ja: "ナプキン",
  },
  peceteIstendi: {
    tr: "Peçete isteği gönderildi ✓",
    en: "Napkins requested ✓",
    de: "Servietten angefordert ✓",
    fr: "Serviettes demandées ✓",
    es: "Servilletas solicitadas ✓",
    ru: "Салфетки запрошены ✓",
    ar: "تم طلب المناديل ✓",
    zh: "已请求纸巾 ✓",
    ja: "ナプキンをお願いしました ✓",
  },
  ekMalzeme: {
    tr: "Ek malzeme",
    en: "Extras",
    de: "Extras",
    fr: "Extras",
    es: "Extras",
    ru: "Доп. приборы",
    ar: "إضافات",
    zh: "加料",
    ja: "追加",
  },
  ekMalzemeIstendi: {
    tr: "Ek malzeme isteği gönderildi ✓",
    en: "Extras requested ✓",
    de: "Extras angefordert ✓",
    fr: "Extras demandés ✓",
    es: "Extras solicitados ✓",
    ru: "Допы запрошены ✓",
    ar: "تم طلب الإضافات ✓",
    zh: "已请求加料 ✓",
    ja: "追加をお願いしました ✓",
  },
  cagriHata: {
    tr: "Çağrı gönderilemedi — tekrar deneyin.",
    en: "Could not send request — try again.",
    de: "Anfrage konnte nicht gesendet werden — erneut versuchen.",
    fr: "Impossible d'envoyer — réessayez.",
    es: "No se pudo enviar — inténtelo de nuevo.",
    ru: "Не удалось отправить — попробуйте снова.",
    ar: "تعذر إرسال الطلب — حاول مرة أخرى.",
    zh: "发送失败——请重试。",
    ja: "送信できませんでした。もう一度お試しください。",
  },
};

/** Kısa anahtarlar ("su") uzun kelimelerde ("sucuklu") eşleşmesin. */
function sozlukBul(metin: string, sozluk: Record<string, Ceviri>, dil: MenuDil): string | null {
  if (dil === "tr") return null;
  const a = metin.toLocaleLowerCase("tr-TR").trim();
  if (sozluk[a]?.[dil]) return sozluk[a]![dil]!;

  // En uzun anahtardan başla — "sucuklu yumurta" > "su"
  const anahtarlar = Object.keys(sozluk).sort((x, y) => y.length - x.length);
  for (const tr of anahtarlar) {
    const ceviri = sozluk[tr]?.[dil];
    if (!ceviri) continue;
    const anahtar = tr.toLocaleLowerCase("tr-TR");
    if (a === anahtar) return ceviri;
    // 3 karakterden kısa: yalnızca tam eşleşme
    if (anahtar.length < 3) continue;
    // Tam kelime / ifade olarak içeriyor mu?
    if (a.includes(anahtar)) {
      const kacis = anahtar.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(?:^|[\\s,./()+\\-])${kacis}(?:$|[\\s,./)+\\-])`, "i");
      if (re.test(` ${a} `)) return ceviri;
    }
  }
  return null;
}

function aciklamaCevirDil(aciklama: string, dil: MenuDil): string {
  if (dil === "tr") return aciklama;
  const direkt = sozlukBul(aciklama, ACIKLAMA, dil);
  if (direkt) return direkt;
  let sonuc = aciklama;
  const anahtarlar = Object.keys(ACIKLAMA).sort((x, y) => y.length - x.length);
  for (const tr of anahtarlar) {
    const en = ACIKLAMA[tr]?.[dil];
    if (!en || tr.length < 3) continue;
    const re = new RegExp(tr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    sonuc = sonuc.replace(re, en);
  }
  return sonuc;
}

export function kategoriCevir(ad: string, dil: MenuDil): string {
  if (dil === "tr") return ad;
  return sozlukBul(ad, KATEGORI, dil) ?? ad;
}

export function masaEtiket(ad: string, dil: MenuDil): string {
  if (dil === "tr") return ad;
  const onek = MASA_ONEK[dil];
  return ad.replace(/^Masa\s+/i, onek);
}

export function alerjenCevir(ad: string, dil: MenuDil): string {
  if (dil === "tr") return ad;
  return ALERJEN[ad]?.[dil] ?? ad;
}

export function alerjenKisaCevir(ad: string, dil: MenuDil): string {
  if (dil === "tr") {
    if (ad === "Süt") return "Laktoz";
    return ad === "Sert kabuklu yemiş" ? "Yemiş" : ad;
  }
  const kisa: Record<string, Ceviri> = {
    Gluten: ALERJEN.Gluten!,
    Laktoz: ALERJEN.Laktoz!,
    Süt: ALERJEN.Laktoz!,
    Yumurta: ALERJEN.Yumurta!,
    Balık: ALERJEN.Balık!,
    Susam: ALERJEN.Susam!,
    Soya: ALERJEN.Soya!,
    "Sert kabuklu yemiş": {
      en: "Nuts",
      de: "Nüsse",
      fr: "Noix",
      es: "Nueces",
      ru: "Орехи",
      ar: "مكسرات",
      zh: "坚果",
      ja: "ナッツ",
    },
    "Kabuklu deniz": ALERJEN["Kabuklu deniz"]!,
  };
  return kisa[ad]?.[dil] ?? ad;
}

export function uiMetin(anahtar: keyof typeof UI, dil: MenuDil): string {
  return UI[anahtar]?.[dil] ?? UI[anahtar]?.tr ?? anahtar;
}

export function urunAdiGoster(urun: Pick<Urun, "ad" | "adEn">, dil: MenuDil): string {
  if (dil === "tr") return urun.ad;
  // Sözlük her zaman öncelikli — bozuk/yanlış adEn (ör. Sucuklu→Water) ezilmesin
  const sozluk = sozlukBul(urun.ad, URUN_AD, dil);
  if (sozluk) return sozluk;
  if (dil === "en" && urun.adEn?.trim() && urun.adEn.trim() !== urun.ad.trim()) {
    return urun.adEn.trim();
  }
  return urun.ad;
}

export function urunAciklamaGoster(
  urun: Pick<Urun, "aciklama" | "aciklamaEn">,
  dil: MenuDil,
): string | undefined {
  if (!urun.aciklama) return undefined;
  if (dil === "tr") return urun.aciklama;
  const ceviri = aciklamaCevirDil(urun.aciklama, dil);
  if (ceviri !== urun.aciklama) return ceviri;
  if (dil === "en" && urun.aciklamaEn && urun.aciklamaEn !== urun.aciklama) return urun.aciklamaEn;
  return ceviri;
}

/** Geriye uyumluluk: EN alanlarını doldur (sözlük bozuk adEn'i ezer) */
export function uruneDilIsle(urun: Urun): Urun {
  const sozlukAd = sozlukBul(urun.ad, URUN_AD, "en");
  const adEn = sozlukAd ?? urun.adEn ?? null;
  const aciklamaEn = urun.aciklama ? aciklamaCevirDil(urun.aciklama, "en") : null;
  if (!adEn && !aciklamaEn) return urun;
  return {
    ...urun,
    adEn: adEn ?? urun.ad,
    aciklamaEn:
      aciklamaEn && aciklamaEn !== urun.aciklama
        ? aciklamaEn
        : (urun.aciklamaEn ?? urun.aciklama ?? null),
  };
}

/** @deprecated — urunAciklamaGoster kullan */
export function aciklamaCevir(aciklama?: string | null): string | null {
  if (!aciklama?.trim()) return null;
  return aciklamaCevirDil(aciklama, "en");
}
