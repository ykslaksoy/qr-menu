import type { TemaAyar } from "@/lib/store";

export type TemaPalet = {
  id: string;
  ad: string;
  aciklama: string;
  kisaAciklama?: string;
  patch: Partial<Pick<TemaAyar, "anaRenk" | "vurguRengi" | "metinRengi" | "zeminRengi" | "zeminStili">>;
};

/** Şablonu değiştirmeden yalnızca renk paleti uygular. */
export const TEMA_PALETLERI: TemaPalet[] = [
  {
    id: "varsayilan",
    ad: "Şablona göre",
    aciklama: "Seçili şablonun varsayılan renkleri (elle renk değiştirirken sıfırlanır).",
    patch: {},
  },
  {
    id: "yesil-kafe",
    ad: "Yeşil kafe",
    aciklama: "Açık zemin, Sofra yeşili — klasik kafe.",
    kisaAciklama: "Klasik kafe",
    patch: {
      anaRenk: "#1f6f5b",
      vurguRengi: "#c45c26",
      metinRengi: "#1c1917",
      zeminRengi: "#f3efe6",
      zeminStili: "solid-warm",
    },
  },
  {
    id: "deniz-mavi",
    ad: "Deniz",
    aciklama: "Serin, açık arka plan.",
    kisaAciklama: "Açık mavi",
    patch: {
      anaRenk: "#0e7490",
      vurguRengi: "#f59e0b",
      metinRengi: "#0f172a",
      zeminRengi: "#f0f9ff",
      zeminStili: "solid-cool",
    },
  },
  {
    id: "lounge-koyu",
    ad: "Lounge",
    aciklama: "Düşük ışık mekanlar için koyu zemin ve açık metin.",
    kisaAciklama: "Koyu bar",
    patch: {
      anaRenk: "#d4a574",
      vurguRengi: "#e8c49a",
      metinRengi: "#f5f0e8",
      zeminRengi: "#141210",
      zeminStili: "solid-dark",
    },
  },
  {
    id: "minimal-gri",
    ad: "Gri",
    aciklama: "Nötr gri tonlar, sade menü.",
    kisaAciklama: "Sade",
    patch: {
      anaRenk: "#374151",
      vurguRengi: "#6b7280",
      metinRengi: "#111827",
      zeminRengi: "#f9fafb",
      zeminStili: "solid-warm",
    },
  },
];

export function paletBul(id: string | null | undefined) {
  return TEMA_PALETLERI.find((p) => p.id === id);
}

export function paletUygula(tema: TemaAyar, paletId: string): TemaAyar {
  const palet = paletBul(paletId);
  if (!palet || paletId === "varsayilan") {
    return { ...tema, paletId: paletId === "varsayilan" ? null : paletId };
  }
  return {
    ...tema,
    paletId,
    ...palet.patch,
  };
}
