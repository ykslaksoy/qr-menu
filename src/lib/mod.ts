/** Oturum modları — her rol ayrı sayfa seti görür. */
export type SofraMod = "platform" | "zincir" | "yonetici" | "garson" | "mutfak";

export const MOD_COOKIE = "sofra_mod";

export const MOD_ETIKET: Record<SofraMod, string> = {
  platform: "Ana yönetici",
  zincir: "Tüm şubelerin yöneticisi",
  yonetici: "Şube yönetici",
  garson: "Şube garson",
  mutfak: "Şube mutfak",
};

export const MOD_ACIKLAMA: Record<SofraMod, string> = {
  platform: "Sofra platformu — tüm işletmeler ve Sofra farkı",
  zincir: "Tüm şubeleri gör, özetle, şubeye gir",
  yonetici: "Tek şube: menü, masalar, stok, abonelik ve dökümanlar",
  garson: "Masa grid, sesli sipariş ve dijital adisyon",
  mutfak: "Bekleyen siparişler ve hazır listesi",
};

export const MOD_ANA_YOL: Record<SofraMod, string> = {
  platform: "/admin",
  zincir: "/subeler",
  yonetici: "/panel",
  garson: "/g",
  mutfak: "/k",
};

/** Her modda olması gereken özellikler (işlevsel yetenekler). */
export type ModOzellik =
  | "isletmeListesi"
  | "platformIstatistik"
  | "impersonate"
  | "subeListesi"
  | "subeyeGir"
  | "sofraFarki"
  | "menuDuzenle"
  | "veriGirisi"
  | "dokumanlar"
  | "tasarim"
  | "masalarQr"
  | "stok"
  | "abonelik"
  | "analitik"
  | "modDegistir"
  | "masaGrid"
  | "sesliSiparis"
  | "manuelUrunEkle"
  | "serbestKalem"
  | "adisyonDuzenle"
  | "adisyonPdf"
  | "siparisDurumGarson"
  | "mutfakBekleyen"
  | "mutfakHazir"
  | "siparisDurumMutfak";

export const MOD_OZELLIK_ETIKET: Record<ModOzellik, string> = {
  isletmeListesi: "Tüm işletmeleri listele",
  platformIstatistik: "Platform özet istatistikleri",
  impersonate: "İşletme yöneticisine gir (impersonate)",
  subeListesi: "Zincire bağlı şubeleri listele",
  subeyeGir: "Şube yönetici ekranına gir",
  sofraFarki: "Sofra farkı / rakip karşılaştırma",
  menuDuzenle: "Menü ve ürün düzenleme",
  veriGirisi: "PDF / hazır menü veri girişi",
  dokumanlar: "Menü PDF, QR, baskı dökümanları",
  tasarim: "Tema ve şablon",
  masalarQr: "Masa tanımı ve QR kodlar",
  stok: "Stok takibi",
  abonelik: "Plan ve ödeme",
  analitik: "Satış analitiği",
  modDegistir: "Garson / mutfak / şube moduna geçiş",
  masaGrid: "Masa listesi ve açık adisyonlar",
  sesliSiparis: "Sesli sipariş alma",
  manuelUrunEkle: "Menüden manuel ürün ekleme",
  serbestKalem: "Menü dışı serbest kalem",
  adisyonDuzenle: "Adisyon kalem +/- sil",
  adisyonPdf: "Canlı adisyon PDF",
  siparisDurumGarson: "Servis, ödeme, iptal (garson)",
  mutfakBekleyen: "Bekleyen sipariş listesi",
  mutfakHazir: "Hazır sipariş listesi",
  siparisDurumMutfak: "Al / hazır durumu (mutfak)",
};

export const MOD_OZELLIKLER: Record<SofraMod, ModOzellik[]> = {
  platform: [
    "isletmeListesi",
    "platformIstatistik",
    "impersonate",
    "sofraFarki",
    "modDegistir",
  ],
  zincir: ["subeListesi", "subeyeGir", "sofraFarki", "modDegistir"],
  yonetici: [
    "menuDuzenle",
    "veriGirisi",
    "dokumanlar",
    "tasarim",
    "masalarQr",
    "stok",
    "abonelik",
    "analitik",
    "sofraFarki",
    "modDegistir",
  ],
  garson: [
    "masaGrid",
    "sesliSiparis",
    "manuelUrunEkle",
    "serbestKalem",
    "adisyonDuzenle",
    "adisyonPdf",
    "siparisDurumGarson",
  ],
  mutfak: ["mutfakBekleyen", "mutfakHazir", "siparisDurumMutfak"],
};

