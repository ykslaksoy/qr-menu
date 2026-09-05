/** Avşar Maden Suyu markasının tüm ürünleri — yanlış tuzlu/erikli ayrımını kaldırır. */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const katalogPath = join(root, "src/toplam-urun-listesi.json");
const menuPath = join(root, "src/isletme-menuleri.json");

const yemekTipleri = [
  "restoran",
  "donerci",
  "pideci",
  "pizzaci",
  "burger",
  "kebapci",
  "corbaci",
  "cigkofteci",
];

/** Avşar içecekleri tüm dükkan tiplerinde seçilebilir */
const tumAvsarTipler = [
  "kafe",
  "kahvaltici",
  "restoran",
  "donerci",
  "pideci",
  "pizzaci",
  "borekci",
  "burger",
  "pastane",
  "kebapci",
  "corbaci",
  "cigkofteci",
];

const tumGazliTipler = ["kafe", ...yemekTipleri];

const kaldirilacakIds = ["tuzlu-soda", "erikli-soda", "tuzlu-erik-soda"];

/** Avşar resmi ürün gamı (avsarmadensuyu.com) */
const avsarUrunler = [
  {
    id: "avsar-sade-maden-suyu",
    ad: "Avşar Sade Maden Suyu",
    fiyat: 35,
    aciklama: "200 ml · doğal maden suyu",
    gorselId: "avsar-soda",
  },
  {
    id: "avsar-tuzlu-erikli-soda",
    ad: "Avşar Tuzlu Erikli Soda",
    fiyat: 45,
    aciklama: "200 ml · şekersiz · yeşil erik aromalı",
    gorselId: "avsar-tuzlu-erikli-soda",
  },
  {
    id: "avsar-karadut-frenk-uzum",
    ad: "Avşar Karadut & Frenk Üzüm",
    fiyat: 45,
    aciklama: "200 ml",
    gorselId: "avsar-soda",
  },
  {
    id: "avsar-mango-ananas",
    ad: "Avşar Mango Ananas",
    fiyat: 45,
    aciklama: "200 ml",
    gorselId: "avsar-soda",
  },
  {
    id: "avsar-tutkumuz",
    ad: "Avşar Tutkumuz",
    fiyat: 45,
    aciklama: "200 ml",
    gorselId: "avsar-soda",
  },
  {
    id: "avsar-coconut",
    ad: "Avşar Coconut",
    fiyat: 45,
    aciklama: "200 ml · hindistan cevizi aromalı",
    gorselId: "avsar-soda",
  },
  {
    id: "avsar-duses-armudu-nektarin",
    ad: "Avşar Düşeş Armudu Nektarin",
    fiyat: 45,
    aciklama: "200 ml",
    gorselId: "avsar-soda",
  },
  {
    id: "avsar-mandalina-c-plus",
    ad: "Avşar Mandalina C Plus",
    fiyat: 45,
    aciklama: "200 ml · C vitamini",
    gorselId: "mandalinli-soda",
  },
  {
    id: "avsar-limon-c-plus",
    ad: "Avşar Limon C Plus",
    fiyat: 45,
    aciklama: "200 ml · C vitamini",
    gorselId: "limonlu-soda",
  },
  {
    id: "avsar-kivi-limon",
    ad: "Avşar Kivi Limon",
    fiyat: 45,
    aciklama: "200 ml",
    gorselId: "limonlu-soda",
  },
  {
    id: "avsar-karpuz-cilek",
    ad: "Avşar Karpuz Çilek",
    fiyat: 45,
    aciklama: "200 ml",
    gorselId: "avsar-soda",
  },
  {
    id: "avsar-yesil-elma",
    ad: "Avşar Yeşil Elma",
    fiyat: 45,
    aciklama: "200 ml",
    gorselId: "elma-gazoz",
  },
  {
    id: "avsar-limon",
    ad: "Avşar Limon",
    fiyat: 45,
    aciklama: "200 ml",
    gorselId: "limonlu-soda",
  },
  {
    id: "avsar-gazoz",
    ad: "Avşar Gazoz",
    fiyat: 45,
    aciklama: "200 ml",
    gorselId: "klasik-gazoz",
  },
  {
    id: "avsar-karamix",
    ad: "Avşar Karamix",
    fiyat: 45,
    aciklama: "200 ml · karamel aromalı",
    gorselId: "avsar-soda",
  },
  {
    id: "avsar-cool-lime",
    ad: "Avşar Cool Lime",
    fiyat: 45,
    aciklama: "200 ml · misket limonu",
    gorselId: "limon-gazoz",
  },
  {
    id: "avsar-limonata",
    ad: "Avşar Limonata",
    fiyat: 45,
    aciklama: "200 ml",
    gorselId: "limonata",
  },
  {
    id: "avsar-kirmizi-elma",
    ad: "Avşar Kırmızı Elma",
    fiyat: 45,
    aciklama: "200 ml",
    gorselId: "elma-gazoz",
  },
  {
    id: "avsar-sirkeli",
    ad: "Avşar Sirkeli",
    fiyat: 45,
    aciklama: "200 ml · elma sirkesi aromalı",
    gorselId: "avsar-soda",
  },
  {
    id: "avsar-berry-hibiscus",
    ad: "Avşar Berry Hibiscus",
    fiyat: 45,
    aciklama: "200 ml",
    gorselId: "avsar-soda",
  },
  {
    id: "avsar-volkanik",
    ad: "Avşar Volkanik",
    fiyat: 45,
    aciklama: "200 ml",
    gorselId: "avsar-soda",
  },
  {
    id: "avsar-tuzlu-karamel",
    ad: "Avşar Tuzlu Karamel",
    fiyat: 45,
    aciklama: "200 ml · şekersiz",
    gorselId: "avsar-soda",
  },
  {
    id: "avsar-greyfurt-yaban-mersini",
    ad: "Avşar Greyfurt Yaban Mersini",
    fiyat: 45,
    aciklama: "200 ml",
    gorselId: "avsar-soda",
  },
];

