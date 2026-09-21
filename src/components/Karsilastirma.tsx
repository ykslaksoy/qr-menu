"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { karsilastirma, type KarsilastirmaKahraman } from "@sofra/tema";

const { superQrModel } = karsilastirma;
const sofra = superQrModel.kahramanlar.find((k) => k.bizim)!;

function statToplam(k: KarsilastirmaKahraman) {
  return Object.values(k.stats).reduce((a, b) => a + b, 0);
}

export function SuperQrKarsilastirma() {
  const rakipler = superQrModel.kahramanlar.filter((k) => !k.bizim);
  const bilesik = superQrModel.bilesik;
  const [rakipId, setRakipId] = useState(bilesik?.id ?? rakipler[0]?.id ?? "adisyo");
  const rakip =
    (bilesik && rakipId === bilesik.id ? bilesik : rakipler.find((k) => k.id === rakipId)) ??
    rakipler[0]!;

  const karsilastirmaSatirlari = useMemo(
    () =>
      superQrModel.boyutlar.map((b) => ({
        boyut: b,
        sofra: sofra.stats[b.id as keyof typeof sofra.stats],
        rakip: rakip.stats[b.id as keyof typeof rakip.stats],
      })),
    [rakip],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {bilesik ? (
          <button
            key={bilesik.id}
            type="button"
            onClick={() => setRakipId(bilesik.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              rakipId === bilesik.id
                ? "bg-zinc-900 text-white"
                : "border border-zinc-900/30 bg-zinc-900/5 hover:border-zinc-900/50"
            }`}
          >
            Vox vs {bilesik.kodAd}
          </button>
        ) : null}
        {rakipler.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setRakipId(k.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              rakipId === k.id
                ? "bg-brand text-white"
                : "border border-line bg-card hover:border-brand/40"
            }`}
          >
            Vox vs {k.kodAd}
          </button>
        ))}
      </div>

      {bilesik && rakipId === bilesik.id ? (
        <p className="rounded-xl border border-zinc-900/15 bg-zinc-900/[0.03] px-4 py-3 text-sm text-muted">
          <strong className="text-foreground">SüperQr</strong> = Top 10 birleşimi — her boyutta max
          puan (lig tavanı). Toplam {statToplam(bilesik as KarsilastirmaKahraman)}/80 · Sofra{" "}
          {statToplam(sofra)}/80.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <KahramanKart kahraman={sofra} toplam={statToplam(sofra)} vurgu />
        <KahramanKart
          kahraman={rakip as KarsilastirmaKahraman}
          toplam={statToplam(rakip as KarsilastirmaKahraman)}
        />
      </div>

      <div className="rounded-2xl border border-line bg-card p-5">
        <h3 className="font-semibold">Güç istatistikleri</h3>
        <p className="mt-1 text-sm text-muted">Her boyut 1–10; toplam puan arena tipine göre yorumlanır.</p>
        <ul className="mt-5 space-y-4">
          {karsilastirmaSatirlari.map(({ boyut, sofra: s, rakip: r }) => (
            <li key={boyut.id}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span title={boyut.aciklama}>
                  {boyut.ikon} {boyut.ad}
                </span>
                <span className="tabular-nums text-muted">
                  {s} · {r}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatBar deger={s} renk={sofra.renk} />
                <StatBar deger={r} renk={rakip.renk} />
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between text-xs text-muted">
          <span>← Vox (Sofra)</span>
          <span>{rakip.kodAd} ({rakip.urun}) →</span>
        </div>
      </div>

      <section className="rounded-2xl border border-brand/25 bg-brand/5 p-5">
        <h3 className="font-semibold">Bu arenada kim kazanır?</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {superQrModel.arenalar
            .filter((a) =>
              bilesik && rakipId === bilesik.id
                ? true
                : a.kazanan === "sofra" || a.kazanan === rakip.id,
            )
            .map((a) => (
              <li
                key={a.senaryo}
                className={`rounded-xl border px-3 py-2 ${
                  a.kazanan === "sofra"
                    ? "border-brand/30 bg-white/80"
                    : "border-line bg-background/60 opacity-80"
                }`}
              >
                <p className="font-medium">{a.senaryo}</p>
                <p className="mt-0.5 text-muted">
                  → <strong>{a.kazananKodAd}</strong> — {a.neden}
                </p>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}

function KahramanKart({
  kahraman,
  toplam,
  vurgu,
}: {
  kahraman: KarsilastirmaKahraman;
  toplam: number;
  vurgu?: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border p-5 ${
        vurgu ? "border-brand bg-brand/5 ring-1 ring-brand/20" : "border-line bg-card"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: kahraman.renk }}>
        {kahraman.kodAd}
      </p>
      <h3 className="mt-1 text-xl font-semibold">{kahraman.urun}</h3>
      <p className="text-sm text-muted">{kahraman.arketip}</p>
      <p className="mt-3 text-sm">{kahraman.ozet}</p>
      <dl className="mt-4 space-y-2 text-sm">
        <div>
          <dt className="font-medium text-brand-dark">İmza yeteneği</dt>
          <dd className="text-muted">{kahraman.imzaYetenek}</dd>
        </div>
        <div>
          <dt className="font-medium text-red-800/80">Kryptonit</dt>
          <dd className="text-muted">{kahraman.kryptonit}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-muted">{kahraman.fiyatNotu}</p>
      <p className="mt-2 text-lg font-semibold tabular-nums">Toplam güç: {toplam}/80</p>
    </article>
  );
}

function StatBar({ deger, renk }: { deger: number; renk: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-black/5">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${deger * 10}%`, backgroundColor: renk }}
      />
    </div>
  );
}

export function SadeceSofradaGrid({ limit }: { limit?: number }) {
  const liste = limit ? karsilastirma.sadeceSofrada.slice(0, limit) : karsilastirma.sadeceSofrada;
  const etiketler = karsilastirma.rakiplerdeDurumEtiket;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {liste.map((o) => {
        const etiket = etiketler[o.rakiplerde as keyof typeof etiketler];
        return (
          <li key={o.id} className="flex flex-col rounded-2xl border border-line bg-card p-5">
            <div className="flex items-start justify-between gap-2">
              <span className="text-2xl" aria-hidden>
                {o.ikon}
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  etiket.renk === "emerald"
                    ? "bg-emerald-100 text-emerald-900"
                    : etiket.renk === "amber"
                      ? "bg-amber-100 text-amber-950"
                      : "bg-sky-100 text-sky-950"
                }`}
              >
                {etiket.ad}
              </span>
            </div>
            <h3 className="mt-3 font-semibold">{o.baslik}</h3>
            <p className="mt-2 flex-1 text-sm text-muted">{o.aciklama}</p>
            {o.demoYol.startsWith("/panel") || o.demoYol === "/admin" ? (
              <p className="mt-3 text-xs text-muted">Plan: {o.plan}</p>
            ) : (
              <Link href={o.demoYol} className="mt-3 text-sm font-medium text-brand underline">
                Canlı akış →
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function KarsilastirmaOzetBand() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-brand/30 bg-brand/5 px-4 py-4 text-center">
        <p className="text-3xl font-semibold text-brand">13</p>
        <p className="mt-1 text-sm text-muted">Sadece Sofra farkı</p>
      </div>
      <div className="rounded-xl border border-line bg-card px-4 py-4 text-center">
        <p className="text-3xl font-semibold">71</p>
        <p className="mt-1 text-sm text-muted">SüperQr tavanı /80</p>
      </div>
      <div className="rounded-xl border border-line bg-card px-4 py-4 text-center">
        <p className="text-3xl font-semibold">50</p>
        <p className="mt-1 text-sm text-muted">Sipariş/ay ücretsiz</p>
      </div>
    </div>
  );
}
