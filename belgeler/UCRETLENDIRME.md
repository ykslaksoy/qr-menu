# Ücretlendirme (deneme / tek şube)

Sofra’nın şu anki ürün kararı — **C bloğu yok** (ÖKC, e-fatura, Getir/YS, native, offline, kiosk).

## Plan sınırları

| Plan | Şube | Not |
|------|------|-----|
| Ücretsiz / deneme | **1** | Ayda 50 QR sipariş hediye kotası (`adet-alti-ucretsiz.json`); aşımda sipariş kesilmez, uyarı çıkar |
| Menü | **1** | Dijital menü + tasarım |
| Menü + Adisyon | **1** | Garson / mutfak / stok / rapor |
| Tam | çok şube | Zincir paneli |

Kod: `uygulamalar/web/src/lib/ucretlendirme.ts` → `planMaxSube` / `subeAcilabilirMi`.

## Deneme hesabı

Kayıt (`/kayit`) ücretsiz plan + örnek menü/masa ile başlar. İlk kurulum sihirbazı: `/panel/kurulum`.

## Ne faturalanmaz (bilinçli)

ÖKC, e-fatura, paket platform API’leri, native el terminali, offline senkron, kiosk — SuperQR C maddeleri; bu sprint kapsamı dışı.
