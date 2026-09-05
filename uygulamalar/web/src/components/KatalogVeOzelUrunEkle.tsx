"use client";

import { useMemo, useState } from "react";
import {
  isletmeTipBul,
  katalogUrunBul,
  toplamUrunKatalogu,
  urunGorselBul,
  urunGorselOner,
  type KatalogUrun,
} from "@sofra/tema";
import { UrunHavuzuSecici } from "@/components/UrunHavuzuSecici";
import { OzelUrunEkleForm } from "@/components/OzelUrunEkleForm";
import { OzelUrunListesi } from "@/components/OzelUrunListesi";
import type { Kategori, Urun } from "@/lib/store";
import { uruneSecenekleriIsle } from "@/lib/urun-secenekleri";

export type OzelUrunTaslak = {
  ad: string;
  fiyat: number;
  aciklama: string;
  kategoriEtiket: string;
  gorselUrl: string | null;
  gorselUrlBaski?: string | null;
  gorselKaynak: "hazir" | "yukleme" | null;
};

type Props = {
  kategoriler: Kategori[];
  /** İşletme tipi — katalog önerilerini daraltır */
  isletmeTipi?: string | null;
  /** Menüdeki katalog id’leri — tik modu için */
  menudekiKatalogIds?: Set<string>;
  /** Menüdeki özel (katalog dışı) ürünler */
  menudekiOzelUrunler?: Urun[];
  onKatalogUrun: (urun: KatalogUrun, kategoriId: string) => void;
  onKatalogKaldir?: (katalogId: string) => void;
  onOzelKaldir?: (urunId: string) => void;
  onOzelUrun: (taslak: OzelUrunTaslak, kategoriId: string) => void;
};

const KATEGORI_ETIKETLER: Record<string, string> = {
  icecek: "İçecekler",
  gazli: "Gazlı içecekler",
  yemek: "Yemekler",
  ana: "Ana yemek",
  tatli: "Tatlılar",
  corba: "Çorbalar",
  salata: "Salatalar",
  burger: "Burger",
  pizza: "Pizza",
  doner: "Döner",
  borek: "Börek",
  cigkofte: "Çiğ köfte",
  genel: "Diğer",
};

function etiketAd(id: string) {
  return KATEGORI_ETIKETLER[id] ?? id;
}

