/** Sofra işletme verisi — MVP localStorage; API gelince aynı tipler kullanılır. */

export type PlanId = "ucretsiz" | "menu" | "menu-adisyon" | "tam";
export type OdemeTipi = "aylik" | "yillik";
export type SiparisDurum = "yeni" | "mutfak" | "hazir" | "servis" | "iptal" | "odendi";

export type Kategori = {
  id: string;
  ad: string;
  sira: number;
};

export type Urun = {
  id: string;
  kategoriId: string;
  ad: string;
  fiyat: number;
  aciklama: string;
  stokTakibi: boolean;
  kalanAdet: number;
  kritikSeviye: number;
  aktif: boolean;
  /** Hazır katalog yolu veya yüklenen data URL (72 dpi ekran sürümü) */
  gorselUrl: string | null;
  /** Yüklenen fotoğrafın 300 dpi baskı sürümü; hazır SVG'de null */
  gorselUrlBaski?: string | null;
  /** hazir = Sofra kataloğu, yukleme = işletmenin kendi fotoğrafı */
  gorselKaynak: "hazir" | "yukleme" | null;
  /** Sofra katalog id; null = listeye özel ürün */
  katalogId?: string | null;
  /** Ön–arka menüde sayfa işareti */
  sayfa?: "on" | "arka" | null;
  /** Siparişte seçilen malzemeler / opsiyonlar (ör. waffle üstü) */
  secenekler?: UrunSecenekGrup[] | null;
  /** Alerjen etiketleri (Gluten, Laktoz, Yumurta…) */
  alerjenler?: string[] | null;
  /** Yaklaşık kalori (kcal); yoksa null — besin.kalori tercih edilir */
  kalori?: number | null;
  /** İçerik / malzemeler (müşteri menü) */
  icerik?: string | null;
  /** Besin değerleri (porsiyon başına, yaklaşık) */
  besin?: {
    kalori: number;
    protein?: number | null;
    yag?: number | null;
    karbonhidrat?: number | null;
  } | null;
  /** İngilizce ad / açıklama (menü dil seçimi) */
  adEn?: string | null;
  aciklamaEn?: string | null;
};

/** Ürün seçenek grubu — müşteri ne konmasını istediğini seçer. */
export type UrunSecenekSecim = {
  id: string;
  ad: string;
  /** Baz fiyata eklenecek tutar (₺) */
  fiyatEk: number;
};

export type UrunSecenekGrup = {
  id: string;
  ad: string;
  zorunlu?: boolean;
  /** true = birden fazla seçilebilir */
  coklu?: boolean;
  min?: number;
  max?: number;
  secimler: UrunSecenekSecim[];
};

export type Masa = {
  id: string;
  ad: string;
  sira: number;
};

export type TemaAyar = {
  sablonId: string;
  fontPaketId: string;
  anaRenk: string;
  vurguRengi: string;
  metinRengi: string;
  zeminRengi: string;
  zeminStili: string;
  cerceveId: string;
  kose: number;
  desenId: string;
  /** list | compact-list | price-list | photo-grid | photo-hero | editorial */
  duzenId?: string;
};

/** Kalemin geldiği kanal — çok kanal → tek adisyon */
export type SiparisKanal = "qr" | "dokun" | "ses" | "serbest";

export type SiparisKalemi = {
  urunId: string;
  ad: string;
  fiyat: number;
  adet: number;
  /** Seçilen malzemelerin özeti (mutfak/garson için) */
  secenekOzet?: string;
  secenekIds?: string[];
  /** İkram — tutara yansımaz, raporda görünür */
  ikram?: boolean;
  /** qr | dokun | ses | serbest */
  kanal?: SiparisKanal;
  /** Menü dışı / özel not */
  not?: string;
  /** KDS istasyon ipucu */
  istasyon?: "bar" | "mutfak" | "tatli";
};

export type StokHareketTur = "satis" | "iade" | "sayim" | "giris" | "acilis";

export type StokHareket = {
  id: string;
  urunId: string;
  urunAd: string;
  tur: StokHareketTur;
  delta: number;
  kalan: number;
  zaman: number;
  not?: string;
};

export type KasaOdeme = {
  kanal: OdemeKanal;
  tutar: number;
  zaman: number;
};

export type SiparisTur = "siparis" | "garson" | "hesap" | "odeme";

export type OdemeKanal = "nakit" | "kart-masa" | "online";

