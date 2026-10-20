"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MENU_DUZENLER, katalog, kategorileriGetir, sablonlariGetir } from "@sofra/tema";
import { PlanUyariBanner } from "@/components/PlanKilit";
import { IsletmeMarkaAyarlari } from "@/components/IsletmeMarkaAyarlari";
import { PanelKvkkAyarlari } from "@/components/PanelKvkkAyarlari";
import { useIsletme } from "@/lib/useIsletme";
import { efektifPlanId, ozellikAcikMi, sablonAcikMi } from "@/lib/plan-kilit";
import { varsayilanParaBirimiAyarlari } from "@/lib/para-birimi";
import { TEMA_PALETLERI, paletUygula } from "@/lib/tema-paletleri";

export default function PanelAyarlarPage() {
  const { isletme, kaydet } = useIsletme();
  const kategoriler = useMemo(() => kategorileriGetir(), []);
  if (!isletme) return null;

  const planId = efektifPlanId(isletme);
  const tamTasarim = ozellikAcikMi(planId, "tamTasarim");
  const tema = isletme.tema;
  const sablon = katalog.sablonlar.find((s) => s.id === tema.sablonId);
  const para = isletme.paraBirimi ?? varsayilanParaBirimiAyarlari();

  function paraKaydet(patch: Partial<typeof para>) {
    kaydet({
      ...isletme!,
      paraBirimi: { ...para, ...patch },
    });
  }

  function patch(p: Partial<typeof tema>) {
    kaydet({ ...isletme!, tema: { ...isletme!.tema, ...p } });
  }

  function sablonSec(id: string) {
    if (!sablonAcikMi(planId, id)) return;
    const s = katalog.sablonlar.find((x) => x.id === id);
    if (!s) return;
    const v = s.varsayilanlar;
    patch({
      sablonId: id,
      anaRenk: v.anaRenk,
      vurguRengi: v.vurguRengi,
      metinRengi: v.metinRengi,
      zeminRengi: v.zeminRengi,
      zeminStili: v.zeminStili,
      kose: v.kose,
      fontPaketId: v.fontPaketi,
      cerceveId: v.cerceve,
      desenId: v.desen,
      duzenId: s.duzen,
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-baslik)] text-3xl font-semibold">Ayarlar</h1>
        <p className="mt-1 text-muted">
          İşletme bilgileri, menü şablonu ve görünüm — hepsi burada.
        </p>
      </div>

      {!tamTasarim ? (
        <PlanUyariBanner
          mevcutPlan={planId}
          mesaj="Ücretsiz planda yalnızca ana renk ve 5 şablon kullanılabilir."
        />
      ) : null}

      <section className="rounded-2xl border border-line bg-card p-5">
        <h2 className="font-semibold">İşletme</h2>
        <p className="mt-1 text-sm text-muted">Ad, logo ve marka bilgileri</p>
        <div className="mt-4">
          <IsletmeMarkaAyarlari isletme={isletme} onKaydet={(sonraki) => kaydet(sonraki)} />
        </div>
      </section>

      <PanelKvkkAyarlari isletme={isletme} onKaydet={(sonraki) => kaydet(sonraki)} />

      <section className="rounded-2xl border border-line bg-card p-5">
        <h2 className="font-semibold">Para birimi</h2>
        <p className="mt-1 text-sm text-muted">
          Ürün fiyatları TL olarak girilir. USD/EUR gösteriminde kur elle güncellenir.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={para.usdAktif}
              onChange={(e) => paraKaydet({ usdAktif: e.target.checked })}
            />
            USD gösterimi (müşteri menüsünde seçilebilir)
          </label>
          <label className="block text-sm">
            1 USD = ? TRY
            <input
              type="number"
              min={0.01}
              step={0.01}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2"
              value={para.usdKur}
              disabled={!para.usdAktif}
              onChange={(e) => paraKaydet({ usdKur: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={para.eurAktif}
              onChange={(e) => paraKaydet({ eurAktif: e.target.checked })}
            />
            EUR gösterimi
          </label>
          <label className="block text-sm">
            1 EUR = ? TRY
            <input
              type="number"
              min={0.01}
              step={0.01}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2"
              value={para.eurKur}
              disabled={!para.eurAktif}
              onChange={(e) => paraKaydet({ eurKur: Number(e.target.value) || 0 })}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-card p-5">
        <h2 className="font-semibold">Hazır renk paletleri</h2>
        <p className="mt-1 text-sm text-muted">
          Şablonunuzu korur; yalnızca ana renk, zemin ve metin tonlarını günceller.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {TEMA_PALETLERI.map((p) => {
            const secili = (tema.paletId ?? "varsayilan") === p.id || (!tema.paletId && p.id === "varsayilan");
            const ornek = p.patch.zeminRengi ?? tema.zeminRengi;
            const vurgu = p.patch.anaRenk ?? tema.anaRenk;
            return (
              <button
                key={p.id}
                type="button"
                disabled={!tamTasarim && p.id !== "varsayilan"}
                onClick={() => kaydet({ ...isletme!, tema: paletUygula(tema, p.id) })}
                className={`rounded-xl border p-3 text-left transition ${
                  secili ? "border-brand ring-1 ring-brand/30" : "border-line hover:border-brand/40"
                } disabled:opacity-50`}
              >
                <div className="flex gap-3">
                  <div
                    className="h-12 w-12 shrink-0 rounded-lg border border-black/10"
                    style={{
                      background: `linear-gradient(135deg, ${ornek} 50%, ${vurgu} 50%)`,
                    }}
                  />
                  <div>
                    <p className="font-medium text-sm">{p.ad}</p>
                    <p className="mt-0.5 text-xs text-muted">{p.aciklama}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-card p-5">
        <h2 className="font-semibold">Şablon seçimi</h2>
        <p className="mt-1 text-sm text-muted">
          Aktif: <strong>{sablon?.ad ?? tema.sablonId}</strong>
        </p>
        <div className="mt-4 space-y-4">
          {kategoriler.map((k) => (
            <div key={k.id}>
              <p className="mb-2 text-xs uppercase tracking-wide text-muted">{k.ad}</p>
              <div className="flex flex-wrap gap-2">
                {sablonlariGetir(k.id).map((s) => {
                  const acik = sablonAcikMi(planId, s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={!acik}
                      onClick={() => sablonSec(s.id)}
                      className={`rounded-full px-3 py-1.5 text-xs ${
                        tema.sablonId === s.id
                          ? "bg-brand text-white"
                          : acik
                            ? "border border-line hover:border-brand/40"
                            : "border border-dashed border-line opacity-50"
                      }`}
                      title={acik ? s.ad : `${s.ad} — Menü planı gerekli`}
                    >
                      {acik ? s.ad : `🔒 ${s.ad}`}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div
        className="rounded-2xl border p-6"
        style={{
          background: tema.zeminRengi,
          color: tema.metinRengi,
          borderColor: tema.anaRenk + "44",
          borderRadius: tema.kose,
        }}
      >
        <p className="text-xs uppercase tracking-wide opacity-60">Önizleme</p>
        {isletme.logoUrl ? (
          <div className="mt-3 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={isletme.logoUrl}
              alt=""
              className="max-h-14 max-w-[160px] object-contain"
            />
          </div>
        ) : null}
        <h2 className="mt-2 text-2xl font-semibold" style={{ color: tema.anaRenk }}>
          {isletme.kafeAdi}
        </h2>
        <p className="mt-1 text-sm opacity-70">
          {sablon?.ad ?? tema.sablonId} ·{" "}
          {katalog.fontPaketleri.find((f) => f.id === tema.fontPaketId)?.etiket}
        </p>
        <div
          className="mt-4 border p-3"
          style={{
            borderColor: tema.anaRenk + "55",
            borderRadius: tema.kose,
            borderWidth: tema.cerceveId === "bold" ? 3 : tema.cerceveId === "none" ? 0 : 1,
          }}
        >
          <span className="font-medium">Örnek ürün</span>
          <span className="float-right font-medium" style={{ color: tema.vurguRengi }}>
            90 TL
          </span>
        </div>
      </div>

      <section className="grid gap-4 rounded-2xl border border-line bg-card p-5 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">Görünüm ince ayar</h2>
        <label className="block text-sm">
          Menü düzeni
          <select
            className="mt-1 w-full rounded-xl border border-line px-3 py-2 disabled:opacity-50"
            value={tema.duzenId ?? sablon?.duzen ?? "list"}
            disabled={!tamTasarim}
            onChange={(e) => patch({ duzenId: e.target.value })}
          >
            {MENU_DUZENLER.map((d) => (
              <option key={d} value={d}>
                {katalog.duzenEtiketleri[d]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Font paketi
          <select
            className="mt-1 w-full rounded-xl border border-line px-3 py-2 disabled:opacity-50"
            value={tema.fontPaketId}
            disabled={!tamTasarim}
            onChange={(e) => patch({ fontPaketId: e.target.value })}
          >
            {katalog.fontPaketleri.map((f) => (
              <option key={f.id} value={f.id}>
                {f.etiket}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Çerçeve
          <select
            className="mt-1 w-full rounded-xl border border-line px-3 py-2 disabled:opacity-50"
            value={tema.cerceveId}
            disabled={!tamTasarim}
            onChange={(e) => patch({ cerceveId: e.target.value })}
          >
            {katalog.cerceveler.map((c) => (
              <option key={c.id} value={c.id}>
                {c.etiket}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Zemin stili
          <select
            className="mt-1 w-full rounded-xl border border-line px-3 py-2 disabled:opacity-50"
            value={tema.zeminStili}
            disabled={!tamTasarim}
            onChange={(e) => patch({ zeminStili: e.target.value })}
          >
            {katalog.zeminStilleri.map((z) => (
              <option key={z.id} value={z.id}>
                {z.etiket}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Desen
          <select
            className="mt-1 w-full rounded-xl border border-line px-3 py-2 disabled:opacity-50"
            value={tema.desenId}
            disabled={!tamTasarim}
            onChange={(e) => patch({ desenId: e.target.value })}
          >
            {katalog.desenler.map((d) => (
              <option key={d.id} value={d.id}>
                {d.etiket}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Ana renk
          <input
            type="color"
            className="mt-1 h-10 w-full cursor-pointer rounded-xl border border-line"
            value={tema.anaRenk}
            onChange={(e) => patch({ anaRenk: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Vurgu rengi
          <input
            type="color"
            className="mt-1 h-10 w-full cursor-pointer rounded-xl border border-line disabled:opacity-50"
            value={tema.vurguRengi}
            disabled={!tamTasarim}
            onChange={(e) => patch({ vurguRengi: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Zemin rengi
          <input
            type="color"
            className="mt-1 h-10 w-full cursor-pointer rounded-xl border border-line disabled:opacity-50"
            value={tema.zeminRengi}
            disabled={!tamTasarim}
            onChange={(e) => patch({ zeminRengi: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Köşe yuvarlaklığı
          <select
            className="mt-1 w-full rounded-xl border border-line px-3 py-2 disabled:opacity-50"
            value={tema.kose}
            disabled={!tamTasarim}
            onChange={(e) => patch({ kose: Number(e.target.value) })}
          >
            {katalog.koseYuvarlaklari.map((k) => (
              <option key={k.id} value={k.id}>
                {k.etiket}
              </option>
            ))}
          </select>
        </label>
      </section>

      {!tamTasarim ? (
        <p className="text-center text-sm text-muted">
          Tam tasarım için{" "}
          <Link href="/panel/abonelik" className="text-brand underline">
            Menü planına
          </Link>{" "}
          geçin.
        </p>
      ) : null}
    </div>
  );
}
