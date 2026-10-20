"use client";

import { DilSecici } from "@/components/DilSecici";
import { ParaBirimiSecici } from "@/components/ParaBirimiSecici";
import type { MenuParaBirimi, ParaBirimiAyarlari } from "@/lib/para-birimi";
import type { MenuDil } from "@/lib/menu-dil";

type Props = {
  dil: MenuDil;
  onDil: (d: MenuDil) => void;
  paraBirimi: MenuParaBirimi;
  onPara: (b: MenuParaBirimi) => void;
  paraAyar: ParaBirimiAyarlari;
  anaRenk: string;
  varyant?: "kapak" | "normal";
};

/** Dil ve para birimi — tek satır, göze batmayan. */
export function MenuTercihCubugu({
  dil,
  onDil,
  paraBirimi,
  onPara,
  paraAyar,
  anaRenk,
  varyant = "normal",
}: Props) {
  const kapak = varyant === "kapak";
  return (
    <div
      className={`inline-flex max-w-[min(100%,14rem)] flex-wrap items-center justify-end gap-1 ${
        kapak ? "rounded-full bg-black/25 px-1 py-0.5 backdrop-blur-sm" : ""
      }`}
    >
      <ParaBirimiSecici
        birim={paraBirimi}
        onDegistir={onPara}
        ayar={paraAyar}
        anaRenk={anaRenk}
        varyant={kapak ? "kapak" : "varsayilan"}
        ton="hafif"
      />
      <DilSecici
        dil={dil}
        onDegistir={onDil}
        anaRenk={anaRenk}
        varyant={kapak ? "kapak" : "varsayilan"}
        ton="hafif"
      />
    </div>
  );
}
