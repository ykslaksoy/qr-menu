import { adetAltiUcretsiz, planKilitleri, ucretsizSablonlar } from "@sofra/tema";
import type { Abonelik, Isletme, PlanId, Siparis, TemaAyar } from "@/lib/store";

export type OzellikId = (typeof planKilitleri.ozellikler)[number]["id"];

const PLAN_SIRA = planKilitleri.planSira as Record<PlanId, number>;

export function planSira(planId: PlanId) {
  return PLAN_SIRA[planId] ?? 0;
}

export function planYeterli(mevcut: PlanId, gereken: PlanId) {
  return planSira(mevcut) >= planSira(gereken);
}

export function ozellikMinPlan(ozellikId: OzellikId): PlanId {
  const o = planKilitleri.ozellikler.find((x) => x.id === ozellikId);
  return (o?.minPlan as PlanId) ?? "tam";
}

export function ozellikAcikMi(planId: PlanId, ozellikId: OzellikId) {
  const o = planKilitleri.ozellikler.find((x) => x.id === ozellikId);
  if (!o) return false;
  return planYeterli(planId, o.minPlan as PlanId);
}

export function sablonAcikMi(planId: PlanId, sablonId: string) {
  if (planYeterli(planId, "menu")) return true;
  return ucretsizSablonlar().some((s) => s.id === sablonId);
}

export function filigranGoster(planId: PlanId) {
  return !planYeterli(planId, "menu");
}

export function siparisAcikMi(planId: PlanId) {
  return ozellikAcikMi(planId, "siparis");
}

/** Bu takvim ayındaki geçerli sipariş sayısı (iptal hariç). */
export function aylikSiparisSayisi(siparisler: Siparis[], simdi = Date.now()) {
  const d = new Date(simdi);
  const yil = d.getFullYear();
  const ay = d.getMonth();
  return siparisler.filter((s) => {
    if (s.durum === "iptal") return false;
    const t = new Date(s.olusturulma);
    return t.getFullYear() === yil && t.getMonth() === ay;
  }).length;
}

export function adetAltiLimit() {
  return adetAltiUcretsiz.aylikSiparisLimiti;
}

export function adetAltiAktif() {
  return Boolean(adetAltiUcretsiz.aktif);
}

export type AdetAltiDurum = {
  aktif: boolean;
  limit: number;
  kullanilan: number;
  kalan: number;
  limitAsildi: boolean;
  hediyePlan: PlanId;
  /** Ücretsiz abonelikte hediye özellikler açık (limit aşılsa da). */
  hediyeAcik: boolean;
  /** Limit aşıldı — sipariş devam, panelde uyarı. */
  uyariVer: boolean;
};

export function adetAltiDurum(isletme: Isletme, simdi = Date.now()): AdetAltiDurum {
  const limit = adetAltiLimit();
  const kullanilan = aylikSiparisSayisi(isletme.siparisler, simdi);
  const limitAsildi = kullanilan >= limit;
  const odemeLi = planSira(abonelikPlanId(isletme.abonelik)) >= planSira("menu");
  const hediyeAcik = adetAltiAktif() && !odemeLi;

  return {
    aktif: adetAltiAktif(),
    limit,
    kullanilan,
    kalan: Math.max(0, limit - kullanilan),
    limitAsildi,
    hediyePlan: adetAltiUcretsiz.hediyePlan as PlanId,
    hediyeAcik,
    uyariVer: hediyeAcik && limitAsildi,
  };
}

/**
 * Ödeme yapılan plan ile adet-altı hediye planın en yükseği.
 * Ücretsiz abonelik → Menü+Adisyon hediye (limit aşılsa da özellik kesilmez).
 */
export function efektifPlanId(isletme: Isletme, simdi = Date.now()): PlanId {
  const odemePlan = abonelikPlanId(isletme.abonelik);
  const durum = adetAltiDurum(isletme, simdi);
  if (!durum.aktif) return odemePlan;
  if (durum.hediyeAcik) {
    return planSira(durum.hediyePlan) > planSira(odemePlan) ? durum.hediyePlan : odemePlan;
  }
  return odemePlan;
}

export function ozellikAcikMiIsletme(isletme: Isletme, ozellikId: OzellikId) {
  return ozellikAcikMi(efektifPlanId(isletme), ozellikId);
}

