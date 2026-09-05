import { stokAlternatifleriBul } from "./stok-alternatif";

export type SesliUrun = {
  id: string;
  ad: string;
  kategoriId: string;
  fiyat: number;
  aktif: boolean;
  stokTakibi: boolean;
  kalanAdet: number;
};

function urunTukendiMi(u: SesliUrun) {
  return u.stokTakibi && u.kalanAdet <= 0;
}

export type SesliKalem = {
  urun: SesliUrun;
  adet: number;
};

export type SesliUyari = {
  aranan: string;
  neden: "bulunamadi" | "tukendi" | "pasif";
  urun?: SesliUrun;
  oneriler: SesliUrun[];
};

export type SesliParseSonuc = {
  kalemler: SesliKalem[];
  uyarilar: SesliUyari[];
  hamMetin: string;
};

const ADET_SOZLUK: Record<string, number> = {
  bir: 1,
  iki: 2,
  uc: 3,
  üç: 3,
  dort: 4,
  dört: 4,
  bes: 5,
  beş: 5,
  alti: 6,
  altı: 6,
  yedi: 7,
  sekiz: 8,
  dokuz: 9,
  on: 10,
};

/** Arama metnini genişletmek için eş anlamlılar (normalize edilmiş anahtar → genişletme). */
export const SESLI_ESANLAMLAR: Record<string, string> = {
  filtre: "filtre kahve",
  cay: "çay",
  latte: "latte",
  su: "su",
  cheesecake: "cheesecake",
};

function normalize(metin: string) {
  return metin
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Eş anlamlı kelimeleri arama metninde genişletir. */
export function esanlamGenislet(metin: string): string {
  const kelimeListesi = metin.split(/\s+/).filter(Boolean);
  return kelimeListesi
    .map((k) => {
      const n = normalize(k);
      return SESLI_ESANLAMLAR[n] ?? k;
    })
    .join(" ");
}

function kelimeler(metin: string) {
  return normalize(metin).split(" ").filter(Boolean);
}

function benzerlikSkoru(a: string, b: string) {
  const ka = kelimeler(a);
  const kb = kelimeler(b);
  if (!ka.length || !kb.length) return 0;
  let ortak = 0;
  for (const k of ka) {
    if (kb.some((x) => x.includes(k) || k.includes(x))) ortak++;
  }
  const tamEslesme = normalize(a) === normalize(b) ? 1 : 0;
  const icerme = normalize(b).includes(normalize(a)) || normalize(a).includes(normalize(b)) ? 0.5 : 0;
  return Math.max(tamEslesme, icerme, ortak / Math.max(ka.length, kb.length));
}

function adetCikar(parca: string): { adet: number; kalan: string } {
  const n = normalize(parca);
  const sayi = n.match(/^(\d+)\s+(.+)$/);
  if (sayi) return { adet: Number(sayi[1]), kalan: sayi[2]! };
  const soz = n.match(/^(bir|iki|uc|üç|dort|dört|bes|beş|alti|altı|yedi|sekiz|dokuz|on)\s+(.+)$/);
  if (soz) return { adet: ADET_SOZLUK[soz[1]!] ?? 1, kalan: soz[2]! };
  return { adet: 1, kalan: parca };
}

function parcalaraBol(metin: string) {
  return metin
    .split(/[,;]|\s+ve\s+|\s+bir de\s+|\s+ayrica\s+|\s+artı\s+|\s+arti\s+/i)
    .map((p) => p.trim())
    .filter(Boolean);
}

function urunEslestir(parca: string, urunler: SesliUrun[]): SesliUrun | null {
  const { kalan } = adetCikar(parca);
  const hedef = normalize(esanlamGenislet(kalan));
  if (!hedef) return null;

  let enIyi: { urun: SesliUrun; skor: number } | null = null;
  for (const u of urunler) {
    const skor = Math.max(benzerlikSkoru(hedef, u.ad), benzerlikSkoru(normalize(kalan), u.ad));
    if (skor >= 0.45 && (!enIyi || skor > enIyi.skor)) {
      enIyi = { urun: u, skor };
    }
  }
  return enIyi?.urun ?? null;
}

function onerilerBul(aranan: string, urunler: SesliUrun[], haricId?: string, kategoriId?: string): SesliUrun[] {
  return stokAlternatifleriBul(esanlamGenislet(aranan), urunler, haricId, kategoriId) as SesliUrun[];
}

export function sesliSiparisParse(metin: string, urunler: SesliUrun[]): SesliParseSonuc {
  const kalemler: SesliKalem[] = [];
  const uyarilar: SesliUyari[] = [];
  const parcalar = parcalaraBol(metin);

  for (const parca of parcalar) {
    const { adet, kalan } = adetCikar(parca);
    const urun = urunEslestir(parca, urunler);

    if (!urun) {
      uyarilar.push({
        aranan: kalan || parca,
        neden: "bulunamadi",
        oneriler: onerilerBul(kalan || parca, urunler),
      });
      continue;
    }

    if (!urun.aktif) {
      uyarilar.push({
        aranan: urun.ad,
        neden: "pasif",
        urun,
        oneriler: onerilerBul(urun.ad, urunler, urun.id, urun.kategoriId),
      });
      continue;
    }

    if (urunTukendiMi(urun) || (urun.stokTakibi && urun.kalanAdet < adet)) {
      uyarilar.push({
        aranan: urun.ad,
        neden: "tukendi",
        urun,
        oneriler: onerilerBul(urun.ad, urunler, urun.id, urun.kategoriId),
      });
      continue;
    }

    const mevcut = kalemler.find((k) => k.urun.id === urun.id);
    if (mevcut) mevcut.adet += adet;
    else kalemler.push({ urun, adet });
  }

  return { kalemler, uyarilar, hamMetin: metin };
}

export function uyariMesaji(u: SesliUyari): string {
  const oneriMetin =
    u.oneriler.length > 0
      ? ` ${u.oneriler.map((o) => o.ad).join(", ")} önerebilirsiniz.`
      : " Başka bir ürün önerebilirsiniz.";

  if (u.neden === "tukendi" && u.urun) {
    return `${u.urun.ad} şu an yok.${oneriMetin}`;
  }
  if (u.neden === "pasif" && u.urun) {
    return `${u.urun.ad} menüde kapalı.${oneriMetin}`;
  }
  return `"${u.aranan}" menüde bulunamadı.${oneriMetin}`;
}
