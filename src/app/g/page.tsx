"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlanKilit } from "@/components/PlanKilit";
import { AdetAltiBanner } from "@/components/AdetAltiBanner";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { PersonelBaslik } from "@/components/PersonelBaslik";
import { useIsletme } from "@/lib/useIsletme";
import { formatTl } from "@/lib/abonelik";
import {
  cagriEtiket,
  cagriMi,
  dakikaOnce,
  durumEtiket,
  garsonOzet,
  istasyonFiltrele,
  istasyonSirala,
  masaIstasyonlari,
  type GarsonFiltre,
} from "@/lib/garson-istasyon";
import { efektifPlanId, ozellikAcikMiIsletme } from "@/lib/plan-kilit";
import { siparisBipCal } from "@/lib/siparis-bip";
import { adisyonKalan, siparisAktifMi, type Siparis } from "@/lib/store";
import { usePersonelCanli } from "@/lib/use-personel-canli";

const FILTRELER: { id: GarsonFiltre; ad: string }[] = [
  { id: "tumu", ad: "Tümü" },
  { id: "cagri", ad: "Çağrı" },
  { id: "hazir", ad: "Hazır" },
  { id: "mutfak", ad: "Mutfak" },
  { id: "acik", ad: "Açık" },
  { id: "bos", ad: "Boş" },
];