export type Siparis = {
  id: string;
  masaId: string;
  masaAd: string;
  kalemler: SiparisKalemi[];
  durum: SiparisDurum;
  olusturulma: number;
  stokDusuldu: boolean;
  /** Varsayılan sipariş; garson/hesap/odeme çağrıları mutfağa düşmez */
  tur?: SiparisTur;
  /** Online / masa ödemesinde bahşiş (TL) */
  bahsis?: number;
  odemeKanal?: OdemeKanal;
  odemeIslemId?: string | null;
  odemeMod?: "canli" | "simulasyon" | null;
  /** Hesap indirimi — yüzde ve/veya TL (ikisi toplanır, ara toplamı aşmaz) */
  indirimYuzde?: number;
  indirimTl?: number;
  /** Kısmi / karışık kasa tahsilatı */
  odemeler?: KasaOdeme[];
};

export type Abonelik = {
  planId: PlanId;
  odemeTipi: OdemeTipi;
  odemeSaglayici: "iyzico" | "paytr" | null;
  referansSlug?: string;
  referansKaynak?: string;
  kalanIndirimAy: number;
  aktif: boolean;
  baslangic: number | null;
};

export type BaskiTalepTuru = "menu" | "adisyon" | "masa-karti";

export type BaskiTalep = {
  id: string;
  tur: BaskiTalepTuru;
  adet: number;
  not?: string;
  olusturulma: number;
  durum: "bekliyor";
};

export type Isletme = {
  kafeAdi: string;
  slug: string;
  /** İşletme logosu — ekran sürümü (data URL veya yol) */
  logoUrl?: string | null;
  /** Logo baskı sürümü (300 dpi PDF için) */
  logoUrlBaski?: string | null;
  /** kafe | restoran | donerci | … */
  isletmeTipi: string | null;
  /** 8 | on-arka-8 | 3x5 | … */
  menuBoyutId: string | null;
  kategoriler: Kategori[];
  urunler: Urun[];
  masalar: Masa[];
  tema: TemaAyar;
  siparisler: Siparis[];
  baskiTalepleri?: BaskiTalep[];
  /** Son stok hareketleri (satış / sayım / giriş) — en yeni başta */
  stokHareketleri?: StokHareket[];
  abonelik: Abonelik;
  olusturulma: number;
};

const STORAGE_KEY = "sofra-isletme-v2";
const LEGACY_KEY = "sofra-isletme";

export function idUret(onek: string) {
  return `${onek}-${Math.random().toString(36).slice(2, 9)}`;
}

export function varsayilanTema(): TemaAyar {
  return {
    sablonId: "sade-acik",
    fontPaketId: "modern",
    anaRenk: "#1f6f5b",
    vurguRengi: "#c45c26",
    metinRengi: "#1c1917",
    zeminRengi: "#f3efe6",
    zeminStili: "solid-warm",
    cerceveId: "thin",
    kose: 12,
    desenId: "pat-none",
    duzenId: "list",
  };
}

export function ornekIsletme(kafeAdi: string, slug: string, ekstra?: Partial<Isletme>): Isletme {
  const katIcecek = idUret("kat");
  const katYemek = idUret("kat");
  const katTatli = idUret("kat");
  const temel: Isletme = {
    kafeAdi,
    slug,
    logoUrl: ekstra?.logoUrl ?? null,
    logoUrlBaski: ekstra?.logoUrlBaski ?? null,
    isletmeTipi: ekstra?.isletmeTipi ?? "kafe",
    menuBoyutId: ekstra?.menuBoyutId ?? null,
    kategoriler: [
      { id: katIcecek, ad: "İçecekler", sira: 1 },
      { id: katYemek, ad: "Yemekler", sira: 2 },
      { id: katTatli, ad: "Tatlılar", sira: 3 },
    ],
    urunler: [
      {
        id: idUret("urun"),
        kategoriId: katIcecek,
        ad: "Filtre Kahve",
        fiyat: 90,
        aciklama: "Günlük çekirdek",
        stokTakibi: true,
        kalanAdet: 40,
        kritikSeviye: 5,
        aktif: true,
        gorselUrl: "/gorseller/kahve.webp",
        gorselKaynak: "hazir",
      },
      {
        id: idUret("urun"),
        kategoriId: katYemek,
        ad: "Sucuklu Yumurta",
        fiyat: 220,
        aciklama: "Köy yumurtası",
        stokTakibi: true,
        kalanAdet: 12,
        kritikSeviye: 3,
        aktif: true,
        gorselUrl: "/gorseller/kahvalti.webp",
        gorselKaynak: "hazir",
      },
      {
        id: idUret("urun"),
        kategoriId: katTatli,
        ad: "Cheesecake",
        fiyat: 160,
        aciklama: "Frambuaz sos",
        stokTakibi: true,
        kalanAdet: 0,
        kritikSeviye: 2,
        aktif: true,
        gorselUrl: "/gorseller/tatli.webp",
        gorselKaynak: "hazir",
      },
    ],
    masalar: [
      { id: idUret("masa"), ad: "Masa 1", sira: 1 },
      { id: idUret("masa"), ad: "Masa 2", sira: 2 },
      { id: idUret("masa"), ad: "Masa 3", sira: 3 },
      { id: idUret("masa"), ad: "Masa 4", sira: 4 },
    ],
    tema: varsayilanTema(),
    siparisler: [],
    baskiTalepleri: [],
    abonelik: {
      planId: "ucretsiz",
      odemeTipi: "aylik",
      odemeSaglayici: null,
      kalanIndirimAy: 0,
      aktif: true,
      baslangic: null,
    },
    olusturulma: Date.now(),
  };

  return {
    ...temel,
    ...ekstra,
    kafeAdi,
    slug,
    abonelik: { ...temel.abonelik, ...ekstra?.abonelik },
    tema: { ...temel.tema, ...ekstra?.tema },
  };
}

