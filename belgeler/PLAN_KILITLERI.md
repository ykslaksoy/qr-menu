# Plan kilidi listesi

Kaynak: `paketler/tema/src/plan-kilitleri.json` · Uygulama: `uygulamalar/web/src/lib/plan-kilit.ts`

Panel → **Abonelik** sayfasında canlı durum görüntülenir.

---

## Plan hiyerarşisi

| Sıra | Plan | Aylık |
|------|------|-------|
| 0 | Ücretsiz | ₺0 |
| 1 | Menü | ₺399 |
| 2 | Menü + Adisyon | ₺699 |
| 3 | Tam Paket | ₺899 |

Üst plan, alt plandaki tüm özellikleri içerir.

---

## Özellik matrisi

| Özellik | Ücretsiz | Menü | Menü+Adisyon | Tam |
|---------|:--------:|:----:|:------------:|:---:|
| Dijital menü + QR PNG | ✓ | ✓ | ✓ | ✓ |
| 5 ücretsiz şablon | ✓ | ✓ | ✓ | ✓ |
| Sınırlı tasarım (ana renk) | ✓ | — | — | — |
| Filigran (Powered by Sofra) | ✓ | — | — | — |
| 25 şablon | — | ✓ | ✓ | ✓ |
| Tam tasarım (font/renk/çerçeve/zemin) | — | ✓ | ✓ | ✓ |
| PDF / metin menü içe aktarma | — | ✓ | ✓ | ✓ |
| Masa kartı baskı PDF | — | ✓ | ✓ | ✓ |
| Filigran kapalı | — | ✓ | ✓ | ✓ |
| Masadan sipariş | — | — | ✓ | ✓ |
| Garson + mutfak ekranı | — | — | ✓ | ✓ |
| Stok takibi | — | — | ✓ | ✓ |
| Gelişmiş analitik | — | — | ✓ | ✓ |
| Öncelikli destek + kurulum | — | — | — | ✓ |

---

## Nerede kilitlenir?

| Özellik | UI | API |
|---------|----|-----|
| Şablon / tasarım | `/panel/tasarim` | `PUT /api/auth` (tema sınırlama) |
| Filigran | `/m/[slug]` | `GET /api/m/[slug]` |
| Sipariş | `/m/[slug]` sepet | `POST /api/m/[slug]/siparis` |
| PDF içe aktar | `/panel/menu/ice-aktar` | `POST /api/panel/ice-aktar` |
| Baskı PDF | `/panel/baski`, masalar | — |
| Stok | `/panel/stok` | — |
| Garson / mutfak | `/g`, `/k` | — |
| Analitik | `/panel` özet | — |
| Plan düşürme | — | `POST /api/panel/odeme` (tema uyumu) |

---

## Adet altı ücretsiz (ek kural)

Ücretsiz abonelik → efektif plan **Menü + Adisyon**.  
Ayda 50 sipariş aşılınca sipariş **kesilmez**; panelde yöneticiye otomatik uyarı.  
Ayrıntı: `belgeler/ADET_ALTI_UCRETSIZ.md`

---

## Ücretsiz şablonlar (5 adet)

Her tarzdan bir tane — `katalog.json` içinde `"ucretsiz": true` olanlar.

---

## Notlar

- Plan değişince (özellikle düşürünce) tema otomatik uyumlanır: kilitli şablon → ücretsiz şablona, tam tasarım alanları sıfırlanır.
- Canlı ödeme anahtarları olmadan abonelik simülasyonla açılır; kilitleme plan kaydına göre çalışır.
- Logo yükleme henüz yok; ücretsiz “logo” maddesi metin olarak fiyatlandırmada kalır.
