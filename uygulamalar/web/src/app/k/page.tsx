"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlanKilit } from "@/components/PlanKilit";
import { AdetAltiBanner } from "@/components/AdetAltiBanner";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { PersonelBaslik } from "@/components/PersonelBaslik";
import { useIsletme } from "@/lib/useIsletme";
import { efektifPlanId, ozellikAcikMiIsletme } from "@/lib/plan-kilit";
import {
  dakikaOnce,
  kdsAciliyet,
  kdsFiltrele,
  kdsOzet,
  kdsSiparisMi,
  kdsSirala,
  siparisIstasyonEtiket,
  type KdsAciliyet,
  type KdsFiltre,
  type KdsIstasyon,
} from "@/lib/mutfak-kds";
import { siparisBipCal } from "@/lib/siparis-bip";
import type { Siparis, SiparisDurum } from "@/lib/store";
import { usePersonelCanli } from "@/lib/use-personel-canli";

const FILTRELER: { id: KdsFiltre; ad: string }[] = [
  { id: "tumu", ad: "Tümü" },
  { id: "yeni", ad: "Yeni" },
  { id: "mutfak", ad: "Mutfakta" },
  { id: "hazir", ad: "Hazır" },
  { id: "geciken", ad: "Geciken" },
];

const ISTASYONLAR: { id: KdsIstasyon; ad: string }[] = [
  { id: "tumu", ad: "Tüm istasyon" },
  { id: "mutfak", ad: "Mutfak" },
  { id: "bar", ad: "Bar" },
  { id: "tatli", ad: "Tatlı" },
];

