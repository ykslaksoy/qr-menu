/** Alerjen → kısa ikon + etiket (MONU tarzı rozet). EU-14 odaklı. */
export const ALERJEN_IKON: Record<string, { ikon: string; kisa: string }> = {
  Gluten: { ikon: "🌾", kisa: "Gluten" },
  Laktoz: { ikon: "🥛", kisa: "Laktoz" },
  Süt: { ikon: "🥛", kisa: "Laktoz" },
  Yumurta: { ikon: "🥚", kisa: "Yumurta" },
  "Sert kabuklu yemiş": { ikon: "🥜", kisa: "Yemiş" },
  "Yer fıstığı": { ikon: "🥜", kisa: "Fıstık" },
  Balık: { ikon: "🐟", kisa: "Balık" },
  "Kabuklu deniz": { ikon: "🦐", kisa: "Deniz" },
  Yumuşakça: { ikon: "🐚", kisa: "Yumuşakça" },
  Susam: { ikon: "🫘", kisa: "Susam" },
  Soya: { ikon: "🫛", kisa: "Soya" },
  Kereviz: { ikon: "🥬", kisa: "Kereviz" },
  Hardal: { ikon: "🟡", kisa: "Hardal" },
  "Acı bakla": { ikon: "🌱", kisa: "Bakla" },
  Sülfit: { ikon: "🫧", kisa: "Sülfit" },
};

/** Müşteri menü filtre çubuğunda gösterilen ana alerjenler */
export const FILTRE_ALERJENLER = [
  "Gluten",
  "Laktoz",
  "Yumurta",
  "Sert kabuklu yemiş",
  "Susam",
  "Soya",
] as const;

export function alerjenRozet(ad: string) {
  return ALERJEN_IKON[ad] ?? { ikon: "⚠️", kisa: ad };
}

/** Ürün seçili (hariç tutulacak) alerjenlerden herhangi birini içeriyor mu? */
export function urunAlerjenIceriyorMu(
  urunAlerjenler: string[] | null | undefined,
  haric: string[],
): boolean {
  if (!haric.length) return false;
  const liste = (urunAlerjenler ?? []).map((a) => (a === "Süt" ? "Laktoz" : a));
  return haric.some((h) => liste.includes(h === "Süt" ? "Laktoz" : h));
}
