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