function legacyAktar(): Isletme | null {
  try {
    const ham = localStorage.getItem(LEGACY_KEY);
    if (!ham) return null;
    const eski = JSON.parse(ham) as {
      kafeAdi?: string;
      slug?: string;
      referansSlug?: string;
      referansKaynak?: string;
    };
    if (!eski.slug || !eski.kafeAdi) return null;
    const isletme = ornekIsletme(eski.kafeAdi, eski.slug, {
      abonelik: {
        planId: "ucretsiz",
        odemeTipi: "aylik",
        odemeSaglayici: null,
        kalanIndirimAy: 0,
        aktif: true,
        baslangic: null,
        referansSlug: eski.referansSlug,
        referansKaynak: eski.referansKaynak,
      },
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(isletme));
    return isletme;
  } catch {
    return null;
  }
}

export function isletmeOku(): Isletme | null {
  if (typeof window === "undefined") return null;
  try {
    const ham = localStorage.getItem(STORAGE_KEY);
    if (ham) return JSON.parse(ham) as Isletme;
    return legacyAktar();
  } catch {
    return null;
  }
}

export function isletmeYaz(isletme: Isletme) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(isletme));
  window.dispatchEvent(new Event("sofra-isletme"));
}

export function isletmeGuncelle(fn: (onceki: Isletme) => Isletme): Isletme | null {
  const onceki = isletmeOku();
  if (!onceki) return null;
  const sonraki = fn(onceki);
  isletmeYaz(sonraki);
  return sonraki;
}

export function urunTukendiMi(u: Urun) {
  return u.stokTakibi && u.kalanAdet <= 0;
}

export function urunKritikMi(u: Urun) {
  return u.stokTakibi && u.kalanAdet > 0 && u.kalanAdet <= u.kritikSeviye;
}

function stokHareketEkle(
  isletme: Isletme,
  hareketler: Omit<StokHareket, "id">[],
): Isletme {
  if (hareketler.length === 0) return isletme;
  const yeni: StokHareket[] = hareketler.map((h) => ({ ...h, id: idUret("sth") }));
  const onceki = isletme.stokHareketleri ?? [];
  return { ...isletme, stokHareketleri: [...yeni, ...onceki].slice(0, 200) };
}

export function stokDus(isletme: Isletme, kalemler: SiparisKalemi[]): Isletme {
  const hareketler: Omit<StokHareket, "id">[] = [];
  const urunler = isletme.urunler.map((u) => {
    const kalem = kalemler.find((k) => k.urunId === u.id);
    if (!kalem || !u.stokTakibi) return u;
    const kalan = Math.max(0, u.kalanAdet - kalem.adet);
    hareketler.push({
      urunId: u.id,
      urunAd: u.ad,
      tur: "satis",
      delta: -kalem.adet,
      kalan,
      zaman: Date.now(),
    });
    return { ...u, kalanAdet: kalan };
  });
  return stokHareketEkle({ ...isletme, urunler }, hareketler);
}

