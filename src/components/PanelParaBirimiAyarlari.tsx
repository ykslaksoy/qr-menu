"use client";

import type { Isletme } from "@/lib/store";
import { varsayilanParaBirimiAyarlari } from "@/lib/para-birimi";

type Props = {
  isletme: Isletme;
  onKaydet: (sonraki: Isletme) => void;
};

export function PanelParaBirimiAyarlari({ isletme, onKaydet }: Props) {
  const para = isletme.paraBirimi ?? varsayilanParaBirimiAyarlari();
  const yabanciAcik = para.usdAktif || para.eurAktif;

  function paraKaydet(patch: Partial<typeof para>) {
    onKaydet({ ...isletme, paraBirimi: { ...para, ...patch } });
  }

  function yabanciToggle(acik: boolean) {
    if (!acik) {
      paraKaydet({ usdAktif: false, eurAktif: false });
      return;
    }
    paraKaydet({ usdAktif: true, eurAktif: true });
  }

  return (
    <section className="rounded-2xl border border-line bg-card p-5">
      <h2 className="font-semibold">Dövizli fiyat</h2>
      <p className="mt-1 text-sm text-muted">
        Fiyatları yine TL girersiniz. Açarsanız müşteri menüde ₺, $ veya € seçebilir.
      </p>
      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-background/50 p-4">
        <input
          type="checkbox"
          className="mt-1"
          checked={yabanciAcik}
          onChange={(e) => yabanciToggle(e.target.checked)}
        />
        <span className="text-sm">
          <strong>Yabancı misafir için dolar ve euro göster</strong>
          <span className="mt-1 block text-muted">Kapalıyken menüde yalnızca Türk lirası görünür.</span>
        </span>
      </label>
      {yabanciAcik ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            1 dolar kaç TL?
            <input
              type="number"
              min={0.01}
              step={0.5}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2"
              value={para.usdKur}
              onChange={(e) => paraKaydet({ usdKur: Number(e.target.value) || 0, usdAktif: true })}
            />
          </label>
          <label className="block text-sm">
            1 euro kaç TL?
            <input
              type="number"
              min={0.01}
              step={0.5}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2"
              value={para.eurKur}
              onChange={(e) => paraKaydet({ eurKur: Number(e.target.value) || 0, eurAktif: true })}
            />
          </label>
        </div>
      ) : null}
    </section>
  );
}
