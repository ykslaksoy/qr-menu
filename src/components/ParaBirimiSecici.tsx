"use client";

import {
  aktifParaBirimleri,
  PARA_BIRIMI_ETIKET,
  type MenuParaBirimi,
  type ParaBirimiAyarlari,
} from "@/lib/para-birimi";

type Props = {
  birim: MenuParaBirimi;
  onDegistir: (b: MenuParaBirimi) => void;
  ayar: ParaBirimiAyarlari;
  anaRenk: string;
  varyant?: "varsayilan" | "kapak";
  ton?: "normal" | "hafif";
};

export function ParaBirimiSecici({
  birim,
  onDegistir,
  ayar,
  anaRenk,
  varyant = "varsayilan",
  ton = "normal",
}: Props) {
  const liste = aktifParaBirimleri(ayar);
  if (liste.length <= 1) return null;

  const kapak = varyant === "kapak";
  const hafif = ton === "hafif";
  const sembol = birim === "TRY" ? "₺" : birim === "USD" ? "$" : "€";

  return (
    <label className="relative inline-flex cursor-pointer items-center" aria-label="Para birimi seç">
      <span
        className={`pointer-events-none inline-flex items-center uppercase tracking-wide ${
          hafif
            ? `rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${
                kapak ? "border-white/30 text-white/95" : "border-black/10 text-foreground/55"
              }`
            : "rounded-full px-2.5 py-1 text-[11px] font-semibold"
        }`}
        style={
          hafif
            ? undefined
            : kapak
              ? {
                  background: "rgba(0,0,0,0.38)",
                  color: "#fff",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                }
              : { background: anaRenk, color: "#fff" }
        }
        aria-hidden
      >
        {hafif ? sembol : (PARA_BIRIMI_ETIKET[birim] ?? birim)}
        {hafif ? <span className="opacity-70">▾</span> : null}
      </span>
      <select
        className="absolute inset-0 cursor-pointer opacity-0"
        value={birim}
        onChange={(e) => onDegistir(e.target.value as MenuParaBirimi)}
      >
        {liste.map((b) => (
          <option key={b} value={b}>
            {PARA_BIRIMI_ETIKET[b]}
          </option>
        ))}
      </select>
    </label>
  );
}
