"use client";

import { fiyatlar } from "@sofra/tema";
import { planBul } from "@/lib/abonelik";
import { planOzellikListesi } from "@/lib/plan-kilit";
import type { PlanId } from "@/lib/store";

export function PlanOzellikTablosu({ planId }: { planId: PlanId }) {
  const ozellikler = planOzellikListesi(planId);
  const plan = planBul(planId);

  return (
    <section className="rounded-2xl border border-line bg-card p-5">
      <h2 className="font-semibold">Plan kilidi — {plan?.ad}</h2>
      <p className="mt-1 text-sm text-muted">Açık ve kilitli özelliklerin tam listesi.</p>
      <ul className="mt-4 space-y-2">
        {ozellikler.map((o) => (
          <li
            key={o.id}
            className={`flex items-start gap-3 rounded-xl border px-3 py-2 text-sm ${
              o.acik ? "border-emerald-200 bg-emerald-50/50" : "border-line bg-background/50 opacity-80"
            }`}
          >
            <span className="mt-0.5 shrink-0">{o.acik ? "✓" : "🔒"}</span>
            <div>
              <p className="font-medium">{o.ad}</p>
              <p className="text-xs text-muted">{o.aciklama}</p>
              {!o.acik ? (
                <p className="mt-1 text-xs text-brand-dark">
                  Gerekli: {fiyatlar.planlar.find((p) => p.id === o.minPlan)?.ad ?? o.minPlan}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PlanKilitOzet({ planId }: { planId: PlanId }) {
  const kilitli = planOzellikListesi(planId).filter((o) => o.kilitli);
  if (!kilitli.length) {
    return (
      <p className="rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-sm">
        Tüm özellikler açık — {planBul(planId)?.ad} planı.
      </p>
    );
  }
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
      <p className="font-medium">{kilitli.length} kilitli özellik</p>
      <ul className="mt-2 list-inside list-disc text-muted">
        {kilitli.slice(0, 5).map((o) => (
          <li key={o.id}>{o.ad}</li>
        ))}
      </ul>
      {kilitli.length > 5 ? (
        <p className="mt-1 text-xs text-muted">+{kilitli.length - 5} daha — Abonelik sayfasında tam liste</p>
      ) : null}
    </div>
  );
}
