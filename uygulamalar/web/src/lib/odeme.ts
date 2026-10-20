import { abonelikOdenecek } from "@/lib/abonelik";
import {
  iyzicoOdemeFormBaslat,
  paytrOdemeTokenAl,
  paytrSepetBase64,
} from "@/lib/odeme-saglayici";
import type { Abonelik, PlanId, OdemeTipi } from "@/lib/store";

export type OdemeSonuc = {
  basarili: boolean;
  mod: "canli" | "simulasyon";
  saglayici: "iyzico" | "paytr";
  islemId: string;
  mesaj: string;
  odemeUrl?: string;
  paytrToken?: string;
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
  opts?: { saglayici?: "iyzico" | "paytr"; email?: string; referans?: string; userIp?: string },
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
    await new Promise((r) => setTimeout(r, 650));
    return {
      basarili: true,
      mod: "simulasyon",
      saglayici,
      islemId,
      mesaj: `Kart ödemesi simülasyonu: ${tutar} TL`,
    };
  }

  const email = opts?.email ?? "musteri@sofra.app";

  if (saglayici === "paytr") {
    const basket = paytrSepetBase64([{ ad: "Hesap", fiyatTl: tutar, adet: 1 }]);
    const sonuc = await paytrOdemeTokenAl({
      merchantOid: islemId,
      email,
      paymentAmountKurus: Math.round(tutar * 100),
      userIp: opts?.userIp ?? "127.0.0.1",
      userBasket: basket,
    });
    return {
      basarili: sonuc.ok,
      mod: "canli",
      saglayici,
      islemId,
      mesaj: sonuc.mesaj,
      paytrToken: sonuc.token,
    };
  }

  const sonuc = await iyzicoOdemeFormBaslat({ tutarTl: tutar, email, referans: islemId });
  return {
    basarili: sonuc.ok,
    mod: "canli",
    saglayici,
    islemId,
    mesaj: sonuc.mesaj,
    odemeUrl: sonuc.odemeUrl,
  };
}

export async function odemeBaslat(
  saglayici: "iyzico" | "paytr",
  abonelik: Abonelik,
  planId: PlanId,
  odemeTipi: OdemeTipi,
  email: string,
  opts?: { userIp?: string },
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

  if (saglayici === "paytr") {
    const basket = paytrSepetBase64([
      { ad: `Sofra ${planId}`, fiyatTl: hesap.odenecek, adet: 1 },
    ]);
    const sonuc = await paytrOdemeTokenAl({
      merchantOid: islemId,
      email,
      paymentAmountKurus: Math.round(hesap.odenecek * 100),
      userIp: opts?.userIp ?? "127.0.0.1",
      userBasket: basket,
    });
    return {
      basarili: sonuc.ok,
      mod: "canli",
      saglayici,
      islemId,
      mesaj: sonuc.mesaj,
      paytrToken: sonuc.token,
    };
  }

  const sonuc = await iyzicoOdemeFormBaslat({
    tutarTl: hesap.odenecek,
    email,
    referans: islemId,
  });
  return {
    basarili: sonuc.ok,
    mod: "canli",
    saglayici,
    islemId,
    mesaj: sonuc.mesaj,
    odemeUrl: sonuc.odemeUrl,
  };
}
