# Baskı ve kargo (sonraya — Faz 2+)

> MVP’de yok. Önce menü paneli, QR, adisyon, ödeme.
> Bu belge ileride yapılacak baskı + kargo akışının karar kaydıdır.

## Karar
- **PDF hazırlığı ve kontrolü** → sonraya
- **Basıp kargo** → sonraya
- MVP’de (ileride self-print açılırsa) en fazla “PDF indir, kendi matbaanda bastır”

## Hedef akış (Faz 2+)

```text
İşletme panelinde:
  1. Firma unvanı + teslimat adresi + telefon kayıtlı
  2. Baskıya hazır PDF onaylı (iç kontrol sonrası)
  3. Ürün seç (masa kartı / sticker / vitrin)
  4. Adet yaz
  5. Sipariş ver

Sofra tarafı:
  6. Matbaada bas
  7. Kargo:
       a) Programa kargo bilgisi gir / takip no
    veya b) Etiket yazdır
    veya c) Kargo API entegrasyonu (Yurtiçi, Aras, MNG vb.)
  8. Adrese direkt teslim
```

## İşletmeden alınacak bilgiler

| Alan | Zorunlu | Not |
|------|---------|-----|
| Unvan / kafe adı | Evet | Fatura + kargo |
| Yetkili ad soyad | Evet | |
| Telefon | Evet | Kargo araması |
| E-posta | Evet | Takip maili |
| Teslimat adresi (il, ilçe, açık adres, posta kodu) | Evet | |
| Fatura adresi (farklıysa) | Hayır | |
| Vergi no / vergi dairesi | Fatura için | |
| Not (kapı kodu, mesai saati) | Hayır | |

Adres bilgileri **işletme ayarlarında** bir kez tutulur; her baskı siparişinde varsayılan gelir, değiştirilebilir.

## Sipariş satırı

| Alan | Örnek |
|------|--------|
| Ürün | Masa kartı, sticker, vitrin A4 |
| Adet | 20, 50, 100… |
| PDF / tasarım sürümü | Onaylı dosya id |
| Teslimat adresi | Kayıtlı veya siparişe özel |
| Durum | taslak → kontrol → baskıda → kargoda → teslim |

## Kargo seçenekleri (öncelik sırası)

1. **Manuel:** Panelden kargo firması + takip no gir → işletmeye bildir  
2. **Etiket:** Panelden etiket PDF / termal yazıcı çıktısı  
3. **API entegrasyonu:** Anlaşmalı kargo firması; etiket + takip otomatik  

İlk açılışta **1 + 2** yeterli; API sonra.

## PDF kontrolü (baskıdan önce)

- İşletme veya Sofra ekibi “onayla” demeden basılmaz  
- Kontrol listesi: QR tarama testi, bleed/kenar, renk, yazım  
- Onaysız sipariş → “kontrol bekliyor”

## Veri modeli (taslak)

```text
Isletme
  └── Adres (teslimat, fatura)
BaskiSiparisi
  ├── isletmeId
  ├── adresId / adres anlık kopyası
  ├── kalemler[] (urun, adet, pdfDosyaId)
  ├── durum
  ├── kargoFirmasi
  ├── takipNo
  └── etiketUrl
```

## Yapılmayacak (şimdi)
- Matbaa otomasyonu
- Kargo API
- PDF rip / CMYK pipeline
- Adres defteri UI

Bunlar menü + adisyon + abonelik oturduktan sonra backlog’a alınır.
