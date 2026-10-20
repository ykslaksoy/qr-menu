"use client";

import type { Isletme } from "@/lib/store";
import { TEMA_PALETLERI, paletUygula } from "@/lib/tema-paletleri";

type Props = {
  isletme: Isletme;
  tamTasarim: boolean;
  onKaydet: (sonraki: Isletme) => void;
};

export function PanelTemaPaletleri({ isletme, tamTasarim, onKaydet }: Props) {
  const tema = isletme.tema;
  const seciliId = tema.paletId ?? "varsayilan";
  const secenekler = TEMA_PALETLERI.filter((p) => p.id !== "varsayilan");

  function sec(paletId: string) {
    onKaydet({ ...isletme, tema: paletUygula(tema, paletId) });
  }

  return (
    <section className="rounded-2xl border border-line bg-card p-5">
      <h2 className="font-semibold">Menü rengi</h2>
      <p className="mt-1 text-sm text-muted">Bir kere dokunun — şablonunuz aynı kalır, sadece renkler değişir.</p>
      {seciliId === "varsayilan" || !tema.paletId ? (
        <p className="mt-2 text-xs text-muted">Şu an: şablonun kendi renkleri</p>
      ) : null}
      <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory">
        <button
          type="button"
          onClick={() => sec("varsayilan")}
          className={`snap-start shrink-0 rounded-xl border p-2 text-center transition ${
            seciliId === "varsayilan" ? "border-brand ring-2 ring-brand/25" : "border-line"
          }`}
          title="Şablon rengi"
        >
          <div
            className="h-14 w-[4.5rem] rounded-lg border border-black/10"
            style={{
              background: `linear-gradient(135deg, ${tema.zeminRengi} 50%, ${tema.anaRenk} 50%)`,
            }}
          />
          <p className="mt-1.5 max-w-[4.5rem] text-[10px] leading-tight text-muted">Şablon</p>
        </button>
        {secenekler.map((p) => {
          const zemin = p.patch.zeminRengi ?? "#f5f5f4";
          const ana = p.patch.anaRenk ?? "#333";
          const secili = seciliId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              disabled={!tamTasarim}
              onClick={() => sec(p.id)}
              className={`snap-start shrink-0 rounded-xl border p-2 text-center transition disabled:opacity-45 ${
                secili ? "border-brand ring-2 ring-brand/25" : "border-line hover:border-brand/35"
              }`}
              title={p.kisaAciklama ?? p.ad}
            >
              <div
                className="h-14 w-[4.5rem] rounded-lg border border-black/10"
                style={{
                  background: `linear-gradient(160deg, ${zemin} 55%, ${ana} 55%)`,
                }}
              />
              <p className="mt-1.5 max-w-[4.5rem] text-[10px] font-medium leading-tight">{p.ad}</p>
            </button>
          );
        })}
      </div>
      {!tamTasarim ? (
        <p className="mt-2 text-xs text-muted">Ek renkler Menü planında açılır.</p>
      ) : null}
    </section>
  );
}
