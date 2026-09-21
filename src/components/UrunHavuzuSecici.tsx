"use client";

import { useMemo, useState } from "react";
import { katalogUrunleriGetir, urunGorselBul, type KatalogUrun } from "@sofra/tema";
import { formatTl } from "@/lib/abonelik";

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
  kahvalti: "Kahvaltılar",
  omlet: "Yumurta & omlet",
  yan: "Yan ürünler",
  genel: "Diğer",
};

function etiketAd(id: string) {
  return KATEGORI_ETIKETLER[id] ?? id;
}

type Props = {
  havuzIds: string[];
  seciliIds: Set<string>;
  onToggle: (id: string) => void;
  onTumunuSec?: () => void;
  onHicbiri?: () => void;
  onVarsayilanaDon?: () => void;
  varsayilanSayisi?: number;
};

export function UrunHavuzuSecici({
  havuzIds,
  seciliIds,
  onToggle,
  onTumunuSec,
  onHicbiri,
  onVarsayilanaDon,
  varsayilanSayisi,
}: Props) {
  const [ara, setAra] = useState("");

  const urunler = useMemo(() => katalogUrunleriGetir(havuzIds), [havuzIds]);

  const filtreli = useMemo(() => {
    const q = ara.trim().toLowerCase();
    if (!q) return urunler;
    return urunler.filter(
      (u) =>
        u.ad.toLowerCase().includes(q) ||
        u.aciklama?.toLowerCase().includes(q) ||
        etiketAd(u.kategoriEtiket).toLowerCase().includes(q),
    );
  }, [urunler, ara]);

  const gruplar = useMemo(() => {
    const map = new Map<string, KatalogUrun[]>();
    for (const u of filtreli) {
      const key = u.kategoriEtiket;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(u);
    }
    return [...map.entries()].sort(([a], [b]) => etiketAd(a).localeCompare(etiketAd(b), "tr"));
  }, [filtreli]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={ara}
          onChange={(e) => setAra(e.target.value)}
          placeholder="Havuzda ara…"
          className="min-w-[200px] flex-1 rounded-xl border border-line px-3 py-2 text-sm"
        />
        {onTumunuSec ? (
          <button
            type="button"
            onClick={onTumunuSec}
            className="rounded-full border border-line px-3 py-1.5 text-xs font-medium hover:border-brand/40"
          >
            Tümünü seç
          </button>
        ) : null}
        {onHicbiri ? (
          <button
            type="button"
            onClick={onHicbiri}
            className="rounded-full border border-line px-3 py-1.5 text-xs font-medium hover:border-brand/40"
          >
            Tümünü kaldır
          </button>
        ) : null}
        {onVarsayilanaDon ? (
          <button
            type="button"
            onClick={onVarsayilanaDon}
            className="rounded-full border border-brand/30 bg-brand/5 px-3 py-1.5 text-xs font-medium text-brand-dark hover:border-brand/50"
          >
            Varsayılana dön{varsayilanSayisi ? ` (${varsayilanSayisi})` : ""}
          </button>
        ) : null}
      </div>

      <p className="text-xs text-muted">
        {seciliIds.size} / {havuzIds.length} ürün seçili — tikleyerek ekleyin, tiki kaldırarak çıkarın.
      </p>

      <div className="max-h-[28rem] space-y-4 overflow-y-auto rounded-xl border border-line p-3">
        {gruplar.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">Sonuç bulunamadı.</p>
        ) : (
          gruplar.map(([kat, liste]) => (
            <div key={kat}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                {etiketAd(kat)} ({liste.filter((u) => seciliIds.has(u.id)).length}/{liste.length})
              </p>
              <ul className="space-y-1">
                {liste.map((u) => {
                  const secili = seciliIds.has(u.id);
                  const g = urunGorselBul(u.gorselId);
                  return (
                    <li key={u.id}>
                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition ${
                          secili ? "bg-brand/10 ring-1 ring-brand/20" : "hover:bg-line/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={secili}
                          onChange={() => onToggle(u.id)}
                          className="h-4 w-4 shrink-0 accent-brand"
                        />
                        {g ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={g.yol} alt="" className="h-9 w-9 rounded-lg object-cover" />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-line/30" />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">{u.ad}</span>
                          <span className="text-xs text-muted">{formatTl(u.fiyat)}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
