# QR Menü Platformu — Ürün İskeleti (Türkçe)

Bu dosya uygulama klasör ağacı, yapılacaklar ve faz sırasını tek yerde tutar.
Tema kataloğu: `config/themes.catalog.json`

---

## 1) Ürün özeti

| Madde | Karar |
|--------|--------|
| Vaat | PDF gönder → dijital menü + QR + masa kartı + basit adisyon |
| Özel sayfa | Her işletme: slug / alt alan adı + şablon + özelleştirme |
| Tasarım | 5 tarz × 5 şablon = 25; font / renk / çerçeve / zemin özelleştir |
| Baskı (MVP) | Dışarıda bastırılacak PDF indir |
| Baskı (sonra) | Bize gönder → basıp kargo |
| Fiyat taslağı | Menü ₺399 · Menü+Adisyon ₺699 · Tam ₺899 |

---

## 2) Klasör / dosya ağacı

```text
qr-menu-platform/
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── .env.ornek
├── .gitignore
├── docker-compose.yml
│
├── uygulamalar/
│   ├── web/                              # Next.js — menü + panel + garson
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── middleware.ts                 # oturum, işletme alt alanı
│   │   ├── public/
│   │   │   ├── fontlar/
│   │   │   └── sablon-onizleme/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (pazarlama)/
│   │   │   │   │   ├── page.tsx          # ana sayfa
│   │   │   │   │   ├── fiyatlandirma/page.tsx
│   │   │   │   │   └── iletisim/page.tsx
│   │   │   │   ├── (kimlik)/
│   │   │   │   │   ├── giris/page.tsx
│   │   │   │   │   ├── kayit/page.tsx
│   │   │   │   │   └── sifremi-unuttum/page.tsx
│   │   │   │   ├── (panel)/              # işletme paneli
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── page.tsx          # bugün özeti
│   │   │   │   │   ├── menu/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── ice-aktar/page.tsx   # PDF → menü
│   │   │   │   │   │   └── [urunId]/page.tsx
│   │   │   │   │   ├── masalar/page.tsx
│   │   │   │   │   ├── qr/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── baski/page.tsx
│   │   │   │   │   ├── tasarim/page.tsx  # 25 şablon + özelleştir
│   │   │   │   │   ├── adisyon/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [adisyonId]/page.tsx
│   │   │   │   │   ├── siparisler/page.tsx
│   │   │   │   │   ├── baski-siparis/page.tsx    # faz 2
│   │   │   │   │   ├── analitikk/page.tsx
│   │   │   │   │   ├── ayarlar/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── sube/page.tsx
│   │   │   │   │   │   ├── kullanicilar/page.tsx
│   │   │   │   │   │   ├── dil/page.tsx
│   │   │   │   │   │   └── abonelik/page.tsx
│   │   │   │   │   └── destek/page.tsx
│   │   │   │   ├── m/[slug]/             # müşteri menü (herkese açık)
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── sepet/page.tsx
│   │   │   │   │   └── siparis-takip/page.tsx
│   │   │   │   ├── g/                    # garson / kasa
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── masa/[masaId]/page.tsx
│   │   │   │   └── k/                    # mutfak ekranı
│   │   │   │       └── page.tsx
│   │   │   ├── bilesenler/
│   │   │   │   ├── menu/
│   │   │   │   ├── adisyon/
│   │   │   │   ├── qr/
│   │   │   │   ├── baski/
│   │   │   │   ├── tasarim/
│   │   │   │   └── arayuz/
│   │   │   ├── kancalar/
│   │   │   ├── kutuphane/
│   │   │   │   ├── kimlik.ts
│   │   │   │   ├── api-istemci.ts
│   │   │   │   ├── qr.ts
│   │   │   │   └── format.ts
│   │   │   ├── durum/                   # sepet, aktif masa
│   │   │   └── stiller/
│   │   └── testler/
│   │
│   ├── api/                              # NestJS / Fastify
│   │   ├── package.json
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app.module.ts
│   │       ├── yapilandirma/
│   │       ├── ortak/
│   │       │   ├── korumalar/
│   │       │   ├── filtreler/
│   │       │   └── borular/
│   │       ├── moduller/
│   │       │   ├── kimlik/
│   │       │   ├── isletmeler/         # tenant / şube
│   │       │   ├── kullanicilar/
│   │       │   ├── menu/
│   │       │   │   ├── kategoriler/
│   │       │   │   ├── urunler/
│   │       │   │   └── ice-aktar/        # PDF / foto AI
│   │       │   ├── masalar/
│   │       │   ├── qr/
│   │       │   ├── siparisler/
│   │       │   ├── adisyonlar/
│   │       │   ├── mutfak/
│   │       │   ├── tasarim/
│   │       │   ├── baski/
│   │       │   │   ├── sablonlar/
│   │       │   │   └── yerine-getirme/   # faz 2 kargo
│   │       │   ├── abonelik/
│   │       │   ├── analitikk/
│   │       │   ├── bildirimler/
│   │       │   └── yonetim/             # sizin süper admin
│   │       └── anlik/                    # websocket
│   │
│   └── isci/                             # arka plan kuyrukları
│       └── src/
│           ├── pdf-ice-aktar.isci.ts
│           ├── pdf-olustur.isci.ts
│           ├── ai-cevir.isci.ts
│           └── baski-siparis.isci.ts
│
├── paketler/
│   ├── veritabani/
│   │   ├── prisma/schema.prisma
│   │   ├── migrasyonlar/
│   │   └── tohum.ts
│   ├── ortak/                            # tipler, doğrulayıcılar
│   │   └── src/
│   │       ├── tipler/
│   │       ├── dogrulayicilar/
│   │       └── sabitler/
│   │           ├── siparis-durumu.ts
│   │           ├── planlar.ts
│   │           └── alerjenler.ts
│   └── pdf-sablonlari/
│       └── src/
│           ├── masa-karti.tsx
│           ├── sticker.tsx
│           ├── vitirin-afis.tsx
│           └── index.ts
│
├── servisler/
│   └── ai-menu-okuyucu/
│       └── src/
│           ├── pdf-oku.ts
│           ├── gorsel-oku.ts
│           └── menu-duzenle.ts
│
├── belgeler/
│   ├── URUN.md
│   ├── MVP.md
│   ├── API.md
│   ├── BASKI_OLCULERI.md
│   ├── ISLETME.md
│   └── YASAL.md
│
├── betikler/
│   ├── demo-restoran-tohumla.ts
│   ├── toplu-qr-uret.ts
│   └── duman-testi.sh
│
└── altyapi/
    ├── Dockerfile.web
    ├── Dockerfile.api
    └── nginx/
```

