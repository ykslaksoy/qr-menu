import { dakikaOnce } from "@/lib/garson-istasyon";
import type { Isletme, Siparis, SiparisDurum } from "@/lib/store";

export { dakikaOnce };

export type KdsFiltre = "tumu" | "yeni" | "mutfak" | "hazir" | "geciken";
export type KdsIstasyon = "tumu" | "bar" | "mutfak" | "tatli";
export type KdsAciliyet = "normal" | "uyari" | "kritik";

/** Bekleyen ticket yaş sınırı (dk) — KDS rengi. */
export const KDS_UYARI_DK = 8;
export const KDS_KRITIK_DK = 15;

export function kdsSiparisMi(s: Siparis) {
  return !["iptal", "odendi", "servis"].includes(s.durum) && (!s.tur || s.tur === "siparis");
}

export function kdsDurumEtiket(d: SiparisDurum) {
  if (d === "yeni") return "Yeni";
  if (d === "mutfak") return "Mutfakta";
  if (d === "hazir") return "Hazır";
  if (d === "servis") return "Servis";
  return d;
}

export function kdsDakika(ts: number, simdi = Date.now()) {
  return Math.max(0, Math.floor((simdi - ts) / 60_000));
}

export function kdsAciliyet(ts: number, simdi = Date.now()): KdsAciliyet {
  const dk = kdsDakika(ts, simdi);
  if (dk >= KDS_KRITIK_DK) return "kritik";
  if (dk >= KDS_UYARI_DK) return "uyari";
  return "normal";
}

function kategoriAd(isletme: Isletme, urunId: string) {
  const urun = isletme.urunler.find((u) => u.id === urunId);
  if (!urun) return "";
  return isletme.kategoriler.find((k) => k.id === urun.kategoriId)?.ad ?? "";
}

/** Ürün kategorisinden KDS istasyonu (bar / mutfak / tatlı). */
export function kalemIstasyon(isletme: Isletme, urunId: string): Exclude<KdsIstasyon, "tumu"> {
  const ad = kategoriAd(isletme, urunId).toLocaleLowerCase("tr-TR");
  if (/içecek|icecek|kahve|çay|cay|bar|soğuk|soguk|smoothie|milkshake/.test(ad)) return "bar";
  if (/tatlı|tatli|dessert|pasta|waffle/.test(ad)) return "tatli";
  return "mutfak";
}

export function siparisIstasyonlar(isletme: Isletme, s: Siparis): Set<Exclude<KdsIstasyon, "tumu">> {
  const set = new Set<Exclude<KdsIstasyon, "tumu">>();
  for (const k of s.kalemler) {
    if (k.ikram && k.fiyat === 0 && k.adet === 0) continue;
    set.add(kalemIstasyon(isletme, k.urunId));
  }
  if (set.size === 0) set.add("mutfak");
  return set;
}

export function siparisIstasyonEtiket(isletme: Isletme, s: Siparis) {
  const set = siparisIstasyonlar(isletme, s);
  const sirali = (["bar", "mutfak", "tatli"] as const).filter((x) => set.has(x));
  const etiket: Record<string, string> = { bar: "Bar", mutfak: "Mutfak", tatli: "Tatlı" };
  return sirali.map((x) => etiket[x]).join(" · ");
}

export function kdsSirala(liste: Siparis[]): Siparis[] {
  return liste.slice().sort((a, b) => a.olusturulma - b.olusturulma);
}

export function kdsFiltrele(
  liste: Siparis[],
  isletme: Isletme,
  filtre: KdsFiltre,
  istasyon: KdsIstasyon,
  ara: string,
  simdi = Date.now(),
): Siparis[] {
  const q = ara.trim().toLocaleLowerCase("tr-TR");
  return liste.filter((s) => {
    if (q && !s.masaAd.toLocaleLowerCase("tr-TR").includes(q)) return false;
    if (istasyon !== "tumu" && !siparisIstasyonlar(isletme, s).has(istasyon)) return false;
    if (filtre === "yeni") return s.durum === "yeni";
    if (filtre === "mutfak") return s.durum === "mutfak";
    if (filtre === "hazir") return s.durum === "hazir";
    if (filtre === "geciken") {
      return (s.durum === "yeni" || s.durum === "mutfak") && kdsDakika(s.olusturulma, simdi) >= KDS_UYARI_DK;
    }
    return true;
  });
}

export function kdsOzet(liste: Siparis[], simdi = Date.now()) {
  const bekleyen = liste.filter((s) => s.durum === "yeni" || s.durum === "mutfak");
  return {
    yeni: liste.filter((s) => s.durum === "yeni").length,
    mutfak: liste.filter((s) => s.durum === "mutfak").length,
    hazir: liste.filter((s) => s.durum === "hazir").length,
    geciken: bekleyen.filter((s) => kdsDakika(s.olusturulma, simdi) >= KDS_UYARI_DK).length,
    kalem: bekleyen.reduce((a, s) => a + s.kalemler.reduce((x, k) => x + k.adet, 0), 0),
  };
}
