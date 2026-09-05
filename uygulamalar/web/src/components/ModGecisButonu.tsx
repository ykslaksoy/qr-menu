"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MOD_ANA_YOL, MOD_ETIKET, type SofraMod } from "@/lib/mod";

type Props = {
  hedef: SofraMod;
  etiket: string;
  className?: string;
};

/** Yönetici panelinden garson/mutfak moduna geçiş — doğrudan URL yerine mod cookie değiştirir. */
export function ModGecisButonu({ hedef, etiket, className }: Props) {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState(false);

  async function gec() {
    setYukleniyor(true);
    const yanit = await fetch("/api/auth", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mod", mod: hedef }),
    });
    const veri = await yanit.json();
    setYukleniyor(false);
    if (yanit.ok) {
      router.push(veri.yonlendir ?? MOD_ANA_YOL[hedef]);
    }
  }

  return (
    <button
      type="button"
      disabled={yukleniyor}
      onClick={gec}
      className={
        className ??
        "rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold hover:border-brand/40 disabled:opacity-50"
      }
    >
      {yukleniyor ? "…" : etiket}
    </button>
  );
}

export function ModEtiketBadge({ mod }: { mod: SofraMod }) {
  return (
    <span className="rounded-full bg-line/50 px-2 py-0.5 text-xs text-muted">{MOD_ETIKET[mod]}</span>
  );
}
