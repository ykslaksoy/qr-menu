"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatTl } from "@/lib/abonelik";
import { uiMetin, type MenuDil } from "@/lib/menu-dil";

type HesapKalem = {
  urunId: string;
  ad: string;
  fiyat: number;
  adet: number;
  secenekOzet?: string;
};

type HesapVeri = {
  masaId: string;
  masaAd: string;
  bos: boolean;
  kalemler: HesapKalem[];
  araToplam: number;
  simulasyon?: boolean;
};

type Props = {
  slug: string;
  masaId: string;
  masaAd: string;
  anaRenk: string;
  vurguRengi: string;
  kose: number;
  dil?: MenuDil;
  onKapat: () => void;
  onOdendi: (toplam: number) => void;
  onHesapIste?: () => void;
};

const BAHSIS_ORANLARI = [0, 5, 10, 15] as const;

export function HesapOdemeModal({
  slug,
  masaId,
  masaAd,
  anaRenk,
  vurguRengi,
  kose,
  dil = "tr",
  onKapat,
  onOdendi,
  onHesapIste,
}: Props) {
  const [veri, setVeri] = useState<HesapVeri | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState("");
  const [bahsisOran, setBahsisOran] = useState<(typeof BAHSIS_ORANLARI)[number]>(10);
  const [oduyor, setOduyor] = useState(false);
  const [basarili, setBasarili] = useState(false);
  const [odenenToplam, setOdenenToplam] = useState(0);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata("");
    try {
      const yanit = await fetch(`/api/m/${slug}/hesap?masaId=${encodeURIComponent(masaId)}`);
      const json = (await yanit.json()) as HesapVeri & { hata?: string };
      if (!yanit.ok) {
        setHata(json.hata ?? uiMetin("odemeHata", dil));
        setVeri(null);
        return;
      }
      setVeri(json);
    } catch {
      setHata(uiMetin("odemeHata", dil));
    } finally {
      setYukleniyor(false);
    }
  }, [slug, masaId, dil]);

  useEffect(() => {
    yukle();
  }, [yukle]);

  const bahsis = useMemo(() => {
    if (!veri || bahsisOran === 0) return 0;
    return Math.round(((veri.araToplam * bahsisOran) / 100) * 100) / 100;
  }, [veri, bahsisOran]);

  const toplam = (veri?.araToplam ?? 0) + bahsis;

  async function ode() {
    if (!veri || veri.bos || oduyor) return;
    setOduyor(true);
    setHata("");
    try {
      const yanit = await fetch(`/api/m/${slug}/hesap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masaId, bahsis }),
      });
      const json = (await yanit.json()) as {
        hata?: string;
        toplam?: number;
        odeme?: { mod?: string };
      };
      if (!yanit.ok) {
        setHata(json.hata ?? uiMetin("odemeHata", dil));
        return;
      }
      setOdenenToplam(json.toplam ?? toplam);
      setBasarili(true);
      onOdendi(json.toplam ?? toplam);
    } catch {
      setHata(uiMetin("odemeHata", dil));
    } finally {
      setOduyor(false);
    }
  }

  return (
    <div
      className="menu-modal-arka fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={uiMetin("hesabim", dil)}
      onClick={onKapat}
    >
      <div
        className="menu-modal-sheet flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl sm:rounded-2xl"
        style={{ borderRadius: kose > 8 ? kose : 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative px-5 pb-4 pt-5 text-white"
          style={{
            background: `linear-gradient(145deg, ${anaRenk} 0%, color-mix(in srgb, ${anaRenk} 70%, #0a2e24) 100%)`,
          }}
        >
          <button
            type="button"
            onClick={onKapat}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg backdrop-blur-sm"
            aria-label={uiMetin("kapat", dil)}
          >
            ×
          </button>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
            {uiMetin("hesabim", dil)}
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-baslik)] text-2xl font-semibold">
            {masaAd}
          </h2>
          {!basarili && veri && !veri.bos ? (
            <p className="mt-1 text-sm text-white/80">
              {uiMetin("araToplam", dil)} · {formatTl(veri.araToplam)}
            </p>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {yukleniyor ? (
            <p className="py-8 text-center text-sm opacity-60">{uiMetin("hesapYukleniyor", dil)}</p>
          ) : basarili ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full text-3xl text-white"
                style={{ background: anaRenk }}
                aria-hidden
              >
                ✓
              </div>
              <p className="mt-4 font-[family-name:var(--font-baslik)] text-xl font-semibold">
                {uiMetin("odemeBasarili", dil)}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums" style={{ color: vurguRengi }}>
                {formatTl(odenenToplam)}
              </p>
              <p className="mt-2 text-sm opacity-60">{uiMetin("odemeTesekkur", dil)}</p>
              <button
                type="button"
                onClick={onKapat}
                className="mt-6 rounded-full px-6 py-2.5 text-sm font-semibold text-white"
                style={{ background: anaRenk }}
              >
                {uiMetin("kapat", dil)}
              </button>
            </div>
          ) : veri?.bos ? (
            <div className="py-8 text-center">
              <p className="text-sm opacity-70">{uiMetin("hesapBos", dil)}</p>
              <button
                type="button"
                onClick={onKapat}
                className="mt-5 rounded-full border px-5 py-2 text-sm font-semibold"
                style={{ borderColor: anaRenk + "55", color: anaRenk }}
              >
                {uiMetin("kapat", dil)}
              </button>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-black/5">
                {(veri?.kalemler ?? []).map((k) => (
                  <li key={k.urunId + k.ad} className="flex items-start justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug">
                        <span className="tabular-nums opacity-55">{k.adet}×</span> {k.ad}
                      </p>
                      {k.secenekOzet ? (
                        <p className="mt-0.5 text-xs opacity-50">{k.secenekOzet}</p>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {formatTl(k.fiyat * k.adet)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide opacity-50">
                  {uiMetin("bahsis", dil)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {BAHSIS_ORANLARI.map((oran) => {
                    const aktif = bahsisOran === oran;
                    return (
                      <button
                        key={oran}
                        type="button"
                        onClick={() => setBahsisOran(oran)}
                        className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition"
                        style={
                          aktif
                            ? { background: anaRenk, color: "#fff" }
                            : {
                                background: "transparent",
                                border: `1px solid ${anaRenk}40`,
                                color: anaRenk,
                              }
                        }
                      >
                        {oran === 0 ? uiMetin("bahsisYok", dil) : `%${oran}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 space-y-1.5 rounded-2xl bg-black/[0.03] px-4 py-3 text-sm">
                <div className="flex justify-between opacity-70">
                  <span>{uiMetin("araToplam", dil)}</span>
                  <span className="tabular-nums">{formatTl(veri?.araToplam ?? 0)}</span>
                </div>
                <div className="flex justify-between opacity-70">
                  <span>
                    {uiMetin("bahsis", dil)}
                    {bahsisOran > 0 ? ` (%${bahsisOran})` : ""}
                  </span>
                  <span className="tabular-nums">{formatTl(bahsis)}</span>
                </div>
                <div className="flex justify-between border-t border-black/5 pt-2 text-base font-semibold">
                  <span>{uiMetin("genelToplam", dil)}</span>
                  <span className="tabular-nums" style={{ color: vurguRengi }}>
                    {formatTl(toplam)}
                  </span>
                </div>
              </div>

              {hata ? <p className="mt-3 text-sm text-red-700">{hata}</p> : null}

              <p className="mt-4 text-center text-[11px] opacity-45">
                {veri?.simulasyon
                  ? uiMetin("odemeSimulasyon", dil)
                  : uiMetin("odemeGuvenli", dil)}
              </p>
            </>
          )}
        </div>

        {!basarili && veri && !veri.bos && !yukleniyor ? (
          <div className="space-y-2 border-t border-black/5 px-5 py-4">
            <button
              type="button"
              disabled={oduyor}
              onClick={ode}
              className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white shadow-md disabled:opacity-60"
              style={{ background: anaRenk }}
            >
              {oduyor
                ? uiMetin("odemeIsleniyor", dil)
                : `${uiMetin("kartlaOde", dil)} · ${formatTl(toplam)}`}
            </button>
            {onHesapIste ? (
              <button
                type="button"
                onClick={onHesapIste}
                className="w-full rounded-full border py-2.5 text-sm font-semibold"
                style={{ borderColor: anaRenk + "44", color: anaRenk }}
              >
                {uiMetin("hesap", dil)}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