export function stokGeriEkle(isletme: Isletme, kalemler: SiparisKalemi[]): Isletme {
  const hareketler: Omit<StokHareket, "id">[] = [];
  const urunler = isletme.urunler.map((u) => {
    const kalem = kalemler.find((k) => k.urunId === u.id);
    if (!kalem || !u.stokTakibi) return u;
    const kalan = u.kalanAdet + kalem.adet;
    hareketler.push({
      urunId: u.id,
      urunAd: u.ad,
      tur: "iade",
      delta: kalem.adet,
      kalan,
      zaman: Date.now(),
    });
    return { ...u, kalanAdet: kalan };
  });
  return stokHareketEkle({ ...isletme, urunler }, hareketler);
}

/** Stok takibini aç / kapat; açılışta başlangıç adedi. */
export function stokTakibiAyarla(
  isletme: Isletme,
  urunId: string,
  acik: boolean,
  kalanAdet?: number,
  kritikSeviye?: number,
): Isletme {
  const urun = isletme.urunler.find((u) => u.id === urunId);
  if (!urun) return isletme;
  const kalan = kalanAdet ?? urun.kalanAdet;
  const kritik = kritikSeviye ?? urun.kritikSeviye ?? 5;
  let sonraki: Isletme = {
    ...isletme,
    urunler: isletme.urunler.map((u) =>
      u.id === urunId
        ? { ...u, stokTakibi: acik, kalanAdet: Math.max(0, kalan), kritikSeviye: Math.max(0, kritik) }
        : u,
    ),
  };
  if (acik && !urun.stokTakibi) {
    sonraki = stokHareketEkle(sonraki, [
      {
        urunId,
        urunAd: urun.ad,
        tur: "acilis",
        delta: kalan,
        kalan,
        zaman: Date.now(),
        not: "Stok takibi açıldı",
      },
    ]);
  }
  return sonraki;
}

/** Elle sayım / giriş — kalanı mutlak değer olarak yazar. */
export function stokSayim(
  isletme: Isletme,
  urunId: string,
  kalanAdet: number,
  tur: "sayim" | "giris" = "sayim",
): Isletme {
  const urun = isletme.urunler.find((u) => u.id === urunId);
  if (!urun || !urun.stokTakibi) return isletme;
  const kalan = Math.max(0, Math.floor(kalanAdet));
  const delta = kalan - urun.kalanAdet;
  let sonraki: Isletme = {
    ...isletme,
    urunler: isletme.urunler.map((u) => (u.id === urunId ? { ...u, kalanAdet: kalan } : u)),
  };
  return stokHareketEkle(sonraki, [
    { urunId, urunAd: urun.ad, tur, delta, kalan, zaman: Date.now() },
  ]);
}

export function siparisOlustur(
  isletme: Isletme,
  masaId: string,
  kalemler: SiparisKalemi[],
): Isletme {
  const masa = isletme.masalar.find((m) => m.id === masaId);
  const siparis: Siparis = {
    id: idUret("sip"),
    masaId,
    masaAd: masa?.ad ?? "Masa",
    kalemler,
    durum: "yeni",
    olusturulma: Date.now(),
    stokDusuldu: true,
    tur: "siparis",
  };
  let sonraki = stokDus(isletme, kalemler);
  sonraki = { ...sonraki, siparisler: [siparis, ...sonraki.siparisler] };
  return sonraki;
}

/** Masadan garson / hesap çağrısı — stok düşmez, mutfağa gitmez. */
export function masaCagriOlustur(
  isletme: Isletme,
  masaId: string,
  tur: "garson" | "hesap",
): Isletme {
  const masa = isletme.masalar.find((m) => m.id === masaId);
  const etiket = tur === "garson" ? "Garson çağrısı" : "Hesap isteği";
  const siparis: Siparis = {
    id: idUret("sip"),
    masaId,
    masaAd: masa?.ad ?? "Masa",
    kalemler: [{ urunId: `_cagri_${tur}`, ad: etiket, fiyat: 0, adet: 1 }],
    durum: "yeni",
    olusturulma: Date.now(),
    stokDusuldu: false,
    tur,
  };
  return { ...isletme, siparisler: [siparis, ...isletme.siparisler] };
}

const AKTIF_SIPARIS_DURUMLARI: SiparisDurum[] = ["yeni", "mutfak", "hazir", "servis"];

export function siparisAktifMi(s: Siparis) {
  return AKTIF_SIPARIS_DURUMLARI.includes(s.durum) && (!s.tur || s.tur === "siparis");
}

