import type { Isletme } from "@/lib/store";

export type MasaGuvenlikKayit = {
  /** Garson masayı açtı mı */
  acik: boolean;
  /** İlk bağlanan müşteri cihazı */
  cihazId: string | null;
  /** Garson onayı bekleyen cihaz kimlikleri */
  bekleyen: string[];
};

export type MasaGuvenlikAyarlari = {
  aktif: boolean;
  masalar: Record<string, MasaGuvenlikKayit>;
};

export function masaGuvenlikAl(isletme: Isletme): MasaGuvenlikAyarlari {
  const raw = (isletme as Isletme & { masaGuvenlik?: MasaGuvenlikAyarlari }).masaGuvenlik;
  return raw ?? { aktif: false, masalar: {} };
}

function kayit(isletme: Isletme, masaId: string): MasaGuvenlikKayit {
  const g = masaGuvenlikAl(isletme);
  return g.masalar[masaId] ?? { acik: false, cihazId: null, bekleyen: [] };
}

export function masaGarsonAc(isletme: Isletme, masaId: string): Isletme {
  const g = masaGuvenlikAl(isletme);
  return {
    ...isletme,
    masaGuvenlik: {
      ...g,
      masalar: {
        ...g.masalar,
        [masaId]: { acik: true, cihazId: null, bekleyen: [] },
      },
    },
  } as Isletme;
}

export function masaGarsonKapat(isletme: Isletme, masaId: string): Isletme {
  const g = masaGuvenlikAl(isletme);
  const { [masaId]: _, ...rest } = g.masalar;
  return { ...isletme, masaGuvenlik: { ...g, masalar: rest } } as Isletme;
}

export type MasaCihazSonuc =
  | { durum: "izinli" }
  | { durum: "beklemede"; mesaj: string }
  | { durum: "reddedildi"; mesaj: string };

/** Müşteri siparişi öncesi cihaz bağlama / onay kontrolü. */
export function masaCihazKontrol(
  isletme: Isletme,
  masaId: string,
  cihazId: string,
): MasaCihazSonuc {
  const g = masaGuvenlikAl(isletme);
  if (!g.aktif) return { durum: "izinli" };

  const m = kayit(isletme, masaId);
  if (!m.acik) {
    return {
      durum: "reddedildi",
      mesaj: "Bu masa henüz açılmadı. Garsonunuzdan masayı açmasını isteyin.",
    };
  }
  if (!m.cihazId) {
    return { durum: "izinli" };
  }
  if (m.cihazId === cihazId || m.bekleyen.includes(cihazId)) {
    return { durum: "izinli" };
  }
  return {
    durum: "beklemede",
    mesaj: "Bu masa başka bir telefona bağlı. Garson onayı bekleniyor.",
  };
}

export function masaCihazBagla(isletme: Isletme, masaId: string, cihazId: string): Isletme {
  const g = masaGuvenlikAl(isletme);
  const m = kayit(isletme, masaId);
  if (!m.acik) return isletme;
  if (!m.cihazId) {
    return {
      ...isletme,
      masaGuvenlik: {
        ...g,
        masalar: { ...g.masalar, [masaId]: { ...m, cihazId } },
      },
    } as Isletme;
  }
  if (m.cihazId === cihazId) return isletme;
  if (m.bekleyen.includes(cihazId)) return isletme;
  return {
    ...isletme,
    masaGuvenlik: {
      ...g,
      masalar: {
        ...g.masalar,
        [masaId]: { ...m, bekleyen: [...m.bekleyen, cihazId] },
      },
    },
  } as Isletme;
}

export function masaCihazOnayla(isletme: Isletme, masaId: string, cihazId: string): Isletme {
  const g = masaGuvenlikAl(isletme);
  const m = kayit(isletme, masaId);
  if (!m.bekleyen.includes(cihazId)) return isletme;
  return {
    ...isletme,
    masaGuvenlik: {
      ...g,
      masalar: {
        ...g.masalar,
        [masaId]: {
          ...m,
          cihazId,
          bekleyen: m.bekleyen.filter((id) => id !== cihazId),
        },
      },
    },
  } as Isletme;
}
