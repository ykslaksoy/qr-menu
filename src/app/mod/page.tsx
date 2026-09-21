"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ModKatalog } from "@/components/ModKatalog";
import {
  MOD_ACIKLAMA,
  MOD_ANA_YOL,
  MOD_ETIKET,
  MOD_OZELLIK_ETIKET,
  modOzellikleri,
  type SofraMod,
} from "@/lib/mod";
import { useIsletme } from "@/lib/useIsletme";

const MOD_IKON: Record<SofraMod, string> = {
  platform: "🏢",
  zincir: "🗺️",
  yonetici: "📋",
  garson: "🎤",
  mutfak: "👨‍🍳",
};

export default function ModSecPage() {
  const router = useRouter();
  const { hazir, oturumlu, mod, modSecenekleri, isletme } = useIsletme();
  const [yukleniyor, setYukleniyor] = useState<SofraMod | null>(null);

  useEffect(() => {
    if (hazir && !oturumlu) {
      router.replace("/giris?sonra=/mod");
    }
  }, [hazir, oturumlu, router]);

  async function modSec(hedef: SofraMod) {
    setYukleniyor(hedef);
    const yanit = await fetch("/api/auth", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mod", mod: hedef }),
    });
    const veri = await yanit.json();
    setYukleniyor(null);
    if (yanit.ok) {
      router.push(veri.yonlendir ?? MOD_ANA_YOL[hedef]);
    }
  }

  if (!hazir || !oturumlu) {
    return (
      <div className="sofra-mesh flex min-h-full items-center justify-center p-8">
        <p className="text-muted">Yükleniyor…</p>
      </div>
    );
  }

  const secenekler = modSecenekleri.length ? modSecenekleri : mod ? [mod] : [];

  return (
    <div className="sofra-mesh min-h-full">
      <main className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="font-[family-name:var(--font-baslik)] text-3xl font-semibold">Mod seçin</h1>
        <p className="mt-2 text-muted">
          {isletme ? `${isletme.kafeAdi} — ` : ""}
          Her rol farklı ekran ve yetki seti görür.
        </p>
        {mod ? <p className="mt-1 text-sm text-brand">Aktif: {MOD_ETIKET[mod]}</p> : null}

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {secenekler.map((m) => (
            <li key={m}>
              <button
                type="button"
                disabled={yukleniyor !== null}
                onClick={() => modSec(m)}
                className={`flex h-full w-full flex-col items-start gap-3 rounded-2xl border bg-card p-5 text-left transition hover:border-brand/40 ${
                  mod === m ? "border-brand ring-1 ring-brand/20" : "border-line"
                }`}
              >
                <div className="flex w-full items-start gap-3">
                  <span className="text-2xl">{MOD_IKON[m]}</span>
                  <span className="flex-1">
                    <span className="block font-semibold">{MOD_ETIKET[m]}</span>
                    <span className="mt-1 block text-sm text-muted">{MOD_ACIKLAMA[m]}</span>
                    <span className="mt-2 block text-xs font-mono text-muted">{MOD_ANA_YOL[m]}</span>
                  </span>
                  {yukleniyor === m ? <span className="text-sm text-muted">…</span> : null}
                </div>
                <ul className="w-full space-y-0.5 border-t border-line/60 pt-3 text-xs text-muted">
                  {modOzellikleri(m)
                    .slice(0, 4)
                    .map((o) => (
                      <li key={o}>· {MOD_OZELLIK_ETIKET[o]}</li>
                    ))}
                  {modOzellikleri(m).length > 4 ? (
                    <li>· +{modOzellikleri(m).length - 4} özellik daha</li>
                  ) : null}
                </ul>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-16 border-t border-line pt-12">
          <ModKatalog />
        </div>
      </main>
    </div>
  );
}
