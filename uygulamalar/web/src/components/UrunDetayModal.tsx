"use client";

import { AlerjenRozetleri } from "@/components/AlerjenRozetleri";
import { formatTl } from "@/lib/abonelik";
import { gorselEkranUrl } from "@/lib/gorsel-raster";
import { uiMetin, type MenuDil } from "@/lib/menu-dil";
import type { Urun } from "@/lib/store";

type Props = {
  urun: Urun;
  adGoster: string;
  aciklamaGoster?: string;
  anaRenk: string;
  vurguRengi: string;
  kose: number;
  tukendi?: boolean;
  siparisModu?: boolean;
  dil?: MenuDil;
  onKapat: () => void;
  onSepete?: () => void;
};

export function UrunDetayModal({
  urun,
  adGoster,
  aciklamaGoster,
  anaRenk,
  vurguRengi,
  kose,
  tukendi,
  siparisModu,
  dil = "tr",
  onKapat,
  onSepete,
}: Props) {
  const gorsel = gorselEkranUrl(urun.gorselUrl);
  const besin = urun.besin;
  const kalori = besin?.kalori ?? urun.kalori;

  return (
    <div
      className="menu-modal-arka fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onKapat}
    >
      <div
        className="menu-modal-sheet max-h-[92vh] w-full max-w-md overflow-y-auto bg-white shadow-2xl sm:rounded-2xl"
        style={{ borderRadius: kose > 8 ? kose : 16 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="menu-foto-wrap relative overflow-hidden">
          {gorsel ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gorsel}
              alt=""
              className="menu-modal-foto"
            />
          ) : (
            <div className="aspect-[5/4] w-full" style={{ background: anaRenk + "18" }} />
          )}
          <button
            type="button"
            onClick={onKapat}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-lg text-white backdrop-blur-sm"
            aria-label="Kapat"
          >
            ×
          </button>
        </div>
        <div className="p-5 pb-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-[family-name:var(--font-baslik)] text-2xl font-semibold leading-tight">
              {adGoster}
            </h2>
            <span className="shrink-0 text-xl font-semibold tabular-nums" style={{ color: vurguRengi }}>
              {formatTl(urun.fiyat)}
            </span>
          </div>
          {aciklamaGoster ? (
            <p className="mt-3 text-[15px] leading-relaxed opacity-70">{aciklamaGoster}</p>
          ) : null}

          {urun.alerjenler?.length ? (
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide opacity-45">
                {uiMetin("alerjen", dil)}
              </p>
              <AlerjenRozetleri
                alerjenler={urun.alerjenler}
                kalori={null}
                boyut="genis"
                anaRenk={anaRenk}
                dil={dil}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm opacity-55">{uiMetin("alerjenYok", dil)}</p>
          )}

          {urun.icerik ? (
            <div className="mt-4 rounded-xl border border-black/8 bg-black/[0.02] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide opacity-45">
                {uiMetin("icerik", dil)}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed opacity-80">{urun.icerik}</p>
            </div>
          ) : null}

          {besin || kalori != null ? (
            <div className="mt-4 rounded-xl border border-black/8 bg-black/[0.02] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide opacity-45">
                {uiMetin("besin", dil)}
                <span className="ml-1 font-normal normal-case opacity-70">
                  · {dil === "en" ? "per serving" : "porsiyon"}
                </span>
              </p>
              <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                {kalori != null ? (
                  <div className="rounded-lg bg-white/80 px-2.5 py-2">
                    <dt className="text-[10px] uppercase tracking-wide opacity-45">{uiMetin("kalori", dil)}</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums">~{kalori} kcal</dd>
                  </div>
                ) : null}
                {besin?.protein != null ? (
                  <div className="rounded-lg bg-white/80 px-2.5 py-2">
                    <dt className="text-[10px] uppercase tracking-wide opacity-45">{uiMetin("protein", dil)}</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums">{besin.protein} g</dd>
                  </div>
                ) : null}
                {besin?.yag != null ? (
                  <div className="rounded-lg bg-white/80 px-2.5 py-2">
                    <dt className="text-[10px] uppercase tracking-wide opacity-45">{uiMetin("yag", dil)}</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums">{besin.yag} g</dd>
                  </div>
                ) : null}
                {besin?.karbonhidrat != null ? (
                  <div className="rounded-lg bg-white/80 px-2.5 py-2">
                    <dt className="text-[10px] uppercase tracking-wide opacity-45">
                      {uiMetin("karbonhidrat", dil)}
                    </dt>
                    <dd className="mt-0.5 font-semibold tabular-nums">{besin.karbonhidrat} g</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          ) : null}

          {urun.secenekler?.length ? (
            <div className="mt-4 rounded-xl border border-black/8 bg-black/[0.02] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-50">Seçenekler</p>
              <ul className="mt-2 space-y-1 text-sm opacity-80">
                {urun.secenekler.map((g) => (
                  <li key={g.id}>
                    {g.ad}
                    {g.zorunlu ? " · zorunlu" : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onKapat}
              className="flex-1 rounded-full border px-4 py-3 text-sm font-semibold"
              style={{ borderColor: anaRenk + "44" }}
            >
              {uiMetin("kapat", dil)}
            </button>
            {siparisModu && onSepete && !tukendi ? (
              <button
                type="button"
                onClick={() => {
                  onSepete();
                  onKapat();
                }}
                className="flex-1 rounded-full px-4 py-3 text-sm font-semibold text-white"
                style={{ background: anaRenk }}
              >
                {uiMetin("sepete", dil)}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
