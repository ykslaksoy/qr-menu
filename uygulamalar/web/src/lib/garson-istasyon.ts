import {
  masaAcikAdisyonlar,
  masaKalanToplam,
  siparisAktifMi,
  type Isletme,
  type Masa,
  type Siparis,
  type SiparisDurum,
} from "@/lib/store";

export type GarsonFiltre = "tumu" | "acik" | "bos" | "cagri" | "hazir" | "mutfak";

export type MasaIstasyon = {
  masa: Masa;
  adisyonlar: Siparis[];
  kalan: number;
  cagri: Siparis | null;
  oncelikDurum: SiparisDurum | "bos";
  enEski: number | null;
  kalemSayisi: number;
};

const ONCELIK: Record<MasaIstasyon["oncelikDurum"], number> = {
  hazir: 0,
  yeni: 1,
  mutfak: 2,
  servis: 3,
  bos: 4,
  iptal: 5,
  odendi: 5,
};

export function cagriMi(s: Siparis) {
  return s.tur === "garson" || s.tur === "hesap" || s.tur === "odeme";
}

export function cagriEtiket(s: Siparis) {
  if (s.tur === "odeme") return s.kalemler[0]?.ad ? `Ödendi · ${s.kalemler[0].ad}` : "Online ödendi";
  if (s.tur === "hesap") return "Hesap istiyor";
  return "Garson çağırdı";
}

export function durumEtiket(d: MasaIstasyon["oncelikDurum"]) {
  if (d === "bos") return "Boş";
  if (d === "yeni") return "Yeni";
  if (d === "mutfak") return "Mutfak";
  if (d === "hazir") return "Hazır";
  if (d === "servis") return "Servis";
  return d;
}

export function dakikaOnce(ts: number, simdi = Date.now()) {
  const dk = Math.max(0, Math.floor((simdi - ts) / 60_000));
  if (dk < 1) return "şimdi";
  if (dk < 60) return `${dk} dk`;
  const sa = Math.floor(dk / 60);
  const kalan = dk % 60;
  return kalan ? `${sa} sa ${kalan} dk` : `${sa} sa`;
}

export function masaOncelikDurum(adisyonlar: Siparis[]): SiparisDurum | "bos" {
  if (adisyonlar.some((s) => s.durum === "hazir")) return "hazir";
  if (adisyonlar.some((s) => s.durum === "yeni")) return "yeni";
  if (adisyonlar.some((s) => s.durum === "mutfak")) return "mutfak";
  if (adisyonlar.some((s) => s.durum === "servis")) return "servis";
  return "bos";
}

export function masaIstasyonlari(isletme: Isletme, cagrilar: Siparis[]): MasaIstasyon[] {
  return isletme.masalar
    .slice()
    .sort((a, b) => a.sira - b.sira)
    .map((masa) => {
      const adisyonlar = masaAcikAdisyonlar(isletme, masa.id);
      return {
        masa,
        adisyonlar,
        kalan: masaKalanToplam(isletme, masa.id),
        cagri: cagrilar.find((c) => c.masaId === masa.id) ?? null,
        oncelikDurum: masaOncelikDurum(adisyonlar),
        enEski: adisyonlar[0]?.olusturulma ?? null,
        kalemSayisi: adisyonlar.reduce((a, s) => a + s.kalemler.length, 0),
      };
    });
}

export function istasyonSirala(liste: MasaIstasyon[]): MasaIstasyon[] {
  return liste.slice().sort((a, b) => {
    const ca = a.cagri ? 0 : 1;
    const cb = b.cagri ? 0 : 1;
    if (ca !== cb) return ca - cb;
    const da = ONCELIK[a.oncelikDurum];
    const db = ONCELIK[b.oncelikDurum];
    if (da !== db) return da - db;
    return a.masa.sira - b.masa.sira;
  });
}

export function istasyonFiltrele(
  liste: MasaIstasyon[],
  filtre: GarsonFiltre,
  ara: string,
): MasaIstasyon[] {
  const q = ara.trim().toLocaleLowerCase("tr-TR");
  return liste.filter((m) => {
    if (q && !m.masa.ad.toLocaleLowerCase("tr-TR").includes(q)) return false;
    if (filtre === "acik") return m.adisyonlar.length > 0;
    if (filtre === "bos") return m.adisyonlar.length === 0 && !m.cagri;
    if (filtre === "cagri") return Boolean(m.cagri);
    if (filtre === "hazir") return m.oncelikDurum === "hazir";
    if (filtre === "mutfak") return m.oncelikDurum === "mutfak" || m.oncelikDurum === "yeni";
    return true;
  });
}

export function garsonOzet(isletme: Isletme, aktif: Siparis[]) {
  const siparisler = aktif.filter((s) => siparisAktifMi(s));
  const cagrilar = aktif.filter(cagriMi);
  const acikMasalar = new Set(siparisler.map((s) => s.masaId)).size;
  const kalan = isletme.masalar.reduce((a, m) => a + masaKalanToplam(isletme, m.id), 0);
  return {
    acikMasalar,
    kalan,
    cagri: cagrilar.length,
    hazir: siparisler.filter((s) => s.durum === "hazir").length,
    mutfak: siparisler.filter((s) => s.durum === "mutfak" || s.durum === "yeni").length,
  };
}