/** Masanın açık adisyonuna kalem ekler; yoksa yeni sipariş açar. */
export function adisyonaKalemEkle(
  isletme: Isletme,
  masaId: string,
  kalemler: SiparisKalemi[],
  siparisId?: string,
): Isletme {
  const acik = siparisId
    ? isletme.siparisler.find((s) => s.id === siparisId && siparisAktifMi(s))
    : isletme.siparisler.find((s) => s.masaId === masaId && siparisAktifMi(s));

  if (!acik) {
    return siparisOlustur(isletme, masaId, kalemler);
  }

  const birlesik = [...acik.kalemler];
  for (const yeni of kalemler) {
    const mevcut = birlesik.find(
      (k) =>
        k.urunId === yeni.urunId &&
        (k.secenekOzet ?? "") === (yeni.secenekOzet ?? "") &&
        (k.kanal ?? "") === (yeni.kanal ?? ""),
    );
    if (mevcut) mevcut.adet += yeni.adet;
    else birlesik.push(yeni);
  }

  // Geç gelen kalemler hazır/servis adisyonda mutfağın yeniden görmesi için "yeni"
  const durum =
    acik.durum === "hazir" || acik.durum === "servis" ? ("yeni" as const) : acik.durum;

  let sonraki = stokDus(isletme, kalemler);
  sonraki = {
    ...sonraki,
    siparisler: sonraki.siparisler.map((s) =>
      s.id === acik.id ? { ...s, kalemler: birlesik, durum } : s,
    ),
  };
  return sonraki;
}

export function masaAcikAdisyonlar(isletme: Isletme, masaId: string): Siparis[] {
  return isletme.siparisler
    .filter((s) => s.masaId === masaId && siparisAktifMi(s))
    .slice()
    .sort((a, b) => a.olusturulma - b.olusturulma);
}

export function masaAcikAdisyon(isletme: Isletme, masaId: string): Siparis | null {
  return masaAcikAdisyonlar(isletme, masaId)[0] ?? null;
}

function kurus(n: number) {
  return Math.round(n * 100) / 100;
}

export function kalemTutar(k: SiparisKalemi): number {
  if (k.ikram || k.urunId.startsWith("_bahsis") || k.urunId.startsWith("_cagri")) return 0;
  return kurus(k.fiyat * k.adet);
}

export function adisyonAraToplam(siparis: Siparis): number {
  return kurus(siparis.kalemler.reduce((a, k) => a + kalemTutar(k), 0));
}

export function adisyonIndirim(siparis: Siparis): number {
  const ara = adisyonAraToplam(siparis);
  const yuzde = Math.min(100, Math.max(0, siparis.indirimYuzde ?? 0));
  const tl = Math.max(0, siparis.indirimTl ?? 0);
  return Math.min(ara, kurus((ara * yuzde) / 100 + tl));
}

/** Kalemler − indirim (bahşiş hariç). Müşteri ödemesi buna bahşiş ekler. */
export function adisyonToplam(siparis: Siparis): number {
  return Math.max(0, kurus(adisyonAraToplam(siparis) - adisyonIndirim(siparis)));
}

export function adisyonOdenen(siparis: Siparis): number {
  return kurus((siparis.odemeler ?? []).reduce((a, o) => a + o.tutar, 0));
}

export function adisyonKalan(siparis: Siparis): number {
  return Math.max(0, kurus(adisyonToplam(siparis) + (siparis.bahsis ?? 0) - adisyonOdenen(siparis)));
}

export function masaKalanToplam(isletme: Isletme, masaId: string): number {
  return kurus(masaAcikAdisyonlar(isletme, masaId).reduce((a, s) => a + adisyonKalan(s), 0));
}

/**
 * Masadaki tüm açık adisyonları online öder; garsona bildirim bırakır.
 * Bahşiş ilk adisyona yazılır.
 */
