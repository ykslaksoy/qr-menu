"use client";

import type { Isletme } from "@/lib/store";
import {
  VARSAYILAN_AYDINLATMA,
  VARSAYILAN_CEREZ,
  varsayilanKvkk,
  type KvkkAyarlari,
} from "@/lib/kvkk-sablonlari";

type Props = {
  isletme: Isletme;
  onKaydet: (sonraki: Isletme) => void;
};

export function PanelKvkkAyarlari({ isletme, onKaydet }: Props) {
  const kvkk: KvkkAyarlari = isletme.kvkk ?? varsayilanKvkk();

  function patch(p: Partial<KvkkAyarlari>) {
    onKaydet({ ...isletme, kvkk: { ...kvkk, ...p } });
  }

  return (
    <section className="rounded-2xl border border-line bg-card p-5">
      <h2 className="font-semibold">KVKK ve çerez metinleri</h2>
      <p className="mt-1 text-sm text-muted">
        Şablon metinleri düzenleyin; yayına alınca müşteri menüsü altında link olarak görünür.
      </p>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={kvkk.yayinda}
          onChange={(e) => patch({ yayinda: e.target.checked })}
        />
        Menüde göster
      </label>
      <div className="mt-4 space-y-4">
        <label className="block text-sm">
          Aydınlatma metni
          <textarea
            rows={8}
            className="mt-1 w-full rounded-xl border border-line px-3 py-2 font-mono text-xs"
            value={kvkk.aydinlatmaMetni}
            onChange={(e) => patch({ aydinlatmaMetni: e.target.value })}
          />
          <button
            type="button"
            className="mt-1 text-xs text-brand underline"
            onClick={() => patch({ aydinlatmaMetni: VARSAYILAN_AYDINLATMA })}
          >
            Şablonu yükle
          </button>
        </label>
        <label className="block text-sm">
          Çerez metni
          <textarea
            rows={6}
            className="mt-1 w-full rounded-xl border border-line px-3 py-2 font-mono text-xs"
            value={kvkk.cerezMetni}
            onChange={(e) => patch({ cerezMetni: e.target.value })}
          />
          <button
            type="button"
            className="mt-1 text-xs text-brand underline"
            onClick={() => patch({ cerezMetni: VARSAYILAN_CEREZ })}
          >
            Şablonu yükle
          </button>
        </label>
      </div>
    </section>
  );
}