/** Müşteri yüzeyi — oturum yok, /m/[slug] */
export const MUSTERI_OZELLIKLER = [
  "Menü görüntüleme (QR)",
  "Sepetten sipariş gönderme",
  "Masa parametresi ile sipariş",
] as const;

export const MOD_SAYFALAR: Record<SofraMod, string[]> = {
  platform: ["/admin", "/admin/sofra-farki", "/mod"],
  zincir: ["/subeler", "/subeler/sofra-farki", "/mod"],
  yonetici: [
    "/panel",
    "/panel/menu",
    "/panel/veri-girisi",
    "/panel/dokumanlar",
    "/panel/ayarlar",
    "/panel/masalar",
    "/panel/stok",
    "/panel/abonelik",
    "/panel/sofra-farki",
    "/mod",
  ],
  garson: ["/g", "/g/masa/[masaId]"],
  mutfak: ["/k"],
};

export function modOzellikAcikMi(mod: SofraMod, ozellik: ModOzellik): boolean {
  return MOD_OZELLIKLER[mod].includes(ozellik);
}

export function modOzellikleri(mod: SofraMod): ModOzellik[] {
  return MOD_OZELLIKLER[mod];
}

const YONETICI_YOLLAR = ["/panel", "/mod"];
const GARSON_YOLLAR = ["/g", "/mod"];
const MUTFAK_YOLLAR = ["/k", "/mod"];
const PLATFORM_YOLLAR = ["/admin"];
const ZINCIR_YOLLAR = ["/subeler", "/mod"];

export function modGecerliMi(deger: string | undefined | null): deger is SofraMod {
  return (
    deger === "platform" ||
    deger === "zincir" ||
    deger === "yonetici" ||
    deger === "garson" ||
    deger === "mutfak"
  );
}

/** Yol, verilen mod için erişilebilir mi? */
export function modYolaErisir(mod: SofraMod, pathname: string): boolean {
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) return true;
  if (pathname === "/mod") {
    return (
      mod === "yonetici" ||
      mod === "platform" ||
      mod === "zincir" ||
      mod === "garson" ||
      mod === "mutfak"
    );
  }

  const kontrol = (kokler: string[]) =>
    kokler.some((k) => pathname === k || pathname.startsWith(k + "/"));

  switch (mod) {
    case "platform":
      return kontrol(PLATFORM_YOLLAR);
    case "zincir":
      return kontrol(ZINCIR_YOLLAR);
    case "yonetici":
      return kontrol(YONETICI_YOLLAR);
    case "garson":
      return kontrol(GARSON_YOLLAR);
    case "mutfak":
      return kontrol(MUTFAK_YOLLAR);
    default:
      return false;
  }
}

/** Oturum gerekli korumalı yollar */
export function korunanYolMu(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/subeler") ||
    pathname.startsWith("/panel") ||
    pathname.startsWith("/g") ||
    pathname.startsWith("/k") ||
    pathname === "/mod"
  );
}

/** API işlemi hangi modlara açık? */
export type SiparisApiIslem =
  | "musteriSiparis"
  | "personelOku"
  | "adisyonEkle"
  | "serbestKalem"
  | "kalemDuzenle"
  | "durumGarson"
  | "durumMutfak";

const SIPARIS_API_MOD: Record<SiparisApiIslem, SofraMod[]> = {
  musteriSiparis: [],
  personelOku: ["yonetici", "garson", "mutfak"],
  adisyonEkle: ["yonetici", "garson"],
  serbestKalem: ["yonetici", "garson"],
  kalemDuzenle: ["yonetici", "garson"],
  durumGarson: ["yonetici", "garson"],
  durumMutfak: ["yonetici", "mutfak"],
};

export function siparisApiModu(mod: SofraMod | null, islem: SiparisApiIslem): boolean {
  if (islem === "musteriSiparis") return mod === null;
  if (!mod) return false;
  return SIPARIS_API_MOD[islem].includes(mod);
}

/** Garson/mutfak durum geçişleri */
export const MUTFAK_DURUMLAR = new Set(["mutfak", "hazir"]);
export const GARSON_DURUMLAR = new Set(["servis", "odendi", "iptal", "yeni", "mutfak"]);
