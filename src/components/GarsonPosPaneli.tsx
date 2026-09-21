"use client";

import { useMemo, useState } from "react";
import { formatTl } from "@/lib/abonelik";
import {
  adisyonKalan,
  type Masa,
  type OdemeKanal,
  type Siparis,
} from "@/lib/store";

type Props = {
  adisyon: Siparis;
  masalar: Masa[];
  digerAdisyonlar: Siparis[];
  disabled?: boolean;
  seciliKalemler: Record<string, boolean>;
  onIslem: (body: Record<string, unknown>) => Promise<boolean>;
};

export function GarsonPosPaneli({
  adisyon,
  masalar,
  digerAdisyonlar,
  disabled,
  seciliKalemler,
  onIslem,
}: Props) {
  const kalan = adisyonKalan(adisyon);
  const [bahsisOran, setBahsisOran] = useState(0);
  const [kismi, setKismi] = useState("");
  const [indirimYuzde, setIndirimYuzde] = useState(adisyon.indirimYuzde ? String(adisyon.indirimYuzde) : "");
  const [indirimTl, setIndirimTl] = useState(adisyon.indirimTl ? String(adisyon.indirimTl) : "");
  const [hedefMasa, setHedefMasa] = useState("");
  const [bolMasa, setBolMasa] = useState("");
  const [birlestirId, setBirlestirId] = useState("");

  const bahsis = useMemo(() => Math.round((kalan * bahsisOran) / 100), [kalan, bahsisOran]);
  const odenecek = kalan + bahsis;
  const digerMasalar = masalar.filter((m) => m.id !== adisyon.masaId);

  async function tamOde(kanal: OdemeKanal) {
    if (odenecek <= 0) return;
    await onIslem({
      kasa: { odemeler: [{ kanal, tutar: odenecek }], bahsis: bahsis || undefined },
    });
  }

  async function kismiOde(kanal: OdemeKanal) {
    const tutar = Math.round((Number(kismi) || 0) * 100) / 100;
    if (tutar <= 0) return;
    await onIslem({ kasa: { odemeler: [{ kanal, tutar }] } });
    setKismi("");
  }

  async function karisikOde() {
    const nakit = Math.round((Number(kismi) || 0) * 100) / 100;
    const kart = Math.round((odenecek - nakit) * 100) / 100;
    if (nakit <= 0 || kart <= 0) return;
    await onIslem({
      kasa: {
        odemeler: [
          { kanal: "nakit", tutar: nakit },
          { kanal: "kart-masa", tutar: kart },
        ],
        bahsis: bahsis || undefined,
      },
    });
    setKismi("");
  }

  const bolKalemler = adisyon.kalemler
    .filter((k) => seciliKalemler[k.urunId])
    .map((k) => ({ urunId: k.urunId, adet: k.adet }));

  return (
    <div className="space-y-4">
      {kalan > 0 ? (
        <section className="rounded-2xl border border-line bg-card p-4">
          <h3 className="font-semibold">Kasa</h3>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{formatTl(odenecek)}</p>
          <p className="text-xs text-muted">
            Kalan {formatTl(kalan)}
            {bahsis > 0 ? ` · bahşiş ${formatTl(bahsis)}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[0, 5, 10, 15].map((o) => (
              <button
                key={o}
                type="button"
                disabled={disabled}
                onClick={() => setBahsisOran(o)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  bahsisOran === o ? "bg-brand text-white" : "border border-line"
                }`}
              >
                {o === 0 ? "Bahşiş yok" : `%${o}`}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={disabled || odenecek <= 0}
              onClick={() => {
                if (confirm(`${formatTl(odenecek)} nakit — tüm kalan alınsın mı?`)) {
                  void tamOde("nakit");
                }
              }}
              className="rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Tümünü nakit al
            </button>
            <button
              type="button"
              disabled={disabled || odenecek <= 0}
              onClick={() => {
                if (confirm(`${formatTl(odenecek)} kart — tüm kalan alınsın mı?`)) {
                  void tamOde("kart-masa");
                }
              }}
              className="rounded-full border border-brand px-4 py-2.5 text-sm font-semibold text-brand disabled:opacity-50"
            >
              Tümünü kart al
            </button>
          </div>
          <div className="mt-4 rounded-2xl border border-dashed border-line p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Kısmi tahsilat</p>
            <p className="mt-1 text-[11px] text-muted">Önce tutarı yazın, sonra kanalı seçin. Adisyon açık kalır.</p>
            <input
              type="number"
              min="0"
              step="0.01"
              value={kismi}
              onChange={(e) => setKismi(e.target.value)}
              placeholder="Örn. 20"
              className="mt-2 w-full rounded-full border border-line px-3 py-2 text-sm"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={disabled || !kismi}
                onClick={() => kismiOde("nakit")}
                className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
              >
                {kismi ? `${formatTl(Number(kismi))} nakit al` : "Kısmi nakit"}
              </button>
              <button
                type="button"
                disabled={disabled || !kismi}
                onClick={() => kismiOde("kart-masa")}
                className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
              >
                {kismi ? `${formatTl(Number(kismi))} kart al` : "Kısmi kart"}
              </button>
              <button
                type="button"
                disabled={disabled || !kismi || Number(kismi) >= odenecek}
                onClick={karisikOde}
                className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
              >
                Karışık (bu nakit + kalan kart)
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-line bg-card p-4">
        <h3 className="font-semibold">İndirim</h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="text-xs text-muted">
            Yüzde
            <input
              type="number"
              min="0"
              max="100"
              value={indirimYuzde}
              onChange={(e) => setIndirimYuzde(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="text-xs text-muted">
            Tutar (₺)
            <input
              type="number"
              min="0"
              value={indirimTl}
              onChange={(e) => setIndirimTl(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm text-foreground"
            />
          </label>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {[10, 20, 50].map((y) => (
            <button
              key={y}
              type="button"
              disabled={disabled}
              onClick={() => setIndirimYuzde(String(y))}
              className="rounded-full border border-line px-3 py-1 text-xs"
            >
              %{y}
            </button>
          ))}
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              onIslem({
                indirim: {
                  yuzde: Number(indirimYuzde) || 0,
                  tl: Number(indirimTl) || 0,
                },
              })
            }
            className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            Uygula
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-card p-4">
        <h3 className="font-semibold">Masa taşı / böl / birleştir</h3>
        <div className="mt-3 flex gap-2">
          <select
            value={hedefMasa}
            onChange={(e) => setHedefMasa(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2 text-sm"
          >
            <option value="">Hedef masa</option>
            {digerMasalar.map((m) => (
              <option key={m.id} value={m.id}>
                {m.ad}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={disabled || !hedefMasa}
            onClick={() => onIslem({ tasi: { masaId: hedefMasa } })}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Taşı
          </button>
        </div>

        <p className="mt-4 text-xs text-muted">Kalem seçip yeni adisyona bölün.</p>
        <div className="mt-2 flex gap-2">
          <select
            value={bolMasa}
            onChange={(e) => setBolMasa(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2 text-sm"
          >
            <option value="">Bu masada yeni adisyon</option>
            {digerMasalar.map((m) => (
              <option key={m.id} value={m.id}>
                {m.ad}’e böl
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={disabled || bolKalemler.length === 0}
            onClick={() =>
              onIslem({
                bol: { kalemler: bolKalemler, masaId: bolMasa || undefined },
              })
            }
            className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand disabled:opacity-50"
          >
            Böl
          </button>
        </div>

        {digerAdisyonlar.length > 0 ? (
          <div className="mt-4 flex gap-2">
            <select
              value={birlestirId}
              onChange={(e) => setBirlestirId(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2 text-sm"
            >
              <option value="">Birleştirilecek adisyon</option>
              {digerAdisyonlar.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.masaAd} · {formatTl(adisyonKalan(s))}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={disabled || !birlestirId}
              onClick={() => onIslem({ birlestir: { kaynakSiparisId: birlestirId } })}
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Birleştir
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
