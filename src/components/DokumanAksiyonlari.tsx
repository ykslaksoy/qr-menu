"use client";

type Props = {
  indiriliyor?: boolean;
  yazdiriliyor?: boolean;
  baskiGonderiliyor?: boolean;
  indirDisabled?: boolean;
  onIndir: () => void | Promise<void>;
  onYazdir: () => void | Promise<void>;
  onBaskiGonder: () => void;
  indirEtiket?: string;
};

export function DokumanAksiyonlari({
  indiriliyor,
  yazdiriliyor,
  baskiGonderiliyor,
  indirDisabled,
  onIndir,
  onYazdir,
  onBaskiGonder,
  indirEtiket = "PDF indir",
}: Props) {
  const busy = indiriliyor || yazdiriliyor || baskiGonderiliyor;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button
        type="button"
        disabled={busy || indirDisabled}
        onClick={() => onIndir()}
        className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {indiriliyor ? "Hazırlanıyor…" : indirEtiket}
      </button>
      <button
        type="button"
        disabled={busy || indirDisabled}
        onClick={() => onYazdir()}
        className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:border-brand/40 disabled:opacity-50"
      >
        {yazdiriliyor ? "Hazırlanıyor…" : "Yazdır"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onBaskiGonder}
        className="rounded-full border border-brand/30 bg-brand/5 px-5 py-2.5 text-sm font-semibold text-brand-dark hover:border-brand/50 disabled:opacity-50"
      >
        {baskiGonderiliyor ? "Gönderiliyor…" : "Baskıya gönder"}
      </button>
    </div>
  );
}
