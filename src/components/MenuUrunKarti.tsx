"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { AlerjenRozetleri } from "@/components/AlerjenRozetleri";
import { gorselEkranUrl } from "@/lib/gorsel-raster";
import type { MenuDuzen } from "@/lib/menu-duzen";

export type MenuUrun = {
  id: string;
  ad: string;
  fiyat: string;
  aciklama?: string;
  gorselUrl?: string | null;
  tukendi?: boolean;
  sepetAdet?: number;
  alerjenler?: string[] | null;
  kalori?: number | null;
  secenekli?: boolean;
};

type TemaVarsayilan = {
  anaRenk: string;
  vurguRengi: string;
  kose: number;
  zeminStili: string;
};

type Props = {
  urun: MenuUrun;
  tema: TemaVarsayilan;
  siparisModu?: boolean;
  onSec?: (id: string) => void;
  onAzalt?: (id: string) => void;
  onDetay?: (id: string) => void;
  dil?: import("@/lib/menu-dil").MenuDil;
  sira?: number;
  canli?: boolean;
  onGorunurluk?: (id: string, gorunur: boolean) => void;
  duzen?: MenuDuzen;
  /** editorial ilk kart — 2 sütun kapla */
  genis?: boolean;
};

function fotoBoyut(duzen: MenuDuzen): { w: number | string; h: number } {
  if (duzen === "photo-hero") return { w: "100%", h: 210 };
  if (duzen === "photo-grid") return { w: "100%", h: 148 };
  if (duzen === "compact-list") return { w: 72, h: 72 };
  if (duzen === "price-list") return { w: 44, h: 44 };
  return { w: 118, h: 118 };
}

