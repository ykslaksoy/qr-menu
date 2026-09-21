/**
 * isletme-menuleri.json içindeki inline ürünleri toplam kataloğa taşır.
 * Tip tanımları urunIds + varsayilanMenuIds kullanır.
 *
 * Kullanım: node paketler/tema/scripts/urun-katalogu-uret.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const src = join(__dir, "../src/isletme-menuleri.json");

function slug(s) {
  const tr = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };
  return s
    .split("")
    .map((ch) => tr[ch] ?? ch)
    .join("")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "urun";
}

const data = JSON.parse(readFileSync(src, "utf8"));

// Zaten urunIds varsa sadece toplam listeyi yenile
if (data.tipler[0]?.urunIds && !data.tipler[0]?.urunler) {
  const master = {};
  for (const tip of data.tipler) {
    for (const uid of tip.urunIds) {
      if (!master[uid]) master[uid] = { id: uid, tipler: [tip.id] };
      else if (!master[uid].tipler.includes(tip.id)) master[uid].tipler.push(tip.id);
    }
  }
  console.log("Tip tanımları zaten urunIds kullanıyor; inline ürün yok.");
  process.exit(0);
}

const master = {};
const typeRefs = {};

for (const tip of data.tipler) {
  const ids = [];
  for (const u of tip.urunler ?? []) {
    const base = slug(u.ad);
    let uid = base;
    let n = 2;
    while (master[uid] && master[uid].ad !== u.ad) {
      uid = `${base}-${n++}`;
    }
    if (!master[uid]) {
      master[uid] = {
        id: uid,
        ad: u.ad,
        fiyat: u.fiyat,
        aciklama: u.aciklama ?? "",
        gorselId: u.gorselId ?? "genel",
        kategoriEtiket: u.kategori ?? "genel",
        tipler: [tip.id],
      };
    } else if (!master[uid].tipler.includes(tip.id)) {
      master[uid].tipler.push(tip.id);
    }
    ids.push(uid);
  }
  typeRefs[tip.id] = ids;
}

data.varsayilanMenuBoyut = "8";
data.tipler = data.tipler.map((tip) => {
  const ids = typeRefs[tip.id] ?? [];
  const { urunler: _u, ...rest } = tip;
  return {
    ...rest,
    varsayilanBoyut: tip.varsayilanBoyut ?? "8",
    urunIds: ids,
    varsayilanMenuIds: ids.slice(0, 8),
  };
});

const toplam = {
  aciklama: "Tüm dükkan tiplerindeki birleşik ürün kataloğu",
  urunSayisi: Object.keys(master).length,
  urunler: Object.values(master).sort((a, b) => a.ad.localeCompare(b.ad, "tr")),
};

writeFileSync(join(__dir, "../src/isletme-menuleri.json"), JSON.stringify(data, null, 2) + "\n");
writeFileSync(join(__dir, "../src/toplam-urun-listesi.json"), JSON.stringify(toplam, null, 2) + "\n");
console.log("OK:", toplam.urunSayisi, "ürün,", data.tipler.length, "tip");