export function masaOnlineOde(
  isletme: Isletme,
  masaId: string,
  opts: {
    bahsis?: number;
    islemId: string;
    mod: "canli" | "simulasyon";
    saglayici: "iyzico" | "paytr";
  },
): { isletme: Isletme; hata?: string; toplam?: number; siparisId?: string } {
  const aciklar = masaAcikAdisyonlar(isletme, masaId);
  if (aciklar.length === 0) return { isletme, hata: "Açık hesap yok" };

  const bahsis = Math.max(0, kurus(opts.bahsis ?? 0));
  const araToplam = kurus(aciklar.reduce((a, s) => a + adisyonToplam(s), 0));
  const toplam = kurus(araToplam + bahsis);
  const masa = isletme.masalar.find((m) => m.id === masaId);
  const zaman = Date.now();

  const odendiIds = new Set(aciklar.map((s) => s.id));
  const siparisler = isletme.siparisler.map((s) => {
    if (!odendiIds.has(s.id)) return s;
    const ilk = s.id === aciklar[0]!.id;
    const tutar = adisyonKalan(s) + (ilk ? bahsis : 0);
    const kalemler =
      ilk && bahsis > 0
        ? [...s.kalemler, { urunId: "_bahsis", ad: "Bahşiş", fiyat: bahsis, adet: 1 }]
        : s.kalemler;
    const odeme: KasaOdeme = { kanal: "online", tutar, zaman };
    return {
      ...s,
      kalemler,
      durum: "odendi" as const,
      bahsis: ilk ? bahsis || s.bahsis : s.bahsis,
      odemeKanal: "online" as const,
      odemeIslemId: opts.islemId,
      odemeMod: opts.mod,
      odemeler: [...(s.odemeler ?? []), odeme],
    };
  });

  const bildirim: Siparis = {
    id: idUret("sip"),
    masaId,
    masaAd: masa?.ad ?? aciklar[0]!.masaAd,
    kalemler: [
      {
        urunId: "_cagri_odeme",
        ad: `Online ödeme · ${toplam} TL`,
        fiyat: 0,
        adet: 1,
      },
    ],
    durum: "yeni",
    olusturulma: zaman,
    stokDusuldu: false,
    tur: "odeme",
    bahsis: bahsis || undefined,
    odemeKanal: "online",
    odemeIslemId: opts.islemId,
    odemeMod: opts.mod,
  };

  return {
    isletme: { ...isletme, siparisler: [bildirim, ...siparisler] },
    toplam,
    siparisId: aciklar[0]!.id,
  };
}

/** Adisyondaki kalem adedini günceller; stok farkını uygular. */
export function adisyonKalemGuncelle(
  isletme: Isletme,
  siparisId: string,
  urunId: string,
  yeniAdet: number,
): { isletme: Isletme; hata?: string } {
  if (yeniAdet <= 0) return adisyonKalemSil(isletme, siparisId, urunId);

  const siparis = isletme.siparisler.find((s) => s.id === siparisId);
  if (!siparis) return { isletme, hata: "Sipariş bulunamadı" };

  const kalem = siparis.kalemler.find((k) => k.urunId === urunId);
  if (!kalem) return { isletme, hata: "Kalem bulunamadı" };

  const delta = yeniAdet - kalem.adet;
  if (delta === 0) return { isletme };

  if (delta > 0) {
    const u = isletme.urunler.find((x) => x.id === urunId);
    if (u?.stokTakibi && u.kalanAdet < delta) {
      return { isletme, hata: `${u.ad} için yeterli stok yok` };
    }
    isletme = stokDus(isletme, [{ ...kalem, adet: delta }]);
  } else {
    isletme = stokGeriEkle(isletme, [{ ...kalem, adet: -delta }]);
  }

  const kalemler = siparis.kalemler.map((k) =>
    k.urunId === urunId ? { ...k, adet: yeniAdet } : k,
  );

  return {
    isletme: {
      ...isletme,
      siparisler: isletme.siparisler.map((s) =>
        s.id === siparisId ? { ...s, kalemler } : s,
      ),
    },
  };
}

/** Adisyondan kalem siler; stok iade eder. Son kalem silinirse sipariş iptal olur. */
export function adisyonKalemSil(
  isletme: Isletme,
  siparisId: string,
  urunId: string,
): { isletme: Isletme; hata?: string } {
  const siparis = isletme.siparisler.find((s) => s.id === siparisId);
  if (!siparis) return { isletme, hata: "Sipariş bulunamadı" };

  const kalem = siparis.kalemler.find((k) => k.urunId === urunId);
  if (!kalem) return { isletme, hata: "Kalem bulunamadı" };

  let sonraki = siparis.stokDusuldu ? stokGeriEkle(isletme, [kalem]) : isletme;
  const kalemler = siparis.kalemler.filter((k) => k.urunId !== urunId);

  if (kalemler.length === 0) {
    return {
      isletme: {
        ...sonraki,
        siparisler: sonraki.siparisler.map((s) =>
          s.id === siparisId ? { ...s, kalemler: [], durum: "iptal", stokDusuldu: false } : s,
        ),
      },
    };
  }

  return {
    isletme: {
      ...sonraki,
      siparisler: sonraki.siparisler.map((s) =>
        s.id === siparisId ? { ...s, kalemler } : s,
      ),
    },
  };
}

