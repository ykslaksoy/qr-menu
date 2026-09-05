"use client";

import Link from "next/link";
import { PlanKilit } from "@/components/PlanKilit";
import { useIsletme } from "@/lib/useIsletme";
import { efektifPlanId, ozellikAcikMiIsletme } from "@/lib/plan-kilit";

const yollar = [
  {
    href: "/panel/veri-girisi/pdf",
    baslik: "PDF / metin menü içe aktar",
    aciklama:
      "Elinizdeki menü PDF’ini veya metin listesini yükleyin; ürünler otomatik menüye eklenir.",
    ozellik: "pdfIceAktar" as const,
  },
  {
    href: "/panel/menu/hazir",
    baslik: "Hazır menü oluştur",
    aciklama: "İşletme tipine göre katalogdan hazır menü seçin ve tek tıkla uygulayın.",
  },
  {
    href: "/panel/menu",
    baslik: "Menü düzenle",
    aciklama: "Katalogdan ürün ekleyin, fiyat ve görselleri elle güncelleyin.",
  },
];

export default function PanelVeriGirisiPage() {
  const { isletme } = useIsletme();
  if (!isletme) return null;

  const planId = efektifPlanId(isletme);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-baslik)] text-3xl font-semibold">
          Veri girişi
        </h1>
        <p className="mt-1 text-muted">
          Menü verisini sisteme buradan girin: PDF/metin içe aktarma, hazır menü veya elle düzenleme.
          Basılı PDF indirme ve baskı işlemleri{" "}
          <Link href="/panel/dokumanlar" className="text-brand underline">
            Dökümanlar
          </Link>{" "}
          bölümündedir.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {yollar.map((yol) => {
          const kilitli =
            yol.ozellik && !ozellikAcikMiIsletme(isletme, yol.ozellik);
          return (
            <Link
              key={yol.href}
              href={yol.href}
              className={`rounded-2xl border border-line bg-card p-5 hover:border-brand/40 ${
                kilitli ? "opacity-75" : ""
              }`}
            >
              <h2 className="font-semibold">
                {kilitli ? "🔒 " : ""}
                {yol.baslik}
              </h2>
              <p className="mt-2 text-sm text-muted">{yol.aciklama}</p>
            </Link>
          );
        })}
      </div>

      {isletme.baskiTalepleri && isletme.baskiTalepleri.length > 0 ? (
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Son baskı talepleri</h2>
          <p className="mt-1 text-sm text-muted">
            Baskı taleplerinizi{" "}
            <Link href="/panel/dokumanlar" className="text-brand underline">
              Dökümanlar
            </Link>{" "}
            bölümünden oluşturabilirsiniz.
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {isletme.baskiTalepleri.slice(0, 5).map((t) => (
              <li key={t.id} className="flex justify-between gap-4 border-b border-line/60 pb-2">
                <span>
                  {t.tur === "menu"
                    ? "Menü A4"
                    : t.tur === "adisyon"
                      ? "Adisyon A5"
                      : "Masa kartı"}{" "}
                  · {t.adet} adet
                </span>
                <span className="text-muted">{t.durum}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!ozellikAcikMiIsletme(isletme, "pdfIceAktar") ? (
        <PlanKilit
          ozellik="pdfIceAktar"
          mevcutPlan={planId}
          baslik="PDF menü içe aktarma Menü planında"
        />
      ) : null}
    </div>
  );
}
