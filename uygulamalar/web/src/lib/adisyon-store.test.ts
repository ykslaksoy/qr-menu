import { describe, expect, it } from "vitest";
import {
  adisyonBol,
  adisyonBirlestir,
  adisyonIndirimUygula,
  adisyonKalemGuncelle,
  adisyonKalemIkram,
  adisyonKalemSil,
  adisyonKalan,
  adisyonTasi,
  adisyonaKalemEkle,
  kasaOde,
  ornekIsletme,
  type SiparisKalemi,
} from "./store";

describe("adisyon kalem işlemleri", () => {
  const kalem: SiparisKalemi = { urunId: "u-test", ad: "Latte", fiyat: 90, adet: 2 };

  it("kalem adedini günceller", () => {
    let isletme = ornekIsletme("Test", "test");
    const urun = isletme.urunler[0]!;
    const urunId = urun.id;
    isletme = adisyonaKalemEkle(isletme, isletme.masalar[0]!.id, [
      { urunId, ad: urun.ad, fiyat: urun.fiyat, adet: 1 },
    ]);
    const siparisId = isletme.siparisler[0]!.id;
    const sonuc = adisyonKalemGuncelle(isletme, siparisId, urunId, 3);
    expect(sonuc.hata).toBeUndefined();
    expect(sonuc.isletme.siparisler[0]!.kalemler[0]!.adet).toBe(3);
  });

  it("son kalemi silince sipariş iptal olur", () => {
    let isletme = ornekIsletme("Test", "test2");
    isletme = {
      ...isletme,
      siparisler: [
        {
          id: "sip-1",
          masaId: isletme.masalar[0]!.id,
          masaAd: "Masa 1",
          kalemler: [kalem],
          durum: "yeni",
          olusturulma: Date.now(),
          stokDusuldu: true,
        },
      ],
    };
    const sonuc = adisyonKalemSil(isletme, "sip-1", "u-test");
    expect(sonuc.isletme.siparisler[0]!.durum).toBe("iptal");
    expect(sonuc.isletme.siparisler[0]!.kalemler).toHaveLength(0);
  });
});

describe("POS adisyon", () => {
  it("indirim ve ikram kalanı düşürür", () => {
    let isletme = ornekIsletme("Pos", "pos");
    const masaId = isletme.masalar[0]!.id;
    const urun = isletme.urunler[0]!;
    isletme = adisyonaKalemEkle(isletme, masaId, [
      { urunId: urun.id, ad: urun.ad, fiyat: 100, adet: 2 },
    ]);
    const siparisId = isletme.siparisler[0]!.id;
    isletme = adisyonIndirimUygula(isletme, siparisId, { yuzde: 10 }).isletme;
    expect(adisyonKalan(isletme.siparisler[0]!)).toBe(180);
    isletme = adisyonKalemIkram(isletme, siparisId, urun.id, true).isletme;
    expect(adisyonKalan(isletme.siparisler[0]!)).toBe(0);
  });

  it("kısmi nakit sonra kartla kapatır", () => {
    let isletme = ornekIsletme("Pos2", "pos2");
    const masaId = isletme.masalar[0]!.id;
    const urun = isletme.urunler[0]!;
    isletme = adisyonaKalemEkle(isletme, masaId, [
      { urunId: urun.id, ad: urun.ad, fiyat: 100, adet: 1 },
    ]);
    const siparisId = isletme.siparisler[0]!.id;
    isletme = kasaOde(isletme, siparisId, {
      odemeler: [{ kanal: "nakit", tutar: 40 }],
    }).isletme;
    expect(isletme.siparisler[0]!.durum).toBe("yeni");
    expect(adisyonKalan(isletme.siparisler[0]!)).toBe(60);
    isletme = kasaOde(isletme, siparisId, {
      odemeler: [{ kanal: "kart-masa", tutar: 60 }],
    }).isletme;
    expect(isletme.siparisler[0]!.durum).toBe("odendi");
    expect(adisyonKalan(isletme.siparisler[0]!)).toBe(0);
  });

  it("masa taşır, böler ve birleştirir", () => {
    let isletme = ornekIsletme("Pos3", "pos3");
    const m1 = isletme.masalar[0]!;
    const m2 = isletme.masalar[1]!;
    const u1 = isletme.urunler[0]!;
    const u2 = isletme.urunler[1]!;
    isletme = adisyonaKalemEkle(isletme, m1.id, [
      { urunId: u1.id, ad: "A", fiyat: 50, adet: 1 },
      { urunId: u2.id, ad: "B", fiyat: 70, adet: 1 },
    ]);
    const kaynakId = isletme.siparisler[0]!.id;
    const bol = adisyonBol(isletme, kaynakId, [{ urunId: u2.id, adet: 1 }], m1.id);
    expect(bol.hata).toBeUndefined();
    isletme = bol.isletme;
    const yeniId = bol.yeniSiparisId!;
    const tasi = adisyonTasi(isletme, yeniId, m2.id);
    expect(tasi.hata).toBeUndefined();
    isletme = tasi.isletme;
    expect(isletme.siparisler.find((s) => s.id === yeniId)!.masaId).toBe(m2.id);
    const birles = adisyonBirlestir(isletme, yeniId, kaynakId);
    expect(birles.hata).toBeUndefined();
    isletme = birles.isletme;
    expect(isletme.siparisler.find((s) => s.id === kaynakId)!.kalemler).toHaveLength(2);
    expect(isletme.siparisler.find((s) => s.id === yeniId)!.durum).toBe("iptal");
  });
});