const avsarIds = avsarUrunler.map((u) => u.id);
const genelSodaIds = ["soda", "limonlu-soda", "mandalinli-soda", "portakalli-soda"];
/** Sade + limonlu soda tüm dükkan tiplerinde */
const tumTipSodaIds = ["soda", "limonlu-soda"];

const katalog = JSON.parse(readFileSync(katalogPath, "utf8"));
const menu = JSON.parse(readFileSync(menuPath, "utf8"));

katalog.urunler = katalog.urunler.filter((u) => !kaldirilacakIds.includes(u.id));
const mevcutIds = new Set(katalog.urunler.map((u) => u.id));

for (const u of avsarUrunler) {
  const idx = katalog.urunler.findIndex((x) => x.id === u.id);
  const kayit = {
    id: u.id,
    ad: u.ad,
    fiyat: u.fiyat,
    aciklama: u.aciklama ?? "",
    gorselId: u.gorselId,
    kategoriEtiket: "gazli",
    tipler: tumAvsarTipler,
  };
  if (idx >= 0) katalog.urunler[idx] = kayit;
  else katalog.urunler.push(kayit);
  mevcutIds.add(u.id);
}

for (const u of katalog.urunler) {
  if (!genelSodaIds.includes(u.id)) continue;
  u.kategoriEtiket = "gazli";
  u.tipler = [...new Set([...u.tipler, ...tumGazliTipler])];
  if (tumTipSodaIds.includes(u.id)) {
    u.tipler = [...new Set([...u.tipler, ...tumAvsarTipler])];
  }
}

katalog.urunSayisi = katalog.urunler.length;
writeFileSync(katalogPath, JSON.stringify(katalog, null, 2) + "\n");

for (const tip of menu.tipler) {
  if (!tumAvsarTipler.includes(tip.id)) continue;
  const set = new Set(tip.urunIds.filter((id) => !kaldirilacakIds.includes(id)));
  for (const id of avsarIds) set.add(id);
  if (tumGazliTipler.includes(tip.id)) {
    for (const id of genelSodaIds) set.add(id);
  }
  if (tumAvsarTipler.includes(tip.id)) {
    for (const id of tumTipSodaIds) set.add(id);
  }
  tip.urunIds = [...set];
}

writeFileSync(menuPath, JSON.stringify(menu, null, 2) + "\n");
console.log("Avşar:", avsarUrunler.length, "ürün · kaldırılan:", kaldirilacakIds.length, "· katalog:", katalog.urunler.length);