export function planOzellikListesi(planId: PlanId) {
  return planKilitleri.ozellikler.map((o) => {
    const acik = ozellikAcikMi(planId, o.id as OzellikId);
    const ozel =
      o.id === "filigran"
        ? filigranGoster(planId)
        : o.id === "filigranKapali"
          ? !filigranGoster(planId)
          : acik;
    return {
      ...o,
      acik: ozel,
      kilitli: !ozel,
    };
  });
}

export function planKilitliOzellikler(planId: PlanId) {
  return planOzellikListesi(planId).filter((o) => o.kilitli && o.id !== "filigran");
}

export function planAcikOzellikler(planId: PlanId) {
  return planOzellikListesi(planId).filter((o) => o.acik);
}

/** Ücretsiz planda tema ve şablonu plana uygun hale getirir (hediye/efektif plan). */
export function isletmePlanaUyum(isletme: Isletme): Isletme {
  const planId = efektifPlanId(isletme);
  let tema = { ...isletme.tema };

  if (!sablonAcikMi(planId, tema.sablonId)) {
    const ilk = ucretsizSablonlar()[0];
    if (ilk) {
      const v = ilk.varsayilanlar;
      tema = {
        sablonId: ilk.id,
        fontPaketId: v.fontPaketi,
        anaRenk: tema.anaRenk,
        vurguRengi: v.vurguRengi,
        metinRengi: v.metinRengi,
        zeminRengi: v.zeminRengi,
        zeminStili: v.zeminStili,
        cerceveId: v.cerceve,
        kose: v.kose,
        desenId: v.desen,
        duzenId: ilk.duzen,
      };
    }
  }

  if (!ozellikAcikMi(planId, "tamTasarim")) {
    const sablon = ucretsizSablonlar().find((s) => s.id === tema.sablonId);
    const v = sablon?.varsayilanlar;
    if (v) {
      tema = {
        ...tema,
        fontPaketId: v.fontPaketi,
        vurguRengi: v.vurguRengi,
        metinRengi: v.metinRengi,
        zeminRengi: v.zeminRengi,
        zeminStili: v.zeminStili,
        cerceveId: v.cerceve,
        kose: v.kose,
        desenId: v.desen,
      };
    }
  }

  return { ...isletme, tema };
}

export function abonelikPlanId(abonelik: Abonelik): PlanId {
  return abonelik.aktif ? abonelik.planId : "ucretsiz";
}

export function menuPlanBilgi(isletme: Isletme) {
  const planId = efektifPlanId(isletme);
  const adet = adetAltiDurum(isletme);
  return {
    planId,
    odemePlanId: abonelikPlanId(isletme.abonelik),
    filigran: filigranGoster(planId),
    siparisAcik: siparisAcikMi(planId),
    adetAlti: {
      aktif: adet.aktif,
      limit: adet.limit,
      kullanilan: adet.kullanilan,
      kalan: adet.kalan,
      limitAsildi: adet.limitAsildi,
      hediyeAcik: adet.hediyeAcik,
      uyariVer: adet.uyariVer,
    },
  };
}

/** Sipariş plan özelliğine göre; limit aşımı siparişi engellemez (yalnızca uyarı). */
export function siparisKabulEdilirMi(isletme: Isletme): {
  ok: true;
  uyari?: string;
} | { ok: false; hata: string } {
  if (!siparisAcikMi(efektifPlanId(isletme))) {
    return { ok: false, hata: "Sipariş özelliği Menü + Adisyon planında" };
  }
  const adet = adetAltiDurum(isletme);
  if (adet.uyariVer) {
    return { ok: true, uyari: adetAltiUcretsiz.limitAsimiUyari };
  }
  return { ok: true };
}

export function temaKaydetIzinli(planId: PlanId, onceki: TemaAyar, sonraki: TemaAyar): TemaAyar {
  if (!sablonAcikMi(planId, sonraki.sablonId)) {
    return onceki;
  }
  if (ozellikAcikMi(planId, "tamTasarim")) {
    return sonraki;
  }
  return {
    ...onceki,
    sablonId: sonraki.sablonId,
    anaRenk: sonraki.anaRenk,
  };
}

export { planKilitleri, adetAltiUcretsiz };
