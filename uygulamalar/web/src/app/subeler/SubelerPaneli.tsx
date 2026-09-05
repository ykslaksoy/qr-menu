"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export type SubeOzet = {
  id: string;
  slug: string;
  kafeAdi: string;
  bekleyen: number;
  odenen: number;
  toplam: number;
};

export type ZincirSiparisSatir = {
  id: string;
  subeSlug: string;
  subeAd: string;
  masaAd: string;
  durum: string;
  durumEtiket: string;
  tutar: number;
  olusturulma: number;
  kalemOzet: string;
};

type Ozet = {
  bekleyenAdet: number;
  bekleyenTutar: number;
  odenenAdet: number;
  odenenTutar: number;
  toplamAdet: number;
  toplamTutar: number;
};

function tl(n: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(n);
}

function saat(ms: number) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

export function SubelerPaneli({
  zincirAd,
  subeler,
  ozet,
  bekleyen,
  odenen,
}: {
  zincirAd: string;
  subeler: SubeOzet[];
  ozet: Ozet;
  bekleyen: ZincirSiparisSatir[];
  odenen: ZincirSiparisSatir[];
}) {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState<string | null>(null);
  const [sekme, setSekme] = useState<"bekleyen" | "odenen" | "toplam">("bekleyen");

  const toplamListe = useMemo(
    () => [...bekleyen, ...odenen].sort((a, b) => b.olusturulma - a.olusturulma),
    [bekleyen, odenen],
  );

  const liste =
    sekme === "bekleyen" ? bekleyen : sekme === "odenen" ? odenen : toplamListe;

  async function subeYoneticisineGec(slug: string) {
    setYukleniyor(slug);
    const yanit = await fetch("/api/subeler", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    setYukleniyor(null);
    if (yanit.ok) {
      router.push("/panel");
      router.refresh();
    }
  }

  async function cikis() {
    await fetch("/api/auth", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cikis" }),
    });
    router.push("/giris");
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-baslik)] text-3xl font-semibold">
            {zincirAd}
          </h1>
          <p className="mt-1 text-muted">
            Tüm şubelerin siparişleri — ödeme durumu ve şube yönetimine geçiş.
          </p>
        </div>
        <button
          type="button"
          onClick={cikis}
          className="rounded-full border border-line px-4 py-2 text-sm hover:border-brand/40"
        >
          Çıkış
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setSekme("bekleyen")}
          className={`rounded-2xl border p-5 text-left transition ${
            sekme === "bekleyen"
              ? "border-brand bg-brand/5 ring-1 ring-brand/20"
              : "border-line bg-card/80 hover:border-brand/40"
          }`}
        >
          <p className="text-xs uppercase tracking-wide text-muted">Ödemesi alınacaklar</p>
          <p className="mt-2 text-3xl font-semibold">{ozet.bekleyenAdet}</p>
          <p className="mt-1 text-sm text-muted">{tl(ozet.bekleyenTutar)}</p>
        </button>
        <button
          type="button"
          onClick={() => setSekme("odenen")}
          className={`rounded-2xl border p-5 text-left transition ${
            sekme === "odenen"
              ? "border-brand bg-brand/5 ring-1 ring-brand/20"
              : "border-line bg-card/80 hover:border-brand/40"
          }`}
        >
          <p className="text-xs uppercase tracking-wide text-muted">Ödemesi alınanlar</p>
          <p className="mt-2 text-3xl font-semibold">{ozet.odenenAdet}</p>
          <p className="mt-1 text-sm text-muted">{tl(ozet.odenenTutar)}</p>
        </button>
        <button
          type="button"
          onClick={() => setSekme("toplam")}
          className={`rounded-2xl border p-5 text-left transition ${
            sekme === "toplam"
              ? "border-brand bg-brand/5 ring-1 ring-brand/20"
              : "border-line bg-card/80 hover:border-brand/40"
          }`}
        >
          <p className="text-xs uppercase tracking-wide text-muted">Toplam siparişler</p>
          <p className="mt-2 text-3xl font-semibold">{ozet.toplamAdet}</p>
          <p className="mt-1 text-sm text-muted">{tl(ozet.toplamTutar)}</p>
        </button>
      </div>

      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-baslik)] text-xl font-semibold">
          {sekme === "bekleyen"
            ? "Ödemesi alınacak siparişler"
            : sekme === "odenen"
              ? "Ödemesi alınan siparişler"
              : "Tüm siparişler"}
        </h2>
        {liste.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-line px-4 py-8 text-center text-muted">
            Bu listede sipariş yok.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card/80">
            {liste.map((s) => (
              <li
                key={`${s.subeSlug}-${s.id}`}
                className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {s.subeAd}
                    <span className="mx-2 text-muted">·</span>
                    {s.masaAd}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">{s.kalemOzet}</p>
                  <p className="mt-1 text-xs text-muted">
                    {saat(s.olusturulma)} · {s.durumEtiket}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-semibold">{tl(s.tutar)}</span>
                  <button
                    type="button"
                    disabled={yukleniyor !== null}
                    onClick={() => subeYoneticisineGec(s.subeSlug)}
                    className="rounded-full border border-line px-3 py-1 text-xs font-semibold hover:border-brand/40 disabled:opacity-50"
                  >
                    {yukleniyor === s.subeSlug ? "…" : "Şube yönetici"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-baslik)] text-xl font-semibold">
          Şubeler
        </h2>
        <p className="mt-1 text-sm text-muted">
          Bir şubeyi açarak şube yönetici moduna geçin.
        </p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subeler.map((s) => (
            <li
              key={s.id}
              className="flex flex-col rounded-2xl border border-line bg-card/80 p-5"
            >
              <h3 className="font-[family-name:var(--font-baslik)] text-xl font-semibold">
                {s.kafeAdi}
              </h3>
              <p className="mt-3 text-sm text-muted">
                {s.bekleyen} ödemesi alınacak · {s.odenen} ödenen · {s.toplam} toplam
              </p>
              <button
                type="button"
                disabled={yukleniyor !== null}
                onClick={() => subeYoneticisineGec(s.slug)}
                className="mt-5 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
              >
                {yukleniyor === s.slug ? "Giriliyor…" : "Şube yöneticisine geç"}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
