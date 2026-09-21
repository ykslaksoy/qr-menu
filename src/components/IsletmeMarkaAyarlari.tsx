"use client";

import { useRef, useState, useEffect } from "react";
import { logoYukle } from "@/lib/gorsel";
import type { Isletme } from "@/lib/store";

type Props = {
  isletme: Isletme;
  onKaydet: (sonraki: Isletme) => void;
};

export function IsletmeMarkaAyarlari({ isletme, onKaydet }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [kafeAdi, setKafeAdi] = useState(isletme.kafeAdi);
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    setKafeAdi(isletme.kafeAdi);
  }, [isletme.kafeAdi]);

  function markaKaydet(patch: Partial<Pick<Isletme, "kafeAdi" | "logoUrl" | "logoUrlBaski">>) {
    onKaydet({ ...isletme, ...patch });
  }

  function adKaydet() {
    const ad = kafeAdi.trim();
    if (!ad) {
      setHata("İşletme adı boş olamaz");
      setKafeAdi(isletme.kafeAdi);
      return;
    }
    setHata("");
    if (ad !== isletme.kafeAdi) {
      markaKaydet({ kafeAdi: ad });
    }
  }

  async function logoSec(e: React.ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    e.target.value = "";
    if (!dosya) return;
    setYukleniyor(true);
    setHata("");
    try {
      const { ekran, baski } = await logoYukle(dosya);
      markaKaydet({ logoUrl: ekran, logoUrlBaski: baski });
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Logo yüklenemedi");
    } finally {
      setYukleniyor(false);
    }
  }

  function logoKaldir() {
    markaKaydet({ logoUrl: null, logoUrlBaski: null });
  }

  return (
    <section className="rounded-2xl border border-line bg-card p-5">
      <h2 className="font-semibold">İşletme adı ve logo</h2>
      <p className="mt-1 text-sm text-muted">
        Menüde, tasarım önizlemesinde ve baskı PDF&apos;lerinde görünür.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          İşletme adı
          <input
            type="text"
            value={kafeAdi}
            onChange={(e) => setKafeAdi(e.target.value)}
            onBlur={adKaydet}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                adKaydet();
              }
            }}
            className="mt-1 w-full rounded-xl border border-line px-3 py-2"
            placeholder="Örn. Cafe Ada"
          />
        </label>

        <div className="sm:col-span-2">
          <p className="text-sm font-medium">Logo</p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {isletme.logoUrl ? (
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-line bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={isletme.logoUrl}
                  alt={`${isletme.kafeAdi} logosu`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-line bg-line/20 text-xs text-muted">
                Logo yok
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={yukleniyor}
                className="rounded-full border border-line px-4 py-2 text-sm font-medium hover:border-brand/40 disabled:opacity-50"
              >
                {yukleniyor ? "Yükleniyor…" : isletme.logoUrl ? "Logoyu değiştir" : "Logo yükle"}
              </button>
              {isletme.logoUrl ? (
                <button
                  type="button"
                  onClick={logoKaldir}
                  className="rounded-full border border-line px-4 py-2 text-sm text-muted hover:border-brand/40"
                >
                  Logoyu kaldır
                </button>
              ) : null}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              className="hidden"
              onChange={logoSec}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            PNG veya JPG önerilir. Şeffaf arka planlı logolar menüde daha iyi görünür.
          </p>
        </div>
      </div>

      {hata ? <p className="mt-3 text-sm text-red-700">{hata}</p> : null}
    </section>
  );
}
