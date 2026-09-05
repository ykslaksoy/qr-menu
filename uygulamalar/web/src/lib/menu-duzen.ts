import { katalog, menuDuzenGecerliMi, sablonBul, sablonDuzen, type MenuDuzen } from "@sofra/tema";
import type { TemaAyar } from "@/lib/store";

export type { MenuDuzen };

export const MUSTERI_DUZENLER: MenuDuzen[] = ["list", "photo-grid", "editorial"];

export function temaDuzen(tema: Pick<TemaAyar, "sablonId" | "duzenId">): MenuDuzen {
  if (menuDuzenGecerliMi(tema.duzenId)) return tema.duzenId;
  return sablonDuzen(tema.sablonId);
}

/** Demo / tasarım sayfası: ?sablon= ile renk + düzen uygula. */
export function temaSablonIle(mevcut: TemaAyar, sablonId: string | null | undefined): TemaAyar {
  if (!sablonId) return mevcut;
  const s = sablonBul(sablonId);
  if (!s) return mevcut;
  const v = s.varsayilanlar;
  return {
    ...mevcut,
    sablonId: s.id,
    fontPaketId: v.fontPaketi,
    anaRenk: v.anaRenk,
    vurguRengi: v.vurguRengi,
    metinRengi: v.metinRengi,
    zeminRengi: v.zeminRengi,
    zeminStili: v.zeminStili,
    cerceveId: v.cerceve,
    kose: v.kose,
    desenId: v.desen,
    duzenId: s.duzen,
  };
}

export function duzenListeSinifi(duzen: MenuDuzen): string {
  if (duzen === "photo-grid") return "mt-4 grid grid-cols-2 gap-2.5";
  if (duzen === "editorial") return "mt-4 grid grid-cols-2 gap-2.5";
  if (duzen === "photo-hero") return "mt-4 space-y-4";
  if (duzen === "price-list") return "mt-3 space-y-1.5";
  if (duzen === "compact-list") return "mt-3 space-y-2";
  return "mt-4 space-y-3";
}

export function kartDuzen(duzen: MenuDuzen, sira: number): MenuDuzen {
  if (duzen !== "editorial") return duzen;
  return sira === 0 ? "photo-hero" : "photo-grid";
}

export function duzenEtiket(id: MenuDuzen): string {
  return katalog.duzenEtiketleri[id] ?? id;
}