/** Serbest (menü dışı) kalem ekler — stok takibi yok. */
export function adisyonaSerbestKalemEkle(
  isletme: Isletme,
  masaId: string,
  ad: string,
  fiyat: number,
  adet: number,
  siparisId?: string,
  ekstra?: { not?: string; istasyon?: "bar" | "mutfak" | "tatli" },
): Isletme {
  const kalem: SiparisKalemi = {
    urunId: idUret("serbest"),
    ad: ad.trim(),
    fiyat,
    adet,
    kanal: "serbest",
    not: ekstra?.not?.trim() || undefined,
    istasyon: ekstra?.istasyon,
  };
  return adisyonaKalemEkle(isletme, masaId, [kalem], siparisId);
}

export function adisyonIndirimUygula(
  isletme: Isletme,
  siparisId: string,
  opts: { yuzde?: number; tl?: number },
): { isletme: Isletme; hata?: string } {
  const siparis = isletme.siparisler.find((s) => s.id === siparisId);
  if (!siparis || !siparisAktifMi(siparis)) return { isletme, hata: "Açık adisyon yok" };
  const yuzde = Math.min(100, Math.max(0, opts.yuzde ?? 0));
  const tl = Math.max(0, kurus(opts.tl ?? 0));
  return {
    isletme: {
      ...isletme,
      siparisler: isletme.siparisler.map((s) =>
        s.id === siparisId ? { ...s, indirimYuzde: yuzde || undefined, indirimTl: tl || undefined } : s,
      ),
    },
  };
}

export function adisyonKalemIkram(
  isletme: Isletme,
  siparisId: string,
  urunId: string,
  ikram: boolean,
): { isletme: Isletme; hata?: string } {
  const siparis = isletme.siparisler.find((s) => s.id === siparisId);
  if (!siparis || !siparisAktifMi(siparis)) return { isletme, hata: "Açık adisyon yok" };
  if (!siparis.kalemler.some((k) => k.urunId === urunId)) {
    return { isletme, hata: "Kalem bulunamadı" };
  }
  return {
    isletme: {
      ...isletme,
      siparisler: isletme.siparisler.map((s) =>
        s.id === siparisId
          ? {
              ...s,
              kalemler: s.kalemler.map((k) => (k.urunId === urunId ? { ...k, ikram } : k)),
            }
          : s,
      ),
    },
  };
}

export function kasaOde(
  isletme: Isletme,
  siparisId: string,
  opts: { odemeler: { kanal: OdemeKanal; tutar: number }[]; bahsis?: number },
): { isletme: Isletme; hata?: string } {
  const siparis = isletme.siparisler.find((s) => s.id === siparisId);
  if (!siparis || !siparisAktifMi(siparis)) return { isletme, hata: "Açık adisyon yok" };

  const odemeler = (opts.odemeler ?? [])
    .map((o) => ({ kanal: o.kanal, tutar: kurus(o.tutar) }))
    .filter((o) => o.tutar > 0);
  if (odemeler.length === 0) return { isletme, hata: "Ödeme tutarı girin" };

  const bahsis = Math.max(0, kurus(opts.bahsis ?? 0));
  const guncel: Siparis = {
    ...siparis,
    bahsis: kurus((siparis.bahsis ?? 0) + bahsis) || undefined,
  };
  const kalan = adisyonKalan(guncel);
  const gelen = kurus(odemeler.reduce((a, o) => a + o.tutar, 0));
  if (gelen > kalan + 0.009) return { isletme, hata: "Tutar kalanı aşıyor" };

  const zaman = Date.now();
  const kayit: KasaOdeme[] = odemeler.map((o) => ({ ...o, zaman }));
  const sonrakiOdemeler = [...(siparis.odemeler ?? []), ...kayit];
  const kapanir = gelen >= kalan - 0.009;
  const anaKanal = odemeler.slice().sort((a, b) => b.tutar - a.tutar)[0]!.kanal;

  return {
    isletme: {
      ...isletme,
      siparisler: isletme.siparisler.map((s) =>
        s.id === siparisId
          ? {
              ...guncel,
              odemeler: sonrakiOdemeler,
              odemeKanal: anaKanal,
              durum: kapanir ? "odendi" : s.durum,
            }
          : s,
      ),
    },
  };
}

