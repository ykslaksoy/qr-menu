import { formatTl } from "@/lib/abonelik";

export type MenuParaBirimi = "TRY" | "USD" | "EUR";

export type ParaBirimiAyarlari = {
  usdAktif: boolean;
  eurAktif: boolean;
  /** 1 USD = ? TRY */
  usdKur: number;
  /** 1 EUR = ? TRY */
  eurKur: number;
};

export function varsayilanParaBirimiAyarlari(): ParaBirimiAyarlari {
  return {
    usdAktif: false,
    eurAktif: false,
    usdKur: 34,
    eurKur: 37,
  };
}

export function aktifParaBirimleri(ayar: ParaBirimiAyarlari): MenuParaBirimi[] {
  const liste: MenuParaBirimi[] = ["TRY"];
  if (ayar.usdAktif && ayar.usdKur > 0) liste.push("USD");
  if (ayar.eurAktif && ayar.eurKur > 0) liste.push("EUR");
  return liste;
}

export function menuFiyatFormatla(
  tlTutar: number,
  birim: MenuParaBirimi,
  ayar: ParaBirimiAyarlari,
): string {
  if (birim === "TRY") return formatTl(tlTutar);
  if (birim === "USD") {
    const kur = ayar.usdKur > 0 ? ayar.usdKur : 1;
    return `$${(tlTutar / kur).toFixed(2)}`;
  }
  const kur = ayar.eurKur > 0 ? ayar.eurKur : 1;
  return `€${(tlTutar / kur).toFixed(2)}`;
}

export const PARA_BIRIMI_ETIKET: Record<MenuParaBirimi, string> = {
  TRY: "₺ TRY",
  USD: "$ USD",
  EUR: "€ EUR",
};
