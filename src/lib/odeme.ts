import { abonelikOdenecek } from "@/lib/abonelik";
import type { Abonelik, PlanId, OdemeTipi } from "@/lib/store";

export type OdemeSonuc = {
  basarili: boolean;
  mod: "canli" | "simulasyon";
  saglayici: "iyzico" | "paytr";
  islemId: string;
  mesaj: string;
};

export function odemeSaglayiciHazir(saglayici: "iyzico" | "paytr") {
  if (saglayici === "iyzico") {
    return Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);
  }
  return Boolean(
    process.env.PAYTR_MERCHANT_ID &&
      process.env.PAYTR_MERCHANT_KEY &&
      process.env.PAYTR_MERCHANT_SALT,
  );
}

/** Varsayılan masa ödeme sağlayıcısı — anahtar varsa canlı, yoksa simülasyon. */
export function masaOdemeSaglayici(): "iyzico" | "paytr" {
  if (odemeSaglayiciHazir("iyzico")) return "iyzico";
  if (odemeSaglayiciHazir("paytr")) return "paytr";
  return "iyzico";
}

/** Masada hesap ödemesi (kart). Anahtar yoksa simülasyon başarılı döner. */
export async function masaOdemeBaslat(
  tutarTl: number,
  opts?: { saglayici?: "iyzico" | "paytr"; email?: string; referans?: string },
): Promise<OdemeSonuc> {
  const saglayici = opts?.saglayici ?? masaOdemeSaglayici();
  const islemId = opts?.referans ?? `masa-${Date.now()}`;
  const tutar = Math.round(Math.max(0, tutarTl) * 100) / 100;

  if (tutar <= 0) {
    return {
      basarili: false,
      mod: "simulasyon",
      saglayici,
      islemId,
      mesaj: "Ödenecek tutar yok",
    };
  }

  if (!odemeSaglayiciHazir(saglayici)) {
    // Demo / geliştirme — gerçek POS yoksa anında onay
    await new Promise((r) => setTimeout(r, 650));
    return {
      basarili: true,
      mod: "simulasyon",
      saglayici,
      islemId,
      mesaj: `Kart ödemesi simülasyonu: ${tutar} TL`,
    };
  }

  try {
    const endpoint =
      saglayici === "iyzico"
        ? "https://api.iyzipay.com/payment/auth"
        : "https://www.paytr.com/odeme/api/get-token";

    const yanit = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchantId: process.env.PAYTR_MERCHANT_ID,
        apiKey: process.env.IYZICO_API_KEY,
        amount: tutar,
        currency: "TRY",
        email: opts?.email ?? "musteri@sofra.app",
        referenceId: islemId,
        basketId: islemId,
      }),
    });

    if (!yanit.ok) {
      return {
        basarili: false,
        mod: "canli",
        saglayici,
        islemId,
        mesaj: `Ödeme sağlayıcı hatası (${yanit.status})`,
      };
    }

    return {
      basarili: true,
      mod: "canli",
      saglayici,
      islemId,
      mesaj: "Ödeme alındı",
    };
  } catch (e) {
    return {
      basarili: false,
      mod: "canli",
      saglayici,
      islemId,
      mesaj: e instanceof Error ? e.message : "Ödeme hatası",
    };
  }
}

export async function odemeBaslat(
  saglayici: "iyzico" | "paytr",
  abonelik: Abonelik,
  planId: PlanId,
  odemeTipi: OdemeTipi,
  email: string,
): Promise<OdemeSonuc> {
  const hesap = abonelikOdenecek(abonelik, planId, odemeTipi);
  const islemId = `sofra-${Date.now()}`;

  if (!odemeSaglayiciHazir(saglayici)) {
    return {
      basarili: true,
      mod: "simulasyon",
      saglayici,
      islemId,
      mesaj: `${saglayici === "iyzico" ? "Iyzico" : "PayTR"} anahtarları yok — simülasyon: ${hesap.odenecek} TL`,
    };
  }

  // Canlı entegrasyon iskeleti — gerçek API çağrısı buraya bağlanır
  try {
    const endpoint =
      saglayici === "iyzico"
        ? "https://api.iyzipay.com/v2/subscription/initialize"
        : "https://www.paytr.com/odeme/api/get-token";

    const yanit = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchantId: process.env.PAYTR_MERCHANT_ID,
        apiKey: process.env.IYZICO_API_KEY,
        amount: hesap.odenecek,
        currency: "TRY",
        email,
        referenceId: islemId,
      }),
    });

    if (!yanit.ok) {
      return {
        basarili: false,
        mod: "canli",
        saglayici,
        islemId,
        mesaj: `Ödeme sağlayıcı hatası (${yanit.status})`,
      };
    }

    return {
      basarili: true,
      mod: "canli",
      saglayici,
      islemId,
      mesaj: "Ödeme başlatıldı",
    };
  } catch (e) {
    return {
      basarili: false,
      mod: "canli",
      saglayici,
      islemId,
      mesaj: e instanceof Error ? e.message : "Ödeme hatası",
    };
  }
}
