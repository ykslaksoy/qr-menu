"use client";

import Link from "next/link";
import { PlanKilit } from "@/components/PlanKilit";
import { VeriGirisPdfForm } from "@/components/VeriGirisPdfForm";
import { useIsletme } from "@/lib/useIsletme";
import { efektifPlanId, ozellikAcikMiIsletme } from "@/lib/plan-kilit";

export default function PanelVeriGirisiPdfPage() {
  const { isletme } = useIsletme();
  if (!isletme) return null;

  const planId = efektifPlanId(isletme);
  if (!ozellikAcikMiIsletme(isletme, "pdfIceAktar")) {
    return (
      <PlanKilit
        ozellik="pdfIceAktar"
        mevcutPlan={planId}
        baslik="PDF menü içe aktarma kilitli"
        tamSayfa
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm text-muted">
          <Link href="/panel/veri-girisi" className="text-brand underline">
            ← Veri girişi
          </Link>
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-baslik)] text-3xl font-semibold">
          PDF / metin menü içe aktar
        </h1>
        <p className="mt-1 text-muted">
          PDF yükleyin veya metni yapıştırın. Satır sonunda fiyat olan ürünler otomatik çıkarılır
          (ör. <code className="font-mono text-xs">Filtre Kahve 90 TL</code>).
        </p>
      </div>

      <VeriGirisPdfForm />
    </div>
  );
}
