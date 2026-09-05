"use client";

import { useMemo, useState } from "react";
import {
  KatalogVeOzelUrunEkle,
  katalogUrunMenudeVar,
  urunFromKatalog,
  urunFromOzel,
  type OzelUrunTaslak,
} from "@/components/KatalogVeOzelUrunEkle";
import { UrunGorselSecici } from "@/components/UrunGorselSecici";
import { useIsletme } from "@/lib/useIsletme";
import { idUret, urunKritikMi, urunTukendiMi, type Urun } from "@/lib/store";
import { formatTl } from "@/lib/abonelik";
import type { KatalogUrun } from "@sofra/tema";

export default function PanelMenuPage() {
  const { isletme, kaydet } = useIsletme();
  const [katAd, setKatAd] = useState("");
  const [duzenlenenId, setDuzenlenenId] = useState<string | null>(null);
  const [bildirim, setBildirim] = useState("");

  const menudekiKatalogIds = useMemo(() => {
    const ids = new Set<string>();
    if (!isletme) return ids;
    for (const u of isletme.urunler) {
      if (u.katalogId) ids.add(u.katalogId);
    }
    return ids;
  }, [isletme]);

  const menudekiOzelUrunler = useMemo(() => {
    if (!isletme) return [];
    return isletme.urunler.filter((u) => !u.katalogId);
  }, [isletme]);

  if (!isletme) return null;

  function kategoriEkle(e: React.FormEvent) {
    e.preventDefault();
    if (!katAd.trim()) return;
    kaydet({
      ...isletme!,
      kategoriler: [
        ...isletme!.kategoriler,
        { id: idUret("kat"), ad: katAd.trim(), sira: isletme!.kategoriler.length + 1 },
      ],
    });
    setKatAd("");
  }

  function katalogdanEkle(k: KatalogUrun, kategoriId: string) {
    if (katalogUrunMenudeVar(isletme!.urunler, k.id)) return;
    const urun = urunFromKatalog(k, kategoriId, idUret("urun"));
    kaydet({ ...isletme!, urunler: [...isletme!.urunler, urun] });
    setBildirim(`"${k.ad}" menüye eklendi.`);
  }

  function katalogdanKaldir(katalogId: string) {
    const silinen = isletme!.urunler.find((u) => u.katalogId === katalogId);
    kaydet({
      ...isletme!,
      urunler: isletme!.urunler.filter((u) => u.katalogId !== katalogId),
    });
    if (silinen) setBildirim(`"${silinen.ad}" menüden çıkarıldı.`);
  }

  function ozelEkle(taslak: OzelUrunTaslak, kategoriId: string) {
    const urun = urunFromOzel(taslak, kategoriId, idUret("urun"));
    kaydet({ ...isletme!, urunler: [...isletme!.urunler, urun] });
    setBildirim(`"${taslak.ad}" özel ürün olarak eklendi.`);
  }

  function urunSil(id: string) {
    kaydet({ ...isletme!, urunler: isletme!.urunler.filter((u) => u.id !== id) });
    if (duzenlenenId === id) setDuzenlenenId(null);
  }

  function urunGuncelle(id: string, patch: Partial<Urun>) {
    kaydet({
      ...isletme!,
      urunler: isletme!.urunler.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-baslik)] text-3xl font-semibold">Menü</h1>
        <p className="mt-1 text-muted">
          Hazır katalogdan tikle — yüzlerce ürün görseliyle saniyede menüye eklenir. Özel ürün de
          ekleyebilirsiniz. Toplu veri için{" "}
          <a href="/panel/veri-girisi" className="font-medium text-brand underline">
            Veri girişi
          </a>
          .
        </p>
      </div>

      <section className="rounded-2xl border border-line bg-card p-5">
        <h2 className="font-semibold">Kategoriler</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {isletme.kategoriler.map((k) => (
            <li key={k.id} className="rounded-full border border-line px-3 py-1 text-sm">
              {k.ad}
            </li>
          ))}
        </ul>
        <form onSubmit={kategoriEkle} className="mt-4 flex gap-2">
          <input
            value={katAd}
            onChange={(e) => setKatAd(e.target.value)}
            placeholder="Yeni kategori"
            className="flex-1 rounded-xl border border-line px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
            Ekle
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-brand/20 bg-brand/[0.03] p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-semibold">Ürün ekle</h2>
            <p className="mt-1 text-sm text-muted">
              Katalogdan seç → otomatik görsel + fiyat. MONU tarzı menü görünümü; Sofra hızında
              kurulum.
            </p>
          </div>
          <a
            href="/panel/menu/hazir"
            className="shrink-0 rounded-full border border-brand/30 bg-white px-3 py-1.5 text-xs font-semibold text-brand"
          >
            Hazır menü şablonu →
          </a>
        </div>
        {bildirim ? (
          <p className="mt-2 text-sm text-emerald-700">{bildirim}</p>
        ) : null}
        <div className="mt-4">
          <KatalogVeOzelUrunEkle
            kategoriler={isletme.kategoriler}
            isletmeTipi={isletme.isletmeTipi}
            menudekiKatalogIds={menudekiKatalogIds}
            menudekiOzelUrunler={menudekiOzelUrunler}
            onKatalogUrun={katalogdanEkle}
            onKatalogKaldir={katalogdanKaldir}
            onOzelKaldir={urunSil}
            onOzelUrun={ozelEkle}
          />
        </div>
      </section>

      <section className="space-y-4">
        {isletme.kategoriler.map((k) => {
          const urunler = isletme.urunler.filter((u) => u.kategoriId === k.id);
          if (!urunler.length) return null;
          return (
            <div key={k.id}>
              <h2 className="mb-2 font-semibold">{k.ad}</h2>
              <ul className="space-y-2">
                {urunler.map((u) => (
                  <li key={u.id} className="rounded-xl border border-line bg-card p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {u.gorselUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={u.gorselUrl}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-lg border border-line object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-line text-xs text-muted">
                            —
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium">
                            {u.ad}{" "}
                            <span className="text-muted">{formatTl(u.fiyat)}</span>
                            {!u.katalogId ? (
                              <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-amber-900">
                                Özel
                              </span>
                            ) : null}
                          </p>
                          <p className="text-xs text-muted">
                            {u.aciklama || "—"}
                            {u.stokTakibi
                              ? ` · Stok ${u.kalanAdet}${urunTukendiMi(u) ? " · Tükendi" : urunKritikMi(u) ? " · Kritik" : ""}`
                              : " · Stok kapalı"}
                            {u.gorselKaynak === "yukleme"
                              ? " · Kendi görsel"
                              : u.gorselKaynak === "hazir"
                                ? " · Hazır görsel"
                                : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setDuzenlenenId(duzenlenenId === u.id ? null : u.id)}
                          className="rounded-full border border-line px-3 py-1 text-xs"
                        >
                          {duzenlenenId === u.id ? "Kapat" : "Görsel"}
                        </button>
                        <button
                          type="button"
                          onClick={() => urunSil(u.id)}
                          className="rounded-full border border-line px-3 py-1 text-xs text-red-700"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                    {duzenlenenId === u.id ? (
                      <div className="mt-3 border-t border-line pt-3">
                        <UrunGorselSecici
                          gorselUrl={u.gorselUrl ?? null}
                          urunAdi={u.ad}
                          onSec={(gorselUrl, gorselKaynak, gorselUrlBaski) =>
                            urunGuncelle(u.id, {
                              gorselUrl,
                              gorselKaynak,
                              gorselUrlBaski: gorselUrlBaski ?? null,
                            })
                          }
                        />
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}
