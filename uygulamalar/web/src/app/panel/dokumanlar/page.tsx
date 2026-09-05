"use client";

import { useEffect, useState } from "react";
import { BaskiTalepForm } from "@/components/BaskiTalepForm";
import { DokumanAksiyonlari } from "@/components/DokumanAksiyonlari";
import { PlanKilit } from "@/components/PlanKilit";
import { useIsletme } from "@/lib/useIsletme";
import { adisyonBaskiPdfIndir, adisyonBaskiPdfOlustur } from "@/lib/adisyon-baski-pdf";
import { masaKartiPdfIndir, masaKartiPdfOlustur } from "@/lib/masa-karti-pdf";
import { menuBaskiPdfIndir, menuBaskiPdfOlustur } from "@/lib/menu-baski-pdf";
import { BASKI_DPI, EKRAN_DPI, TASMA_MM } from "@/lib/baski-cozunurluk";
import { pdfYazdir } from "@/lib/pdf-yazdir";
import { efektifPlanId, ozellikAcikMi, ozellikAcikMiIsletme } from "@/lib/plan-kilit";
import { menuQrUrl, qrDataUrl } from "@/lib/qr";
import { idUret, type BaskiTalepTuru } from "@/lib/store";

export default function PanelDokumanlarPage() {
  const { isletme, kaydet } = useIsletme();
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [indiriliyor, setIndiriliyor] = useState<string | null>(null);
  const [menuPdfIndiriliyor, setMenuPdfIndiriliyor] = useState(false);
  const [menuPdfYazdiriliyor, setMenuPdfYazdiriliyor] = useState(false);
  const [adisyonPdfIndiriliyor, setAdisyonPdfIndiriliyor] = useState(false);
  const [adisyonPdfYazdiriliyor, setAdisyonPdfYazdiriliyor] = useState(false);
  const [baskiForm, setBaskiForm] = useState<BaskiTalepTuru | null>(null);

  useEffect(() => {
    if (!isletme) return;
    let iptal = false;
    (async () => {
      const next: Record<string, string> = {};
      for (const m of isletme.masalar) {
        next[m.id] = await qrDataUrl(menuQrUrl(isletme.slug, m.ad));
      }
      if (!iptal) setQrMap(next);
    })();
    return () => {
      iptal = true;
    };
  }, [isletme]);

  if (!isletme) return null;

  const planId = efektifPlanId(isletme);
  const menuBaskiAcik = ozellikAcikMiIsletme(isletme, "baskiPdf");
  const adisyonBaskiAcik = ozellikAcikMi(planId, "adisyonBaskiPdf");
  const menuPdfOpts = () => ({
    kafeAdi: isletme.kafeAdi,
    logoUrl: isletme.logoUrl,
    logoUrlBaski: isletme.logoUrlBaski,
    kategoriler: isletme.kategoriler,
    urunler: isletme.urunler,
    anaRenk: isletme.tema.anaRenk,
  });
  const adisyonPdfOpts = () => ({
    kafeAdi: isletme.kafeAdi,
    logoUrl: isletme.logoUrl,
    logoUrlBaski: isletme.logoUrlBaski,
    anaRenk: isletme.tema.anaRenk,
  });

  async function baskiTalepEkle(tur: BaskiTalepTuru, adet: number, not: string) {
    const talep = {
      id: idUret("baski"),
      tur,
      adet,
      not: not || undefined,
      olusturulma: Date.now(),
      durum: "bekliyor" as const,
    };
    kaydet({
      ...isletme!,
      baskiTalepleri: [talep, ...(isletme!.baskiTalepleri ?? [])],
    });
    setBaskiForm(null);
  }

  async function masaPdfIndir(masaId: string, masaAd: string) {
    setIndiriliyor(masaId);
    try {
      await masaKartiPdfIndir({
        kafeAdi: isletme!.kafeAdi,
        logoUrl: isletme!.logoUrl,
        logoUrlBaski: isletme!.logoUrlBaski,
        masaAd,
        qrUrl: menuQrUrl(isletme!.slug, masaAd),
        anaRenk: isletme!.tema.anaRenk,
      });
    } finally {
      setIndiriliyor(null);
    }
  }

  async function masaPdfYazdir(masaAd: string) {
    const doc = await masaKartiPdfOlustur({
      kafeAdi: isletme!.kafeAdi,
      logoUrl: isletme!.logoUrl,
      logoUrlBaski: isletme!.logoUrlBaski,
      masaAd,
      qrUrl: menuQrUrl(isletme!.slug, masaAd),
      anaRenk: isletme!.tema.anaRenk,
    });
    pdfYazdir(doc);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-baslik)] text-3xl font-semibold">
          Dökümanlar
        </h1>
        <p className="mt-1 text-muted">
          PDF indirme, yazdırma ve baskı talebi buradan yapılır. Menü verisi girmek için{" "}
          <a href="/panel/veri-girisi" className="text-brand underline">
            Veri girişi
          </a>{" "}
          bölümünü kullanın. Dijital menü {EKRAN_DPI} dpi; baskı {BASKI_DPI} dpi · taşma payı{" "}
          {TASMA_MM} mm.
        </p>
      </div>

      {menuBaskiAcik ? (
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Menü baskı PDF (A4)</h2>
          <p className="mt-1 text-sm text-muted">
            Aktif ürünleriniz masa üstü A4 menü olarak, ürün görselleri {BASKI_DPI} dpi ile taşma
            paylı PDF olarak hazırlanır.
          </p>
          <DokumanAksiyonlari
            indiriliyor={menuPdfIndiriliyor}
            yazdiriliyor={menuPdfYazdiriliyor}
            indirDisabled={isletme.urunler.filter((u) => u.aktif).length === 0}
            indirEtiket="Menü PDF indir (A4)"
            onIndir={async () => {
              setMenuPdfIndiriliyor(true);
              try {
                await menuBaskiPdfIndir(menuPdfOpts());
              } finally {
                setMenuPdfIndiriliyor(false);
              }
            }}
            onYazdir={async () => {
              setMenuPdfYazdiriliyor(true);
              try {
                pdfYazdir(await menuBaskiPdfOlustur(menuPdfOpts()));
              } finally {
                setMenuPdfYazdiriliyor(false);
              }
            }}
            onBaskiGonder={() => setBaskiForm("menu")}
          />
          <BaskiTalepForm
            tur="menu"
            turAd="Menü A4"
            acik={baskiForm === "menu"}
            onKapat={() => setBaskiForm(null)}
            onGonder={(adet, not) => baskiTalepEkle("menu", adet, not)}
          />
        </section>
      ) : (
        <PlanKilit ozellik="baskiPdf" mevcutPlan={planId} baslik="Menü baskı PDF kilitli" />
      )}

      {adisyonBaskiAcik ? (
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Adisyon baskı PDF (A5 · 148×210 mm)</h2>
          <p className="mt-1 text-sm text-muted">
            Masa adisyon fişi boyutunda boş form. A4 menüden farklı dar fiş formatındadır.
          </p>
          <DokumanAksiyonlari
            indiriliyor={adisyonPdfIndiriliyor}
            yazdiriliyor={adisyonPdfYazdiriliyor}
            indirEtiket="Adisyon PDF indir (A5)"
            onIndir={async () => {
              setAdisyonPdfIndiriliyor(true);
              try {
                await adisyonBaskiPdfIndir(adisyonPdfOpts());
              } finally {
                setAdisyonPdfIndiriliyor(false);
              }
            }}
            onYazdir={async () => {
              setAdisyonPdfYazdiriliyor(true);
              try {
                pdfYazdir(await adisyonBaskiPdfOlustur(adisyonPdfOpts()));
              } finally {
                setAdisyonPdfYazdiriliyor(false);
              }
            }}
            onBaskiGonder={() => setBaskiForm("adisyon")}
          />
          <BaskiTalepForm
            tur="adisyon"
            turAd="Adisyon A5"
            acik={baskiForm === "adisyon"}
            onKapat={() => setBaskiForm(null)}
            onGonder={(adet, not) => baskiTalepEkle("adisyon", adet, not)}
          />
        </section>
      ) : (
        <PlanKilit
          ozellik="adisyonBaskiPdf"
          mevcutPlan={planId}
          baslik="Adisyon baskı PDF kilitli"
        />
      )}

      {menuBaskiAcik ? (
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Masa kartları</h2>
          <p className="mt-1 text-sm text-muted">
            Her masa için PDF masa kartı (100×140 mm kesim, {TASMA_MM} mm taşma payı). QR kod menüye
            yönlendirir.
          </p>

          {isletme.masalar.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Önce <a href="/panel/masalar" className="text-brand underline">masa ekleyin</a>.
            </p>
          ) : (
            <>
              <DokumanAksiyonlari
                indiriliyor={indiriliyor === "tum"}
                indirEtiket="Tüm masaları PDF indir"
                onIndir={async () => {
                  setIndiriliyor("tum");
                  try {
                    for (const m of isletme.masalar) {
                      await masaPdfIndir(m.id, m.ad);
                    }
                  } finally {
                    setIndiriliyor(null);
                  }
                }}
                onYazdir={async () => {
                  for (const m of isletme.masalar) {
                    await masaPdfYazdir(m.ad);
                  }
                }}
                onBaskiGonder={() => setBaskiForm("masa-karti")}
              />
              <BaskiTalepForm
                tur="masa-karti"
                turAd="Masa kartı"
                acik={baskiForm === "masa-karti"}
                onKapat={() => setBaskiForm(null)}
                onGonder={(adet, not) => baskiTalepEkle("masa-karti", adet, not)}
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isletme.masalar.map((m) => (
                  <article key={m.id} className="rounded-2xl border border-line bg-background p-4">
                    <h3 className="font-semibold">{m.ad}</h3>
                    {qrMap[m.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={qrMap[m.id]} alt={`${m.ad} QR`} className="mx-auto mt-3 h-32 w-32" />
                    ) : (
                      <div className="mx-auto mt-3 flex h-32 w-32 items-center justify-center text-xs text-muted">
                        Önizleme…
                      </div>
                    )}
                    <DokumanAksiyonlari
                      indiriliyor={indiriliyor === m.id}
                      indirEtiket="PDF indir"
                      onIndir={() => masaPdfIndir(m.id, m.ad)}
                      onYazdir={() => masaPdfYazdir(m.ad)}
                      onBaskiGonder={() => setBaskiForm("masa-karti")}
                    />
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      ) : null}

      {isletme.baskiTalepleri && isletme.baskiTalepleri.length > 0 ? (
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Baskı talepleri</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {isletme.baskiTalepleri.map((t) => (
              <li key={t.id} className="flex flex-wrap justify-between gap-2 border-b border-line/60 pb-2">
                <span>
                  {t.tur === "menu"
                    ? "Menü A4"
                    : t.tur === "adisyon"
                      ? "Adisyon A5"
                      : "Masa kartı"}{" "}
                  · {t.adet} adet
                  {t.not ? ` · ${t.not}` : ""}
                </span>
                <span className="text-muted">
                  {new Date(t.olusturulma).toLocaleDateString("tr-TR")} · {t.durum}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
