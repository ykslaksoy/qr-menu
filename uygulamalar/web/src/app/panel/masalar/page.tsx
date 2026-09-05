"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useIsletme } from "@/lib/useIsletme";
import { idUret } from "@/lib/store";
import { menuQrUrl, qrDataUrl, qrIndir } from "@/lib/qr";

export default function PanelMasalarPage() {
  const { isletme, kaydet } = useIsletme();
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [yeniAd, setYeniAd] = useState("");

  useEffect(() => {
    if (!isletme) return;
    let iptal = false;
    (async () => {
      const next: Record<string, string> = {};
      for (const m of isletme.masalar) {
        const url = menuQrUrl(isletme.slug, m.ad);
        next[m.id] = await qrDataUrl(url);
      }
      if (!iptal) setQrMap(next);
    })();
    return () => {
      iptal = true;
    };
  }, [isletme]);

  if (!isletme) return null;

  function masaEkle(e: React.FormEvent) {
    e.preventDefault();
    const ad = yeniAd.trim() || `Masa ${isletme!.masalar.length + 1}`;
    kaydet({
      ...isletme!,
      masalar: [
        ...isletme!.masalar,
        { id: idUret("masa"), ad, sira: isletme!.masalar.length + 1 },
      ],
    });
    setYeniAd("");
  }

  function masaSil(id: string) {
    kaydet({ ...isletme!, masalar: isletme!.masalar.filter((m) => m.id !== id) });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-baslik)] text-3xl font-semibold">
          Masalar / QR
        </h1>
        <p className="mt-1 text-muted">
          Her masa için menü QR üretin ve PNG indirin. Basılı menü, adisyon ve masa kartı PDF’leri
          yalnızca yönetici ekranındaki{" "}
          <Link href="/panel/dokumanlar" className="text-brand underline">
            Dökümanlar
          </Link>{" "}
          bölümünden indirilir.
        </p>
      </div>

      <form onSubmit={masaEkle} className="flex gap-2">
        <input
          value={yeniAd}
          onChange={(e) => setYeniAd(e.target.value)}
          placeholder="Masa adı (örn. Bahçe 1)"
          className="flex-1 rounded-xl border border-line bg-card px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
          Masa ekle
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isletme.masalar.map((m) => (
          <article key={m.id} className="rounded-2xl border border-line bg-card p-4">
            <div className="flex items-start justify-between">
              <h2 className="font-semibold">{m.ad}</h2>
              <button type="button" onClick={() => masaSil(m.id)} className="text-xs text-red-700">
                Sil
              </button>
            </div>
            <p className="mt-1 break-all font-mono text-[10px] text-muted">
              {menuQrUrl(isletme.slug, m.ad)}
            </p>
            {qrMap[m.id] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrMap[m.id]} alt={`${m.ad} QR`} className="mx-auto mt-3 h-40 w-40" />
            ) : (
              <div className="mx-auto mt-3 flex h-40 w-40 items-center justify-center text-xs text-muted">
                QR…
              </div>
            )}
            <button
              type="button"
              disabled={!qrMap[m.id]}
              onClick={() =>
                qrIndir(qrMap[m.id], `${isletme.slug}-${m.ad.replace(/\s+/g, "-")}-qr.png`)
              }
              className="mt-3 w-full rounded-full border border-line py-2 text-sm font-semibold hover:border-brand/40 disabled:opacity-40"
            >
              PNG indir
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