export function adisyonTasi(
  isletme: Isletme,
  siparisId: string,
  hedefMasaId: string,
): { isletme: Isletme; hata?: string } {
  const siparis = isletme.siparisler.find((s) => s.id === siparisId);
  if (!siparis || !siparisAktifMi(siparis)) return { isletme, hata: "Açık adisyon yok" };
  if (siparis.masaId === hedefMasaId) return { isletme };
  const masa = isletme.masalar.find((m) => m.id === hedefMasaId);
  if (!masa) return { isletme, hata: "Hedef masa bulunamadı" };
  return {
    isletme: {
      ...isletme,
      siparisler: isletme.siparisler.map((s) =>
        s.id === siparisId ? { ...s, masaId: masa.id, masaAd: masa.ad } : s,
      ),
    },
  };
}

export function adisyonBirlestir(
  isletme: Isletme,
  kaynakId: string,
  hedefId: string,
): { isletme: Isletme; hata?: string } {
  if (kaynakId === hedefId) return { isletme, hata: "Aynı adisyon" };
  const kaynak = isletme.siparisler.find((s) => s.id === kaynakId);
  const hedef = isletme.siparisler.find((s) => s.id === hedefId);
  if (!kaynak || !siparisAktifMi(kaynak)) return { isletme, hata: "Kaynak adisyon yok" };
  if (!hedef || !siparisAktifMi(hedef)) return { isletme, hata: "Hedef adisyon yok" };

  const birlesik = [...hedef.kalemler];
  for (const yeni of kaynak.kalemler) {
    const mevcut = birlesik.find(
      (k) => k.urunId === yeni.urunId && Boolean(k.ikram) === Boolean(yeni.ikram),
    );
    if (mevcut) mevcut.adet += yeni.adet;
    else birlesik.push({ ...yeni });
  }

  return {
    isletme: {
      ...isletme,
      siparisler: isletme.siparisler.map((s) => {
        if (s.id === hedefId) {
          return {
            ...s,
            kalemler: birlesik,
            indirimTl: kurus((s.indirimTl ?? 0) + (kaynak.indirimTl ?? 0)) || undefined,
            bahsis: kurus((s.bahsis ?? 0) + (kaynak.bahsis ?? 0)) || undefined,
            odemeler: [...(s.odemeler ?? []), ...(kaynak.odemeler ?? [])],
          };
        }
        if (s.id === kaynakId) {
          return { ...s, kalemler: [], durum: "iptal" as const };
        }
        return s;
      }),
    },
  };
}

export function adisyonBol(
  isletme: Isletme,
  siparisId: string,
  kalemler: { urunId: string; adet: number }[],
  hedefMasaId?: string,
): { isletme: Isletme; hata?: string; yeniSiparisId?: string } {
  const kaynak = isletme.siparisler.find((s) => s.id === siparisId);
  if (!kaynak || !siparisAktifMi(kaynak)) return { isletme, hata: "Açık adisyon yok" };

  const tasinan: SiparisKalemi[] = [];
  const kalanKalemler = kaynak.kalemler.map((k) => ({ ...k }));
  for (const istek of kalemler) {
    const adet = Math.max(0, Math.floor(istek.adet));
    if (adet <= 0) continue;
    const idx = kalanKalemler.findIndex((k) => k.urunId === istek.urunId);
    if (idx < 0) return { isletme, hata: "Kalem bulunamadı" };
    const k = kalanKalemler[idx]!;
    if (adet > k.adet) return { isletme, hata: `${k.ad} için yeterli adet yok` };
    tasinan.push({ ...k, adet });
    if (adet === k.adet) kalanKalemler.splice(idx, 1);
    else kalanKalemler[idx] = { ...k, adet: k.adet - adet };
  }
  if (tasinan.length === 0) return { isletme, hata: "Bölünecek kalem seçin" };
  if (kalanKalemler.length === 0) return { isletme, hata: "Tüm adisyonu taşıyın, bölmeyin" };

  const hedefId = hedefMasaId ?? kaynak.masaId;
  const masa = isletme.masalar.find((m) => m.id === hedefId);
  if (!masa) return { isletme, hata: "Hedef masa bulunamadı" };

  const yeniId = idUret("sip");
  const yeni: Siparis = {
    id: yeniId,
    masaId: masa.id,
    masaAd: masa.ad,
    kalemler: tasinan,
    durum: kaynak.durum,
    olusturulma: Date.now(),
    stokDusuldu: kaynak.stokDusuldu,
    tur: "siparis",
  };

  return {
    isletme: {
      ...isletme,
      siparisler: [
        yeni,
        ...isletme.siparisler.map((s) => (s.id === siparisId ? { ...s, kalemler: kalanKalemler } : s)),
      ],
    },
    yeniSiparisId: yeniId,
  };
}

