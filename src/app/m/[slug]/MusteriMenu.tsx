"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { MenuUrunKarti } from "@/components/MenuUrunKarti";
import { MenuReferansKaydet } from "@/components/MenuReferansKaydet";
import { UrunSecenekModal } from "@/components/UrunSecenekModal";
import { UrunDetayModal } from "@/components/UrunDetayModal";
import { HesapOdemeModal } from "@/components/HesapOdemeModal";
import { DilSecici } from "@/components/DilSecici";
import { formatTl } from "@/lib/abonelik";
import { MenuFiligran } from "@/components/MenuFiligran";
import { urunuZenginlestir } from "@/lib/urun-secenekleri";
import { useSiraliFotoCanli } from "@/lib/use-sirali-foto-canli";
import { FILTRE_ALERJENLER, urunAlerjenIceriyorMu, alerjenRozet } from "@/lib/alerjen-etiketleri";
import {
  MUSTERI_DUZENLER,
  duzenListeSinifi,
  kartDuzen,
  temaDuzen,
  temaSablonIle,
  type MenuDuzen,
} from "@/lib/menu-duzen";
import {
  dilRtlMi,
  kategoriCevir,
  masaEtiket,
  uiMetin,
  urunAciklamaGoster,
  urunAdiGoster,
  alerjenKisaCevir,
  type MenuDil,
} from "@/lib/menu-dil";
import { urunTukendiMi, type Kategori, type Masa, type PlanId, type SiparisKalemi, type TemaAyar, type Urun } from "@/lib/store";

type MenuVeri = {
  slug: string;
  kafeAdi: string;
  logoUrl?: string | null;
  kapakUrl?: string | null;
  kategoriler: Kategori[];
  urunler: Urun[];
  masalar: Masa[];
  tema: TemaAyar;
  planId?: PlanId;
  filigran?: boolean;
  siparisAcik?: boolean;
  adetAlti?: {
    aktif: boolean;
    limit: number;
    kullanilan: number;
    kalan: number;
    limitAsildi: boolean;
    hediyeAcik: boolean;
  };
};

export type { MenuVeri };

type ClientProps = {
  baslangicMenu?: MenuVeri | null;
  baslangicHata?: string;
};

