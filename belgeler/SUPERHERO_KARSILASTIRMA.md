# SüperHero × Sofra — özellik skorlaması

**Yöntem (Arı / koloni ile aynı):**  
SüperHero gerçek bir ürün değil. **Big Four** rakiplerin her boyuttaki **en iyi puanının birleşimi** — ligin teorik tavanı.

```
SüperHero(özellik X) = max(Adisyo, Menulux, KarekodGarson, Simpra)
```

Kaynak: `paketler/tema/src/karsilastirma.json` (Sofra farkı / SüperHero karşılaştırma).  
Adysso ligde ayrı AI menü arketipi; Big Four’a dahil değil.

---

## Big Four (tekil skorlar, /80)

| Ürün | Kod ad | Toplam | /100 |
|------|--------|-------:|-----:|
| KarekodGarson | Modülord | 60 | 75.0 |
| Simpra | Chain Master | 58 | 72.5 |
| Menulux | Titan ÖKC | 54 | 67.5 |
| Adisyo | Flash POS | 53 | 66.3 |
| **Sofra** | **Vox** | **54** | **67.5** |

Aritmetik ortalama (Big Four) ≈ **56.3 / 80** (~70.3).  
SüperHero max birleşim **71 / 80** — tek rakibin çok üstünde.

---

## SüperHero vs Sofra (boyut boyut)

Her boyut 1–10. Kaynak = o boyutta max’ı veren rakip.

| Boyut | SüperHero | Sofra | Δ | Kaynak |
|-------|----------:|------:|--:|--------|
| Hız | 8 | **9** | +1 | Adisyo |
| Güç (modül derinliği) | **10** | 5 | −5 | KarekodGarson |
| Zırh (ÖKC / yasal / offline) | **10** | 3 | −7 | Menulux |
| Çeviklik | 9 | 9 | 0 | Adisyo |
| Sihir (AI / ses) | 8 | **9** | +1 | KarekodGarson |
| Fiyat | 9 | 9 | 0 | Adisyo |
| Ordu (çok şube / platform) | **9** | 2 | −7 | Menulux / Simpra |
| Menü | 8 | 8 | 0 | KarekodGarson / Simpra |
| **Toplam /80** | **71** | **54** | **−17** | |
| **Normalize /100** | **88.8** | **67.5** | **−21.3** | |

**Özet:** Sofra **hız** ve **sihir**de tavanı aşıyor; **güç / zırh / ordu**da büyük açık. Fiyat, çeviklik ve menüde berabere.

---

## SüperHero’da var — Sofra’da yok / zayıf

Birleşik rakibin imza yetenekleri (hangi app’ten geldiğiyle):

| Özellik | Kimden | Sofra |
|---------|--------|-------|
| ÖKC / yazarkasa (Ingenico, Pavo) | Menulux | Yok |
| E-fatura / yasal uyum | Menulux | Yok |
| Offline çalışma | Menulux | Yok |
| Garson el terminali (native) | Menulux | Yok (mobil web) |
| 130+ modül (İK, gamification…) | KarekodGarson | Yok |
| AI satış / personel tahmin | KarekodGarson | Yok |
| 6+ kurumsal rol ekranı seti | KarekodGarson | Kısmi (5 rol; derinlik az) |
| Merkezi çok şube + reçete stok | Simpra | Kısmi zincir paneli |
| Yemeksepeti / Getir entegrasyonu | Simpra | Yok |
| Kiosk sipariş | Simpra | Yok |
| Klasik bulut POS olgunluğu | Adisyo | Adisyon MVP |
| Kurumsal donanım ekosistemi | Menulux + Simpra | Yok |

---

## Sofra’da var — SüperHero birleşiminde zayıf / yok

`sadeceSofrada` listesi (rakiplerde yok veya nadir):

| Özellik | Neden avantaj |
|---------|---------------|
| Garson **sesli sipariş** (tarayıcı, donanımsız) | Big Four’da imza yok |
| Stok yok → **alternatif öner** | Tipik POS’ta yok |
| **4 kanal → tek adisyon** (QR, ses, yazı, dokun) | Nadir |
| Canlı adisyon **PDF fiş** | Nadir |
| **50 sipariş/ay** ücretsiz tam özellik | Farklı paket |
| 12 tip × 245 ürün **tik kataloğu** | Yok |
| Menü **boyut şablonları** (hazır kurulum) | Yok |
| Veri girişi / dökümanlar ayrımı | Yok |
| Menü QR **referans** (%15) | Nadir |
| **Komisyon yok** (sabit abonelik) | Marketplace’ten ayrışır |
| 25 şablon + tasarım @ Menü+Adisyon fiyatı | Farklı |
| Garson **serbest kalem** + ses | Nadir |
| Platform **impersonation** desteği | Nadir |

Boyut skorunda da Sofra kazanır: **Hız +1**, **Sihir +1**.

---

## SüperHero kimliği (hedef tavan)

Tek cümle: *Adisyo hızı + Menulux zırhı + KarekodGarson modül gücü + Simpra ordu yönetimi* — tek üründe.

Sofra’nın koruyacağı kimlik (Vox):
- Sesli garson + stok alternatif
- Hızlı PDF / hazır menü kurulum
- Komisyonsuz, adet-altı hediye
- Basit rol ekranları (garson / mutfak / yönetici / zincir)

---

## Sofra’nın tavanı kapatması (kabaca)

| Öncelik | Ne | Boyut etkisi |
|---------|----|--------------|
| P0 | Genel ürün seçenekleri + garson çağır | güç / menü |
| P0 | Zincir paneli derinliği (reçete, merkezi menü) | ordu +2…4 |
| P1 | Platform sipariş (Getir / YS) iskelet | ordu |
| P1 | Temel e-fatura / ÖKC ortaklığı | zirh |
| P1 | SSE bildirim + satış raporu | güç / sihir |
| P2 | Offline / el terminali PWA | zirh |

Ordu 2→7 ve zırh 3→6 ile Sofra ≈ **64–66 / 80** (~82); güç 5→8 ile ≈ **69 / 80** (~86) — SüperHero bandına yaklaşır, Vox kimliği korunur.

---

*Son güncelleme: Sofra `karsilastirma.json` SuperHero modeli + Arı’daki SüperHero tanımı (max birleşim).*