---

## 3) Veritabanı varlıkları

```text
Isletme
├── Sube
├── Kullanici (sahip, garson, mutfak, kasa)
├── Abonelik
├── Tema (sablonId + özelleştirmeler)
├── Kategori
│   └── Urun (fiyat, görsel, alerjen, varyant, ekstra)
├── Masa
│   └── QrKod
├── Adisyon
│   ├── AdisyonKalemi
│   └── Odeme
├── Siparis
│   ├── SiparisKalemi
│   └── SiparisDurumGecmisi
├── BaskiDosyasi
├── BaskiSiparisi          # faz 2
└── AnalitikOlayi
```

---

## 4) Yapılacaklar ağacı

```text
A. KEŞİF VE DOĞRULAMA
├── A1. Ürün adı ve alan adı
├── A2. Fiyat paketlerini kilitle
├── A3. On işletme görüşmesi
├── A4. Rakip notları
└── A5. MVP / v1.5 / v2 sınırları

B. ALTYAPI
├── B1. Monorepo ve CI
├── B2. Postgres + Redis + dosya depolama
├── B3. Kimlik doğrulama ve roller
├── B4. Çok kiracılı yapı (slug / alt alan)
├── B5. Ortam değişkenleri (geliştirme / canlı)
└── B6. Hata izleme

C. MENÜ
├── C1. Kategori ekle / düzenle / sil
├── C2. Ürün ekle / düzenle / sil
├── C3. Varyant ve ekstra
├── C4. Alerjen etiketleri
├── C5. İki dil (TR + EN)
├── C6. Herkese açık menü sayfası
└── C7. PDF / fotoğraftan menü aktarımı

D. QR
├── D1. Masa oluşturma
├── D2. Masa bazlı QR
├── D3. PNG / SVG / PDF indir
└── D4. Menü değişince QR aynı kalsın

E. TASARIM VE BASKI
├── E1. 5 kategori × 5 şablon seçici
├── E2. Font / renk / çerçeve / zemin özelleştir
├── E3. Şablona sıfırla
├── E4. Masa kartı PDF
├── E5. Sticker ve vitrin PDF
├── E6. Toplu ZIP indir
└── E7. [FAZ 2] Basıp kargo siparişi

F. SİPARİŞ
├── F1. Sepet ve masa bağlama
├── F2. Sipariş oluşturma
├── F3. Anlık bildirim
├── F4. Durum: yeni → mutfak → hazır → servis
├── F5. Garson çağır / hesap iste
└── F6. Sesli uyarı

G. ADİSYON
├── G1. Masa aç / kapat
├── G2. QR siparişini adisyona yaz
├── G3. Garson elle ürün eklesin
├── G4. İptal / ikram / not
├── G5. Hesap birleştir / böl (v1.5)
├── G6. Ödeme tipi işaretle
├── G7. Gün sonu özeti
└── G8. Mutfak ekranı

H. ABONELİK
├── H1. Planlar (Ücretsiz / Menü / Pro)
├── H2. Iyzico veya PayTR
├── H3. Fatura bilgileri
└── H4. Limitler ve filigran

I. ANALİTİK
├── I1. QR okutma
├── I2. Ürün görüntüleme
└── I3. Günlük ciro / sipariş

J. YASAL
├── J1. KVKK ve çerez
├── J2. Kullanım şartları
├── J3. Mesafeli satış (baskı için)
└── J4. E-posta şablonları

K. SATIŞ
├── K1. Ana sayfa
├── K2. WhatsApp çağrısı
├── K3. Demo işletme tohumu
├── K4. Kurulum kontrol listesi
└── K5. İlk on müşteri kurulumu

L. KALİTE
├── L1. Birim testler
├── L2. Uçtan uca: QR → mutfak → adisyon
├── L3. Baskı PDF kontrolü
└── L4. Yoğun masa duman testi
```

---

## 5) Geliştirme sırası (MVP)

```text
1. Kimlik + işletme + slug
2. Menü + herkese açık menü sayfası
3. Tasarım (katalog JSON → şablon seçici)
4. Masa + QR + baskı PDF
5. Sipariş + adisyon bağlama
6. Garson / mutfak ekranı
7. Abonelik ödemesi
```

**MVP bitti sayılır:** menü yayında, masa QR var, masa kartı PDF indiriliyor, sipariş adisyona düşüyor, en az bir ücretli plan alınabiliyor.

---

## 6) Ertelediklerimiz

- Basıp kargo
- Getir / Yemeksepeti
- Ağır stok ve personel
- Özel alan adı (`menu.markaadi.com`) — Pro / kurumsal sonra

---

## 7) Bu haftanın çıktıları

| # | İş | Bitti ölçüsü |
|---|-----|----------------|
| 1 | İsim + fiyat | Tek sayfada yazılı |
| 2 | On işletme görüşmesi | Notlar |
| 3 | Repo + iskelet | Tenant + menü ayakta |
| 4 | Şablon seçici | Katalogdan 25 şablon listeleniyor |
