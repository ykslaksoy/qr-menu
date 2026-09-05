/** Gazlı içecek katalog girişlerini üretir (helal, Türkiye menü standardı). */
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

const tumGazliTipler = ["kafe", ...yemekTipleri];

/** id, ad, fiyat, gorselId, aciklama?, tipler? */
const yeniUrunler = [
  { id: "pepsi", ad: "Pepsi", fiyat: 60, gorselId: "pepsi", aciklama: "330 ml" },
  { id: "portakalli-gazoz", ad: "Portakallı Gazoz", fiyat: 55, gorselId: "portakalli-gazoz", aciklama: "330 ml" },
  { id: "limon-gazoz", ad: "Limon Gazoz", fiyat: 55, gorselId: "limon-gazoz", aciklama: "330 ml" },
  { id: "uludag-gazoz", ad: "Uludağ Gazoz", fiyat: 50, gorselId: "uludag-gazoz", aciklama: "200 ml" },
  { id: "cola-turka", ad: "Cola Turka", fiyat: 55, gorselId: "cola-turka", aciklama: "330 ml" },
  { id: "tonik", ad: "Tonik", fiyat: 55, gorselId: "tonik", aciklama: "330 ml" },
  { id: "ice-tea-limon", ad: "Ice Tea Limon", fiyat: 50, gorselId: "ice-tea-limon", aciklama: "330 ml" },
  { id: "ice-tea-seftali", ad: "Ice Tea Şeftali", fiyat: 50, gorselId: "ice-tea-seftali", aciklama: "330 ml" },
  { id: "enerji-icecegi", ad: "Enerji İçeceği", fiyat: 75, gorselId: "enerji-icecegi", aciklama: "250 ml" },
  { id: "visneli-gazoz", ad: "Vişneli Gazoz", fiyat: 55, gorselId: "visneli-gazoz", aciklama: "330 ml" },
  { id: "elma-gazoz", ad: "Elmalı Gazoz", fiyat: 55, gorselId: "elma-gazoz", aciklama: "330 ml" },
  { id: "klasik-gazoz", ad: "Klasik Gazoz", fiyat: 45, gorselId: "klasik-gazoz", aciklama: "200 ml" },
  { id: "mandalina-gazoz", ad: "Mandalina Gazoz", fiyat: 55, gorselId: "mandalina-gazoz", aciklama: "330 ml" },
  { id: "sade-gazoz", ad: "Sade Gazoz", fiyat: 40, gorselId: "sade-gazoz", aciklama: "200 ml" },
];

const kafeGazliIds = [
  "kola",
  "pepsi",
  "portakalli-gazoz",
  "limon-gazoz",
  "uludag-gazoz",
  "cola-turka",
  "tonik",
  "ice-tea",
  "ice-tea-limon",
  "ice-tea-seftali",
  "enerji-icecegi",
  "visneli-gazoz",
  "elma-gazoz",
  "klasik-gazoz",
  "mandalina-gazoz",
  "sade-gazoz",
  "soda",
  "limonlu-soda",
  "mandalinli-soda",
  "portakalli-soda",
  "corcil",
  "limonata",
];

const katalog = JSON.parse(readFileSync(katalogPath, "utf8"));
const menu = JSON.parse(readFileSync(menuPath, "utf8"));
const mevcutIds = new Set(katalog.urunler.map((u) => u.id));

for (const u of yeniUrunler) {
  if (mevcutIds.has(u.id)) continue;
  katalog.urunler.push({
    id: u.id,
    ad: u.ad,
    fiyat: u.fiyat,
    aciklama: u.aciklama ?? "",
    gorselId: u.gorselId,
    kategoriEtiket: "gazli",
    tipler: u.tipler ?? tumGazliTipler,
  });
  mevcutIds.add(u.id);
}

// Kola + ice-tea tip genişletme
for (const u of katalog.urunler) {
  if (u.id === "kola" && !u.tipler.includes("kafe")) {
    u.tipler = [...new Set([...u.tipler, "kafe"])];
    u.kategoriEtiket = "gazli";
  }
  if (u.id === "ice-tea") {
    u.tipler = [...new Set([...u.tipler, ...tumGazliTipler])];
    u.kategoriEtiket = "gazli";
  }
  if (["soda", "limonlu-soda", "mandalinli-soda", "portakalli-soda", "corcil", "limonata"].includes(u.id)) {
    u.kategoriEtiket = u.id.includes("soda") || u.id === "corcil" ? "gazli" : u.kategoriEtiket;
  }
}

writeFileSync(katalogPath, JSON.stringify(katalog, null, 2) + "\n");

const kafe = menu.tipler.find((t) => t.id === "kafe");
if (kafe) {
  const set = new Set(kafe.urunIds);
  for (const id of kafeGazliIds) set.add(id);
  kafe.urunIds = [...set];
}

for (const tipId of yemekTipleri) {
  const tip = menu.tipler.find((t) => t.id === tipId);
  if (!tip) continue;
  const set = new Set(tip.urunIds);
  for (const id of ["pepsi", "portakalli-gazoz", "limon-gazoz", "ice-tea-limon"]) set.add(id);
  tip.urunIds = [...set];
}

writeFileSync(menuPath, JSON.stringify(menu, null, 2) + "\n");
console.log("Gazlı ürün:", yeniUrunler.length, "yeni · katalog:", katalog.urunler.length);
