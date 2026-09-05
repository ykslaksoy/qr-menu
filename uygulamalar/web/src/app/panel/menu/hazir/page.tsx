"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  isletmeTipBul,
  isletmeTipleriniGetir,
  katalogUrunleriGetir,
  menuBoyutlariniGetir,
  toplamUrunKatalogu,
  urunGorselBul,
  varsayilanMenuBoyutId,
} from "@sofra/tema";
import { UrunHavuzuSecici } from "@/components/UrunHavuzuSecici";
import { OzelUrunEkleForm } from "@/components/OzelUrunEkleForm";
import { useIsletme } from "@/lib/useIsletme";
import {
  hazirMenuUygulaSecili,
  seciliIdsSablonu,
} from "@/lib/hazir-menu";
import { formatTl } from "@/lib/abonelik";
import type { OzelUrunTaslak } from "@/components/KatalogVeOzelUrunEkle";

export default function HazirMenuPage() {
  const { isletme, kaydet } = useIsletme();
  const tipler = isletmeTipleriniGetir();
  const boyutlar = menuBoyutlariniGetir();
  const katalogToplam = toplamUrunKatalogu().length;

  const [tipId, setTipId] = useState(isletme?.isletmeTipi ?? "kafe");
  const [boyutId, setBoyutId] = useState(
    isletme?.menuBoyutId ?? isletmeTipBul(tipId)?.varsayilanBoyut ?? varsayilanMenuBoyutId(),
  );
  const [seciliUrunIds, setSeciliUrunIds] = useState<Set<string>>(() => new Set());
  const [ekleModu, setEkleModu] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [uygulaniyor, setUygulaniyor] = useState(false);
  const [ozelUrunler, setOzelUrunler] = useState<OzelUrunTaslak[]>([]);

  const seciliTip = isletmeTipBul(tipId);
  const varsayilanMi = boyutId === (seciliTip?.varsayilanBoyut ?? varsayilanMenuBoyutId());
  const havuzIds = seciliTip?.urunIds ?? [];

  useEffect(() => {
    setSeciliUrunIds(new Set(seciliIdsSablonu(tipId, boyutId)));
  }, [tipId, boyutId]);

  const seciliSirali = useMemo(() => {
    if (!seciliTip) return [];
    return katalogUrunleriGetir(seciliTip.urunIds.filter((id) => seciliUrunIds.has(id)));
  }, [seciliTip, seciliUrunIds]);

  if (!isletme) return null;

  function tipSec(id: string) {
    setTipId(id);
    const tip = isletmeTipBul(id);
    setBoyutId(tip?.varsayilanBoyut ?? varsayilanMenuBoyutId());
    setMesaj("");
  }

  function toggleUrun(id: string) {
    setSeciliUrunIds((onceki) => {
      const sonraki = new Set(onceki);
      if (sonraki.has(id)) sonraki.delete(id);
      else sonraki.add(id);
      return sonraki;
    });
  }

  function varsayilanaDon() {
    setSeciliUrunIds(new Set(seciliIdsSablonu(tipId, boyutId)));
  }

  async function uygula() {
    if (!isletme || !seciliTip) return;
    if (seciliSirali.length === 0 && ozelUrunler.length === 0) {
      setMesaj("En az bir katalog veya özel ürün seçin.");
      return;
    }
    const toplam = seciliSirali.length + ozelUrunler.length;
    const onay = ekleModu
      ? true
      : window.confirm(
          `Mevcut menü (${isletme.urunler.length} ürün) silinip ${toplam} ürünlük menü yazılacak. Devam?`,
        );
    if (!onay) return;

    setUygulaniyor(true);
    const siraliIds = seciliTip.urunIds.filter((id) => seciliUrunIds.has(id));
    const sonraki = hazirMenuUygulaSecili(isletme, tipId, siraliIds, {
      mevcutuKoruyarakEkle: ekleModu,
      ozelUrunler,
    });
    await kaydet(sonraki);
    setUygulaniyor(false);
    setOzelUrunler([]);
    setMesaj(
      ekleModu
        ? `${toplam} ürün mevcut menüye eklendi.`
        : `${seciliTip.ad} menüsü oluşturuldu (${toplam} ürün).`,
    );
  }

  function ozelUrunEkle(taslak: OzelUrunTaslak) {
    setOzelUrunler((onceki) => [...onceki, taslak]);
  }

  function ozelUrunKaldir(index: number) {
    setOzelUrunler((onceki) => onceki.filter((_, i) => i !== index));
  }

  const varsayilanAdet = seciliIdsSablonu(tipId, boyutId).length;
  const menuHazir = seciliSirali.length > 0 || ozelUrunler.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted">
          <Link href="/panel/veri-girisi" className="text-brand underline">
            ← Veri girişi
          </Link>
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-baslik)] text-3xl font-semibold">
          Hazır menü oluştur
        </h1>
        <p className="mt-1 text-muted">
          Tip seçin, ürünleri tikleyerek menünüzü oluşturun. Toplam katalog: {katalogToplam} ürün.
        </p>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">1. İşletme tipi</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tipler.map((t) => {
            const secili = tipId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => tipSec(t.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  secili
                    ? "border-brand bg-brand/5 ring-2 ring-brand/25"
                    : "border-line bg-card hover:border-brand/40"
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {t.ikon}
                </span>
                <p className="mt-2 font-semibold">{t.ad}</p>
                <p className="mt-0.5 text-xs text-muted">{t.aciklama}</p>
                <p className="mt-2 text-xs text-muted">
                  {t.urunIds.length} ürün havuzu · varsayılan {t.varsayilanMenuIds.length} ürün
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">2. Başlangıç şablonu</h2>
        <p className="mt-1 text-sm text-muted">
          Boyut seçince liste otomatik dolar; sonra istediğinizi tikleyerek ekleyip çıkarabilirsiniz.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {boyutlar.map((b) => {
            const secili = boyutId === b.id;
            const varsayilan = b.id === (seciliTip?.varsayilanBoyut ?? varsayilanMenuBoyutId());
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setBoyutId(b.id)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  secili
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-card hover:border-brand/40"
                }`}
              >
                <p className="text-sm font-semibold">
                  {b.ad}
                  {varsayilan ? (
                    <span
                      className={`ml-1 text-xs font-normal ${secili ? "text-white/80" : "text-brand"}`}
                    >
                      (varsayılan)
                    </span>
                  ) : null}
                </p>
                <p className={`text-xs ${secili ? "text-white/80" : "text-muted"}`}>
                  {b.aciklama} · {b.adet} ürün
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {seciliTip ? (
        <section className="rounded-2xl border border-line bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            3. Ürün seçimi — {seciliTip.ad}
          </h2>
          <UrunHavuzuSecici
            havuzIds={havuzIds}
            seciliIds={seciliUrunIds}
            onToggle={toggleUrun}
            onTumunuSec={() => setSeciliUrunIds(new Set(havuzIds))}
            onHicbiri={() => setSeciliUrunIds(new Set())}
            onVarsayilanaDon={varsayilanaDon}
            varsayilanSayisi={varsayilanAdet}
          />

          <div className="mt-6 border-t border-line pt-4">
            <h3 className="text-sm font-semibold">Listede olmayan ürün</h3>
            <p className="mt-1 text-xs text-muted">
              Katalogda yoksa buradan ekleyin — tiklediğiniz ürünlerle birlikte menüye yazılır.
            </p>
            {ozelUrunler.length > 0 ? (
              <ul className="mt-3 space-y-1">
                {ozelUrunler.map((u, i) => (
                  <li
                    key={`${u.ad}-${i}`}
                    className="flex items-center justify-between rounded-lg border border-amber-200/80 bg-amber-50/50 px-3 py-2 text-sm"
                  >
                    <span>
                      {u.ad} · {formatTl(u.fiyat)}{" "}
                      <span className="text-xs text-amber-800">(özel)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => ozelUrunKaldir(i)}
                      className="text-xs text-red-700"
                    >
                      Çıkar
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-3">
              <OzelUrunEkleForm compact onEkle={ozelUrunEkle} />
            </div>
          </div>
        </section>
      ) : null}

      {menuHazir ? (
        <section className="rounded-2xl border border-line bg-card p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-semibold">
                Seçilen menü — {seciliTip?.ad}
                {varsayilanMi ? " (varsayılan şablon)" : ""}
              </h2>
              <p className="text-sm text-muted">
                {seciliSirali.length} ürün
                {ozelUrunler.length > 0 ? ` + ${ozelUrunler.length} özel` : ""}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={ekleModu}
                onChange={(e) => setEkleModu(e.target.checked)}
              />
              Mevcut menüyü silme, üzerine ekle
            </label>
          </div>

          <UrunGrid urunler={seciliSirali} />

          {ozelUrunler.length > 0 ? (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Özel ürünler ({ozelUrunler.length})
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {ozelUrunler.map((u, i) => (
                  <li
                    key={`${u.ad}-${i}`}
                    className="flex items-center justify-between rounded-xl border border-amber-200/80 bg-amber-50/50 px-3 py-2 text-sm"
                  >
                    <span>
                      {u.ad} · {formatTl(u.fiyat)}
                    </span>
                    <span className="text-xs text-amber-800">özel</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={uygula}
              disabled={uygulaniyor}
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {uygulaniyor ? "Oluşturuluyor…" : "Menüyü oluştur"}
            </button>
            <Link
              href="/panel/menu"
              className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold"
            >
              Elle düzenle
            </Link>
          </div>
          {mesaj ? <p className="mt-3 text-sm text-emerald-700">{mesaj}</p> : null}
        </section>
      ) : (
        <p className="text-sm text-muted">
          Menüye eklemek için havuzdan ürün seçin veya listede olmayan özel ürün ekleyin.
        </p>
      )}
    </div>
  );
}

function UrunGrid({
  urunler,
}: {
  urunler: { ad: string; fiyat: number; gorselId: string; id?: string }[];
}) {
  return (
    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
      {urunler.map((u) => {
        const g = urunGorselBul(u.gorselId);
        return (
          <li
            key={u.id ?? u.ad}
            className="flex items-center gap-3 rounded-xl border border-line/80 bg-background/50 px-3 py-2"
          >
            {g ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={g.yol} alt="" className="h-10 w-10 rounded-lg object-cover" />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{u.ad}</p>
              <p className="text-xs text-muted">{formatTl(u.fiyat)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
