import { createHmac, randomBytes } from "node:crypto";

export function iyzicoSandboxMi() {
  const v = process.env.IYZICO_SANDBOX?.toLowerCase();
  if (v === "0" || v === "false") return false;
  if (v === "1" || v === "true") return true;
  return process.env.IYZICO_API_KEY?.startsWith("sandbox") ?? true;
}

export function iyzicoBaseUrl() {
  return iyzicoSandboxMi() ? "https://sandbox-api.iyzipay.com" : "https://api.iyzipay.com";
}

/** IYZWSv2 authorization header (REST v2). */
export function iyzicoAuthorizationHeader(body: string) {
  const apiKey = process.env.IYZICO_API_KEY!;
  const secretKey = process.env.IYZICO_SECRET_KEY!;
  const randomKey = `${Date.now()}${randomBytes(4).toString("hex")}`;
  const payload = randomKey + body;
  const signature = createHmac("sha256", secretKey).update(payload).digest("hex");
  const auth = Buffer.from(`apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`).toString(
    "base64",
  );
  return { authorization: `IYZWSv2 ${auth}`, randomKey };
}

export type PaytrTokenIstek = {
  merchantOid: string;
  email: string;
  paymentAmountKurus: number;
  userIp: string;
  userBasket: string;
  testMode?: "0" | "1";
};

/** PayTR get-token için paytr_token (HMAC-SHA256 + base64). */
export function paytrTokenOlustur(istek: PaytrTokenIstek) {
  const merchantId = process.env.PAYTR_MERCHANT_ID!;
  const merchantKey = process.env.PAYTR_MERCHANT_KEY!;
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT!;
  const noInstallment = "0";
  const maxInstallment = "0";
  const currency = "TL";
  const testMode = istek.testMode ?? (process.env.PAYTR_TEST_MODE === "1" ? "1" : "0");

  const hashStr = [
    merchantId,
    istek.userIp,
    istek.merchantOid,
    istek.email,
    String(istek.paymentAmountKurus),
    istek.userBasket,
    noInstallment,
    maxInstallment,
    currency,
    testMode,
    merchantSalt,
  ].join("");

  const token = createHmac("sha256", merchantKey).update(hashStr).digest("base64");
  return { paytr_token: token, test_mode: testMode, currency, no_installment: noInstallment, max_installment: maxInstallment };
}

export async function paytrOdemeTokenAl(istek: PaytrTokenIstek) {
  const merchantId = process.env.PAYTR_MERCHANT_ID!;
  const { paytr_token, test_mode, currency, no_installment, max_installment } =
    paytrTokenOlustur(istek);

  const body = new URLSearchParams({
    merchant_id: merchantId,
    user_ip: istek.userIp,
    merchant_oid: istek.merchantOid,
    email: istek.email,
    payment_amount: String(istek.paymentAmountKurus),
    paytr_token,
    user_basket: istek.userBasket,
    no_installment,
    max_installment,
    currency,
    test_mode,
  });

  const yanit = await fetch("https://www.paytr.com/odeme/api/get-token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const metin = await yanit.text();
  let json: { status?: string; token?: string; reason?: string };
  try {
    json = JSON.parse(metin) as { status?: string; token?: string; reason?: string };
  } catch {
    return { ok: false, mesaj: `PayTR yanıtı okunamadı (${yanit.status})` };
  }
  if (json.status === "success" && json.token) {
    return { ok: true, token: json.token, mesaj: "PayTR ödeme token alındı" };
  }
  return { ok: false, mesaj: json.reason ?? "PayTR token alınamadı" };
}

export async function iyzicoOdemeFormBaslat(opts: {
  tutarTl: number;
  email: string;
  referans: string;
}) {
  const tutar = Math.round(opts.tutarTl * 100) / 100;
  const body = JSON.stringify({
    locale: "tr",
    conversationId: opts.referans,
    price: tutar.toFixed(2),
    paidPrice: tutar.toFixed(2),
    currency: "TRY",
    basketId: opts.referans,
    paymentGroup: "PRODUCT",
    callbackUrl: process.env.IYZICO_CALLBACK_URL ?? "https://sofra.app/api/odeme/iyzico-callback",
    buyer: {
      id: "BY1",
      name: "Sofra",
      surname: "Musteri",
      email: opts.email,
      identityNumber: "11111111111",
      registrationAddress: "Turkey",
      city: "Istanbul",
      country: "Turkey",
    },
    basketItems: [
      {
        id: "BI1",
        name: "Sofra abonelik",
        category1: "Abonelik",
        itemType: "VIRTUAL",
        price: tutar.toFixed(2),
      },
    ],
  });

  const { authorization } = iyzicoAuthorizationHeader(body);
  const yanit = await fetch(`${iyzicoBaseUrl()}/payment/iyzipos/checkoutform/initialize/auth/ecom`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body,
  });
  const json = (await yanit.json()) as { status?: string; paymentPageUrl?: string; errorMessage?: string };
  if (json.status === "success" && json.paymentPageUrl) {
    return { ok: true, odemeUrl: json.paymentPageUrl, mesaj: "Iyzico ödeme sayfası hazır" };
  }
  return { ok: false, mesaj: json.errorMessage ?? `Iyzico hata (${yanit.status})` };
}

/** Basit tek çekim auth (masa ödemesi) — sandbox/canlı. */
export async function iyzicoTekCekimAuth(opts: {
  tutarTl: number;
  email: string;
  referans: string;
}) {
  const tutar = Math.round(opts.tutarTl * 100) / 100;
  const body = JSON.stringify({
    locale: "tr",
    conversationId: opts.referans,
    price: tutar.toFixed(2),
    paidPrice: tutar.toFixed(2),
    currency: "TRY",
    installment: "1",
    paymentChannel: "WEB",
    paymentGroup: "PRODUCT",
    paymentCard: {
      cardHolderName: "John Doe",
      cardNumber: "5528790000000008",
      expireMonth: "12",
      expireYear: "2030",
      cvc: "123",
      registerCard: "0",
    },
    buyer: {
      id: "BY1",
      name: "Sofra",
      surname: "Musteri",
      email: opts.email,
      identityNumber: "11111111111",
      registrationAddress: "Turkey",
      city: "Istanbul",
      country: "Turkey",
    },
    basketItems: [
      {
        id: "BI1",
        name: "Hesap",
        category1: "Yemek",
        itemType: "PHYSICAL",
        price: tutar.toFixed(2),
      },
    ],
  });

  const { authorization } = iyzicoAuthorizationHeader(body);
  const yanit = await fetch(`${iyzicoBaseUrl()}/payment/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body,
  });
  const json = (await yanit.json()) as { status?: string; errorMessage?: string };
  if (json.status === "success") {
    return { ok: true, mesaj: "Iyzico ödeme onaylandı" };
  }
  return { ok: false, mesaj: json.errorMessage ?? `Iyzico auth hata (${yanit.status})` };
}

export function paytrSepetBase64(kalemler: { ad: string; fiyatTl: number; adet: number }[]) {
  const raw = kalemler.map((k) => [k.ad, k.fiyatTl.toFixed(2), k.adet] as const);
  return Buffer.from(JSON.stringify(raw)).toString("base64");
}