export default function MusteriMenuClient({
  baslangicMenu = null,
  baslangicHata = "",
}: ClientProps) {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = params.slug;
  const masaParam = searchParams.get("masa") ?? "1";
  // /m/demo (no query) still uses default masa "1" for display — enable siparis
  // unless explicitly disabled with ?siparis=0
  const siparisIstegi =
    searchParams.get("siparis") !== "0" &&
    (searchParams.get("siparis") === "1" || Boolean(masaParam));

  const [menu, setMenu] = useState<MenuVeri | null>(baslangicMenu);
  const [hata, setHata] = useState(baslangicHata);
  const [sepet, setSepet] = useState<SiparisKalemi[]>([]);
  const [mesaj, setMesaj] = useState("");
  const [aktifKategoriId, setAktifKategoriId] = useState<string | null>(null);
  const [onayAcik, setOnayAcik] = useState(false);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [secenekUrun, setSecenekUrun] = useState<Urun | null>(null);
  const [detayUrun, setDetayUrun] = useState<Urun | null>(null);
  const [dil, setDil] = useState<MenuDil>("tr");
  const [cagriGonderiliyor, setCagriGonderiliyor] = useState(false);
  const [hesapAcik, setHesapAcik] = useState(false);
  const [haricAlerjenler, setHaricAlerjenler] = useState<string[]>([]);
  const [ara, setAra] = useState("");
  const [duzenOverride, setDuzenOverride] = useState<MenuDuzen | null>(null);

  const yukle = useCallback(async () => {
    try {
      const yanit = await fetch(`/api/m/${slug}`);
      if (!yanit.ok) {
        if (!baslangicMenu) {
          setHata("Menü bulunamadı");
          setMenu(null);
        }
        return;
      }
      const veri = (await yanit.json()) as MenuVeri;
      setMenu({
        ...veri,
        urunler: (veri.urunler ?? []).map(urunuZenginlestir),
      });
      setHata("");
    } catch {
      if (!baslangicMenu) {
        setHata("Bağlantı hatası — sayfayı yenileyin.");
      }
    }
  }, [slug, baslangicMenu]);

  useEffect(() => {
    // SSR veri varken sessizce yenile; yoksa hemen yükle
    yukle();
  }, [yukle]);

  const siraliKategoriler = useMemo(() => {
    if (!menu) return [];
    const dolu = menu.kategoriler
      .filter((k) => menu.urunler.some((u) => u.kategoriId === k.id))
      .slice();

    const skor = (ad: string) => {
      const a = ad.toLocaleLowerCase("tr-TR");
      if (/atıştırmalık|atistirmalik|yemek|snack/.test(a)) return 0;
      if (/içecek|icecek|drink/.test(a)) return 1;
      if (/tatlı|tatli|dessert/.test(a)) return 2;
      return 50 + (dolu.find((k) => k.ad === ad)?.sira ?? 99);
    };

    return dolu.sort((a, b) => skor(a.ad) - skor(b.ad) || a.sira - b.sira);
  }, [menu]);

  useEffect(() => {
    if (!siraliKategoriler.length) {
      setAktifKategoriId(null);
      return;
    }
    setAktifKategoriId((onceki) =>
      onceki && siraliKategoriler.some((k) => k.id === onceki)
        ? onceki
        : siraliKategoriler[0]!.id,
    );
  }, [siraliKategoriler]);

  /** SSR + ilk boyama: effect beklemeden ilk kategori seçili olsun */
  const seciliKategoriId =
    (aktifKategoriId && siraliKategoriler.some((k) => k.id === aktifKategoriId)
      ? aktifKategoriId
      : null) ??
    siraliKategoriler[0]?.id ??
    null;

  const listeUrunler = useMemo(() => {
    if (!menu) return [];
    const q = ara.trim().toLocaleLowerCase("tr-TR");
    return menu.urunler.filter((u) => {
      if (!q && seciliKategoriId && u.kategoriId !== seciliKategoriId) return false;
      if (urunAlerjenIceriyorMu(u.alerjenler, haricAlerjenler)) return false;
      if (q) {
        const ad = urunAdiGoster(u, dil).toLocaleLowerCase("tr-TR");
        const acik = (urunAciklamaGoster(u, dil) ?? "").toLocaleLowerCase("tr-TR");
        if (!ad.includes(q) && !acik.includes(q)) return false;
      }
      return true;
    });
  }, [menu, seciliKategoriId, haricAlerjenler, ara, dil]);

  const listeUrunIds = useMemo(() => listeUrunler.map((u) => u.id), [listeUrunler]);
  const { canliId, gorunurlukBildir } = useSiraliFotoCanli(listeUrunIds, 3800);

  function alerjenFiltreToggle(ad: string) {
    setHaricAlerjenler((onceki) =>
      onceki.includes(ad) ? onceki.filter((x) => x !== ad) : [...onceki, ad],
    );
  }

  const masa = useMemo(() => {
    if (!menu) return null;
    return (
      menu.masalar.find(
        (m) => m.ad === masaParam || m.ad === `Masa ${masaParam}` || String(m.sira) === masaParam,
      ) ?? menu.masalar[0]
    );
  }, [menu, masaParam]);

  function kalemAnahtar(k: Pick<SiparisKalemi, "urunId" | "secenekIds" | "secenekOzet">) {
    const ids = (k.secenekIds ?? []).slice().sort().join(",");
    return `${k.urunId}::${ids || (k.secenekOzet ?? "")}`;
  }

  function sepeteEkle(urunId: string) {
    const u = menu?.urunler.find((x) => x.id === urunId);
    if (!u || urunTukendiMi(u)) return;
    if (u.secenekler?.length) {
      setSecenekUrun(u);
      return;
    }
    sepeteKalemEkle({ urunId: u.id, ad: u.ad, fiyat: u.fiyat, adet: 1 });
  }

  function sepeteKalemEkle(kalem: SiparisKalemi) {
    const anahtar = kalemAnahtar(kalem);
    setSepet((onceki) => {
      const mevcut = onceki.find((k) => kalemAnahtar(k) === anahtar);
      if (mevcut) {
        const guncel = { ...mevcut, adet: mevcut.adet + kalem.adet };
        return [guncel, ...onceki.filter((k) => kalemAnahtar(k) !== anahtar)];
      }
      return [kalem, ...onceki];
    });
    setMesaj("");
  }

  function sepettenAzaltKalem(kalem: SiparisKalemi) {
    const anahtar = kalemAnahtar(kalem);
    setSepet((onceki) => {
      const sonraki = onceki
        .map((k) => (kalemAnahtar(k) === anahtar ? { ...k, adet: k.adet - 1 } : k))
        .filter((k) => k.adet > 0);
      if (sonraki.length === 0) setOnayAcik(false);
      return sonraki;
    });
  }

  function sepeteArtirKalem(kalem: SiparisKalemi) {
    sepeteKalemEkle({ ...kalem, adet: 1 });
  }

  function sepettenAzalt(urunId: string) {
    const ilk = sepet.find((k) => k.urunId === urunId);
    if (ilk) sepettenAzaltKalem(ilk);
  }

  function sepettenSil(kalem: SiparisKalemi) {
    const anahtar = kalemAnahtar(kalem);
    setSepet((onceki) => {
      const sonraki = onceki.filter((k) => kalemAnahtar(k) !== anahtar);
      if (sonraki.length === 0) setOnayAcik(false);
      return sonraki;
    });
  }

  function sepetAdet(urunId: string) {
    return sepet.filter((k) => k.urunId === urunId).reduce((a, k) => a + k.adet, 0);
  }

  function onayAc() {
    if (!masa) {
      setMesaj("Masa bulunamadı — QR’ı tekrar okutun.");
      return;
    }
    if (sepet.length === 0) return;
    setMesaj("");
    setOnayAcik(true);
  }

  async function siparisGonder() {
    if (!masa || sepet.length === 0 || gonderiliyor) return;
    setGonderiliyor(true);
    setMesaj("");
    try {
      const yanit = await fetch(`/api/m/${slug}/siparis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masaId: masa.id, kalemler: sepet }),
      });
      const veri = (await yanit.json().catch(() => ({}))) as { hata?: string };
      if (!yanit.ok) {
        setMesaj(veri.hata ?? "Sipariş gönderilemedi");
        setGonderiliyor(false);
        return;
      }
      setSepet([]);
      setOnayAcik(false);
      setMesaj(
        dil === "en"
          ? "Order received — kitchen and waiter notified."
          : dil === "tr"
            ? "Siparişiniz alındı — mutfak ve garson ekranına düştü."
            : "✓",
      );
      yukle();
    } catch {
      setMesaj(dil === "en" ? "Connection error — try again." : "Bağlantı hatası — tekrar deneyin.");
    } finally {
      setGonderiliyor(false);
    }
  }

  async function cagriGonder(tur: "garson" | "hesap" | "su" | "pecete" | "ek-malzeme") {
    if (!masa || cagriGonderiliyor) return;
    setCagriGonderiliyor(true);
    setMesaj("");
    try {
      const apiTur = tur === "su" || tur === "pecete" || tur === "ek-malzeme" ? "garson" : tur;
      const yanit = await fetch(`/api/m/${slug}/siparis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masaId: masa.id, cagri: apiTur }),
      });
      const veri = (await yanit.json().catch(() => ({}))) as { hata?: string };
      if (!yanit.ok) {
        setMesaj(veri.hata ?? uiMetin("cagriHata", dil));
        return;
      }
      const mesajMap: Record<string, string> = {
        garson: uiMetin("garsonCagrildi", dil),
        hesap: uiMetin("hesapIstendi", dil),
        su: uiMetin("suIstendi", dil),
        pecete: uiMetin("peceteIstendi", dil),
        "ek-malzeme": uiMetin("ekMalzemeIstendi", dil),
      };
      setMesaj(mesajMap[tur] ?? uiMetin("garsonCagrildi", dil));
    } catch {
      setMesaj(uiMetin("cagriHata", dil));
    } finally {
      setCagriGonderiliyor(false);
    }
  }

  if (hata) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p>{hata}</p>
        <Link href="/kayit" className="mt-4 inline-block text-brand underline">
          Kayıt ol
        </Link>
      </div>
    );
  }

  if (!menu) {
    return <p className="p-8 text-sm opacity-60">Menü yükleniyor…</p>;
  }

  const sablonParam = searchParams.get("sablon");
  const duzenParam = searchParams.get("duzen");
  const tema = temaSablonIle(menu.tema, sablonParam);
  const sablonDuzenId = temaDuzen(tema);
  const duzen: MenuDuzen =
    duzenOverride ??
    (duzenParam === "list" ||
    duzenParam === "photo-grid" ||
    duzenParam === "editorial" ||
    duzenParam === "compact-list" ||
    duzenParam === "price-list" ||
    duzenParam === "photo-hero"
      ? duzenParam
      : sablonDuzenId);
  const izgara = duzen === "photo-grid" || duzen === "editorial";
  const kapakUrl =
    menu.kapakUrl ||
    (izgara || duzen === "photo-hero" ? "/gorseller/foto/kapak-cafe.jpg" : null);
  const kapakModu = Boolean(kapakUrl);
  const kafeAdi = menu.kafeAdi;
  const siparisModu = siparisIstegi && Boolean(menu.siparisAcik);
  const sepetToplam = sepet.reduce((a, k) => a + k.fiyat * k.adet, 0);
  const sepetAdetToplam = sepet.reduce((a, k) => a + k.adet, 0);
  const sepetAcik = siparisModu && sepet.length > 0;

  async function menuPaylas() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: kafeAdi, text: kafeAdi, url });
        return;
      }
    } catch {
      /* kullanıcı iptal */
    }
    try {
      await navigator.clipboard.writeText(url);
      /* sessiz kopyala — ortada toast gösterme */
    } catch {
      /* panoya yazılamadı; toast ile url göstermiyoruz */
    }
  }

  return (
    <div
      className="min-h-full px-4 pb-8"
      dir={dilRtlMi(dil) ? "rtl" : "ltr"}
      style={{
        background: tema.zeminRengi,
        color: tema.metinRengi,
        paddingTop: sepetAcik ? "0.5rem" : kapakModu ? "0.75rem" : "2rem",
      }}
    >
      <MenuReferansKaydet slug={slug} />

      {sepetAcik ? (
        <div
          className="fixed inset-x-0 top-0 z-30 border-b bg-white/98 px-3 py-2 shadow-md backdrop-blur"
          style={{ borderColor: tema.anaRenk + "33" }}
        >
          <div className="mx-auto max-w-md">
            <ul className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {sepet.map((k) => (
                <li
                  key={kalemAnahtar(k)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border bg-white px-2 py-1 text-sm shadow-sm"
                  style={{ borderColor: tema.anaRenk + "44" }}
                >
                  <span className="max-w-[9rem] truncate font-medium">
                    {k.ad}
                    {k.secenekOzet ? ` · ${k.secenekOzet}` : ""}
                  </span>
                  <button
                    type="button"
                    aria-label="Azalt"
                    onClick={() => sepettenAzaltKalem(k)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border text-base leading-none"
                    style={{ borderColor: tema.anaRenk + "66", color: tema.anaRenk }}
                  >
                    −
                  </button>
                  <span className="w-4 text-center text-xs font-semibold">{k.adet}</span>
                  <button
                    type="button"
                    aria-label="Artır"
                    onClick={() => sepeteArtirKalem(k)}
                    className="flex h-7 w-7 items-center justify-center rounded-full border text-base leading-none"
                    style={{ borderColor: tema.anaRenk + "66", color: tema.anaRenk }}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    aria-label="Sil"
                    onClick={() => sepettenSil(k)}
                    className="ml-0.5 text-[10px] opacity-55 underline"
                  >
                    Sil
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate text-sm">
                <span className="font-semibold">{formatTl(sepetToplam)}</span>
                <span className="opacity-60"> · {sepetAdetToplam} ürün</span>
              </p>
              <button
                type="button"
                onClick={onayAc}
                className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-white"
                style={{ background: tema.anaRenk }}
              >
                Gönder
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {onayAcik && sepet.length > 0 ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/45 p-3 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="siparis-onay-baslik"
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 shadow-xl"
            style={{ color: tema.metinRengi }}
          >
            <h2
              id="siparis-onay-baslik"
              className="font-[family-name:var(--font-baslik)] text-xl font-semibold"
            >
              Sipariş listenizi kontrol edin
            </h2>
            <p className="mt-1 text-sm opacity-70">
              {masa?.ad ?? "Masa"} · göndermeden önce listeyi onaylayın
            </p>
            <ul className="mt-4 divide-y divide-black/10">
              {sepet.map((k) => (
                <li key={kalemAnahtar(k)} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{k.ad}</p>
                    {k.secenekOzet ? (
                      <p className="truncate text-xs opacity-70">{k.secenekOzet}</p>
                    ) : null}
                    <p className="text-xs opacity-60">
                      {k.adet} × {formatTl(k.fiyat)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label="Azalt"
                      onClick={() => sepettenAzaltKalem(k)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border text-lg leading-none"
                      style={{ borderColor: tema.anaRenk + "66", color: tema.anaRenk }}
                    >
                      −
                    </button>
                    <span className="w-5 text-center font-semibold">{k.adet}</span>
                    <button
                      type="button"
                      aria-label="Artır"
                      onClick={() => sepeteArtirKalem(k)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border text-lg leading-none"
                      style={{ borderColor: tema.anaRenk + "66", color: tema.anaRenk }}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => sepettenSil(k)}
                      className="ml-1 text-xs opacity-60 underline"
                    >
                      Sil
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-lg font-semibold">{formatTl(sepetToplam)}</p>
            {mesaj ? <p className="mt-2 text-sm text-red-700">{mesaj}</p> : null}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={gonderiliyor}
                onClick={() => {
                  setOnayAcik(false);
                  setMesaj("");
                }}
                className="flex-1 rounded-full border px-4 py-3 text-sm font-semibold"
                style={{ borderColor: tema.anaRenk + "55" }}
              >
                Düzenle
              </button>
              <button
                type="button"
                disabled={gonderiliyor}
                onClick={siparisGonder}
                className="flex-1 rounded-full px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: tema.anaRenk }}
              >
                {gonderiliyor ? "Gönderiliyor…" : "Onayla ve gönder"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {mesaj && !onayAcik ? (
        <div className="fixed inset-x-0 bottom-4 z-30 mx-auto max-w-md px-4">
          <p
            className="rounded-2xl border bg-white/98 px-4 py-3 text-center text-sm font-medium shadow-lg"
            style={{ borderColor: tema.anaRenk + "44", color: tema.metinRengi }}
          >
            {mesaj}
          </p>
        </div>
      ) : null}

      <div
        className={`mx-auto ${izgara ? "max-w-lg" : "max-w-md"}`}
        style={{ paddingTop: sepetAcik ? "5.75rem" : undefined }}
      >
        {kapakModu ? (
          <header className="menu-kapak relative overflow-hidden rounded-[1.35rem] shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={kapakUrl!}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.62) 100%)",
              }}
              aria-hidden
            />
            <div className="relative z-10 flex min-h-[11.5rem] flex-col justify-between px-3.5 pb-3.5 pt-3">
              <div className="flex justify-end">
                <DilSecici
                  dil={dil}
                  onDegistir={setDil}
                  anaRenk={tema.anaRenk}
                  varyant="kapak"
                />
              </div>
              <div className="flex items-end gap-3">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/95 text-2xl font-semibold shadow-sm"
                  style={{ color: tema.anaRenk }}
                >
                  {menu.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={menu.logoUrl}
                      alt=""
                      className="h-10 w-10 object-contain"
                    />
                  ) : (
                    <span className="font-serif">{(menu.kafeAdi || "S").trim().charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1 pb-0.5 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85">
                    SOFRA
                  </p>
                  <h1 className="truncate font-serif text-[1.35rem] font-semibold leading-tight tracking-tight">
                    {menu.kafeAdi}
                  </h1>
                  {masa ? (
                    <p className="mt-0.5 text-sm text-white/85">{masaEtiket(masa.ad, dil)}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={menuPaylas}
                  aria-label={uiMetin("paylas", dil)}
                  className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/92 text-sm font-semibold text-stone-700 shadow-sm"
                >
                  i
                </button>
              </div>
            </div>
          </header>
        ) : (
          <header className="relative rounded-3xl px-4 pb-5 pt-6 text-center">
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl opacity-90"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, ${tema.anaRenk}22 0%, transparent 70%)`,
              }}
              aria-hidden
            />
            <div className="relative z-10">
              {menu.logoUrl ? (
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={menu.logoUrl}
                    alt={`${menu.kafeAdi} logosu`}
                    className="max-h-14 max-w-[180px] object-contain drop-shadow-sm"
                  />
                </div>
              ) : null}
              <h1
                className={`${
                  tema.fontPaketId === "editorial" || tema.fontPaketId === "klasik"
                    ? "font-serif"
                    : "font-[family-name:var(--font-baslik)]"
                } text-[1.85rem] font-semibold tracking-tight ${menu.logoUrl ? "mt-3" : ""}`}
                style={{ color: tema.anaRenk }}
              >
                {menu.kafeAdi}
              </h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm opacity-65">
                {masa ? <p>{masaEtiket(masa.ad, dil)}</p> : null}
                <DilSecici dil={dil} onDegistir={setDil} anaRenk={tema.anaRenk} />
                <button
                  type="button"
                  onClick={menuPaylas}
                  className="rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                  style={{ borderColor: tema.anaRenk + "55", color: tema.anaRenk }}
                >
                  {uiMetin("paylas", dil)}
                </button>
              </div>
            </div>
          </header>
        )}

        <div className="mt-3 flex items-center gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">{uiMetin("ara", dil)}</span>
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-40"
              aria-hidden
            >
              ⌕
            </span>
            <input
              type="search"
              value={ara}
              onChange={(e) => setAra(e.target.value)}
              placeholder={uiMetin("araPlaceholder", dil)}
              className="w-full rounded-full border py-2.5 pl-9 pr-3.5 text-sm outline-none"
              style={{
                borderColor: tema.anaRenk + "33",
                color: tema.metinRengi,
                background:
                  tema.zeminStili === "solid-dark"
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(255,255,255,0.92)",
              }}
            />
          </label>
          <div
            className="flex shrink-0 gap-1"
            role="group"
            aria-label={uiMetin("gorunum", dil)}
          >
            {MUSTERI_DUZENLER.map((d) => {
              const aktif = duzen === d;
              const etiket =
                d === "photo-grid"
                  ? uiMetin("duzenIzgara", dil)
                  : d === "editorial"
                    ? uiMetin("duzenDergi", dil)
                    : uiMetin("duzenListe", dil);
              const ikon =
                d === "photo-grid" ? "▦" : d === "editorial" ? "▥" : "☰";
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={aktif}
                  aria-label={etiket}
                  title={etiket}
                  onClick={() => setDuzenOverride(d)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold"
                  style={
                    aktif
                      ? { background: tema.anaRenk, color: "#fff", borderColor: tema.anaRenk }
                      : {
                          color: tema.metinRengi,
                          borderColor: tema.anaRenk + "33",
                          background: "rgba(255,255,255,0.92)",
                        }
                  }
                >
                  <span aria-hidden>{ikon}</span>
                </button>
              );
            })}
          </div>
        </div>

        {siraliKategoriler.length > 0 ? (
          <div
            className="mt-3"
            role="tablist"
            aria-label="Kategoriler"
          >
            <div className="flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {siraliKategoriler.map((kat) => {
                const aktif = kat.id === seciliKategoriId;
                const katGorsel =
                  kat.gorselUrl ||
                  menu.urunler.find((u) => u.kategoriId === kat.id && u.gorselUrl)?.gorselUrl ||
                  null;
                if (kapakModu || izgara) {
                  return (
                    <button
                      key={kat.id}
                      type="button"
                      role="tab"
                      aria-selected={aktif}
                      onClick={() => setAktifKategoriId(kat.id)}
                      className="menu-kat-kart w-[6.6rem] shrink-0 overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition"
                      style={{
                        borderColor: aktif ? tema.anaRenk : "transparent",
                        boxShadow: aktif
                          ? `0 0 0 2px ${tema.anaRenk}55, 0 8px 18px rgba(0,0,0,0.08)`
                          : "0 1px 3px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div
                        className="aspect-square w-full overflow-hidden"
                        style={{ background: tema.anaRenk + "14" }}
                      >
                        {katGorsel ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={katGorsel}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center text-lg opacity-30">
                            ✦
                          </span>
                        )}
                      </div>
                      <p
                        className="truncate px-1.5 py-2 text-center text-[12px] font-semibold leading-tight"
                        style={{ color: aktif ? tema.anaRenk : tema.metinRengi }}
                      >
                        {kategoriCevir(kat.ad, dil)}
                      </p>
                    </button>
                  );
                }
                return (
                  <button
                    key={kat.id}
                    type="button"
                    role="tab"
                    aria-selected={aktif}
                    onClick={() => setAktifKategoriId(kat.id)}
                    className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition"
                    style={
                      aktif
                        ? { background: tema.anaRenk, color: "#fff" }
                        : {
                            background: "transparent",
                            color: tema.metinRengi,
                            border: `1px solid ${tema.anaRenk}40`,
                          }
                    }
                  >
                    {kategoriCevir(kat.ad, dil)}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mt-3">
          <div
            className="flex gap-1.5 overflow-x-auto rounded-full border px-2.5 py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ borderColor: tema.anaRenk + "28", background: "rgba(255,255,255,0.55)" }}
            role="group"
            aria-label={uiMetin("alerjenFiltre", dil)}
          >
            <span className="inline-flex shrink-0 items-center gap-1 pr-1 text-[11px] font-semibold uppercase tracking-wide opacity-50">
              <span aria-hidden>▸</span>
              {uiMetin("alerjenHaric", dil)}
            </span>
            {FILTRE_ALERJENLER.map((ad) => {
              const aktif = haricAlerjenler.includes(ad);
              const rozet = alerjenRozet(ad);
              return (
                <button
                  key={ad}
                  type="button"
                  aria-pressed={aktif}
                  onClick={() => alerjenFiltreToggle(ad)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition"
                  style={
                    aktif
                      ? { background: tema.anaRenk, color: "#fff" }
                      : {
                          background: "transparent",
                          color: tema.metinRengi,
                          border: `1px solid ${tema.anaRenk}35`,
                        }
                  }
                >
                  <span aria-hidden>{rozet.ikon}</span>
                  {alerjenKisaCevir(ad, dil)}
                </button>
              );
            })}
            {haricAlerjenler.length > 0 ? (
              <button
                type="button"
                onClick={() => setHaricAlerjenler([])}
                className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold underline opacity-60"
              >
                {uiMetin("filtreTemizle", dil)}
              </button>
            ) : null}
          </div>
        </div>

        {listeUrunler.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-black/10 px-4 py-8 text-center text-sm opacity-60">
            {uiMetin("filtreSonucYok", dil)}
          </p>
        ) : null}

        {seciliKategoriId ? (
          <h2 className="mt-4 font-serif text-xl font-semibold tracking-tight">
            {kategoriCevir(
              siraliKategoriler.find((k) => k.id === seciliKategoriId)?.ad ?? "",
              dil,
            )}
          </h2>
        ) : null}

        <ul
          className={duzenListeSinifi(duzen)}
          key={(seciliKategoriId ?? "all") + haricAlerjenler.join(",") + duzen + ara}
        >
          {listeUrunler.map((u, i) => (
              <MenuUrunKarti
                key={u.id}
                sira={i}
                canli={canliId === u.id}
                onGorunurluk={gorunurlukBildir}
                duzen={kartDuzen(duzen, i)}
                genis={duzen === "editorial" && i === 0}
                urun={{
                  id: u.id,
                  ad: urunAdiGoster(u, dil),
                  fiyat: formatTl(u.fiyat),
                  aciklama: urunAciklamaGoster(u, dil),
                  gorselUrl: u.gorselUrl,
                  tukendi: urunTukendiMi(u),
                  sepetAdet: sepetAdet(u.id),
                  alerjenler: u.alerjenler,
                  kalori: u.kalori,
                  secenekli: Boolean(u.secenekler?.length),
                }}
                tema={{
                  anaRenk: tema.anaRenk,
                  vurguRengi: tema.vurguRengi,
                  kose: tema.kose,
                  zeminStili: tema.zeminStili,
                }}
                siparisModu={siparisModu}
                onSec={sepeteEkle}
                onAzalt={sepettenAzalt}
                dil={dil}
                onDetay={(id) => {
                  const u = menu.urunler.find((x) => x.id === id);
                  if (u) setDetayUrun(u);
                }}
              />
            ))}
        </ul>

        {siparisModu && masa ? (
          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={() => setHesapAcik(true)}
              className="w-full rounded-full py-3.5 text-sm font-semibold text-white shadow-md"
              style={{ background: tema.anaRenk }}
            >
              {uiMetin("hesapGor", dil)}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={cagriGonderiliyor}
                onClick={() => cagriGonder("garson")}
                className="rounded-full border px-3 py-2.5 text-sm font-semibold disabled:opacity-60"
                style={{ borderColor: tema.anaRenk + "66", color: tema.anaRenk }}
              >
                {uiMetin("garson", dil)}
              </button>
              <button
                type="button"
                disabled={cagriGonderiliyor}
                onClick={() => cagriGonder("hesap")}
                className="rounded-full border px-3 py-2.5 text-sm font-semibold disabled:opacity-60"
                style={{ borderColor: tema.anaRenk + "66", color: tema.anaRenk }}
              >
                {uiMetin("hesap", dil)}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                disabled={cagriGonderiliyor}
                onClick={() => cagriGonder("su")}
                className="rounded-full border px-2 py-2 text-xs font-semibold disabled:opacity-60"
                style={{ borderColor: tema.anaRenk + "44", color: tema.anaRenk }}
              >
                💧 {uiMetin("suIste", dil)}
              </button>
              <button
                type="button"
                disabled={cagriGonderiliyor}
                onClick={() => cagriGonder("pecete")}
                className="rounded-full border px-2 py-2 text-xs font-semibold disabled:opacity-60"
                style={{ borderColor: tema.anaRenk + "44", color: tema.anaRenk }}
              >
                🧻 {uiMetin("peceteIste", dil)}
              </button>
              <button
                type="button"
                disabled={cagriGonderiliyor}
                onClick={() => cagriGonder("ek-malzeme")}
                className="rounded-full border px-2 py-2 text-xs font-semibold disabled:opacity-60"
                style={{ borderColor: tema.anaRenk + "44", color: tema.anaRenk }}
              >
                🍽️ {uiMetin("ekMalzeme", dil)}
              </button>
            </div>
          </div>
        ) : null}

        {siparisIstegi && !menu.siparisAcik ? (
          <p className="mt-4 rounded-xl border border-line bg-black/5 p-3 text-sm opacity-70">
            {uiMetin("siparisKapali", dil)}
          </p>
        ) : null}
      </div>
      {menu.filigran ? <MenuFiligran /> : null}

      {secenekUrun ? (
        <UrunSecenekModal
          urun={secenekUrun}
          anaRenk={tema.anaRenk}
          vurguRengi={tema.vurguRengi}
          dil={dil}
          onKapat={() => setSecenekUrun(null)}
          onOnayla={({ ids, ozet, fiyat }) => {
            sepeteKalemEkle({
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

      {detayUrun ? (
        <UrunDetayModal
          urun={detayUrun}
          adGoster={urunAdiGoster(detayUrun, dil)}
          aciklamaGoster={urunAciklamaGoster(detayUrun, dil)}
          anaRenk={tema.anaRenk}
          vurguRengi={tema.vurguRengi}
          kose={tema.kose}
          tukendi={urunTukendiMi(detayUrun)}
          siparisModu={siparisModu}
          dil={dil}
          onKapat={() => setDetayUrun(null)}
          onSepete={() => sepeteEkle(detayUrun.id)}
        />
      ) : null}

      {hesapAcik && masa ? (
        <HesapOdemeModal
          slug={slug}
          masaId={masa.id}
          masaAd={masaEtiket(masa.ad, dil)}
          anaRenk={tema.anaRenk}
          vurguRengi={tema.vurguRengi}
          kose={tema.kose}
          dil={dil}
          onKapat={() => setHesapAcik(false)}
          onOdendi={(toplam) => {
            setMesaj(
              dil === "en"
                ? `Paid ${formatTl(toplam)} — thank you!`
                : dil === "tr"
                  ? `Ödeme alındı · ${formatTl(toplam)}`
                  : uiMetin("odemeBasarili", dil),
            );
          }}
          onHesapIste={() => {
            setHesapAcik(false);
            void cagriGonder("hesap");
          }}
        />
      ) : null}
    </div>
  );
}
