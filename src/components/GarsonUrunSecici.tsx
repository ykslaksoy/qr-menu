"use client";

import { useMemo, useState } from "react";
import { formatTl } from "@/lib/abonelik";
import { UrunSecenekModal } from "@/components/UrunSecenekModal";
import { urunuZenginlestir } from "@/lib/urun-secenekleri";
import { stokAlternatifleriBul, type AlternatifUrun } from "@/lib/stok-alternatif";
import { urunTukendiMi, type Kategori, type SiparisKalemi, type Urun } from "@/lib/store";

type Props = {
  kategoriler: Kategori[];
  urunler: Urun[];
  disabled?: boolean;
  anaRenk?: string;
  vurguRengi?: string;
  onEkle: (kalemler: SiparisKalemi[]) => void;
};

function kalemAnahtar(k: Pick<SiparisKalemi, "urunId" | "secenekIds" | "secenekOzet">) {
  const ids = (k.secenekIds ?? []).slice().sort().join(",");
  return `${k.urunId}::${ids || (k.secenekOzet ?? "")}`;
}

export function GarsonUrunSecici({
  kategoriler,
  urunler,
  disabled,
  anaRenk = "#1f6f5b",
  vurguRengi = "#c45c26",
  onEkle,
}: Props) {
  const [arama, setArama] = useState("");
  const [aktifKat, setAktifKat] = useState<string | "tumu">("tumu");
  const [sepet, setSepet] = useState<SiparisKalemi[]>([]);
  const [secenekUrun, setSecenekUrun] = useState<Urun | null>(null);
  const [tukenenId, setTukenenId] = useState<string | null>(null);

  const siraliKat = useMemo(
    () => [...kategoriler].sort((a, b) => a.sira - b.sira),
    [kategoriler],
  );

  const zenginUrunler = useMemo(() => urunler.map(urunuZenginlestir), [urunler]);

  const filtreli = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr-TR");
    return zenginUrunler.filter((u) => {
      if (aktifKat !== "tumu" && u.kategoriId !== aktifKat) return false;
      if (!q) return true;
      return u.ad.toLocaleLowerCase("tr-TR").includes(q);
    });
  }, [zenginUrunler, aktifKat, arama]);

  function kalemEkle(kalem: SiparisKalemi) {
    setSepet((onceki) => {
      const anahtar = kalemAnahtar(kalem);
      const varMi = onceki.find((k) => kalemAnahtar(k) === anahtar);
      if (varMi) {
        return onceki.map((k) =>
          kalemAnahtar(k) === anahtar ? { ...k, adet: k.adet + kalem.adet } : k,
        );
      }
      return [...onceki, kalem];
    });
  }

  function alternatifEkle(alt: AlternatifUrun) {
    const tam = zenginUrunler.find((u) => u.id === alt.id);
    if (tam) {
      sepeteEkle(tam);
    } else {
      kalemEkle({ urunId: alt.id, ad: alt.ad, fiyat: alt.fiyat, adet: 1 });
    }
    setTukenenId(null);
  }

  function sepeteEkle(urun: Urun) {
    if (urunTukendiMi(urun)) {
      setTukenenId((onceki) => (onceki === urun.id ? null : urun.id));
      return;
    }
    setTukenenId(null);
    if (urun.secenekler?.length) {
      setSecenekUrun(urun);
      return;
    }
    kalemEkle({ urunId: urun.id, ad: urun.ad, fiyat: urun.fiyat, adet: 1 });
  }

  const sepetToplam = sepet.reduce((a, k) => a + k.fiyat * k.adet, 0);

  return (
    <div className="space-y-3 rounded-2xl border border-line bg-card p-4">
      <div>
        <h3 className="font-semibold">Menüden ekle</h3>
        <p className="mt-1 text-xs text-muted">
          Seçenekli ürünlerde varyant ekranı açılır
        </p>
      </div>

      <input
        type="search"
        value={arama}
        onChange={(e) => setArama(e.target.value)}
        placeholder="Ürün ara…"
        className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm"
        disabled={disabled}
      />

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setAktifKat("tumu")}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            aktifKat === "tumu" ? "bg-brand text-white" : "border border-line bg-background"
          }`}
        >
          Tümü
        </button>
        {siraliKat.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setAktifKat(k.id)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
              aktifKat === k.id ? "bg-brand text-white" : "border border-line bg-background"
            }`}
          >
            {k.ad}
          </button>
        ))}
      </div>

      <ul className="max-h-64 space-y-2 overflow-y-auto">
        {filtreli.length === 0 ? (
          <li className="py-4 text-center text-sm text-muted">Ürün bulunamadı</li>
        ) : (
          filtreli.map((u) => {
            const tukendi = urunTukendiMi(u);
            const sepetAdet = sepet
              .filter((k) => k.urunId === u.id)
              .reduce((a, k) => a + k.adet, 0);
            const alternatifler =
              tukendi && tukenenId === u.id
                ? stokAlternatifleriBul(u.ad, urunler, u.id, u.kategoriId)
                : [];
            return (
              <li key={u.id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => sepeteEkle(u)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    tukendi
                      ? "border-amber-200 bg-amber-50/60 opacity-90"
                      : "border-line hover:border-brand/40 active:scale-[0.99]"
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="font-medium">{u.ad}</span>
                    {u.secenekler?.length ? (
                      <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-brand">
                        Seçenekli
                      </span>
                    ) : null}
                    {tukendi ? (
                      <span className="ml-2 text-xs text-amber-700">Tükendi</span>
                    ) : null}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {sepetAdet > 0 ? (
                      <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs font-semibold text-brand-dark">
                        {sepetAdet}
                      </span>
                    ) : null}
                    <span className="text-muted">{formatTl(u.fiyat)}</span>
                  </span>
                </button>
                {alternatifler.length > 0 ? (
                  <div className="mt-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                    <p className="text-[11px] font-medium text-amber-900">
                      Alternatif öneriler
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {alternatifler.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => alternatifEkle(a)}
                          className="rounded-full border border-amber-300 bg-white px-2.5 py-1 text-xs font-medium text-amber-950 disabled:opacity-50"
                        >
                          {a.ad} · {formatTl(a.fiyat)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : tukendi && tukenenId === u.id ? (
                  <p className="mt-1.5 px-1 text-xs text-muted">Uygun alternatif yok</p>
                ) : null}
              </li>
            );
          })
        )}
      </ul>

      {sepet.length > 0 ? (
        <div className="rounded-xl border border-brand/30 bg-brand/5 p-3">
          <ul className="space-y-1 text-sm">
            {sepet.map((k) => (
              <li key={kalemAnahtar(k)} className="flex justify-between gap-2">
                <span className="min-w-0">
                  {k.adet}× {k.ad}
                  {k.secenekOzet ? (
                    <span className="block text-xs text-muted">{k.secenekOzet}</span>
                  ) : null}
                </span>
                <span className="shrink-0 text-muted">{formatTl(k.fiyat * k.adet)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-right font-semibold">{formatTl(sepetToplam)}</p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onEkle(sepet);
              setSepet([]);
            }}
            className="mt-3 w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Adisyona ekle ({sepet.length} kalem)
          </button>
        </div>
      ) : null}

      {secenekUrun ? (
        <UrunSecenekModal
          urun={secenekUrun}
          anaRenk={anaRenk}
          vurguRengi={vurguRengi}
          onKapat={() => setSecenekUrun(null)}
          onOnayla={({ ids, ozet, fiyat }) => {
            kalemEkle({
              urunId: secenekUrun.id,
              ad: secenekUrun.ad,
              fiyat,
              adet: 1,
              secenekIds: ids,
              secenekOzet: ozet || undefined,
            });
            setSecenekUrun(null);
          }}
        />
      ) : null}
    </div>
  );
}
