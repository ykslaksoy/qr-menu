"use client";

import { useMemo, useState } from "react";
import { fiyatlar, referans } from "@sofra/tema";
import { useIsletme } from "@/lib/useIsletme";
import {
  abonelikOdenecek,
  formatTl,
  planBul,
} from "@/lib/abonelik";
import { PlanOzellikTablosu } from "@/components/PlanOzellikTablosu";
import { efektifPlanId } from "@/lib/plan-kilit";
import { planMaxSube } from "@/lib/ucretlendirme";
import type { OdemeTipi, PlanId } from "@/lib/store";

export default function PanelAbonelikPage() {
  const { isletme, kaydet, oturumlu } = useIsletme();
  const [planId, setPlanId] = useState<PlanId>("menu-adisyon");
  const [odemeTipi, setOdemeTipi] = useState<OdemeTipi>("yillik");
  const [saglayici, setSaglayici] = useState<"iyzico" | "paytr">("iyzico");
  const [mesaj, setMesaj] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  const hesap = useMemo(() => {
    if (!isletme) return null;
    return abonelikOdenecek(isletme.abonelik, planId, odemeTipi);
  }, [isletme, planId, odemeTipi]);

  if (!isletme || !hesap) return null;

  const aktifPlan = planBul(isletme.abonelik.planId);
  const etkinPlanId = efektifPlanId(isletme);
  const qrReferans =
    isletme.abonelik.referansSlug &&
    isletme.abonelik.referansKaynak === referans.referansQr.kaynakDegeri;

  async function odemeSimule() {
    setYukleniyor(true);
    setMesaj("");

    if (oturumlu) {
      const yanit = await fetch("/api/panel/odeme", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, odemeTipi, saglayici }),
      });
      const veri = await yanit.json();
      setYukleniyor(false);

      if (!yanit.ok) {
        setMesaj(veri.hata ?? "Ödeme başarısız");
        return;
      }

      if (veri.isletme) {
        await kaydet(veri.isletme);
      }

      const mod = veri.odeme?.mod === "canli" ? "canlı" : "simülasyon";
      setMesaj(
        planId === "ucretsiz"
          ? "Ücretsiz plana geçildi."
          : `${saglayici === "iyzico" ? "Iyzico" : "PayTR"} (${mod}): ${formatTl(hesap!.odenecek)} tahsil edildi.`,
      );
      return;
    }

    setYukleniyor(false);
    if (planId === "ucretsiz") {
      kaydet({
        ...isletme!,
        abonelik: {
          ...isletme!.abonelik,
          planId: "ucretsiz",
          odemeTipi: "aylik",
          odemeSaglayici: null,
          aktif: true,
          baslangic: Date.now(),
        },
      });
      setMesaj("Ücretsiz plana geçildi.");
      return;
    }

    const kalanIndirimAy =
      odemeTipi === "yillik" && qrReferans
        ? Math.max(isletme!.abonelik.kalanIndirimAy, referans.referansBasinaAy)
        : isletme!.abonelik.kalanIndirimAy;

    kaydet({
      ...isletme!,
      abonelik: {
        ...isletme!.abonelik,
        planId,
        odemeTipi,
        odemeSaglayici: saglayici,
        kalanIndirimAy,
        aktif: true,
        baslangic: Date.now(),
      },
    });

    setMesaj(
      `${saglayici === "iyzico" ? "Iyzico" : "PayTR"} ödeme simülasyonu başarılı. ${formatTl(hesap!.odenecek)} tahsil edildi (yerel).`,
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-baslik)] text-3xl font-semibold">Abonelik</h1>
        <p className="mt-1 text-muted">
          Aktif: {aktifPlan?.ad}
          {etkinPlanId !== isletme.abonelik.planId
            ? ` · Bu ay etkin: ${planBul(etkinPlanId)?.ad}`
            : ""}
          {isletme.abonelik.odemeSaglayici
            ? ` · ${isletme.abonelik.odemeSaglayici}`
            : ""}
          {isletme.abonelik.kalanIndirimAy > 0
            ? ` · Referans indirimi ${isletme.abonelik.kalanIndirimAy} ay`
            : ""}
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-card p-4 text-sm">
        <p className="font-medium">Şube sınırı</p>
        <p className="mt-1 text-muted">
          Seçili plan: en fazla{" "}
          <span className="font-semibold text-foreground">{planMaxSube(planId)}</span> şube · Aktif plan:{" "}
          <span className="font-semibold text-foreground">{planMaxSube(etkinPlanId)}</span> şube.
          Deneme / menü paketleri tek şube; çok şube için Tam paket gerekir. Ayrıntı:{" "}
          <code className="text-xs">belgeler/UCRETLENDIRME.md</code>
        </p>
      </div>

      {qrReferans ? (
        <div className="rounded-2xl border border-brand/30 bg-brand/5 p-4 text-sm">
          Menü QR referansı: <code className="font-mono">{isletme.abonelik.referansSlug}</code>
          <br />
          Yıllık planda ilk {referans.referansBasinaAy} ay %{Math.round(referans.indirimOrani * 100)}{" "}
          indirim uygulanır.
        </div>
      ) : (
        <p className="text-sm text-muted">
          Referans indirimi için kayıt, başka bir işletmenin menü QR’si üzerinden yapılmış olmalı.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {fiyatlar.planlar.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPlanId(p.id as PlanId)}
            className={`rounded-2xl border p-4 text-left ${
              planId === p.id ? "border-brand ring-1 ring-brand/30" : "border-line bg-card"
            }`}
          >
            <p className="font-semibold">{p.ad}</p>
            <p className="mt-2 text-2xl font-semibold">
              {p.aylik === 0 ? "₺0" : formatTl(p.aylik)}
              {p.aylik > 0 ? <span className="text-sm font-normal text-muted">/ay</span> : null}
            </p>
          </button>
        ))}
      </div>

      {planId !== "ucretsiz" ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setOdemeTipi("aylik")}
            className={`rounded-full px-4 py-2 text-sm ${odemeTipi === "aylik" ? "bg-brand text-white" : "border border-line"}`}
          >
            Aylık
          </button>
          <button
            type="button"
            onClick={() => setOdemeTipi("yillik")}
            className={`rounded-full px-4 py-2 text-sm ${odemeTipi === "yillik" ? "bg-brand text-white" : "border border-line"}`}
          >
            Yıllık (~%{Math.round((fiyatlar.yillikIndirimOrani ?? 0.17) * 100)} indirimli paket)
          </button>
        </div>
      ) : null}

      <div className="rounded-2xl border border-line bg-card p-5">
        <p className="text-sm text-muted">Liste</p>
        <p className="text-xl font-semibold">{formatTl(hesap.liste)}</p>
        {hesap.indirimOrani > 0 ? (
          <p className="mt-2 text-sm text-brand-dark">
            Referans %{Math.round(hesap.indirimOrani * 100)} ({hesap.indirimAy} ay) uygulandı
          </p>
        ) : null}
        <p className="mt-3 text-sm text-muted">Ödenecek</p>
        <p className="font-[family-name:var(--font-baslik)] text-3xl font-semibold">
          {formatTl(hesap.odenecek)}
        </p>

        {planId !== "ucretsiz" ? (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setSaglayici("iyzico")}
              className={`rounded-full px-4 py-2 text-sm ${saglayici === "iyzico" ? "bg-brand text-white" : "border border-line"}`}
            >
              Iyzico
            </button>
            <button
              type="button"
              onClick={() => setSaglayici("paytr")}
              className={`rounded-full px-4 py-2 text-sm ${saglayici === "paytr" ? "bg-brand text-white" : "border border-line"}`}
            >
              PayTR
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={odemeSimule}
          disabled={yukleniyor}
          className="mt-6 w-full rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {yukleniyor
            ? "İşleniyor…"
            : planId === "ucretsiz"
              ? "Ücretsiz plana geç"
              : `${saglayici === "iyzico" ? "Iyzico" : "PayTR"} ile öde`}
        </button>
        {mesaj ? <p className="mt-3 text-sm text-brand-dark">{mesaj}</p> : null}
        <p className="mt-2 text-xs text-muted">
          Canlı API anahtarları bağlanınca aynı ekran gerçek ödemeye geçer. MVP’de yerel simülasyon.
        </p>
      </div>

      <PlanOzellikTablosu planId={etkinPlanId} />
    </div>
  );
}
