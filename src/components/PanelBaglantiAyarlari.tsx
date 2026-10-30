"use client";

import { useEffect, useState } from "react";
import { BAGLANTI_NOTU } from "@/components/BaglantiUyari";

type Alan = { anahtar: string; etiket: string };
const GRUPLAR: { baslik: string; yedek: string; alanlar: Alan[] }[] = [
  {
    baslik: "Veritabanı (Postgres)",
    yedek: "Boşsa yerleşik SQLite kullanılır (kalıcı değil).",
    alanlar: [{ anahtar: "DATABASE_URL", etiket: "DATABASE_URL (postgresql://…)" }],
  },
  {
    baslik: "Iyzico",
    yedek: "Boşsa ödeme simülasyonu çalışır.",
    alanlar: [
      { anahtar: "IYZICO_API_KEY", etiket: "API key" },
      { anahtar: "IYZICO_SECRET_KEY", etiket: "Secret key" },
      { anahtar: "IYZICO_CALLBACK_URL", etiket: "Callback URL" },
    ],
  },
  {
    baslik: "PayTR",
    yedek: "Boşsa ödeme simülasyonu çalışır.",
    alanlar: [
      { anahtar: "PAYTR_MERCHANT_ID", etiket: "Merchant ID" },
      { anahtar: "PAYTR_MERCHANT_KEY", etiket: "Merchant key" },
      { anahtar: "PAYTR_MERCHANT_SALT", etiket: "Merchant salt" },
    ],
  },
  {
    baslik: "Vercel Blob (görsel yükleme)",
    yedek: "Boşsa mevcut görsel saklama yöntemi kullanılır.",
    alanlar: [{ anahtar: "BLOB_READ_WRITE_TOKEN", etiket: "Blob token" }],
  },
];

export function PanelBaglantiAyarlari() {
  const [durum, setDurum] = useState<Record<string, boolean> | null>(null);
  useEffect(() => {
    fetch("/api/panel/baglantilar")
      .then((r) => (r.ok ? r.json() : null))
      .then(setDurum)
      .catch(() => setDurum(null));
  }, []);
  return (
    <section className="space-y-4 rounded-xl border p-5">
      <div>
        <h2 className="text-xl font-semibold">Bağlantılar</h2>
        <p className="mt-1 text-sm text-muted">
          Güvenlik için anahtarlar tarayıcıda veya veritabanında saklanmaz; Vercel ortam değişkenlerine
          (Project → Settings → Environment Variables) aşağıdaki adlarla girilir. Burada yalnızca durum görünür.
        </p>
      </div>
      {GRUPLAR.map((g) => (
        <div key={g.baslik} className="space-y-2">
          <h3 className="font-medium">{g.baslik}</h3>
          {g.alanlar.map((a) => {
            const tanimli = durum?.[a.anahtar] === true;
            return (
              <label key={a.anahtar} className="block text-sm">
                <span>{a.etiket}</span>
                <input
                  disabled
                  type="password"
                  className="mt-1 w-full rounded border px-2 py-1"
                  placeholder={tanimli ? "Tanımlı ✓" : `${a.anahtar} — tanımlı değil`}
                />
                {!tanimli && <span className="mt-1 block text-xs text-amber-700">{BAGLANTI_NOTU}</span>}
              </label>
            );
          })}
          <p className="text-xs text-muted">{g.yedek}</p>
        </div>
      ))}
    </section>
  );
}
