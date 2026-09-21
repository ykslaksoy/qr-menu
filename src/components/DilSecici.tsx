"use client";

import { MENU_DILLER, uiMetin, type MenuDil } from "@/lib/menu-dil";

type Props = {
  dil: MenuDil;
  onDegistir: (dil: MenuDil) => void;
  anaRenk: string;
  /** kapak: foto hero üstünde yarı saydam */
  varyant?: "varsayilan" | "kapak";
};

/**
 * Native <select> — iOS/Android sistem picker.
 * Overlay / fixed / portal taşması yok.
 */
export function DilSecici({ dil, onDegistir, anaRenk, varyant = "varsayilan" }: Props) {
  const aktif = MENU_DILLER.find((d) => d.id === dil) ?? MENU_DILLER[0]!;
  const kapak = varyant === "kapak";

  return (
    <label
      className="relative inline-flex cursor-pointer items-center"
      aria-label={uiMetin("dilSec", dil)}
    >
      <span
        className="pointer-events-none inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
        style={
          kapak
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
        <span>{aktif.bayrak}</span>
        {aktif.etiket}
        <span className="opacity-80">▾</span>
      </span>
      <select
        value={dil}
        onChange={(e) => onDegistir(e.target.value as MenuDil)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label={uiMetin("dilSec", dil)}
      >
        {MENU_DILLER.map((d) => (
          <option key={d.id} value={d.id}>
            {d.bayrak} {d.ad}
          </option>
        ))}
      </select>
    </label>
  );
}
