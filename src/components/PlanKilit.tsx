"use client";

import Link from "next/link";
import { planBul } from "@/lib/abonelik";
import { ozellikMinPlan, type OzellikId } from "@/lib/plan-kilit";
import type { PlanId } from "@/lib/store";

type Props = {
  ozellik: OzellikId;
  mevcutPlan: PlanId;
  baslik?: string;
  /** Tam sayfa kilidi */
  tamSayfa?: boolean;
  /** Garson/mutfak ekranında panel linki gösterme */
  personelMod?: boolean;
  children?: React.ReactNode;
};

export function PlanKilit({ ozellik, mevcutPlan, baslik, tamSayfa, personelMod, children }: Props) {
  const gereken = ozellikMinPlan(ozellik);
  const plan = planBul(gereken);

  if (tamSayfa) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="text-2xl">🔒</p>
        <h2 className="mt-3 font-[family-name:var(--font-baslik)] text-xl font-semibold">
          {baslik ?? "Bu özellik kilitli"}
        </h2>
        <p className="mt-2 text-sm text-muted">
          Mevcut planınız: <strong>{planBul(mevcutPlan)?.ad}</strong>
          <br />
          Gerekli plan: <strong>{plan?.ad}</strong>
        </p>
        <Link
          href={personelMod ? "/mod" : "/panel/abonelik"}
          className="mt-6 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
        >
          {personelMod ? "Şube yönetici moduna geç" : "Planı yükselt"}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40 blur-[1px]">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/60 p-4">
        <div className="max-w-xs rounded-xl border border-line bg-card p-4 text-center shadow-sm">
          <p className="text-lg">🔒</p>
          <p className="mt-1 text-sm font-semibold">{baslik ?? "Plan gerekli"}</p>
          <p className="mt-1 text-xs text-muted">{plan?.ad} planı ve üzeri</p>
          <Link
            href={personelMod ? "/mod" : "/panel/abonelik"}
            className="mt-3 inline-block text-sm font-semibold text-brand underline"
          >
            {personelMod ? "Şube yönetici modu" : "Yükselt"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PlanUyariBanner({
  mevcutPlan,
  mesaj,
}: {
  mevcutPlan: PlanId;
  mesaj: string;
}) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
      <span className="font-medium">{planBul(mevcutPlan)?.ad} planı:</span> {mesaj}{" "}
      <Link href="/panel/abonelik" className="font-semibold text-brand underline">
        Yükselt
      </Link>
    </div>
  );
}
