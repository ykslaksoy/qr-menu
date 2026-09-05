/**
 * Ücretlendirme sınırları — deneme / tek şube.
 * C bloğu (ÖKC, e-fatura, platform entegrasyonu) burada yok.
 */

export const UCRETLENDIRME = {
  /** Ücretsiz / deneme hesap: tek şube */
  denemeMaxSube: 1,
  /** Ücretli menü planı varsayılan tek şube (çok şube = zincir paketi) */
  menuMaxSube: 1,
  /** Menü+Adisyon tek şube */
  menuAdisyonMaxSube: 1,
  /** Tam paket / zincir: pratikte sınırsız (ürün kararı) */
  tamMaxSube: 50,
  /** Adet-altı hediye kotası (adet-alti-ucretsiz.json ile uyumlu) */
  denemeAylikSiparis: 50,
} as const;

export type PlanIdSinir = "ucretsiz" | "menu" | "menu-adisyon" | "tam";

export function planMaxSube(planId: string): number {
  if (planId === "tam") return UCRETLENDIRME.tamMaxSube;
  if (planId === "menu-adisyon") return UCRETLENDIRME.menuAdisyonMaxSube;
  if (planId === "menu") return UCRETLENDIRME.menuMaxSube;
  return UCRETLENDIRME.denemeMaxSube;
}

/** Yeni şube açılabilir mi? */
export function subeAcilabilirMi(planId: string, mevcutSubeSayisi: number): {
  ok: boolean;
  max: number;
  mesaj?: string;
} {
  const max = planMaxSube(planId);
  if (mevcutSubeSayisi >= max) {
    return {
      ok: false,
      max,
      mesaj: `Bu plan en fazla ${max} şube destekler. Çok şube için Tam paket / zincir gerekir.`,
    };
  }
  return { ok: true, max };
}
