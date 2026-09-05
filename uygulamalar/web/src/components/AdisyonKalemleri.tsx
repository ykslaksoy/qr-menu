"use client";

import { formatTl } from "@/lib/abonelik";
import {
  adisyonAraToplam,
  adisyonIndirim,
  adisyonKalan,
  adisyonOdenen,
  adisyonToplam,
  kalemTutar,
  type Siparis,
  type SiparisKanal,
} from "@/lib/store";

type Props = {
  adisyon: Siparis;
  disabled?: boolean;
  onAdetDegistir: (urunId: string, adet: number) => void;
  onSil: (urunId: string) => void;
  onIkram?: (urunId: string, ikram: boolean) => void;
  secili?: Record<string, boolean>;
  onSecim?: (urunId: string, secili: boolean) => void;
};

const KANAL_ROZET: Record<SiparisKanal, string> = {
  qr: "QR",
  dokun: "Dokun",
  ses: "Ses",
  serbest: "Serbest",
};

export function AdisyonKalemleri({
  adisyon,
  disabled,
  onAdetDegistir,
  onSil,
  onIkram,
  secili,
  onSecim,
}: Props) {
  const ara = adisyonAraToplam(adisyon);
  const indirim = adisyonIndirim(adisyon);
  const net = adisyonToplam(adisyon);
  const odenen = adisyonOdenen(adisyon);
  const kalan = adisyonKalan(adisyon);

  return (
    <div>
      <ul className="mt-3 space-y-2">
        {adisyon.kalemler.map((k) => (
          <KalemSatiri
            key={k.urunId}
            kalem={k}
            disabled={disabled}
            onAdetDegistir={onAdetDegistir}
            onSil={onSil}
            onIkram={onIkram}
            secili={Boolean(secili?.[k.urunId])}
            onSecim={onSecim}
          />
        ))}
      </ul>
      <div className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
        <p className="flex justify-between">
          <span className="text-muted">Ara toplam</span>
          <span>{formatTl(ara)}</span>
        </p>
        {indirim > 0 ? (
          <p className="flex justify-between text-brand-dark">
            <span>
              İndirim
              {adisyon.indirimYuzde ? ` %${adisyon.indirimYuzde}` : ""}
              {adisyon.indirimTl ? ` ${formatTl(adisyon.indirimTl)}` : ""}
            </span>
            <span>−{formatTl(indirim)}</span>
          </p>
        ) : null}
        {adisyon.bahsis ? (
          <p className="flex justify-between">
            <span className="text-muted">Bahşiş</span>
            <span>{formatTl(adisyon.bahsis)}</span>
          </p>
        ) : null}
        {odenen > 0 ? (
          <p className="flex justify-between">
            <span className="text-muted">Alınan</span>
            <span>{formatTl(odenen)}</span>
          </p>
        ) : null}
        <p className="flex justify-between text-right font-semibold">
          <span>{odenen > 0 ? "Kalan" : "Toplam"}</span>
          <span>{formatTl(kalan > 0 ? kalan : net)}</span>
        </p>
      </div>
    </div>
  );
}

function KalemSatiri({
  kalem,
  disabled,
  onAdetDegistir,
  onSil,
  onIkram,
  secili,
  onSecim,
}: {
  kalem: Siparis["kalemler"][number];
  disabled?: boolean;
  onAdetDegistir: (urunId: string, adet: number) => void;
  onSil: (urunId: string) => void;
  onIkram?: (urunId: string, ikram: boolean) => void;
  secili?: boolean;
  onSecim?: (urunId: string, secili: boolean) => void;
}) {
  const tutar = kalemTutar(kalem);
  const menuDisi = kalem.urunId.startsWith("serbest");
  return (
    <li className="flex items-center gap-2 rounded-xl border border-line bg-background px-2 py-2 text-sm">
      {onSecim ? (
        <input
          type="checkbox"
          checked={secili}
          disabled={disabled}
          onChange={(e) => onSecim(kalem.urunId, e.target.checked)}
          className="h-4 w-4 shrink-0"
          aria-label="Bölmek için seç"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{kalem.ad}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1">
          {kalem.kanal ? (
            <span className="rounded bg-black/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
              {KANAL_ROZET[kalem.kanal] ?? kalem.kanal}
            </span>
          ) : null}
          {kalem.ikram ? (
            <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
              İkram
            </span>
          ) : null}
          {menuDisi ? (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
              Menü dışı
            </span>
          ) : null}
        </div>
        {kalem.not ? <p className="mt-0.5 text-xs text-muted">{kalem.not}</p> : null}
        <p className="text-xs text-muted">{formatTl(kalem.fiyat)} / adet</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAdetDegistir(kalem.urunId, kalem.adet - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-lg leading-none disabled:opacity-40"
          aria-label="Azalt"
        >
          −
        </button>
        <span className="w-6 text-center font-semibold tabular-nums">{kalem.adet}</span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAdetDegistir(kalem.urunId, kalem.adet + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-lg leading-none disabled:opacity-40"
          aria-label="Artır"
        >
          +
        </button>
        {onIkram ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onIkram(kalem.urunId, !kalem.ikram)}
            className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase text-brand hover:bg-brand/10 disabled:opacity-40"
          >
            {kalem.ikram ? "Satış" : "İkram"}
          </button>
        ) : null}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSil(kalem.urunId)}
          className="ml-1 rounded-full px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-40"
        >
          Sil
        </button>
      </div>
      <span className={`w-16 shrink-0 text-right font-medium tabular-nums ${kalem.ikram ? "line-through opacity-50" : ""}`}>
        {formatTl(kalem.ikram ? kalem.fiyat * kalem.adet : tutar)}
      </span>
    </li>
  );
}