/** MONU tarzı: görsel-öncelikli; şablon düzeni (liste / ızgara / dergi) */
export function MenuUrunKarti({
  urun,
  tema,
  siparisModu,
  onSec,
  onAzalt,
  onDetay,
  dil = "tr",
  sira = 0,
  canli = false,
  onGorunurluk,
  duzen = "list",
  genis = false,
}: Props) {
  const tukendi = urun.tukendi === true;
  const ekranGorsel = gorselEkranUrl(urun.gorselUrl);
  const adet = urun.sepetAdet ?? 0;
  const koyu = tema.zeminStili === "solid-dark";
  const kose = Math.min(tema.kose, 18);
  const kartBg = koyu ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.92)";
  const stagger = Math.min(sira, 10) * 55;
  const liRef = useRef<HTMLLIElement>(null);
  const dikey = duzen === "photo-grid" || duzen === "photo-hero";
  const fiyatListe = duzen === "price-list";
  const kompakt = duzen === "compact-list";
  const foto = fotoBoyut(duzen);

  useEffect(() => {
    if (!onGorunurluk || !liRef.current) return;
    const el = liRef.current;
    const obs = new IntersectionObserver(
      ([entry]) => {
        onGorunurluk(urun.id, entry?.isIntersecting ?? false);
      },
      { root: null, threshold: 0.45, rootMargin: "-8% 0px -8% 0px" },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      onGorunurluk(urun.id, false);
    };
  }, [urun.id, onGorunurluk]);

  function detayAc(e: MouseEvent) {
    if (!onDetay) return;
    e.stopPropagation();
    e.preventDefault();
    onDetay(urun.id);
  }

  const gorselEl = (
    <button
      type="button"
      onClick={onDetay ? detayAc : undefined}
      disabled={!onDetay}
      className={`menu-foto-wrap relative shrink-0 ${canli ? "menu-foto-wrap--canli" : ""} ${
        onDetay ? "cursor-pointer" : ""
      }`}
      style={{
        width: foto.w,
        height: foto.h,
        borderRadius: dikey ? Math.max(kose - 2, 8) : kose,
        background: tema.anaRenk + "14",
      }}
      aria-label={onDetay ? `${urun.ad} detayı` : undefined}
    >
      {ekranGorsel ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={canli ? `canli-${urun.id}` : `statik-${urun.id}`}
          src={ekranGorsel}
          alt=""
          className="menu-foto"
          width={typeof foto.w === "number" ? foto.w : 400}
          height={foto.h}
          loading={sira < 4 ? "eager" : "lazy"}
          decoding="async"
          style={{ animationDelay: canli ? undefined : `${stagger}ms` }}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-2xl opacity-30" aria-hidden>
          ✦
        </span>
      )}
      {tukendi ? (
        <span className="absolute inset-x-0 bottom-0 z-[2] bg-black/55 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-white">
          Tükendi
        </span>
      ) : null}
    </button>
  );

  const adetKontrol =
    siparisModu && onSec && !tukendi ? (
      adet > 0 ? (
        <div
          className={`flex shrink-0 items-center gap-1 ${
            dikey ? "flex-row" : "flex-col justify-center self-center"
          }`}
        >
          <button
            type="button"
            aria-label="Artır"
            onClick={() => onSec(urun.id)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-white shadow-sm"
            style={{ background: tema.anaRenk }}
          >
            +
          </button>
          <span className="min-w-[1.25rem] text-center text-sm font-semibold tabular-nums">{adet}</span>
          {onAzalt ? (
            <button
              type="button"
              aria-label="Azalt"
              onClick={() => onAzalt(urun.id)}
              className="flex h-9 w-9 items-center justify-center rounded-full border text-lg font-bold"
              style={{ borderColor: tema.anaRenk, color: tema.anaRenk }}
            >
              −
            </button>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          aria-label="Ekle"
          onClick={() => onSec(urun.id)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white shadow-sm"
          style={{ background: tema.anaRenk }}
        >
          +
        </button>
      )
    ) : null;

  const metinEl = (
    <div
      className={`flex min-w-0 flex-1 flex-col ${
        dikey ? "justify-start py-2" : fiyatListe ? "justify-center py-0" : "min-h-[118px] justify-center py-0.5"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onDetay ? detayAc : undefined}
          disabled={!onDetay}
          className={`min-w-0 flex-1 text-left font-semibold leading-snug ${
            dikey ? "font-serif text-[15px]" : kompakt || fiyatListe ? "text-[14px]" : "text-[15px]"
          } ${onDetay ? "hover:opacity-80" : ""}`}
        >
          {urun.ad}
        </button>
        <span
          className="shrink-0 pt-0.5 text-[15px] font-semibold tabular-nums"
          style={{ color: tukendi ? undefined : tema.vurguRengi }}
        >
          {urun.fiyat}
        </span>
      </div>
      {!fiyatListe && urun.aciklama ? (
        <p className={`mt-1 leading-snug opacity-60 ${dikey ? "line-clamp-2 text-[12px]" : "line-clamp-2 text-[13px]"}`}>
          {urun.aciklama}
        </p>
      ) : null}
      {urun.secenekli ? (
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide opacity-45">
          {dil === "en" ? "Customizable" : dil === "tr" ? "Seçenekli" : "★"}
        </p>
      ) : null}
      {!fiyatListe ? (
        <AlerjenRozetleri
          alerjenler={urun.alerjenler}
          kalori={urun.kalori}
          anaRenk={tema.anaRenk}
          dil={dil}
        />
      ) : null}
    </div>
  );

  const ortakStil = {
    borderRadius: Math.max(tema.kose, dikey ? 14 : 16),
    background: kartBg,
    boxShadow: koyu ? "none" : "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
    ["--menu-canli-renk" as string]: tema.anaRenk,
  };

  return (
    <li
      ref={liRef}
      data-urun-id={urun.id}
      className={`menu-kart-anim ${dikey ? "p-1.5" : fiyatListe ? "px-2.5 py-1.5" : "p-2.5"} ${
        canli ? "menu-kart-anim--canli" : ""
      } ${tukendi ? "pointer-events-none opacity-45 grayscale-[0.3]" : ""} ${
        genis ? "col-span-2" : ""
      }`}
      style={{ ...ortakStil, animationDelay: `${stagger}ms` }}
      aria-disabled={tukendi || undefined}
    >
      {dikey ? (
        <div className="flex flex-col">
          {gorselEl}
          <div className="flex items-start gap-2 px-1">
            {metinEl}
            {adetKontrol ? <div className="pt-2">{adetKontrol}</div> : null}
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          {gorselEl}
          {metinEl}
          {adetKontrol}
        </div>
      )}
    </li>
  );
}
