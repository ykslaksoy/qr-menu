"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PlanKilit } from "@/components/PlanKilit";
import { useIsletme } from "@/lib/useIsletme";
import { formatTl } from "@/lib/abonelik";
import { efektifPlanId, ozellikAcikMiIsletme } from "@/lib/plan-kilit";
import {
  kanalEtiket,
  kanalSirasi,
  masaSirasi,
  odemeSirasi,
  raporCsv,
  raporSiparisleri,
  saatlikCiro,
  satisOzet,
  urunSirasi,
  type RaporAralik,
} from "@/lib/satis-analitik";

const ARALIKLAR: { id: RaporAralik; etiket: string }[] = [
  { id: "bugun", etiket: "Bugün" },
  { id: "7g", etiket: "7g" },
  { id: "30g", etiket: "30g" },
  { id: "tumu", etiket: "Tümü" },
];

export default function PanelRaporPage() {
  const { isletme } = useIsletme();
  const [aralik, setAralik] = useState<RaporAralik>("bugun");

  const siparisler = useMemo(
    () => (isletme ? raporSiparisleri(isletme, aralik) : []),
    [isletme, aralik],
  );
  const ozet = useMemo(() => satisOzet(siparisler), [siparisler]);
  const urunler = useMemo(() => urunSirasi(siparisler), [siparisler]);
  const masalar = useMemo(() => masaSirasi(siparisler), [siparisler]);
  const kanallar = useMemo(() => kanalSirasi(siparisler), [siparisler]);
  const odemeler = useMemo(() => odemeSirasi(siparisler), [siparisler]);
  const saatlik = useMemo(() => saatlikCiro(siparisler), [siparisler]);
  const maxSaat = useMemo(
    () => Math.max(1, ...saatlik.map((b) => b.tutar)),
    [saatlik],
  );

  if (!isletme) return null;

  if (!ozellikAcikMiIsletme(isletme, "analitik")) {
    return (
      <PlanKilit
        ozellik="analitik"
        mevcutPlan={efektifPlanId(isletme)}
        baslik="Raporlar kilitli"
        tamSayfa
      />
    );
  }

  function csvIndir() {
    const csv = raporCsv(siparisler);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sofra-rapor-${aralik}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-baslik)] text-3xl font-semibold">Raporlar</h1>
          <p className="mt-1 text-muted">Satış özeti, ürün ve kanal dağılımı.</p>
        </div>
        <button
          type="button"
          onClick={csvIndir}
          className="rounded-full border border-line bg-card px-4 py-2 text-sm font-medium hover:border-brand/40"
        >
          CSV indir
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {ARALIKLAR.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAralik(a.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              aralik === a.id
                ? "bg-brand text-white"
                : "border border-line bg-card text-foreground/80 hover:bg-line/60"
            }`}
          >
            {a.etiket}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Kart baslik="Sipariş" deger={String(ozet.siparis)} />
        <Kart baslik="Ödenen" deger={String(ozet.odendi)} />
        <Kart baslik="Açık" deger={String(ozet.acik)} />
        <Kart baslik="Ciro" deger={formatTl(ozet.ciro)} />
        <Kart baslik="Ort. adisyon" deger={formatTl(ozet.ortAdisyon)} />
      </div>

      <section className="mt-8 rounded-2xl border border-line bg-card p-5">
        <h2 className="font-semibold">Son 24s dağılım</h2>
        <p className="mt-1 text-xs text-muted">Ödenen siparişlerin saatlik ciro çubukları</p>
        <div className="mt-4 flex h-36 items-end gap-1">
          {saatlik.map((b) => (
            <div key={b.saat} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
              <div
                className="w-full max-w-[14px] rounded-t bg-brand/80"
                style={{
                  height: `${Math.max(b.tutar > 0 ? 8 : 2, Math.round((b.tutar / maxSaat) * 100))}%`,
                }}
                title={`${b.saat}. dilim · ${formatTl(b.tutar)} · ${b.adet} sipariş`}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted">
          <span>−24s</span>
          <span>şimdi</span>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">En çok satanlar</h2>
          {urunler.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Henüz veri yok.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {urunler.map((u) => (
                <li
                  key={u.ad}
                  className="flex justify-between gap-2 border-b border-line/60 py-2 last:border-0"
                >
                  <span className="truncate">{u.ad}</span>
                  <span className="shrink-0 text-muted">
                    {u.adet} · {formatTl(u.tutar)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Masa ısı</h2>
          {masalar.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Henüz veri yok.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {masalar.map((m) => (
                <li
                  key={m.ad}
                  className="flex justify-between gap-2 border-b border-line/60 py-2 last:border-0"
                >
                  <span>{m.ad}</span>
                  <span className="text-muted">
                    {m.adet} sipariş · {formatTl(m.tutar)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Kanal dağılımı</h2>
          {kanallar.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Henüz veri yok.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {kanallar.map((k) => (
                <li
                  key={k.kanal}
                  className="flex justify-between gap-2 border-b border-line/60 py-2 last:border-0"
                >
                  <span>{kanalEtiket(k.kanal)}</span>
                  <span className="text-muted">
                    {k.adet} · {formatTl(k.tutar)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Ödeme dağılımı</h2>
          {odemeler.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Henüz veri yok.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {odemeler.map((o) => (
                <li
                  key={o.kanal}
                  className="flex justify-between gap-2 border-b border-line/60 py-2 last:border-0"
                >
                  <span>{kanalEtiket(o.kanal)}</span>
                  <span className="text-muted">{formatTl(o.tutar)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/panel" className="text-brand underline">
          ← Özet
        </Link>
      </p>
    </div>
  );
}

function Kart({ baslik, deger }: { baslik: string; deger: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{baslik}</p>
      <p className="mt-2 text-xl font-semibold">{deger}</p>
    </div>
  );
}
