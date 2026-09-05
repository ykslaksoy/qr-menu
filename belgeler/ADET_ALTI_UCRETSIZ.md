# Adet altı ücretsiz

Kaynak: `paketler/tema/src/adet-alti-ucretsiz.json`

## Kural (kilitli)

| | |
|--|--|
| **Limit** | Takvim ayında **50** QR sipariş (iptal hariç) |
| **Hediye** | Ücretsiz abonelikte **Menü + Adisyon** özellikleri açık |
| **Aşım** | Sipariş devam eder; **yöneticiye panel/garson/mutfakta otomatik uyarı** |
| **Ücretli plan** | Limit uyarısı yok |

## Gerekçe

Küçük kafe: günde ~1 QR sipariş → ayda ~30. Ücretsiz taban **50** (biraz pay bırakır).

## Örnek

- Küçük kafe, ayda 30 sipariş → ₺0, özellikler açık
- Aynı kafe ayda 60 sipariş → siparişler devam eder; panelde “kota aşıldı” uyarısı
- Menü / Menü+Adisyon ödeyen → limit uyarısı yok

## Panel

- Sayaç: `kullanılan / 50`
- Limit dolunca sarı uyarı (tüm panel sayfaları + garson/mutfak)
- Müşteri menüsünde uyarı yok

## Saha cümlesi

> **“Ayda 50 siparişe kadar ücretsiz. Aşınca size panelde uyarı çıkar; sipariş durmaz.”**
