"use client";

import { useMemo, useState } from "react";
import { useIsletme } from "@/lib/useIsletme";
import { PlanKilit } from "@/components/PlanKilit";
import { efektifPlanId, ozellikAcikMiIsletme } from "@/lib/plan-kilit";
import {
  stokSayim,
  stokTakibiAyarla,
  urunKritikMi,
  urunTukendiMi,
  type StokHareketTur,
} from "@/lib/store";

const HAREKET_ETIKET: Record<StokHareketTur, string> = {
  satis: "Satış",
  iade: "İade",
  sayim: "Sayım",
  giris: "Giriş",
  acilis: "Açılış",
};

function zamanEtiket(ms: number) {
  try {
    return new Date(ms).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function PanelStokPage() {
  const { isletme, kaydet } = useIsletme();
  const [sayimDeger, setSayimDeger] = useState<Record<string, string>>({});

  const kritikler = useMemo(
    () => (isletme ? isletme.urunler.filter(urunKritikMi) : []),
    [isletme],
  );
  const hareketler = useMemo(
    () => (isletme?.stokHareketleri ?? []).slice(0, 20),
    [isletme],
  );

  if (!isletme) return null;

  const planId = efektifPlanId(isletme);
  if (!ozellikAcikMiIsletme(isletme, "stok")) {
    return (
      <PlanKilit
        ozellik="stok"
        mevcutPlan={planId}
        baslik="Stok takibi kilitli"
        tamSayfa
      />
    );
  }

  function takibiAc(urunId: string) {
    kaydet(stokTakibiAyarla(isletme!, urunId, true, 20, 5));
  }

  function takibiKapat(urunId: string) {
    kaydet(stokTakibiAyarla(isletme!, urunId, false));
  }

  function kalanYaz(urunId: string, kalan: number) {
    kaydet(stokSayim(isletme!, urunId, kalan));
  }

  function sayimUygula(urunId: string) {
    const ham = sayimDeger[urunId];
    if (ham === undefined || ham === "") return;
    const n = Number(ham);
    if (!Number.isFinite(n) || n < 0) return;
    kalanYaz(urunId, Math.floor(n));
    setSayimDeger((onceki) => {
      const kopya = { ...onceki };
      delete kopya[urunId];
      return kopya;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-baslik)] text-3xl font-semibold">Stok</h1>
        <p className="mt-1 text-muted">
          Satış onayında otomatik düşer. Tükenen ürün menüde silik ve tıklanamaz olur.
        </p>
      </div>

      {kritikler.length > 0 ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-semibold">Kritik ürünler ({kritikler.length})</p>
          <p className="mt-1 text-amber-900/80">
            {kritikler.map((u) => `${u.ad} (${u.kalanAdet})`).join(" · ")}
          </p>
        </div>
      ) : null}

      <ul className="space-y-2">
        {isletme.urunler.map((u) => {
          const takipte = u.stokTakibi;
          return (
            <li
              key={u.id}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 ${
                !takipte
                  ? "border-line"
                  : urunTukendiMi(u)
                    ? "border-red-300 opacity-70"
                    : urunKritikMi(u)
                      ? "border-amber-400"
                      : "border-line"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{u.ad}</p>
                {takipte ? (
                  <p className="text-xs text-muted">
                    Kalan {u.kalanAdet} · Kritik ≤ {u.kritikSeviye}
                    {urunTukendiMi(u) ? " · Tükendi" : urunKritikMi(u) ? " · Kritik" : ""}
                  </p>
                ) : (
                  <p className="text-xs text-muted">Stok takibi kapalı</p>
                )}
              </div>

              {takipte ? (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => kalanYaz(u.id, Math.max(0, u.kalanAdet - 1))}
                    className="rounded-full border border-line px-3 py-1 text-sm"
                  >
                    −1
                  </button>
                  <button
                    type="button"
                    onClick={() => kalanYaz(u.id, u.kalanAdet + 10)}
                    className="rounded-full border border-line px-3 py-1 text-sm"
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    onClick={() => kalanYaz(u.id, 0)}
                    className="rounded-full border border-line px-3 py-1 text-sm"
                  >
                    Tükendi
                  </button>
                  <label className="flex items-center gap-1 text-sm">
                    <span className="sr-only">Sayım</span>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      placeholder="Sayım"
                      value={sayimDeger[u.id] ?? ""}
                      onChange={(e) =>
                        setSayimDeger((onceki) => ({ ...onceki, [u.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") sayimUygula(u.id);
                      }}
                      className="w-20 rounded-full border border-line bg-background px-3 py-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => sayimUygula(u.id)}
                      className="rounded-full border border-line px-3 py-1 text-sm"
                    >
                      Yaz
                    </button>
                  </label>
                  <button
                    type="button"
                    onClick={() => takibiKapat(u.id)}
                    className="rounded-full border border-line px-3 py-1 text-xs text-muted"
                    title="Stok takibini kapat"
                  >
                    Takibi kapat
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => takibiAc(u.id)}
                  className="rounded-full border border-brand/40 bg-brand/5 px-3 py-1.5 text-sm font-medium text-brand-dark"
                >
                  Takibi aç
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <section className="rounded-2xl border border-line bg-card p-5">
        <h2 className="font-semibold">Son hareketler</h2>
        {hareketler.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Henüz stok hareketi yok.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line/60 text-sm">
            {hareketler.map((h) => (
              <li key={h.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                <div>
                  <span className="font-medium">{h.urunAd}</span>
                  <span className="ml-2 text-xs text-muted">
                    {HAREKET_ETIKET[h.tur] ?? h.tur}
                    {" · "}
                    {h.delta > 0 ? `+${h.delta}` : h.delta}
                    {" → kalan "}
                    {h.kalan}
                  </span>
                </div>
                <time className="shrink-0 text-xs text-muted" dateTime={new Date(h.zaman).toISOString()}>
                  {zamanEtiket(h.zaman)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
