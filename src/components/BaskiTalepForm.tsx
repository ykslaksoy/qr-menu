"use client";

import { useState } from "react";
import type { BaskiTalep, BaskiTalepTuru } from "@/lib/store";

type Props = {
  tur: BaskiTalepTuru;
  turAd: string;
  acik: boolean;
  onKapat: () => void;
  onGonder: (adet: number, not: string) => void | Promise<void>;
};

export function BaskiTalepForm({ turAd, acik, onKapat, onGonder }: Props) {
  const [adet, setAdet] = useState("20");
  const [not, setNot] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [mesaj, setMesaj] = useState("");

  if (!acik) return null;

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(adet);
    if (!Number.isFinite(n) || n < 1) return;
    setGonderiliyor(true);
    try {
      await onGonder(n, not.trim());
      setMesaj("Baskı talebiniz kaydedildi. Sofra ekibi sizinle iletişime geçecek.");
      setNot("");
    } finally {
      setGonderiliyor(false);
    }
  }

  return (
    <form
      onSubmit={gonder}
      className="mt-4 space-y-3 rounded-xl border border-brand/20 bg-brand/5 p-4"
    >
      <p className="text-sm font-semibold text-brand-dark">Baskı talebi — {turAd}</p>
      <label className="block text-sm">
        Adet
        <input
          type="number"
          min={1}
          value={adet}
          onChange={(e) => setAdet(e.target.value)}
          className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        Not (opsiyonel)
        <textarea
          value={not}
          onChange={(e) => setNot(e.target.value)}
          rows={2}
          placeholder="Kağıt türü, aciliyet, teslimat adresi farklıysa…"
          className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2 text-sm"
        />
      </label>
      {mesaj ? <p className="text-sm text-brand-dark">{mesaj}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={gonderiliyor}
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {gonderiliyor ? "Kaydediliyor…" : "Talebi gönder"}
        </button>
        <button
          type="button"
          onClick={onKapat}
          className="rounded-full border border-line px-4 py-2 text-sm"
        >
          Kapat
        </button>
      </div>
    </form>
  );
}
