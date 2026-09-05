"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdisyonKalemleri } from "@/components/AdisyonKalemleri";
import { GarsonPosPaneli } from "@/components/GarsonPosPaneli";
import { GarsonSerbestKalem } from "@/components/GarsonSerbestKalem";
import { GarsonUrunSecici } from "@/components/GarsonUrunSecici";
import { SesliSiparisAl } from "@/components/SesliSiparisAl";
import { AdetAltiBanner } from "@/components/AdetAltiBanner";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { PlanKilit } from "@/components/PlanKilit";
import { useIsletme } from "@/lib/useIsletme";
import { adisyonCanliPdfIndir, adisyonCanliPdfYazdir } from "@/lib/adisyon-baski-pdf";
import { efektifPlanId, ozellikAcikMiIsletme } from "@/lib/plan-kilit";
import type { SesliKalem } from "@/lib/sesli-siparis-parser";
import { dakikaOnce } from "@/lib/garson-istasyon";
import {
  adisyonAraToplam,
  adisyonIndirim,
  adisyonKalan,
  adisyonOdenen,
  siparisAktifMi,
  type Siparis,
  type SiparisDurum,
  type SiparisKalemi,
} from "@/lib/store";

const etiket: Record<SiparisDurum, string> = {
  yeni: "Yeni",
  mutfak: "Mutfak",
  hazir: "Hazır",
  servis: "Servis",
  iptal: "İptal",
  odendi: "Ödendi",
};

