import type { Isletme, MenuGoruntulenmeKayit, Masa } from "@/lib/store";

const TZ = "Europe/Istanbul";
const MAX_KAYIT = 1200;

export function bugunGunAnahtari(simdi = Date.now()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(simdi));
}

export function masaCoz(masalar: Masa[], masaParam: string | null | undefined): {
  masaId: string;
  masaAd: string;
} {
  const ham = (masaParam ?? "").trim();
  if (!ham) {
    return { masaId: "_genel", masaAd: "Genel / QR" };
  }
  const bul = masalar.find((m) => m.id === ham || m.ad === ham);
  if (bul) return { masaId: bul.id, masaAd: bul.ad };
  return { masaId: `masa-${ham}`, masaAd: `Masa ${ham}` };
}

export function menuGoruntulenmeKaydet(
  isletme: Isletme,
  masaParam: string | null | undefined,
  simdi = Date.now(),
): Isletme {
  const { masaId, masaAd } = masaCoz(isletme.masalar, masaParam);
  const gun = bugunGunAnahtari(simdi);
  const mevcut = [...(isletme.menuGoruntulenme ?? [])];
  const idx = mevcut.findIndex((k) => k.gun === gun && k.masaId === masaId);
  if (idx >= 0) {
    mevcut[idx] = { ...mevcut[idx]!, adet: mevcut[idx]!.adet + 1 };
  } else {
    mevcut.push({ gun, masaId, masaAd, adet: 1 });
  }
  const kirpilmis =
    mevcut.length > MAX_KAYIT
      ? mevcut.sort((a, b) => b.gun.localeCompare(a.gun)).slice(0, MAX_KAYIT)
      : mevcut;
  return { ...isletme, menuGoruntulenme: kirpilmis };
}

export type GoruntulenmeAralik = "bugun" | "7g" | "30g";

export function goruntulenmeFiltrele(
  kayitlar: MenuGoruntulenmeKayit[],
  aralik: GoruntulenmeAralik,
  simdi = Date.now(),
): MenuGoruntulenmeKayit[] {
  const bugun = bugunGunAnahtari(simdi);
  if (aralik === "bugun") {
    return kayitlar.filter((k) => k.gun === bugun);
  }
  const gunSay = aralik === "7g" ? 7 : 30;
  const bas = new Date(simdi);
  bas.setDate(bas.getDate() - (gunSay - 1));
  const basAnahtar = bugunGunAnahtari(bas.getTime());
  return kayitlar.filter((k) => k.gun >= basAnahtar && k.gun <= bugun);
}

export function goruntulenmeGunlukToplam(kayitlar: MenuGoruntulenmeKayit[]) {
  const map = new Map<string, number>();
  for (const k of kayitlar) {
    map.set(k.gun, (map.get(k.gun) ?? 0) + k.adet);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([gun, adet]) => ({ gun, adet }));
}

export function goruntulenmeMasaSirasi(kayitlar: MenuGoruntulenmeKayit[]) {
  const map = new Map<string, { masaAd: string; adet: number }>();
  for (const k of kayitlar) {
    const o = map.get(k.masaId) ?? { masaAd: k.masaAd, adet: 0 };
    o.adet += k.adet;
    map.set(k.masaId, o);
  }
  return [...map.entries()]
    .map(([masaId, v]) => ({ masaId, masaAd: v.masaAd, adet: v.adet }))
    .sort((a, b) => b.adet - a.adet);
}

export function goruntulenmeToplam(kayitlar: MenuGoruntulenmeKayit[]) {
  return kayitlar.reduce((n, k) => n + k.adet, 0);
}
