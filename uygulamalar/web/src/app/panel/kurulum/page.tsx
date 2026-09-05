"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { hazirMenuIlgiliUrunlerle } from "@/lib/hazir-menu";
import { kurulumDurum, kurulumTamamMi, masaUret } from "@/lib/kurulum";
import { useIsletme } from "@/lib/useIsletme";

const ADIMLAR = ["İşletme", "Masalar / QR", "Örnek menü", "Personel"] as const;

export default function PanelKurulumPage() {
  const { isletme, kaydet, hazir } = useIsletme();
  const [adim, setAdim] = useState(0);
  const [kafeAdi, setKafeAdi] = useState("");
  const [masaAdet, setMasaAdet] = useState(6);
  const [personelOk, setPersonelOk] = useState(false);
  const [mesaj, setMesaj] = useState("");

  const durum = useMemo(
    () => (isletme ? kurulumDurum(isletme, personelOk) : null),
    [isletme, personelOk],
  );

  if (!hazir) return <p className="p-8 text-muted">Yükleniyor…</p>;
  if (!isletme || !durum) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted">Önce giriş yapın.</p>
        <Link href="/giris" className="mt-4 inline-block text-brand underline">
          Giriş
        </Link>
      </div>
    );
  }

  const ad = kafeAdi || isletme.kafeAdi;

  async function kaydetAd() {
    const isim = ad.trim();
    if (!isim) return;
    await kaydet({ ...isletme!, kafeAdi: isim });
    setMesaj("İşletme adı kaydedildi.");
    setAdim(1);
  }

  async function kaydetMasalar() {
    const masalar = masaUret(masaAdet, isletme!.masalar);
    await kaydet({ ...isletme!, masalar });
    setMesaj(`${masalar.length} masa hazır. QR’ler Masalar sayfasından indirilir.`);
    setAdim(2);
  }

  async function ornekMenuYukle() {
    const guncel = hazirMenuIlgiliUrunlerle(isletme!, "kafe", { gazliLimit: 6 });
    await kaydet(guncel);
    setMesaj(`Örnek menü yüklendi (${guncel.urunler.length} ürün).`);
    setAdim(3);
  }

  function personelOnayla() {
    setPersonelOk(true);
    setMesaj("Personel adımları tamam. Demo hesaplarla deneyebilirsiniz.");
  }

  const tamam = kurulumTamamMi(durum);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div>
        <h1 className="font-[family-name:var(--font-baslik)] text-3xl font-semibold">
          İlk kurulum
        </h1>
        <p className="mt-1 text-muted">
          4 adımda restoranda denenebilir hale getirin — ÖKC / Getir entegrasyonu yok.
        </p>
      </div>

      <ol className="flex flex-wrap gap-2">
        {ADIMLAR.map((etiket, i) => (
          <li key={etiket}>
            <button
              type="button"
              onClick={() => setAdim(i)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                adim === i ? "bg-brand text-white" : "border border-line bg-card"
              }`}
            >
              {i + 1}. {etiket}
            </button>
          </li>
        ))}
      </ol>

      {mesaj ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {mesaj}
        </p>
      ) : null}

      {adim === 0 ? (
        <section className="space-y-3 rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">İşletme adı</h2>
          <input
            value={ad}
            onChange={(e) => setKafeAdi(e.target.value)}
            className="w-full rounded-xl border border-line bg-background px-3 py-2"
            placeholder="Örn: Cafe Ada"
          />
          <p className="text-xs text-muted">Menü: /m/{isletme.slug}</p>
          <button
            type="button"
            onClick={kaydetAd}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            Kaydet ve devam
          </button>
        </section>
      ) : null}

      {adim === 1 ? (
        <section className="space-y-3 rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Masa / QR üret</h2>
          <label className="block text-sm">
            Masa sayısı
            <input
              type="number"
              min={1}
              max={40}
              value={masaAdet}
              onChange={(e) => setMasaAdet(Number(e.target.value) || 1)}
              className="mt-1 w-full rounded-xl border border-line bg-background px-3 py-2"
            />
          </label>
          <p className="text-xs text-muted">Şu an {isletme.masalar.length} masa kayıtlı.</p>
          <button
            type="button"
            onClick={kaydetMasalar}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            Masaları oluştur
          </button>
          <Link href="/panel/masalar" className="ml-3 text-sm text-brand underline">
            Masalar / QR sayfası
          </Link>
        </section>
      ) : null}

      {adim === 2 ? (
        <section className="space-y-3 rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Örnek menü</h2>
          <p className="text-sm text-muted">
            Aktif ürün: {isletme.urunler.filter((u) => u.aktif).length}. Kafe kataloğundan örnek menü
            yükleyebilir veya Menü sayfasından düzenleyebilirsiniz.
          </p>
          <button
            type="button"
            onClick={ornekMenuYukle}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            Örnek kafe menüsü yükle
          </button>
          <Link href="/panel/menu" className="ml-3 text-sm text-brand underline">
            Menüyü düzenle
          </Link>
          <div>
            <button type="button" onClick={() => setAdim(3)} className="mt-2 text-sm underline">
              Menü tamam → Personel
            </button>
          </div>
        </section>
      ) : null}

      {adim === 3 ? (
        <section className="space-y-3 rounded-2xl border border-line bg-card p-5">
          <h2 className="font-semibold">Personel rolleri</h2>
          <ul className="space-y-2 text-sm">
            <li>
              Yönetici —{" "}
              <Link className="text-brand underline" href="/api/auth/demo/yonetici">
                demo giriş
              </Link>
            </li>
            <li>
              Garson —{" "}
              <Link className="text-brand underline" href="/api/auth/demo/garson">
                demo giriş
              </Link>
            </li>
            <li>
              Mutfak —{" "}
              <Link className="text-brand underline" href="/api/auth/demo/mutfak">
                demo giriş
              </Link>
            </li>
          </ul>
          <p className="text-xs text-muted">Şifre (seed): demo1234 · Ayrıntı Personel sayfasında.</p>
          <button
            type="button"
            onClick={personelOnayla}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            Rolleri anladım
          </button>
          <Link href="/panel/personel" className="ml-3 text-sm text-brand underline">
            Personel matrisi
          </Link>
        </section>
      ) : null}

      <section className="rounded-2xl border border-dashed border-line p-4 text-sm">
        <p className="font-medium">Durum</p>
        <ul className="mt-2 grid grid-cols-2 gap-1 text-muted">
          <li>{durum.adOk ? "✅" : "⬜"} İşletme adı</li>
          <li>{durum.masaOk ? "✅" : "⬜"} Masalar</li>
          <li>{durum.menuOk ? "✅" : "⬜"} Menü</li>
          <li>{durum.personelOk ? "✅" : "⬜"} Personel</li>
        </ul>
        {tamam ? (
          <Link
            href="/panel"
            className="mt-4 inline-block rounded-full bg-emerald-700 px-4 py-2 font-semibold text-white"
          >
            Panele git — kurulum tamam
          </Link>
        ) : null}
      </section>
    </div>
  );
}