export default function GarsonPage() {
  const { isletme, hazir, yenile } = useIsletme();
  const oncekiYeni = useRef<number | null>(null);
  const oncekiCagri = useRef<number | null>(null);
  const [filtre, setFiltre] = useState<GarsonFiltre>("tumu");
  const [ara, setAra] = useState("");
  const [simdi, setSimdi] = useState(() => Date.now());
  const [islemId, setIslemId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const yukle = useCallback(async () => {
    if (!isletme) return;
    await fetch(`/api/m/${isletme.slug}/siparis`);
    await yenile();
  }, [isletme, yenile]);

  usePersonelCanli({
    slug: isletme?.slug,
    enabled: Boolean(isletme),
    onOlay: (olay) => {
      if (olay.tur === "siparis" || olay.tur === "cagri" || olay.tur === "hazir") {
        void yenile();
      }
    },
    onBildirim: (mesaj) => {
      setToast(mesaj);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 4000);
    },
  });

  useEffect(() => {
    if (!isletme) return;
    yukle();
    const t = setInterval(yukle, 8000);
    return () => clearInterval(t);
  }, [isletme, yukle]);

  useEffect(() => {
    const t = setInterval(() => setSimdi(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const aktifSiparisler = useMemo(() => {
    if (!isletme) return [] as Siparis[];
    return isletme.siparisler.filter((s) => !["iptal", "odendi"].includes(s.durum));
  }, [isletme]);

  const cagrilar = useMemo(() => aktifSiparisler.filter(cagriMi), [aktifSiparisler]);

  const yeniSayisi = useMemo(
    () => aktifSiparisler.filter((s) => s.durum === "yeni" && siparisAktifMi(s)).length,
    [aktifSiparisler],
  );

  useEffect(() => {
    const yeniSiparis = oncekiYeni.current != null && yeniSayisi > oncekiYeni.current;
    const yeniCagri = oncekiCagri.current != null && cagrilar.length > oncekiCagri.current;
    if (yeniSiparis || yeniCagri) siparisBipCal();
    oncekiYeni.current = yeniSayisi;
    oncekiCagri.current = cagrilar.length;
  }, [yeniSayisi, cagrilar.length]);

  async function patchDurum(siparisId: string, durum: "odendi" | "servis") {
    if (!isletme) return;
    setIslemId(siparisId);
    await fetch(`/api/m/${isletme.slug}/siparis`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siparisId, durum }),
    });
    setIslemId(null);
    await yenile();
  }

  async function masayiServisEt(masaId: string, adisyonlar: Siparis[]) {
    if (!isletme) return;
    const hazirlar = adisyonlar.filter((s) => s.durum === "hazir");
    setIslemId(masaId);
    for (const s of hazirlar) {
      await fetch(`/api/m/${isletme.slug}/siparis`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siparisId: s.id, durum: "servis" }),
      });
    }
    setIslemId(null);
    await yenile();
  }

  if (!hazir) return <p className="p-8 text-muted">Yükleniyor…</p>;
  if (!isletme) {
    return (
      <div className="sofra-mesh min-h-full p-8 text-center">
        <Link href="/giris" className="text-brand underline">
          Giriş yapın
        </Link>
      </div>
    );
  }

  if (!ozellikAcikMiIsletme(isletme, "garsonMutfak")) {
    return (
      <div className="sofra-mesh min-h-full p-8">
        <PlanKilit
          ozellik="garsonMutfak"
          mevcutPlan={efektifPlanId(isletme)}
          baslik="Garson ekranı kilitli"
          tamSayfa
          personelMod
        />
      </div>
    );
  }

  const ozet = garsonOzet(isletme, aktifSiparisler);
  const masalar = istasyonSirala(
    istasyonFiltrele(masaIstasyonlari(isletme, cagrilar), filtre, ara),
  );
  const siparisListe = aktifSiparisler
    .filter(siparisAktifMi)
    .slice()
    .sort((a, b) => {
      if (a.durum === "hazir" && b.durum !== "hazir") return -1;
      if (b.durum === "hazir" && a.durum !== "hazir") return 1;
      return b.olusturulma - a.olusturulma;
    });

  return (
    <div className="sofra-mesh min-h-full pb-8">
      <ImpersonationBanner />
      <AdetAltiBanner isletme={isletme} compact />
      <PersonelBaslik rol="garson" kafeAdi={isletme.kafeAdi} />
      {toast ? (
        <div className="fixed inset-x-0 top-3 z-50 flex justify-center px-4 pointer-events-none">
          <p className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
            {toast}
          </p>
        </div>
      ) : null}

      <main className="mx-auto max-w-4xl space-y-5 px-4 py-5">
        <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <OzetKart etiket="Açık masa" deger={String(ozet.acikMasalar)} />
          <OzetKart etiket="Kalan hesap" deger={formatTl(ozet.kalan)} />
          <OzetKart etiket="Çağrı" deger={String(ozet.cagri)} vurgu={ozet.cagri > 0} />
          <OzetKart etiket="Hazır / mutfak" deger={`${ozet.hazir} / ${ozet.mutfak}`} vurgu={ozet.hazir > 0} />
        </section>

        {cagrilar.length > 0 ? (
          <section className="rounded-2xl border border-amber-300/70 bg-amber-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-900">
              Bekleyen çağrı ({cagrilar.length})
            </h2>
            <ul className="mt-3 space-y-2">
              {cagrilar.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm"
                >
                  <Link href={`/g/masa/${s.masaId}`} className="min-w-0 font-medium hover:underline">
                    {s.masaAd} · {cagriEtiket(s)}
                    <span className="ml-2 text-xs font-normal text-muted">
                      {dakikaOnce(s.olusturulma, simdi)}
                    </span>
                  </Link>
                  <button
                    type="button"
                    disabled={islemId === s.id}
                    onClick={() => patchDurum(s.id, "odendi")}
                    className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Tamam
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Kuşbakışı</h2>
              <p className="mt-0.5 text-xs text-muted">
                Çağrı ve hazır üstte. Masaya girin veya hazırı buradan servis edin.
              </p>
            </div>
            <label className="relative min-w-[10rem] flex-1 sm:max-w-xs">
              <span className="sr-only">Masa ara</span>
              <input
                type="search"
                value={ara}
                onChange={(e) => setAra(e.target.value)}
                placeholder="Masa ara"
                className="w-full rounded-full border border-line bg-card px-3.5 py-2 text-sm"
              />
            </label>
          </div>

          <div
            className="mt-3 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Masa filtresi"
          >
            {FILTRELER.map((f) => {
              const aktif = filtre === f.id;
              const sayi =
                f.id === "cagri"
                  ? ozet.cagri
                  : f.id === "hazir"
                    ? ozet.hazir
                    : f.id === "mutfak"
                      ? ozet.mutfak
                      : f.id === "acik"
                        ? ozet.acikMasalar
                        : null;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={aktif}
                  onClick={() => setFiltre(f.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    aktif ? "bg-brand text-white" : "border border-line bg-card"
                  }`}
                >
                  {f.ad}
                  {sayi != null ? ` ${sayi}` : ""}
                </button>
              );
            })}
          </div>

          {isletme.masalar.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Masa tanımlı değil — yöneticinizden masa eklemesini isteyin.
            </p>
          ) : masalar.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
              Bu filtrede masa yok.
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {masalar.map((m) => {
                const dolu = m.adisyonlar.length > 0;
                const hazirMi = m.oncelikDurum === "hazir";
                return (
                  <div
                    key={m.masa.id}
                    className={`flex min-h-[8.25rem] flex-col justify-between rounded-3xl border-2 p-3.5 ${
                      m.cagri
                        ? "border-amber-400 bg-amber-50 shadow-sm"
                        : hazirMi
                          ? "border-emerald-400 bg-emerald-50"
                          : dolu
                            ? "border-brand/50 bg-brand/5"
                            : "border-dashed border-line bg-card"
                    }`}
                  >
                    <Link href={`/g/masa/${m.masa.id}`} className="min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-semibold leading-tight">{m.masa.ad}</p>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            m.cagri
                              ? "bg-amber-200 text-amber-950"
                              : hazirMi
                                ? "bg-emerald-200 text-emerald-950"
                                : m.oncelikDurum === "yeni"
                                  ? "bg-sky-100 text-sky-900"
                                  : m.oncelikDurum === "mutfak"
                                    ? "bg-orange-100 text-orange-900"
                                    : "bg-black/5 text-muted"
                          }`}
                        >
                          {m.cagri ? "Çağrı" : durumEtiket(m.oncelikDurum)}
                        </span>
                      </div>
                      {m.cagri ? (
                        <p className="mt-1 text-xs font-semibold text-amber-900">{cagriEtiket(m.cagri)}</p>
                      ) : null}
                      {m.enEski ? (
                        <p className="mt-1 text-[11px] text-muted">{dakikaOnce(m.enEski, simdi)}</p>
                      ) : (
                        <p className="mt-1 text-[11px] text-muted">Boş — sipariş al</p>
                      )}
                    </Link>
                    <div className="mt-2 flex items-end justify-between gap-2">
                      <div>
                        {dolu ? (
                          <>
                            <p className="text-lg font-semibold tabular-nums leading-none">{formatTl(m.kalan)}</p>
                            <p className="mt-0.5 text-[11px] text-muted">
                              {m.adisyonlar.length} adisyon · {m.kalemSayisi} kalem
                            </p>
                          </>
                        ) : (
                          <Link href={`/g/masa/${m.masa.id}`} className="text-xs font-semibold text-brand underline">
                            Aç
                          </Link>
                        )}
                      </div>
                      {m.cagri ? (
                        <button
                          type="button"
                          disabled={islemId === m.cagri.id}
                          onClick={() => patchDurum(m.cagri!.id, "odendi")}
                          className="rounded-full bg-amber-800 px-2.5 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
                        >
                          Tamam
                        </button>
                      ) : hazirMi ? (
                        <button
                          type="button"
                          disabled={islemId === m.masa.id}
                          onClick={() => masayiServisEt(m.masa.id, m.adisyonlar)}
                          className="rounded-full bg-emerald-700 px-2.5 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
                        >
                          Servis
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Aktif adisyonlar ({siparisListe.length})
          </h2>
          {siparisListe.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Aktif sipariş yok.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {siparisListe.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/g/masa/${s.masaId}`}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm hover:border-brand/40 ${
                      s.durum === "hazir"
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-line bg-card"
                    }`}
                  >
                    <span>
                      <span className="font-medium">{s.masaAd}</span>
                      <span className="text-muted">
                        {" "}
                        · {durumEtiket(s.durum)} · {dakikaOnce(s.olusturulma, simdi)}
                      </span>
                    </span>
                    <span className="font-medium tabular-nums">{formatTl(adisyonKalan(s))}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function OzetKart({ etiket, deger, vurgu }: { etiket: string; deger: string; vurgu?: boolean }) {
  return (
    <div
      className={`rounded-2xl border px-3 py-2.5 ${
        vurgu ? "border-amber-300 bg-amber-50" : "border-line bg-card"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{etiket}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums leading-tight">{deger}</p>
    </div>
  );
}