export default function GarsonMasaAdisyonPage() {
  const params = useParams();
  const masaId = String(params.masaId);
  const router = useRouter();
  const { isletme, hazir, yenile } = useIsletme();
  const [adisyonlar, setAdisyonlar] = useState<Siparis[]>([]);
  const [aktifHepsi, setAktifHepsi] = useState<Siparis[]>([]);
  const [seciliId, setSeciliId] = useState<string | null>(null);
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");
  const [islem, setIslem] = useState(false);
  const [seciliKalemler, setSeciliKalemler] = useState<Record<string, boolean>>({});

  const masa = isletme?.masalar.find((m) => m.id === masaId);
  const adisyon = adisyonlar.find((s) => s.id === seciliId) ?? adisyonlar[0] ?? null;

  const yukle = useCallback(async () => {
    if (!isletme) return;
    const yanit = await fetch(`/api/m/${isletme.slug}/siparis`);
    if (yanit.ok) {
      const veri = await yanit.json();
      const liste = ((veri.siparisler ?? []) as Siparis[]).filter((s) => siparisAktifMi(s));
      const masaSip = liste.filter((s) => s.masaId === masaId);
      setAktifHepsi(liste);
      setAdisyonlar(masaSip);
      setSeciliId((onceki) => {
        if (onceki && masaSip.some((s) => s.id === onceki)) return onceki;
        return masaSip[0]?.id ?? null;
      });
    }
    await yenile();
  }, [isletme, masaId, yenile]);

  useEffect(() => {
    if (!isletme) return;
    yukle();
    const t = setInterval(yukle, 2500);
    return () => clearInterval(t);
  }, [isletme, yukle]);

  async function apiPatch(body: Record<string, unknown>) {
    if (!isletme || !adisyon) return false;
    setIslem(true);
    setHata("");
    const yanit = await fetch(`/api/m/${isletme.slug}/siparis`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siparisId: adisyon.id, ...body }),
    });
    const veri = await yanit.json();
    setIslem(false);
    if (!yanit.ok) {
      setHata(veri.hata ?? "İşlem başarısız");
      return false;
    }
    await yukle();
    return true;
  }

  async function kalemleriEkle(kalemler: SiparisKalemi[] | SesliKalem[], kanal?: "ses" | "dokun") {
    if (!isletme || kalemler.length === 0) return;
    setIslem(true);
    setHata("");
    setMesaj("");

    const mapped: SiparisKalemi[] =
      "urun" in kalemler[0]!
        ? (kalemler as SesliKalem[]).map((k) => ({
            urunId: k.urun.id,
            ad: k.urun.ad,
            fiyat: k.urun.fiyat,
            adet: k.adet,
            kanal: kanal ?? "ses",
          }))
        : (kalemler as SiparisKalemi[]).map((k) => ({
            ...k,
            kanal: k.kanal ?? kanal ?? "dokun",
          }));

    const yanit = await fetch(`/api/m/${isletme.slug}/siparis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masaId, adisyonaEkle: true, siparisId: adisyon?.id, kalemler: mapped }),
    });
    const veri = await yanit.json();
    setIslem(false);

    if (!yanit.ok) {
      setHata(veri.hata ?? "Adisyona eklenemedi");
      return;
    }

    setMesaj(`${mapped.length} kalem adisyona eklendi.`);
    yukle();
  }

  async function serbestKalemEkle(
    ad: string,
    fiyat: number,
    adet: number,
    ekstra?: { not?: string; istasyon?: "bar" | "mutfak" | "tatli" },
  ) {
    if (!isletme) return;
    setIslem(true);
    setHata("");
    setMesaj("");
    const yanit = await fetch(`/api/m/${isletme.slug}/siparis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        masaId,
        siparisId: adisyon?.id,
        serbestKalem: {
          ad,
          fiyat,
          adet,
          not: ekstra?.not,
          istasyon: ekstra?.istasyon,
        },
      }),
    });
    const veri = await yanit.json();
    setIslem(false);
    if (!yanit.ok) {
      setHata(veri.hata ?? "Eklenemedi");
      return;
    }
    setMesaj(`"${ad}" adisyona eklendi.`);
    yukle();
  }

  async function durumGuncelle(durum: SiparisDurum) {
    if (durum === "iptal" && !confirm("Adisyon iptal edilsin mi? Stok iade edilir.")) return;
    const ok = await apiPatch({ durum });
    if (ok) setMesaj(`Durum: ${etiket[durum]}`);
  }

  async function posIslem(body: Record<string, unknown>) {
    const ok = await apiPatch(body);
    if (!ok) return false;
    if (body.tasi && typeof body.tasi === "object" && body.tasi && "masaId" in body.tasi) {
      const hedef = String((body.tasi as { masaId: string }).masaId);
      setMesaj("Adisyon taşındı");
      router.push(`/g/masa/${hedef}`);
    } else if (body.bol) {
      setMesaj("Adisyon bölündü");
      setSeciliKalemler({});
    } else if (body.kasa) {
      setMesaj("Kasa kaydı alındı");
    } else if (body.birlestir) {
      setMesaj("Adisyonlar birleştirildi");
    } else if (body.indirim) {
      setMesaj("İndirim uygulandı");
    }
    return true;
  }

  async function kalemIkram(urunId: string, ikram: boolean) {
    await apiPatch({ ikram: { urunId, ikram } });
  }

  async function kalemAdet(urunId: string, adet: number) {
    if (adet <= 0) {
      if (!confirm("Kalemi silmek istiyor musunuz?")) return;
      await apiPatch({ kalemSil: urunId });
      return;
    }
    await apiPatch({ kalemGuncelle: { urunId, adet } });
  }

  async function kalemSil(urunId: string) {
    if (!confirm("Kalemi silmek istiyor musunuz?")) return;
    await apiPatch({ kalemSil: urunId });
  }

  function pdfOpts() {
    if (!isletme || !masa || !adisyon) return null;
    const indirim = adisyonIndirim(adisyon);
    return {
      kafeAdi: isletme.kafeAdi,
      logoUrl: isletme.logoUrl,
      logoUrlBaski: isletme.logoUrlBaski,
      anaRenk: isletme.tema.anaRenk,
      masaAd: masa.ad,
      kalemler: adisyon.kalemler,
      olusturulma: adisyon.olusturulma,
      araToplam: adisyonAraToplam(adisyon),
      indirimTl: adisyon.indirimTl,
      indirimYuzde: adisyon.indirimYuzde,
      bahsis: adisyon.bahsis,
      odenen: adisyonOdenen(adisyon),
      kalan: adisyonKalan(adisyon),
      adisyonId: adisyon.id,
      // indirim tutarı PDF içinde yuzde+tl’den hesaplanır; yalnız tl verilmişse tutarı indirimTl’ye yaz
      ...(indirim > 0 && !adisyon.indirimTl && !adisyon.indirimYuzde
        ? { indirimTl: indirim }
        : {}),
    };
  }

  if (!hazir) return <p className="p-8 text-muted">Yükleniyor…</p>;
  if (!isletme) {
    return (
      <div className="sofra-mesh min-h-full p-8 text-center">
        <Link href="/giris" className="text-brand underline">
          Giriş yapın
        </Link>
      </div>
    );
  }

  if (!ozellikAcikMiIsletme(isletme, "garsonMutfak")) {
    return (
      <div className="sofra-mesh min-h-full p-8">
        <PlanKilit
          ozellik="garsonMutfak"
          mevcutPlan={efektifPlanId(isletme)}
          baslik="Dijital adisyon kilitli"
          tamSayfa
        />
      </div>
    );
  }

  if (!masa) {
    return (
      <div className="sofra-mesh min-h-full p-8 text-center">
        <p className="text-muted">Masa bulunamadı.</p>
        <Link href="/g" className="mt-4 inline-block text-brand underline">
          Masalara dön
        </Link>
      </div>
    );
  }

  const aktifUrunler = isletme.urunler.filter((u) => u.aktif);
  const pdfVeri = pdfOpts();

  return (
    <div className="sofra-mesh min-h-full pb-24">
      <ImpersonationBanner />
      <AdetAltiBanner isletme={isletme} compact />
      <header className="border-b border-line bg-card px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
          <div>
            <Link href="/g" className="text-xs text-brand underline">
              ← Masalar
            </Link>
            <p className="text-xs uppercase tracking-wide text-muted">
              Dijital adisyon
              {adisyon ? ` · ${etiket[adisyon.durum]}` : ""}
              {adisyon ? ` · ${dakikaOnce(adisyon.olusturulma)}` : ""}
            </p>
            <h1 className="font-[family-name:var(--font-baslik)] text-xl font-semibold">{masa.ad}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-6">
        <section className="rounded-2xl border border-line bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold">Açık adisyon</h2>
            {adisyon ? (
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand-dark">
                {etiket[adisyon.durum]}
              </span>
            ) : (
              <span className="text-xs text-muted">Henüz sipariş yok</span>
            )}
          </div>

          {adisyonlar.length > 1 ? (
            <div className="mt-3 flex gap-1.5 overflow-x-auto">
              {adisyonlar.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSeciliId(s.id);
                    setSeciliKalemler({});
                  }}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    s.id === adisyon?.id ? "bg-brand text-white" : "border border-line"
                  }`}
                >
                  Adisyon {i + 1} · {etiket[s.durum]}
                </button>
              ))}
            </div>
          ) : null}

          {adisyon ? (
            <>
              <AdisyonKalemleri
                adisyon={adisyon}
                disabled={islem}
                onAdetDegistir={kalemAdet}
                onSil={kalemSil}
                onIkram={kalemIkram}
                secili={seciliKalemler}
                onSecim={(id, v) => setSeciliKalemler((p) => ({ ...p, [id]: v }))}
              />

              <div className="mt-4 flex flex-wrap gap-2">
                {adisyon.durum === "yeni" ? (
                  <button
                    type="button"
                    disabled={islem}
                    onClick={() => durumGuncelle("mutfak")}
                    className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    Mutfağa gönder
                  </button>
                ) : null}
                {adisyon.durum === "hazir" ? (
                  <button
                    type="button"
                    disabled={islem}
                    onClick={() => durumGuncelle("servis")}
                    className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    Servis edildi
                  </button>
                ) : null}
                {pdfVeri ? (
                  <>
                    <button
                      type="button"
                      disabled={islem}
                      onClick={() => adisyonCanliPdfIndir(pdfVeri)}
                      className="rounded-full border border-line px-4 py-2 text-sm disabled:opacity-50"
                    >
                      PDF indir
                    </button>
                    <button
                      type="button"
                      disabled={islem}
                      onClick={() => adisyonCanliPdfYazdir(pdfVeri)}
                      className="rounded-full border border-line px-4 py-2 text-sm disabled:opacity-50"
                    >
                      Yazdır
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  disabled={islem}
                  onClick={() => durumGuncelle("iptal")}
                  className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-700 disabled:opacity-50"
                >
                  İptal et
                </button>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">
              QR siparişi yoksa menüden, sesle veya yazarak ilk kalemi ekleyin.
            </p>
          )}
        </section>

        {adisyon ? (
          <GarsonPosPaneli
            adisyon={adisyon}
            masalar={isletme.masalar}
            digerAdisyonlar={aktifHepsi.filter((s) => s.id !== adisyon.id)}
            disabled={islem}
            seciliKalemler={seciliKalemler}
            onIslem={posIslem}
          />
        ) : null}

        <GarsonUrunSecici
          kategoriler={isletme.kategoriler}
          urunler={aktifUrunler}
          disabled={islem}
          onEkle={(kalemler) => kalemleriEkle(kalemler, "dokun")}
        />

        <SesliSiparisAl
          urunler={aktifUrunler}
          disabled={islem}
          onOnayla={(kalemler) => kalemleriEkle(kalemler, "ses")}
        />

        <GarsonSerbestKalem disabled={islem} onEkle={serbestKalemEkle} />

        {hata ? <p className="text-sm text-red-700">{hata}</p> : null}
        {mesaj ? <p className="text-sm text-emerald-700">{mesaj}</p> : null}
      </main>
    </div>
  );
}
