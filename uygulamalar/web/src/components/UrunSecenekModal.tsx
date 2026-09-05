"use client";

import { useMemo, useState } from "react";
import { formatTl } from "@/lib/abonelik";
import { uiMetin, type MenuDil } from "@/lib/menu-dil";
import { secenekMetinCevir } from "@/lib/urun-secenekleri";
import type { Urun, UrunSecenekGrup } from "@/lib/store";

type Props = {
  urun: Urun;
  anaRenk: string;
  vurguRengi: string;
  dil?: MenuDil;
  onKapat: () => void;
  onOnayla: (secilen: { ids: string[]; ozet: string; fiyat: number }) => void;
};

export function UrunSecenekModal({
  urun,
  anaRenk,
  vurguRengi,
  dil = "tr",
  onKapat,
  onOnayla,
}: Props) {
  const gruplar = urun.secenekler ?? [];
  const [secili, setSecili] = useState<Record<string, string[]>>(() => {
    const baslangic: Record<string, string[]> = {};
    for (const g of gruplar) baslangic[g.id] = [];
    return baslangic;
  });

  const tumSecimler = useMemo(() => {
    const map = new Map<string, { ad: string; fiyatEk: number; grupId: string }>();
    for (const g of gruplar) {
      for (const s of g.secimler) {
        map.set(s.id, { ad: s.ad, fiyatEk: s.fiyatEk, grupId: g.id });
      }
    }
    return map;
  }, [gruplar]);

  const secilenIds = useMemo(() => Object.values(secili).flat(), [secili]);

  const ekstra = secilenIds.reduce((t, id) => t + (tumSecimler.get(id)?.fiyatEk ?? 0), 0);
  const toplam = urun.fiyat + ekstra;
  const ozet = secilenIds
    .map((id) => {
      const ad = tumSecimler.get(id)?.ad;
      return ad ? secenekMetinCevir(ad, dil) : null;
    })
    .filter(Boolean)
    .join(", ");

  function toggle(grup: UrunSecenekGrup, secimId: string) {
    setSecili((onceki) => {
      const mevcut = onceki[grup.id] ?? [];
      if (grup.coklu) {
        const varMi = mevcut.includes(secimId);
        let sonraki = varMi ? mevcut.filter((x) => x !== secimId) : [...mevcut, secimId];
        if (grup.max && sonraki.length > grup.max) {
          sonraki = sonraki.slice(sonraki.length - grup.max);
        }
        return { ...onceki, [grup.id]: sonraki };
      }
      return { ...onceki, [grup.id]: mevcut[0] === secimId ? [] : [secimId] };
    });
  }

  function zorunluOk(): boolean {
    for (const g of gruplar) {
      if (!g.zorunlu) continue;
      const n = (secili[g.id] ?? []).length;
      const min = g.min ?? 1;
      if (n < min) return false;
    }
    return true;
  }

  return (
    <div
      className="menu-modal-arka fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="urun-secenek-baslik"
      onClick={onKapat}
    >
      <div
        className="menu-modal-sheet max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="urun-secenek-baslik"
          className="font-[family-name:var(--font-baslik)] text-xl font-semibold text-stone-900"
        >
          {urun.ad}
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          {urun.aciklama || uiMetin("secenekAciklama", dil)}
        </p>

        <div className="mt-5 space-y-6">
          {gruplar.map((grup) => (
            <section key={grup.id}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                {secenekMetinCevir(grup.ad, dil)}
                {grup.coklu ? ` · ${uiMetin("secenekCoklu", dil)}` : null}
                {grup.zorunlu ? ` · ${uiMetin("secenekZorunlu", dil)}` : null}
              </h3>
              <ul className="mt-2 space-y-2">
                {grup.secimler.map((s) => {
                  const acik = (secili[grup.id] ?? []).includes(s.id);
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => toggle(grup, s.id)}
                        className="flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition"
                        style={{
                          borderColor: acik ? anaRenk : "#e7e5e4",
                          background: acik ? anaRenk + "14" : "#fff",
                        }}
                      >
                        <span className="font-medium text-stone-800">
                          {secenekMetinCevir(s.ad, dil)}
                        </span>
                        <span className="text-stone-500">
                          {s.fiyatEk > 0
                            ? `+${formatTl(s.fiyatEk)}`
                            : uiMetin("secenekDahil", dil)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        {ozet ? (
          <p className="mt-4 rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-600">
            {uiMetin("secenekOzet", dil)}: {ozet}
          </p>
        ) : (
          <p className="mt-4 text-sm text-stone-400">{uiMetin("secenekBos", dil)}</p>
        )}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onKapat}
            className="flex-1 rounded-full border border-stone-300 py-2.5 text-sm font-semibold text-stone-700"
          >
            {uiMetin("vazgec", dil)}
          </button>
          <button
            type="button"
            disabled={!zorunluOk()}
            onClick={() =>
              onOnayla({
                ids: secilenIds,
                ozet,
                fiyat: toplam,
              })
            }
            className="flex-[1.4] rounded-full py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: vurguRengi }}
          >
            {uiMetin("sepete", dil)} · {formatTl(toplam)}
          </button>
        </div>
      </div>
    </div>
  );
}
