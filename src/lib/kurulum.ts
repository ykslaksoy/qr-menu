import { idUret, type Isletme, type Masa } from "@/lib/store";

/** Kurulum sihirbazı — masa üretimi */
export function masaUret(adet: number, onceki: Masa[] = []): Masa[] {
  const n = Math.max(1, Math.min(40, Math.floor(adet)));
  const mevcut = onceki.slice(0, n);
  while (mevcut.length < n) {
    const sira = mevcut.length + 1;
    mevcut.push({ id: idUret("masa"), ad: `Masa ${sira}`, sira });
  }
  return mevcut.map((m, i) => ({ ...m, sira: i + 1, ad: m.ad || `Masa ${i + 1}` }));
}

export type KurulumDurum = {
  adOk: boolean;
  masaOk: boolean;
  menuOk: boolean;
  personelOk: boolean;
};

export function kurulumDurum(isletme: Isletme, personelOnaylandi = false): KurulumDurum {
  return {
    adOk: Boolean(isletme.kafeAdi?.trim() && isletme.slug?.trim()),
    masaOk: (isletme.masalar?.length ?? 0) >= 1,
    menuOk: (isletme.urunler?.filter((u) => u.aktif).length ?? 0) >= 3,
    personelOk: personelOnaylandi,
  };
}

export function kurulumTamamMi(d: KurulumDurum) {
  return d.adOk && d.masaOk && d.menuOk && d.personelOk;
}
