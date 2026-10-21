"use client";

import type { Isletme } from "@/lib/store";
import { masaGuvenlikAl } from "@/lib/masa-guvenlik";

type Props = {
  isletme: Isletme;
  onKaydet: (sonraki: Isletme) => void;
};

export function PanelMasaGuvenlikAyarlari({ isletme, onKaydet }: Props) {
  const g = masaGuvenlikAl(isletme);

  return (
    <section className="rounded-2xl border border-line bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Masa sipariş güvenliği</h2>
      <p className="mt-2 text-sm text-muted">
        Garson masayı açar; ilk müşteri telefonu bağlanır. Evden sahte sipariş için yabancı cihazlar garson
        onayı bekler.
      </p>
      <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm">
        <input
          type="checkbox"
          className="h-5 w-5 rounded border-line"
          checked={g.aktif}
          onChange={(e) =>
            onKaydet({
              ...isletme,
              masaGuvenlik: { ...g, aktif: e.target.checked },
            })
          }
        />
        <span>Masa güvenliğini aç (saha için önerilir)</span>
      </label>
      <p className="mt-3 text-xs text-muted">
        Garson ekranında masayı açın; onay bekleyen cihazlar garson panelinde listelenir.
      </p>
    </section>
  );
}