export default function MutfakPage() {
  const { isletme, hazir: yuklendi, yenile } = useIsletme();
  const oncekiYeni = useRef<number | null>(null);
  const [filtre, setFiltre] = useState<KdsFiltre>("tumu");
  const [istasyon, setIstasyon] = useState<KdsIstasyon>("tumu");
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
    const t = setInterval(() => setSimdi(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);

  const siparisler = useMemo(() => {
    if (!isletme) return [] as Siparis[];
    return isletme.siparisler.filter(kdsSiparisMi);
  }, [isletme]);

  const yeniSayisi = useMemo(
    () => siparisler.filter((s) => s.durum === "yeni").length,
    [siparisler],
  );

  useEffect(() => {
    if (oncekiYeni.current != null && yeniSayisi > oncekiYeni.current) {
      siparisBipCal();
    }
    oncekiYeni.current = yeniSayisi;
  }, [yeniSayisi]);

  async function durumGuncelle(siparisId: string, durum: SiparisDurum) {
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

  if (!yuklendi) return <p className="p-8 text-stone-400">Yükleniyor…</p>;
  if (!isletme) {
    return (
      <div className="min-h-full bg-stone-950 p-8 text-center text-white">
        <Link href="/giris" className="underline">
          Giriş yapın
        </Link>
      </div>
    );
  }

  if (!ozellikAcikMiIsletme(isletme, "garsonMutfak")) {
    return (
      <div className="min-h-full bg-stone-950 p-8">
        <PlanKilit
          ozellik="garsonMutfak"
          mevcutPlan={efektifPlanId(isletme)}
          baslik="Mutfak ekranı kilitli"
          tamSayfa
          personelMod
        />
      </div>
    );
  }

  const ozet = kdsOzet(siparisler, simdi);
  const filtreli = kdsSirala(kdsFiltrele(siparisler, isletme, filtre, istasyon, ara, simdi));
  const yeniListe = filtreli.filter((s) => s.durum === "yeni");
  const mutfakListe = filtreli.filter((s) => s.durum === "mutfak");
  const hazirListe = filtreli.filter((s) => s.durum === "hazir");

  return (
    <div className="min-h-full bg-stone-950 text-stone-100">
      <ImpersonationBanner />
      <AdetAltiBanner isletme={isletme} compact />
      <PersonelBaslik rol="mutfak" kafeAdi={isletme.kafeAdi} />
      {toast ? (
        <div className="fixed inset-x-0 top-3 z-50 flex justify-center px-4 pointer-events-none">
          <p className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-950 shadow-lg">
            {toast}
          </p>
        </div>
      ) : null}

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-5">
        <section className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <OzetKart etiket="Yeni" deger={String(ozet.yeni)} vurgu={ozet.yeni > 0} renk="amber" />
          <OzetKart etiket="Mutfakta" deger={String(ozet.mutfak)} />
          <OzetKart etiket="Hazır" deger={String(ozet.hazir)} renk="emerald" />
          <OzetKart etiket="Geciken" deger={String(ozet.geciken)} vurgu={ozet.geciken > 0} renk="rose" />
          <OzetKart etiket="Bekleyen kalem" deger={String(ozet.kalem)} />
        </section>

        <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">KDS</h2>
            <p className="mt-0.5 text-xs text-stone-500">
              Eski ticket üstte. Yaşlananlar turuncu / kırmızı. Al → Hazır → garson servis eder.
            </p>
          </div>
          <label className="relative min-w-[10rem] flex-1 sm:max-w-xs">
            <span className="sr-only">Masa ara</span>
            <input
              type="search"
              value={ara}
              onChange={(e) => setAra(e.target.value)}
              placeholder="Masa ara"
              className="w-full rounded-full border border-stone-700 bg-stone-900 px-3.5 py-2 text-sm text-white placeholder:text-stone-500"
            />
          </label>
        </section>

        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Durum filtresi">
          {FILTRELER.map((f) => {
            const aktif = filtre === f.id;
            const sayi =
              f.id === "yeni"
                ? ozet.yeni
                : f.id === "mutfak"
                  ? ozet.mutfak
                  : f.id === "hazir"
                    ? ozet.hazir
                    : f.id === "geciken"
                      ? ozet.geciken
                      : null;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={aktif}
                onClick={() => setFiltre(f.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  aktif ? "bg-amber-400 text-stone-950" : "border border-stone-700 bg-stone-900 text-stone-200"
                }`}
              >
                {f.ad}
                {sayi != null ? ` ${sayi}` : ""}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="İstasyon">
          {ISTASYONLAR.map((i) => {
            const aktif = istasyon === i.id;
            return (
              <button
                key={i.id}
                type="button"
                role="tab"
                aria-selected={aktif}
                onClick={() => setIstasyon(i.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  aktif ? "bg-sky-400 text-stone-950" : "border border-stone-700 bg-stone-900 text-stone-300"
                }`}
              >
                {i.ad}
              </button>
            );
          })}
        </div>

        {filtreli.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-700 px-4 py-12 text-center text-sm text-stone-400">
            Bu filtrede ticket yok.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <KdsSutun
              baslik="Yeni"
              renk="amber"
              liste={yeniListe}
              isletme={isletme}
              simdi={simdi}
              islemId={islemId}
              onDurum={durumGuncelle}
            />
            <KdsSutun
              baslik="Mutfakta"
              renk="orange"
              liste={mutfakListe}
              isletme={isletme}
              simdi={simdi}
              islemId={islemId}
              onDurum={durumGuncelle}
            />
            <KdsSutun
              baslik="Hazır · garson"
              renk="emerald"
              liste={hazirListe}
              isletme={isletme}
              simdi={simdi}
              islemId={islemId}
              onDurum={durumGuncelle}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function OzetKart({
  etiket,
  deger,
  vurgu,
  renk = "stone",
}: {
  etiket: string;
  deger: string;
  vurgu?: boolean;
  renk?: "stone" | "amber" | "emerald" | "rose";
}) {
  const sinif =
    renk === "amber"
      ? vurgu
        ? "border-amber-500/60 bg-amber-500/15"
        : "border-stone-700 bg-stone-900"
      : renk === "emerald"
        ? "border-emerald-600/50 bg-emerald-500/10"
        : renk === "rose"
          ? vurgu
            ? "border-rose-500/70 bg-rose-500/15"
            : "border-stone-700 bg-stone-900"
          : "border-stone-700 bg-stone-900";
  return (
    <div className={`rounded-2xl border px-3 py-2.5 ${sinif}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">{etiket}</p>
      <p className="mt-0.5 text-xl font-bold tabular-nums leading-tight">{deger}</p>
    </div>
  );
}

function KdsSutun({
  baslik,
  renk,
  liste,
  isletme,
  simdi,
  islemId,
  onDurum,
}: {
  baslik: string;
  renk: "amber" | "orange" | "emerald";
  liste: Siparis[];
  isletme: NonNullable<ReturnType<typeof useIsletme>["isletme"]>;
  simdi: number;
  islemId: string | null;
  onDurum: (id: string, durum: SiparisDurum) => void;
}) {
  const baslikRenk =
    renk === "amber" ? "text-amber-300" : renk === "orange" ? "text-orange-300" : "text-emerald-300";

  return (
    <section className="min-w-0">
      <h3 className={`mb-2 text-sm font-bold uppercase tracking-wide ${baslikRenk}`}>
        {baslik} ({liste.length})
      </h3>
      <ul className="space-y-3">
        {liste.length === 0 ? (
          <li className="rounded-xl border border-dashed border-stone-800 px-3 py-8 text-center text-xs text-stone-500">
            Boş
          </li>
        ) : (
          liste.map((s) => (
            <KdsKart
              key={s.id}
              siparis={s}
              isletme={isletme}
              simdi={simdi}
              busy={islemId === s.id}
              onDurum={onDurum}
            />
          ))
        )}
      </ul>
    </section>
  );
}

function KdsKart({
  siparis: s,
  isletme,
  simdi,
  busy,
  onDurum,
}: {
  siparis: Siparis;
  isletme: NonNullable<ReturnType<typeof useIsletme>["isletme"]>;
  simdi: number;
  busy: boolean;
  onDurum: (id: string, durum: SiparisDurum) => void;
}) {
  const acil = kdsAciliyet(s.olusturulma, simdi);
  const cerceve = aciliyetSinif(acil, s.durum);

  return (
    <li className={`rounded-2xl border-2 p-4 ${cerceve}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-lg font-bold leading-tight">{s.masaAd}</p>
          <p className="mt-0.5 text-xs text-stone-400">
            {siparisIstasyonEtiket(isletme, s)} · {dakikaOnce(s.olusturulma, simdi)}
            {acil !== "normal" && s.durum !== "hazir" ? (
              <span className={`ml-1 font-semibold ${acil === "kritik" ? "text-rose-300" : "text-amber-300"}`}>
                · {acil === "kritik" ? "kritik" : "gecikiyor"}
              </span>
            ) : null}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-200">
          {s.kalemler.reduce((a, k) => a + k.adet, 0)} kalem
        </span>
      </div>

      <ul className="mt-3 space-y-1.5">
        {s.kalemler.map((k, i) => (
          <li key={i} className="text-lg leading-snug">
            <span className="font-bold text-amber-300">{k.adet}×</span> {k.ad}
            {k.ikram ? <span className="ml-1 text-xs font-medium text-sky-300">ikram</span> : null}
            {k.secenekOzet ? (
              <span className="mt-0.5 block text-sm font-medium text-amber-100/85">→ {k.secenekOzet}</span>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        {s.durum === "yeni" ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDurum(s.id, "mutfak")}
              className="rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-stone-950 disabled:opacity-50"
            >
              Al
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDurum(s.id, "hazir")}
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-stone-950 disabled:opacity-50"
            >
              Hazır
            </button>
          </>
        ) : null}
        {s.durum === "mutfak" ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDurum(s.id, "hazir")}
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-stone-950 disabled:opacity-50"
            >
              Hazır
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDurum(s.id, "yeni")}
              className="rounded-full border border-stone-500 px-3 py-2 text-xs font-semibold text-stone-200 disabled:opacity-50"
            >
              Geri
            </button>
          </>
        ) : null}
        {s.durum === "hazir" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onDurum(s.id, "mutfak")}
            className="rounded-full border border-stone-500 px-3 py-2 text-xs font-semibold text-stone-200 disabled:opacity-50"
          >
            Geri al
          </button>
        ) : null}
      </div>
    </li>
  );
}

function aciliyetSinif(acil: KdsAciliyet, durum: SiparisDurum) {
  if (durum === "hazir") return "border-emerald-600/70 bg-emerald-950/40";
  if (acil === "kritik") return "border-rose-500 bg-rose-950/50 shadow-[0_0_0_1px_rgba(244,63,94,0.35)]";
  if (acil === "uyari") return "border-amber-500 bg-amber-950/40";
  if (durum === "yeni") return "border-amber-600/50 bg-stone-900";
  return "border-stone-600 bg-stone-900";
}
