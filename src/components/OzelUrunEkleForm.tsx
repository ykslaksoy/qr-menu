"use client";

import { useState } from "react";
import { UrunGorselSecici } from "@/components/UrunGorselSecici";
import type { OzelUrunTaslak } from "@/components/KatalogVeOzelUrunEkle";

type Props = {
  onEkle: (taslak: OzelUrunTaslak) => void;
  compact?: boolean;
};

export function OzelUrunEkleForm({ onEkle, compact }: Props) {
  const [ad, setAd] = useState("");
  const [fiyat, setFiyat] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [gorselUrl, setGorselUrl] = useState<string | null>(null);
  const [gorselUrlBaski, setGorselUrlBaski] = useState<string | null>(null);
  const [gorselKaynak, setGorselKaynak] = useState<"hazir" | "yukleme" | null>(null);

  function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (!ad.trim()) return;
    onEkle({
      ad: ad.trim(),
      fiyat: Number(fiyat) || 0,
      aciklama: aciklama.trim(),
      kategoriEtiket: "ozel",
      gorselUrl,
      gorselUrlBaski,
      gorselKaynak,
    });
    setAd("");
    setFiyat("");
    setAciklama("");
    setGorselUrl(null);
    setGorselUrlBaski(null);
    setGorselKaynak(null);
  }

  if (compact) {
    return (
      <form onSubmit={gonder} className="flex flex-wrap gap-2">
        <input
          value={ad}
          onChange={(e) => setAd(e.target.value)}
          placeholder="Listede olmayan ürün adı *"
          required
          className="min-w-[140px] flex-1 rounded-xl border border-line px-3 py-2 text-sm"
        />
        <input
          value={fiyat}
          onChange={(e) => setFiyat(e.target.value)}
          placeholder="Fiyat"
          type="number"
          min={0}
          className="w-24 rounded-xl border border-line px-3 py-2 text-sm"
        />
        <input
          value={aciklama}
          onChange={(e) => setAciklama(e.target.value)}
          placeholder="Açıklama"
          className="min-w-[100px] flex-1 rounded-xl border border-line px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-950 hover:border-amber-400"
        >
          + Özel ürün ekle
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={gonder} className="grid gap-3 sm:grid-cols-2">
      <p className="text-sm text-muted sm:col-span-2">
        Katalogda olmayan ürünü kendiniz tanımlayın — menüde normal ürün gibi görünür.
      </p>
      <input
        value={ad}
        onChange={(e) => setAd(e.target.value)}
        placeholder="Ürün adı *"
        required
        className="rounded-xl border border-line px-3 py-2 text-sm sm:col-span-2"
      />
      <input
        value={fiyat}
        onChange={(e) => setFiyat(e.target.value)}
        placeholder="Fiyat (TL)"
        type="number"
        min={0}
        className="rounded-xl border border-line px-3 py-2 text-sm"
      />
      <input
        value={aciklama}
        onChange={(e) => setAciklama(e.target.value)}
        placeholder="Açıklama"
        className="rounded-xl border border-line px-3 py-2 text-sm"
      />
      <UrunGorselSecici
        gorselUrl={gorselUrl}
        urunAdi={ad}
        onSec={(url, kaynak, baski) => {
          setGorselUrl(url);
          setGorselKaynak(kaynak);
          setGorselUrlBaski(baski ?? null);
        }}
      />
      <button
        type="submit"
        className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white sm:col-span-2"
      >
        Özel ürün ekle
      </button>
    </form>
  );
}
