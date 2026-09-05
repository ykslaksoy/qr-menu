import { describe, expect, it } from "vitest";
import { ornekIsletme, siparisOlustur } from "./store";

/** Atomik güncelleme mantığının sırayla uygulanınca sipariş kaybetmediğini doğrular. */
describe("sipariş kalıcılığı", () => {
  it("ardışık siparişler birikir", () => {
    let isletme = ornekIsletme("Test", "test-kalici");
    const masaId = isletme.masalar[0]!.id;
    const u1 = isletme.urunler[0]!;
    const u2 = isletme.urunler[1]!;

    isletme = siparisOlustur(isletme, masaId, [
      { urunId: u1.id, ad: u1.ad, fiyat: u1.fiyat, adet: 1 },
    ]);
    isletme = siparisOlustur(isletme, masaId, [
      { urunId: u2.id, ad: u2.ad, fiyat: u2.fiyat, adet: 2 },
    ]);

    expect(isletme.siparisler).toHaveLength(2);
    expect(isletme.siparisler.map((s) => s.kalemler[0]!.ad)).toEqual([u2.ad, u1.ad]);
  });
});
