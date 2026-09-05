"use client";

import { useState } from "react";

type Istasyon = "bar" | "mutfak" | "tatli";

type Props = {
  disabled?: boolean;
  onEkle: (
    ad: string,
    fiyat: number,
    adet: number,
    ekstra?: { not?: string; istasyon?: Istasyon },
  ) => void;
};

export function GarsonSerbestKalem({ disabled, onEkle }: Props) {
  const [acik, setAcik] = useState(false);
  const [ad, setAd] = useState("");
  const [fiyat, setFiyat] = useState("");
  const [adet, setAdet] = useState("1");
  const [not, setNot] = useState("");
  const [istasyon, setIstasyon] = useState<"" | Istasyon>("");

  function gonder(e: React.FormEvent) {
    e.preventDefault();
    const f = Number(fiyat.replace(",", "."));
    const a = Number(adet) || 1;
    if (!ad.trim() || !Number.isFinite(f) || f < 0 || a < 1) return;
    const ekstra =
      not.trim() || istasyon
        ? {
            not: not.trim() || undefined,
            istasyon: istasyon || undefined,
          }
        : undefined;
    onEkle(ad.trim(), f, a, ekstra);
    setAd("");
    setFiyat("");
    setAdet("1");
    setNot("");
    setIstasyon("");
    setAcik(false);
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <button
        type="button"
        onClick={() => setAcik((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h3 className="font-semibold">Menü dışı kalem</h3>
          <p className="mt-0.5 text-xs text-muted">Listede olmayan ürün veya özel not</p>
        </div>
        <span className="text-lg text-muted">{acik ? "−" : "+"}</span>
      </button>

      {acik ? (
        <form onSubmit={gonder} className="mt-3 space-y-3">
          <label className="block text-sm">
            Ürün adı
            <input
              value={ad}
              onChange={(e) => setAd(e.target.value)}
              placeholder="Örn: Özel karışım"
              className="mt-1 w-full rounded-xl border border-line bg-background px-3 py-2 text-sm"
              disabled={disabled}
              required
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              Fiyat (₺)
              <input
                value={fiyat}
                onChange={(e) => setFiyat(e.target.value)}
                inputMode="decimal"
                placeholder="0"
                className="mt-1 w-full rounded-xl border border-line bg-background px-3 py-2 text-sm"
                disabled={disabled}
                required
              />
            </label>
            <label className="block text-sm">
              Adet
              <input
                value={adet}
                onChange={(e) => setAdet(e.target.value)}
                inputMode="numeric"
                className="mt-1 w-full rounded-xl border border-line bg-background px-3 py-2 text-sm"
                disabled={disabled}
              />
            </label>
          </div>
          <label className="block text-sm">
            Not
            <textarea
              value={not}
              onChange={(e) => setNot(e.target.value)}
              placeholder="Örn: Az şekerli"
              rows={2}
              className="mt-1 w-full resize-none rounded-xl border border-line bg-background px-3 py-2 text-sm"
              disabled={disabled}
            />
          </label>
          <label className="block text-sm">
            İstasyon
            <select
              value={istasyon}
              onChange={(e) => setIstasyon(e.target.value as "" | Istasyon)}
              className="mt-1 w-full rounded-xl border border-line bg-background px-3 py-2 text-sm"
              disabled={disabled}
            >
              <option value="">Seçilmedi</option>
              <option value="bar">Bar</option>
              <option value="mutfak">Mutfak</option>
              <option value="tatli">Tatlı</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={disabled}
            className="w-full rounded-full border border-line py-2 text-sm font-medium disabled:opacity-50"
          >
            Adisyona ekle
          </button>
        </form>
      ) : null}
    </div>
  );
}
