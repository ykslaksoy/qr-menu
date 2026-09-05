"use client";

import { useRef, useState } from "react";
import { urunGorselleriniGetir } from "@sofra/tema";
import { gorselYukle } from "@/lib/gorsel";

type Props = {
  gorselUrl: string | null;
  onSec: (
    gorselUrl: string | null,
    kaynak: "hazir" | "yukleme" | null,
    gorselUrlBaski?: string | null,
  ) => void;
  /** Ürün adı — öneri vurgusu için */
  urunAdi?: string;
};

export function UrunGorselSecici({ gorselUrl, onSec, urunAdi }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const liste = urunGorselleriniGetir();

  async function dosyaSec(e: React.ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    e.target.value = "";
    if (!dosya) return;
    setYukleniyor(true);
    setHata("");
    try {
      const { ekran, baski } = await gorselYukle(dosya);
      onSec(ekran, "yukleme", baski);
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Yükleme başarısız");
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div className="space-y-3 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Ürün görseli</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={yukleniyor}
            className="rounded-full border border-line px-3 py-1 text-xs font-medium hover:border-brand/40 disabled:opacity-50"
          >
            {yukleniyor ? "Yükleniyor…" : "Kendi görselimi yükle"}
          </button>
          {gorselUrl ? (
            <button
              type="button"
              onClick={() => onSec(null, null, null)}
              className="rounded-full border border-line px-3 py-1 text-xs text-muted hover:border-brand/40"
            >
              Görseli kaldır
            </button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={dosyaSec}
        />
      </div>

      {gorselUrl ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gorselUrl}
            alt={urunAdi || "Ürün"}
            className="h-16 w-16 rounded-xl border border-line object-cover"
            width={64}
            height={64}
          />
          <p className="text-xs text-muted">
            {gorselUrl.startsWith("data:")
              ? "Ekran sürümü (72 dpi) — baskı PDF'de 300 dpi kullanılır"
              : "Hazır Sofra görseli — baskıda vektörden 300 dpi üretilir"}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted">Görselsiz veya aşağıdaki hazırlerden seçin</p>
      )}

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {liste.map((g) => {
          const secili = gorselUrl === g.yol;
          return (
            <button
              key={g.id}
              type="button"
              title={g.ad}
              onClick={() => onSec(g.yol, "hazir", null)}
              className={`overflow-hidden rounded-xl border p-1 transition ${
                secili ? "border-brand ring-2 ring-brand/30" : "border-line hover:border-brand/40"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.yol} alt={g.ad} className="aspect-square w-full rounded-lg object-cover" />
              <span className="mt-0.5 block truncate text-center text-[10px] text-muted">{g.ad}</span>
            </button>
          );
        })}
      </div>
      {hata ? <p className="text-xs text-red-700">{hata}</p> : null}
    </div>
  );
}
