"use client";

import Link from "next/link";
import { ModGecisButonu } from "@/components/ModGecisButonu";
import { PlanKilitOzet } from "@/components/PlanOzellikTablosu";
import { useIsletme } from "@/lib/useIsletme";
import { urunKritikMi, urunTukendiMi } from "@/lib/store";
import { formatTl, planBul } from "@/lib/abonelik";
import { efektifPlanId, ozellikAcikMiIsletme } from "@/lib/plan-kilit";

export default function PanelOzetPage() {
  const { isletme } = useIsletme();
  if (!isletme) return null;

  const aktifSiparis = isletme.siparisler.filter(
    (s) => !["iptal", "odendi"].includes(s.durum),
  ).length;
  const kritik = isletme.urunler.filter(urunKritikMi).length;
  const tukenen = isletme.urunler.filter(urunTukendiMi).length;
  const planId = efektifPlanId(isletme);
  const plan = planBul(planId);
  const odemePlan = planBul(isletme.abonelik.planId);
  const siparisAcik = ozellikAcikMiIsletme(isletme, "siparis");
  const garsonAcik = ozellikAcikMiIsletme(isletme, "garsonMutfak");
  const analitikAcik = ozellikAcikMiIsletme(isletme, "analitik");

  return (
    <div>
      <h1 className="font-[family-name:var(--font-baslik)] text-3xl font-semibold">
        {isletme.kafeAdi}
      </h1>
      <p className="mt-1 text-muted">
        /m/{isletme.slug} · Plan: {odemePlan?.ad}
        {planId !== isletme.abonelik.planId ? ` · Etkin: ${plan?.ad}` : ""}
        {isletme.abonelik.odemeTipi === "yillik" ? " (yıllık)" : ""}
      </p>

      <div className="mt-6">
        <PlanKilitOzet planId={planId} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Kart baslik="Ürün" deger={String(isletme.urunler.length)} href="/panel/menu" />
        <Kart baslik="Veri girişi" deger="PDF & hazır" href="/panel/veri-girisi" />
        <Kart baslik="Dökümanlar" deger="İndir & baskı" href="/panel/dokumanlar" />
        <Kart baslik="Masa" deger={String(isletme.masalar.length)} href="/panel/masalar" />
        <Kart baslik="Aktif sipariş" deger={String(aktifSiparis)} href="/panel/abonelik" />
        <Kart
          baslik="Raporlar"
          deger={analitikAcik ? "Ciro & ürün" : "🔒"}
          href={analitikAcik ? "/panel/rapor" : "/panel/abonelik"}
        />
        <Kart
          baslik="Stok uyarı"
          deger={`${kritik} kritik · ${tukenen} tükendi`}
          href="/panel/stok"
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/panel/veri-girisi"
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
        >
          Veri girişi
        </Link>
        <Link
          href={siparisAcik ? `/m/${isletme.slug}?siparis=1` : "/panel/abonelik"}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            siparisAcik ? "border border-line bg-card" : "border border-line bg-card opacity-70"
          }`}
        >
          {siparisAcik ? "Müşteri menüsü (sipariş)" : "🔒 Sipariş — plan yükselt"}
        </Link>
        {garsonAcik ? (
          <>
            <ModGecisButonu hedef="garson" etiket="Garson moduna geç →" />
            <ModGecisButonu hedef="mutfak" etiket="Mutfak moduna geç →" />
          </>
        ) : null}
        <Link href="/panel/abonelik" className="rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold">
          Abonelik — {odemePlan?.aylik ? formatTl(odemePlan.aylik) + "/ay" : "Ücretsiz"}
        </Link>
      </div>

      {analitikAcik ? (
        <div className="mt-8 rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Analitik (Tam Paket)</h2>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted">Toplam sipariş</dt>
              <dd className="text-lg font-semibold">{isletme.siparisler.length}</dd>
            </div>
            <div>
              <dt className="text-muted">Ödenen</dt>
              <dd className="text-lg font-semibold">
                {isletme.siparisler.filter((s) => s.durum === "odendi").length}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Ortalama sepet</dt>
              <dd className="text-lg font-semibold">
                {isletme.siparisler.length
                  ? formatTl(
                      Math.round(
                        isletme.siparisler.reduce(
                          (a, s) => a + s.kalemler.reduce((b, k) => b + k.fiyat * k.adet, 0),
                          0,
                        ) / isletme.siparisler.length,
                      ),
                    )
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </div>
  );
}

function Kart({ baslik, deger, href }: { baslik: string; deger: string; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-line bg-card p-4 hover:border-brand/40">
      <p className="text-xs uppercase tracking-wide text-muted">{baslik}</p>
      <p className="mt-2 text-xl font-semibold">{deger}</p>
    </Link>
  );
}