export function KatalogVeOzelUrunEkle({
  kategoriler,
  isletmeTipi,
  menudekiKatalogIds,
  menudekiOzelUrunler,
  onKatalogUrun,
  onKatalogKaldir,
  onOzelKaldir,
  onOzelUrun,
}: Props) {
  const [mod, setMod] = useState<"katalog" | "ozel">("katalog");
  const [ara, setAra] = useState("");
  const [kategoriId, setKategoriId] = useState("");

  const seciliKat = kategoriId || kategoriler[0]?.id || "";

  const tipHavuzu = isletmeTipi ? isletmeTipBul(isletmeTipi)?.urunIds : null;
  const tikModu = Boolean(tipHavuzu?.length && menudekiKatalogIds && onKatalogKaldir);

  function toggleHavuz(id: string) {
    if (!tikModu) return;
    if (menudekiKatalogIds!.has(id)) {
      onKatalogKaldir!(id);
    } else {
      const u = katalogUrunBul(id);
      if (u && seciliKat) onKatalogUrun(u, seciliKat);
    }
  }

  const sonuclar = useMemo(() => {
    const q = ara.trim().toLowerCase();
    const tum = toplamUrunKatalogu();
    if (q) {
      return tum
        .filter(
          (u) =>
            u.ad.toLowerCase().includes(q) ||
            u.aciklama?.toLowerCase().includes(q) ||
            u.kategoriEtiket.toLowerCase().includes(q),
        )
        .slice(0, 32);
    }
    if (isletmeTipi) {
      const tipUygun = tum.filter((u) => u.tipler?.includes(isletmeTipi));
      if (tipUygun.length > 0) return tipUygun.slice(0, 24);
    }
    return tum.slice(0, 24);
  }, [ara, isletmeTipi]);

  function katalogSec(u: KatalogUrun) {
    if (!seciliKat) return;
    onKatalogUrun(u, seciliKat);
    setAra("");
  }

  function ozelEkleTaslak(taslak: OzelUrunTaslak) {
    if (!seciliKat) return;
    onOzelUrun(taslak, seciliKat);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMod("katalog")}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            mod === "katalog" ? "bg-brand text-white" : "border border-line"
          }`}
        >
          Katalogdan seç
        </button>
        <button
          type="button"
          onClick={() => setMod("ozel")}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            mod === "ozel" ? "bg-brand text-white" : "border border-line"
          }`}
        >
          Listede yok — özel ürün
        </button>
      </div>

      <select
        value={seciliKat}
        onChange={(e) => setKategoriId(e.target.value)}
        className="w-full rounded-xl border border-line px-3 py-2 text-sm sm:max-w-xs"
      >
        {kategoriler.map((k) => (
          <option key={k.id} value={k.id}>
            {k.ad}
          </option>
        ))}
      </select>

      {mod === "katalog" ? (
        tikModu && tipHavuzu ? (
          <div className="space-y-3">
            <p className="text-xs text-muted">
              İşletme tipinizin ürün havuzu — tikleyerek menüye ekleyin, tiki kaldırarak çıkarın.
            </p>
            <UrunHavuzuSecici
              havuzIds={tipHavuzu}
              seciliIds={menudekiKatalogIds!}
              onToggle={toggleHavuz}
              onTumunuSec={() => {
                for (const id of tipHavuzu) {
                  if (!menudekiKatalogIds!.has(id)) {
                    const u = katalogUrunBul(id);
                    if (u) onKatalogUrun(u, seciliKat);
                  }
                }
              }}
              onHicbiri={() => {
                for (const id of tipHavuzu) {
                  if (menudekiKatalogIds!.has(id)) onKatalogKaldir!(id);
                }
              }}
            />
            <div className="mt-4 border-t border-line pt-4">
              <h3 className="text-sm font-semibold">Listede olmayan ürün</h3>
              <p className="mt-1 text-xs text-muted">
                Katalogda yoksa ad ve fiyat yazıp ekleyin — havuzdaki ürünlerle birlikte menüde yer alır.
              </p>
              {menudekiOzelUrunler && onOzelKaldir ? (
                <OzelUrunListesi urunler={menudekiOzelUrunler} onKaldir={onOzelKaldir} />
              ) : null}
              <div className="mt-3">
                <OzelUrunEkleForm compact onEkle={ozelEkleTaslak} />
              </div>
            </div>
          </div>
        ) : (
        <div className="space-y-3">
          <input
            value={ara}
            onChange={(e) => setAra(e.target.value)}
            placeholder="Katalogda ara (217+ ürün)…"
            className="w-full rounded-xl border border-line px-3 py-2 text-sm"
          />
          <p className="text-xs text-muted">
            {isletmeTipi
              ? "Önce işletme tipinize uygun ürünler gösterilir. Arama tüm kataloğu tarar."
              : "Sofra kataloğundan ürün seçin — fiyat ve görsel otomatik gelir."}
          </p>
          <ul className="max-h-72 space-y-1 overflow-y-auto rounded-xl border border-line p-2">
            {sonuclar.length === 0 ? (
              <li className="px-2 py-4 text-center text-sm text-muted">
                Sonuç yok —{" "}
                <button type="button" className="text-brand underline" onClick={() => setMod("ozel")}>
                  özel ürün ekleyin
                </button>
              </li>
            ) : (
              sonuclar.map((u) => {
                const g = urunGorselBul(u.gorselId);
                return (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => katalogSec(u)}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-brand/5"
                    >
                      {g ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={g.yol} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-line/30" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">{u.ad}</span>
                        <span className="text-xs text-muted">
                          {u.fiyat} ₺ · {etiketAd(u.kategoriEtiket)}
                        </span>
                      </span>
                      <span className="text-xs text-brand">Ekle</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
        )
      ) : (
        <OzelUrunEkleForm
          onEkle={(t) => {
            if (seciliKat) onOzelUrun(t, seciliKat);
          }}
        />
      )}
    </div>
  );
}

/** Katalog kaydından işletme ürünü oluşturur. */
export function urunFromKatalog(k: KatalogUrun, kategoriId: string, id: string): Urun {
  const gorsel = urunGorselBul(k.gorselId) ?? urunGorselOner(k.ad);
  const temel: Urun = {
    id,
    kategoriId,
    katalogId: k.id,
    ad: k.ad,
    fiyat: k.fiyat,
    aciklama: k.aciklama || "",
    stokTakibi: false,
    kalanAdet: 0,
    kritikSeviye: 5,
    aktif: true,
    gorselUrl: gorsel?.yol ?? null,
    gorselKaynak: gorsel ? "hazir" : null,
  };
  return uruneSecenekleriIsle(temel);
}

/** Özel (listede olmayan) ürün oluşturur. */
export function urunFromOzel(t: OzelUrunTaslak, kategoriId: string, id: string): Urun {
  let gorselUrl = t.gorselUrl;
  let gorselKaynak = t.gorselKaynak;
  if (!gorselUrl) {
    const oneri = urunGorselOner(t.ad);
    if (oneri) {
      gorselUrl = oneri.yol;
      gorselKaynak = "hazir";
    }
  }
  return uruneSecenekleriIsle({
    id,
    kategoriId,
    katalogId: null,
    ad: t.ad,
    fiyat: t.fiyat,
    aciklama: t.aciklama,
    stokTakibi: false,
    kalanAdet: 0,
    kritikSeviye: 5,
    aktif: true,
    gorselUrl,
    gorselUrlBaski: t.gorselUrlBaski ?? null,
    gorselKaynak,
  });
}

/** Katalog id ile aynı ürün zaten menüde mi? */
export function katalogUrunMenudeVar(urunler: Urun[], katalogId: string) {
  return urunler.some((u) => u.katalogId === katalogId);
}

export { katalogUrunBul };
