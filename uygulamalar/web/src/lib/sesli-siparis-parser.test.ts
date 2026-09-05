import { describe, expect, it } from "vitest";
import { sesliSiparisParse, uyariMesaji, type SesliUrun } from "./sesli-siparis-parser";

const urun = (id: string, ad: string, extra?: Partial<SesliUrun>): SesliUrun => ({
  id,
  kategoriId: "icecek",
  ad,
  fiyat: 50,
  stokTakibi: false,
  kalanAdet: 10,
  aktif: true,
  ...extra,
});

describe("sesliSiparisParse", () => {
  const menu = [
    urun("u1", "Filtre Kahve"),
    urun("u2", "Latte"),
    urun("u3", "Portakallı Soda", { stokTakibi: true, kalanAdet: 0 }),
    urun("u4", "Limonlu Soda", { kategoriId: "icecek" }),
    urun("u5", "Mandalinalı Soda", { kategoriId: "icecek" }),
  ];

  it("ürün ve adet çıkarır", () => {
    const s = sesliSiparisParse("iki latte ve bir filtre kahve", menu);
    expect(s.kalemler).toHaveLength(2);
    expect(s.kalemler.find((k) => k.urun.ad === "Latte")?.adet).toBe(2);
  });

  it("tükenen ürün için uyarı ve öneri verir", () => {
    const s = sesliSiparisParse("portakallı soda", menu);
    expect(s.kalemler).toHaveLength(0);
    expect(s.uyarilar[0]?.neden).toBe("tukendi");
    expect(s.uyarilar[0]?.oneriler.some((o) => o.ad === "Limonlu Soda")).toBe(true);
    expect(uyariMesaji(s.uyarilar[0]!)).toContain("yok");
  });
});
