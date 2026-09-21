import Link from "next/link";
import { redirect } from "next/navigation";
import {
  efektifMod,
  isletmeVeriParse,
  mevcutKullanici,
} from "@/lib/auth-server";
import type { Siparis } from "@/lib/store";
import { SubelerPaneli, type SubeOzet, type ZincirSiparisSatir } from "./SubelerPaneli";

function siparisTutar(s: Siparis) {
  return s.kalemler.reduce((n, k) => n + k.fiyat * k.adet, 0);
}

function durumEtiket(durum: Siparis["durum"]) {
  switch (durum) {
    case "yeni":
      return "Yeni";
    case "mutfak":
      return "Mutfak";
    case "hazir":
      return "Hazır";
    case "servis":
      return "Servis";
    case "odendi":
      return "Ödendi";
    case "iptal":
      return "İptal";
    default:
      return durum;
  }
}

export default async function SubelerPage() {
  const user = await mevcutKullanici();
  if (!user) redirect("/giris?sonra=/subeler");

  const mod = await efektifMod(user);
  if (mod === "yonetici") redirect("/panel");
  if (mod !== "zincir" || !user.zincir) {
    redirect("/");
  }

  const bekleyen: ZincirSiparisSatir[] = [];
  const odenen: ZincirSiparisSatir[] = [];
  let toplamAdet = 0;
  let toplamTutar = 0;
  let bekleyenTutar = 0;
  let odenenTutar = 0;

  const subeler: SubeOzet[] = user.zincir.subeler.map((s) => {
    const veri = isletmeVeriParse(s.veri);
    const siparisler = veri.siparisler ?? [];
    let subeBekleyen = 0;
    let subeOdenen = 0;

    for (const sip of siparisler) {
      if (sip.durum === "iptal") continue;
      const tutar = siparisTutar(sip);
      toplamAdet += 1;
      toplamTutar += tutar;
      const satir: ZincirSiparisSatir = {
        id: sip.id,
        subeSlug: s.slug,
        subeAd: s.kafeAdi,
        masaAd: sip.masaAd,
        durum: sip.durum,
        durumEtiket: durumEtiket(sip.durum),
        tutar,
        olusturulma: sip.olusturulma,
        kalemOzet: sip.kalemler.map((k) => `${k.adet}× ${k.ad}`).join(", "),
      };
      if (sip.durum === "odendi") {
        odenen.push(satir);
        odenenTutar += tutar;
        subeOdenen += 1;
      } else {
        bekleyen.push(satir);
        bekleyenTutar += tutar;
        subeBekleyen += 1;
      }
    }

    return {
      id: s.id,
      slug: s.slug,
      kafeAdi: s.kafeAdi,
      bekleyen: subeBekleyen,
      odenen: subeOdenen,
      toplam: subeBekleyen + subeOdenen,
    };
  });

  const sirala = (a: ZincirSiparisSatir, b: ZincirSiparisSatir) =>
    b.olusturulma - a.olusturulma;
  bekleyen.sort(sirala);
  odenen.sort(sirala);

  return (
    <div className="sofra-mesh min-h-full">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/subeler"
              className="font-[family-name:var(--font-baslik)] text-xl font-semibold text-brand-dark"
            >
              Sofra
            </Link>
            <span className="text-sm text-muted">{user.zincir.ad}</span>
            <span className="rounded-full bg-line/50 px-2 py-0.5 text-xs text-muted">
              Tüm şubelerin yöneticisi
            </span>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm">
            <Link
              href="/subeler/sofra-farki"
              className="rounded-full border border-line px-3 py-1.5 hover:border-brand/40"
            >
              Sofra farkı
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <SubelerPaneli
          zincirAd={user.zincir.ad}
          subeler={subeler}
          ozet={{
            bekleyenAdet: bekleyen.length,
            bekleyenTutar,
            odenenAdet: odenen.length,
            odenenTutar,
            toplamAdet,
            toplamTutar,
          }}
          bekleyen={bekleyen}
          odenen={odenen}
        />
      </main>
    </div>
  );
}
