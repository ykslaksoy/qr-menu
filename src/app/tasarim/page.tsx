"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  katalog,
  kategorileriGetir,
  sablonlariGetir,
  type Sablon,
} from "@sofra/tema";
import { SiteNav } from "@/components/SiteNav";

export default function TasarimPage() {
  const kategoriler = useMemo(() => kategorileriGetir(), []);
  const [kategoriId, setKategoriId] = useState(kategoriler[0]?.id ?? "sade");
  const [secili, setSecili] = useState<Sablon | null>(null);
  const sablonlar = sablonlariGetir(kategoriId);

  const v = secili?.varsayilanlar;

  return (
    <div className="sofra-mesh min-h-full">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="font-[family-name:var(--font-baslik)] text-3xl font-semibold md:text-4xl">
          Tasarım şablonları
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Önce tarzı seçin, sonra beş şablondan birini. İsterseniz font, renk,
          çerçeve ve zemini özelleştirirsiniz (yönetici ekranında).
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {kategoriler.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => {
                setKategoriId(k.id);
                setSecili(null);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                kategoriId === k.id
                  ? "bg-brand text-white"
                  : "border border-line bg-card hover:border-brand/40"
              }`}
            >
              {k.ad}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          {kategoriler.find((k) => k.id === kategoriId)?.aciklama}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sablonlar.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSecili(s)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                secili?.id === s.id
                  ? "border-brand ring-2 ring-brand/30"
                  : "border-line bg-card hover:border-brand/40"
              }`}
              style={{
                background: s.varsayilanlar.zeminRengi,
                color: s.varsayilanlar.metinRengi,
              }}
            >
              <div
                className="mb-3 h-2 w-16 rounded-full"
                style={{ background: s.varsayilanlar.anaRenk }}
              />
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold">{s.ad}</h2>
                {s.ucretsiz ? (
                  <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                    Ücretsiz
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-xs opacity-70">id: {s.id}</p>
              <p className="mt-1 text-sm opacity-80">
                Vurgu{" "}
                <span style={{ color: s.varsayilanlar.vurguRengi }}>●</span>
              </p>
            </button>
          ))}
        </div>

        {secili && v ? (
          <aside className="mt-10 rounded-2xl border border-line bg-card p-6">
            <h3 className="font-[family-name:var(--font-baslik)] text-xl font-semibold">
              {secili.ad}
            </h3>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted">Yazı tipi</dt>
                <dd>{v.fontPaketi}</dd>
              </div>
              <div>
                <dt className="text-muted">Çerçeve</dt>
                <dd>{v.cerceve}</dd>
              </div>
              <div>
                <dt className="text-muted">Zemin</dt>
                <dd>
                  {v.zeminStili} / {v.desen}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Köşe</dt>
                <dd>{v.kose}px</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/m/demo?masa=1&siparis=1&sablon=${secili.id}`}
                className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Demo menüde aç
              </Link>
              <p className="self-center text-sm text-muted">
                {katalog.duzenEtiketleri[secili.duzen as keyof typeof katalog.duzenEtiketleri] ??
                  secili.duzen}{" "}
                düzeni canlı menüde uygulanır.
              </p>
            </div>
          </aside>
        ) : null}
      </main>
    </div>
  );
}
