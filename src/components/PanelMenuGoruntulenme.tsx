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
  { id: "7g", etiket: "7 gün" },
  { id: "30g", etiket: "30 gün" },
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
          <h2 className="font-semibold">Menü görüntülenme / QR</h2>
          <p className="mt-1 text-sm text-muted">
            Müşteri menüsü açılışları — masa ve gün bazlı (oturumda bir kez sayılır).
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

      <p className="mt-4 text-2xl font-semibold tabular-nums">{toplam}</p>
      <p className="text-xs text-muted">toplam görüntülenme</p>

      {gunluk.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Bu aralıkta kayıt yok.</p>
      ) : (
        <>
          <div className="mt-6">
            <h3 className="text-sm font-medium">Günlük</h3>
            <div className="mt-3 flex h-28 items-end gap-1 overflow-x-auto">
              {gunluk.map((g) => (
                <div
                  key={g.gun}
                  className="flex min-w-[28px] flex-1 flex-col items-center justify-end gap-1"
                >
                  <div
                    className="w-full max-w-[20px] rounded-t bg-brand/70"
                    style={{
                      height: `${Math.max(g.adet > 0 ? 10 : 4, Math.round((g.adet / maxGun) * 100))}%`,
                    }}
                    title={`${g.gun} · ${g.adet}`}
                  />
                  <span className="text-[9px] text-muted">{g.gun.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <h3 className="text-sm font-medium">Masa bazlı</h3>
            <table className="mt-2 w-full min-w-[320px] text-left text-sm">
              <thead className="text-xs uppercase text-muted">
                <tr>
                  <th className="py-2 pr-4">Masa</th>
                  <th className="py-2 pr-4">Görüntülenme</th>
                </tr>
              </thead>
              <tbody>
                {masalar.map((m) => (
                  <tr key={m.masaId} className="border-t border-line/60">
                    <td className="py-2 pr-4">{m.masaAd}</td>
                    <td className="py-2 pr-4 tabular-nums">{m.adet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
