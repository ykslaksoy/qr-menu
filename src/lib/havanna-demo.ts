import type { Isletme } from "@/lib/store";

/** Demo menüde fotoğraf grid — repo içi /gorseller/foto/* (Havanna UX satırı). */
export const HAVANNA_URUN_FOTO: Record<string, string> = {
  "Filtre Kahve": "/gorseller/foto/filtre-kahve.jpg",
  Latte: "/gorseller/foto/latte.jpg",
  Americano: "/gorseller/foto/americano.jpg",
  Cappuccino: "/gorseller/foto/cappuccino.jpg",
  "Çay": "/gorseller/foto/cay.jpg",
  "Soğuk Kahve": "/gorseller/foto/soguk-kahve.jpg",
  Smoothie: "/gorseller/foto/smoothie.jpg",
  Limonata: "/gorseller/foto/limonata.jpg",
  Su: "/gorseller/foto/su.jpg",
  Tost: "/gorseller/foto/tost.jpg",
  "Sandviç": "/gorseller/foto/sandvic.jpg",
  Omlet: "/gorseller/foto/omlet.jpg",
  "Sucuklu Yumurta": "/gorseller/foto/sucuklu-yumurta.jpg",
  "Granola Bowl": "/gorseller/foto/granola-bowl.jpg",
  Cheesecake: "/gorseller/foto/cheesecake.jpg",
  Brownie: "/gorseller/foto/brownie.jpg",
  Kruvasan: "/gorseller/foto/kruvasan.jpg",
  Cookie: "/gorseller/foto/cookie.jpg",
  Dondurma: "/gorseller/foto/dondurma.jpg",
  Waffle: "/gorseller/foto/waffle.jpg",
  Espresso: "/gorseller/foto/espresso.jpg",
  "Sıcak Çikolata": "/gorseller/foto/sicak-cikolata.jpg",
  Salata: "/gorseller/foto/salata.jpg",
  "Çorba": "/gorseller/foto/corba.jpg",
};

export const HAVANNA_KAT_FOTO: Record<string, string> = {
  "Atıştırmalık": "/gorseller/foto/kat-atistirmalik.jpg",
  "İçecekler": "/gorseller/foto/kat-icecekler.jpg",
  Tatlılar: "/gorseller/foto/kat-tatlilar.jpg",
};

const KAT_SIRA: Record<string, number> = {
  "Atıştırmalık": 1,
  "İçecekler": 2,
  Tatlılar: 3,
};

/** Cafe Ada zincir demo: kapak + foto kategori/ürün + photo-grid tema. */
/** Neşe Çay Evi — kapak, kategori şeridi ve ürün foto ızgarası (demo ile aynı UX). */
export function neseHavannaMenusu(isletme: Isletme): Isletme {
  const kategoriler = isletme.kategoriler.map((k, i) => {
    const ad = k.ad.toLowerCase();
    let gorselUrl = k.gorselUrl ?? null;
    if (/çay|cay|demleme/.test(ad)) gorselUrl = "/gorseller/foto/cay.jpg";
    else if (/tatlı|tatli|pasta|kek/.test(ad)) gorselUrl = "/gorseller/foto/kat-tatlilar.jpg";
    else if (/içecek|icecek|kahve|limonata|smoothie/.test(ad))
      gorselUrl = "/gorseller/foto/kat-icecekler.jpg";
    else if (/tost|sandvi|atış|atistir|kahvalt/.test(ad))
      gorselUrl = "/gorseller/foto/kat-atistirmalik.jpg";
    return { ...k, gorselUrl, sira: i + 1 };
  });

  const urunler = isletme.urunler.map((u) => {
    const ad = u.ad.toLowerCase();
    let gorselUrl: string | null = null;
    if (/çay|cay|oralet|bergamot/.test(ad)) gorselUrl = "/gorseller/foto/cay.jpg";
    else if (/latte|filtre|americano|cappuccino|espresso|kahve/.test(ad))
      gorselUrl = "/gorseller/foto/latte.jpg";
    else if (/limonata|smoothie|su\b/.test(ad)) gorselUrl = "/gorseller/foto/limonata.jpg";
    else if (/tost/.test(ad)) gorselUrl = "/gorseller/foto/tost.jpg";
    else if (/sandvi/.test(ad)) gorselUrl = "/gorseller/foto/sandvic.jpg";
    else if (/cheesecake|tatlı|tatli|kurabiye|pasta/.test(ad))
      gorselUrl = "/gorseller/foto/cheesecake.jpg";
    return gorselUrl ? { ...u, gorselUrl, gorselKaynak: "hazir" as const } : u;
  });

  return {
    ...isletme,
    kapakUrl: "/gorseller/foto/kapak-cafe.jpg",
    kategoriler,
    urunler,
    tema: {
      ...isletme.tema,
      duzenId: "photo-grid",
      anaRenk: "#2d5a3d",
      vurguRengi: "#c4a35a",
      zeminRengi: "#f7f3ea",
      zeminStili: "solid-warm",
    },
  };
}

export function havannaDemoMenusu(isletme: Isletme): Isletme {
  const kategoriler = isletme.kategoriler
    .map((k) => ({
      ...k,
      gorselUrl: HAVANNA_KAT_FOTO[k.ad] ?? k.gorselUrl ?? null,
      sira: KAT_SIRA[k.ad] ?? k.sira,
    }))
    .sort((a, b) => a.sira - b.sira);
  const urunler = isletme.urunler.map((u) => {
    const yol = HAVANNA_URUN_FOTO[u.ad];
    return yol ? { ...u, gorselUrl: yol, gorselKaynak: "hazir" as const } : u;
  });
  return {
    ...isletme,
    kapakUrl: "/gorseller/foto/kapak-cafe.jpg",
    kategoriler,
    urunler,
    tema: {
      ...isletme.tema,
      duzenId: "photo-grid",
      anaRenk: "#1f6f5b",
      vurguRengi: "#c45c26",
      zeminRengi: "#f3efe6",
      zeminStili: "solid-warm",
    },
  };
}
