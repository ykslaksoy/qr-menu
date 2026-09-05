import { fiyatlar, referans, davetEdilenIndirimGecerliMi } from "@sofra/tema";
import type { Abonelik, OdemeTipi, PlanId } from "@/lib/store";

export function planBul(planId: PlanId) {
  return fiyatlar.planlar.find((p) => p.id === planId) ?? fiyatlar.planlar[0];
}

export function planListeFiyati(planId: PlanId, odemeTipi: OdemeTipi) {
  const plan = planBul(planId);
  if (!plan || planId === "ucretsiz") return 0;
  return odemeTipi === "yillik" ? plan.yillik : plan.aylik;
}

/** Referans indirimi yalnızca yıllık + menü QR + kalan ay > 0 */
export function abonelikIndirimOrani(abonelik: Abonelik): number {
  if (abonelik.odemeTipi !== "yillik") return 0;
  if (abonelik.kalanIndirimAy < 1) return 0;
  const qrOk =
    abonelik.referansKaynak === referans.referansQr.kaynakDegeri &&
    Boolean(abonelik.referansSlug);
  if (
    !davetEdilenIndirimGecerliMi(
      abonelik.referansSlug,
      abonelik.referansKaynak,
      true,
    ) &&
    !qrOk
  ) {
    return 0;
  }
  return referans.indirimOrani;
}

export function abonelikOdenecek(abonelik: Abonelik, planId: PlanId, odemeTipi: OdemeTipi) {
  const liste = planListeFiyati(planId, odemeTipi);
  if (liste === 0) return { liste: 0, indirimOrani: 0, odenecek: 0, indirimAy: 0 };

  const taslak: Abonelik = {
    ...abonelik,
    planId,
    odemeTipi,
    kalanIndirimAy:
      odemeTipi === "yillik" &&
      abonelik.referansSlug &&
      abonelik.referansKaynak === referans.referansQr.kaynakDegeri
        ? Math.max(abonelik.kalanIndirimAy, referans.referansBasinaAy)
        : abonelik.kalanIndirimAy,
  };

  const oran = abonelikIndirimOrani(taslak);
  // Yıllıkta referans %15, 3 ay = yıllık faturanın 3/12'sine uygulanır (MVP yaklaşımı)
  let odenecek = liste;
  if (oran > 0 && odemeTipi === "yillik") {
    const aylikEsdeger = liste / 12;
    const indirimliAy = Math.min(referans.referansBasinaAy, 12);
    const indirimTutari = aylikEsdeger * indirimliAy * oran;
    odenecek = Math.round(liste - indirimTutari);
  } else if (oran > 0 && odemeTipi === "aylik") {
    odenecek = Math.round(liste * (1 - oran));
  }

  return {
    liste,
    indirimOrani: oran,
    odenecek,
    indirimAy: oran > 0 ? referans.referansBasinaAy : 0,
  };
}

export function formatTl(n: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(n);
}
