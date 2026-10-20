"use client";

import { useState } from "react";
import type { Isletme } from "@/lib/store";
import { kvkkBirlestir, type KvkkAyarlari } from "@/lib/kvkk-sablonlari";

type Props = {
  isletme: Isletme;
  onKaydet: (sonraki: Isletme) => void;
};

export function PanelKvkkAyarlari({ isletme, onKaydet }: Props) {
  const kvkk: KvkkAyarlari = kvkkBirlestir(isletme.kvkk);
  const [duzenle, setDuzenle] = useState(false);

  function patch(p: Partial<KvkkAyarlari>) {
    onKaydet({ ...isletme, kvkk: { ...kvkk, ...p } });
  }

  return (
    <section className="rounded-2xl border border-line bg-card p-5">
      <h2 className="font-semibold">Yasal metinler (KVKK)</h2>
      <p className="mt-1 text-sm text-muted">
        Hazır Türkçe metin dolu. Açtığınızda müşteri menüsünün altında iki küçük link görünür.
      </p>
      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4">
        <input
          type="checkbox"
          className="mt-1"
          checked={kvkk.yayinda}
          onChange={(e) => patch({ yayinda: e.target.checked })}
        />
        <span className="text-sm">
          <strong>Menüde göster</strong>
          <span className="mt-1 block text-muted">Kapalıysa müşteri bu metinleri görmez.</span>
        </span>
      </label>
      <button
        type="button"
        className="mt-3 text-sm text-brand underline"
        onClick={() => setDuzenle((d) => !d)}
      >
        {duzenle ? "Düzenlemeyi gizle" : "Metni avukatınızla değiştirmek isterseniz düzenleyin"}
      </button>
      {duzenle ? (
        <div className="mt-3 space-y-3">
          <label className="block text-sm">
            Aydınlatma metni
            <textarea
              rows={6}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm"
              value={kvkk.aydinlatmaMetni}
              onChange={(e) => patch({ aydinlatmaMetni: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Çerez metni
            <textarea
              rows={4}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm"
              value={kvkk.cerezMetni}
              onChange={(e) => patch({ cerezMetni: e.target.value })}
            />
          </label>
        </div>
      ) : null}
    </section>
  );
}
