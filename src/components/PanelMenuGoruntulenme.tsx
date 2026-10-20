"use client";

import { useMemo, useState } from "react";
import type { Isletme } from "@/lib/store";
import {
  goruntulenmeFiltrele,
  goruntulenmeGunlukToplam,
  goruntulenmeMasaSirasi,
  goruntulenmeToplam,
  type GoruntulenmeAralik,
} from "@/lib/menu-goruntulenme";

const ARALIKLAR: { id: GoruntulenmeAralik; etiket: string }[] = [
  { id: "bugun", etiket: "Bugün" },
  { id: "7g", etiket: "Son 7 gün" },
  { id: "30g", etiket: "Son 30 gün" },
];

type Props = {
  isletme: Isletme;
};

export function PanelMenuGoruntulenme({ isletme }: Props) {
  const [aralik, setAralik] = useState<GoruntulenmeAralik>("7g");
  const ham = isletme.menuGoruntulenme ?? [];
  const filtreli = useMemo(() => goruntulenmeFiltrele(ham, aralik), [ham, aralik]);
  const toplam = useMemo(() => goruntulenmeToplam(filtreli), [filtreli]);
  const gunluk = useMemo(() => goruntulenmeGunlukToplam(filtreli), [filtreli]);
  const masalar = useMemo(() => goruntulenmeMasaSirasi(filtreli), [filtreli]);
  const maxGun = Math.max(1, ...gunluk.map((g) => g.adet));

  return (
    <section className="mt-10 rounded-2xl border border-line bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">Menü kaç kez açıldı?</h2>
          <p className="mt-1 text-sm text-muted">
            QR okutulunca veya menü linkine girildiğinde sayılır (aynı telefonda günde bir kez).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ARALIKLAR.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAralik(a.id)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                aralik === a.id
                  ? "bg-brand text-white"
                  : "border border-line bg-background text-foreground/80 hover:bg-line/60"
              }`}
            >
              {a.etiket}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-3xl font-semibold tabular-nums">{toplam}</p>
      <p className="text-sm text-muted">açılış</p>

      {gunluk.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Henüz veri yok — müşteri menüsünü bir kez açın.</p>
      ) : (
        <>
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted">Günlük</h3>
            <div className="mt-3 flex h-24 items-end gap-1 overflow-x-auto">
              {gunluk.map((g) => (
                <div
                  key={g.gun}
                  className="flex min-w-[24px] flex-1 flex-col items-center justify-end gap-1"
                >
                  <div
                    className="w-full max-w-[16px] rounded-t bg-brand/70"
                    style={{
                      height: `${Math.max(g.adet > 0 ? 10 : 4, Math.round((g.adet / maxGun) * 100))}%`,
                    }}
                    title={`${g.gun} · ${g.adet}`}
                  />
                  <span className="text-[9px] text-muted">{g.gun.slice(8)}</span>
                </div>
              ))}
            </div>
          </div>

          {masalar.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted">Hangi masa?</h3>
              <ul className="mt-2 space-y-1.5 text-sm">
                {masalar.slice(0, 8).map((m) => (
                  <li key={m.masaId} className="flex justify-between gap-2 border-b border-line/50 py-1.5">
                    <span>{m.masaAd}</span>
                    <span className="tabular-nums text-muted">{m.adet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
