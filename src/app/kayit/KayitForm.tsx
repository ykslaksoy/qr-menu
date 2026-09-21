"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { referans, referansKoduOlustur } from "@sofra/tema";
import { menuYolu, slugOlustur } from "@/lib/slug";
import { referansQrGecerliMi, referansMenuQrOku, referansSlugDogrula } from "@/lib/referans";
import { isletmeYaz } from "@/lib/store";
import type { Isletme } from "@/lib/store";

function baslikYap(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export function KayitForm() {
  const searchParams = useSearchParams();
  const [kafeAdi, setKafeAdi] = useState("");
  const [slugElle, setSlugElle] = useState<string | null>(null);
  const [referansSlug, setReferansSlug] = useState<string | null>(null);
  const [referansQr, setReferansQr] = useState(false);
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [kaydedildi, setKaydedildi] = useState(false);

  useEffect(() => {
    const fromParam = searchParams.get(referans.referansQr.isletmeParametresi);
    const kaynakParam = searchParams.get(referans.referansQr.kaynakParametresi);
    const fromUrl = fromParam?.trim().toLowerCase() ?? "";

    if (fromUrl && referansSlugDogrula(fromUrl) && referansQrGecerliMi(fromUrl, kaynakParam)) {
      setReferansSlug(fromUrl);
      setReferansQr(true);
      return;
    }

    const oturum = referansMenuQrOku();
    if (oturum && referansQrGecerliMi(oturum.from, oturum.kaynak)) {
      setReferansSlug(oturum.from);
      setReferansQr(true);
      return;
    }

    setReferansSlug(fromUrl && referansSlugDogrula(fromUrl) ? fromUrl : null);
    setReferansQr(false);
  }, [searchParams]);

  const otomatikSlug = useMemo(() => slugOlustur(kafeAdi), [kafeAdi]);
  const slug = slugElle !== null ? slugElle : otomatikSlug;
  const adres = menuYolu(slug);
  const referansGecerli = referansQr && referansSlug;

  function kafeAdiDegisti(deger: string) {
    setKafeAdi(deger);
    setSlugElle(null);
    setKaydedildi(false);
  }

  async function kaydet(e: React.FormEvent) {
    e.preventDefault();
    if (!kafeAdi.trim() || !slug || !email || !sifre) return;
    setYukleniyor(true);
    setHata("");

    const yanit = await fetch("/api/auth", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "kayit",
        email,
        sifre,
        kafeAdi: kafeAdi.trim(),
        slug,
        referansSlug: referansGecerli ? referansSlug : undefined,
        referansKaynak: referansGecerli ? referans.referansQr.kaynakDegeri : undefined,
      }),
    });
    const veri = (await yanit.json()) as { hata?: string; isletme?: Isletme };
    setYukleniyor(false);

    if (!yanit.ok) {
      setHata(veri.hata ?? "Kayıt başarısız");
      return;
    }

    if (veri.isletme) {
      isletmeYaz(veri.isletme);
    }
    setKaydedildi(true);
  }

  return (
    <>
      {referansGecerli ? (
        <div className="mt-6 rounded-2xl border border-brand/30 bg-brand/5 p-4 text-sm">
          <p className="font-semibold text-brand-dark">
            {baslikYap(referansSlug!)} — menü QR ile geldiniz
          </p>
          <p className="mt-1 text-muted">
            Yıllık plan alırsanız ilk {referans.referansBasinaAy} ay %
            {Math.round(referans.indirimOrani * 100)} indirim uygulanır.
          </p>
        </div>
      ) : referansSlug && !referansQr ? (
        <div className="mt-6 rounded-2xl border border-line bg-card p-4 text-sm text-muted">
          Referans indirimi için önce <strong>referans olan yerin menü QR kodunu</strong> okutmanız
          gerekir.
        </div>
      ) : null}

      <form onSubmit={kaydet} className="mt-8 space-y-5 rounded-2xl border border-line bg-card p-6">
        <label className="block">
          <span className="text-sm font-medium">Kafe / restoran adı</span>
          <input
            type="text"
            value={kafeAdi}
            onChange={(e) => kafeAdiDegisti(e.target.value)}
            placeholder="Örn. Cafe Ada"
            className="mt-1.5 w-full rounded-xl border border-line bg-background px-3 py-2.5 outline-none focus:border-brand"
            autoComplete="organization"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">E-posta</span>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setKaydedildi(false);
            }}
            className="mt-1.5 w-full rounded-xl border border-line bg-background px-3 py-2.5 outline-none focus:border-brand"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Şifre (min. 6)</span>
          <input
            type="password"
            value={sifre}
            onChange={(e) => {
              setSifre(e.target.value);
              setKaydedildi(false);
            }}
            minLength={6}
            className="mt-1.5 w-full rounded-xl border border-line bg-background px-3 py-2.5 outline-none focus:border-brand"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Slug (otomatik)</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlugElle(slugOlustur(e.target.value))}
            placeholder="cafe-ada"
            className="mt-1.5 w-full rounded-xl border border-line bg-background px-3 py-2.5 font-mono text-sm outline-none focus:border-brand"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            title="Küçük harf, rakam ve tire"
          />
          <span className="mt-1.5 block text-xs text-muted">
            İsterseniz elle de düzenleyebilirsiniz; yine boşluksuz kalır.
          </span>
        </label>

        {referansGecerli ? (
          <div className="rounded-xl border border-dashed border-brand/30 bg-background/60 px-3 py-3 text-sm">
            <p className="text-muted">Davet referansı</p>
            <p className="mt-1 font-mono text-brand-dark">{referansKoduOlustur(referansSlug!)}</p>
            <p className="mt-1 text-xs text-muted">Menü QR ile doğrulandı</p>
          </div>
        ) : (
          <p className="text-xs text-muted">
            Referans indirimi yalnızca bir işletmenin <strong>menü QR kodu</strong> okutulduktan
            sonra kayıt olunduğunda geçerlidir.
          </p>
        )}

        <div className="rounded-xl border border-dashed border-line bg-background/60 px-3 py-3 text-sm">
          <p className="text-muted">Menü adresiniz</p>
          <p className="mt-1 break-all font-mono text-brand-dark">
            https://{adres}
            {slug ? "?masa=1" : null}
          </p>
        </div>

        {hata ? <p className="text-sm text-red-700">{hata}</p> : null}

        <button
          type="submit"
          disabled={!slug || yukleniyor}
          className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-40"
        >
          {yukleniyor ? "Kaydediliyor…" : "Kaydet ve devam et"}
        </button>
      </form>

      {kaydedildi ? (
        <div className="mt-6 rounded-2xl border border-brand/30 bg-card p-5 text-sm">
          <p className="font-semibold text-brand-dark">{kafeAdi.trim()} kaydedildi.</p>
          <p className="mt-1 text-muted">
            Slug: <code className="font-mono">{slug}</code>
          </p>
          {referansGecerli ? (
            <p className="mt-1 text-muted">
              Davet referansı:{" "}
              <code className="font-mono">{referansKoduOlustur(referansSlug!)}</code> (menü QR)
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/panel"
              className="rounded-full bg-brand px-4 py-2 font-semibold text-white"
            >
              Şube yöneticisine git
            </Link>
            <Link href={`/m/${slug}`} className="rounded-full border border-line px-4 py-2">
              Menüyü aç
            </Link>
          </div>
        </div>
      ) : null}

      <Ornekler onSec={(ad) => kafeAdiDegisti(ad)} />
    </>
  );
}

function Ornekler({ onSec }: { onSec: (ad: string) => void }) {
  const ornekler = ["Cafe Ada", "Karadeniz Sofrası", "Pizza Napoli", "Şişli Kahve"];
  return (
    <div className="mt-8">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Örnek dene</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {ornekler.map((ad) => (
          <button
            key={ad}
            type="button"
            onClick={() => onSec(ad)}
            className="rounded-full border border-line bg-card px-3 py-1.5 text-xs hover:border-brand/40"
          >
            {ad} → {slugOlustur(ad)}
          </button>
        ))}
      </div>
    </div>
  );
}
