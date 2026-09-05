# Keşfet — Sofra’lı restoranlar ağı

> Faz 2 özelliği. MVP’de sadece kayıtta “dizinde görünsün” + adres alanları toplanabilir.
> Marketplace / Getir değildir: sipariş komisyonu yok; menüye ve (isteğe) gel-al’a yönlendirir.

---

## 1) Amaç

Sofra kullanan işletmeleri **opt-in** ile listeler; müşteri semt/ilçeye göre bulur, menü QR sayfasına gider.

---

## 2) Ekranlar

### A) Public — `/kesfet`

```text
┌─────────────────────────────────────────┐
│ Sofra · Keşfet                          │
│ Şehir [İstanbul ▾]  İlçe [Kadıköy ▾]    │
│ Ara [kahve, pizza…………]  [Ara]           │
├─────────────────────────────────────────┤
│ Harita (opsiyonel)                      │
│ ○ Cafe Ada    ○ Pizza Napoli  …         │
├─────────────────────────────────────────┤
│ Kartlar                                 │
│ ┌──────────────┐ ┌──────────────┐       │
│ │ Cafe Ada     │ │ Pizza Napoli │       │
│ │ Kadıköy      │ │ Moda         │       │
│ │ Kahve · Açık │ │ Pizza · Açık │       │
│ │ [Menüyü aç]  │ │ [Menüyü aç]  │       │
│ └──────────────┘ └──────────────┘       │
└─────────────────────────────────────────┘
```

**Kart alanları:** logo, işletme adı, ilçe, kısa kategori etiketleri, “açık / kapalı” (opsiyonel), Menüyü aç → `/m/{slug}`

**Filtreler:** şehir, ilçe, kategori (kahve, pizza…), “şimdi açık”, arama metni

**Boş durum:** “Bu ilçede henüz Sofra’lı işletme yok.”

---

### B) Public — işletme mini profil `/kesfet/[slug]` (opsiyonel)

```text
Cafe Ada
Kadıköy · Kahve
Adres: …
[Menüyü aç]  [Yol tarifi]  [Ara]
“Sofra ile dijital menü”
```

Menü yine `/m/cafe-ada` — keşfet sadece vitrin.

---

### C) Panel — Ayarlar → Keşfet / vitrin

```text
☐ Sofra Keşfet’te görünsün   (varsayılan: kapalı)

Görünür ad:     [Cafe Ada        ]
Kısa açıklama:  [Moda’da kahve…]
Kategoriler:    [Kahve] [Kahvaltı] …
Kapak / logo:   [yükle]

Adres (keşfet + harita için)
  İl: [ ] İlçe: [ ] Mahalle: [ ]
  Açık adres: [ ]
  Konum: lat/lng (haritadan seç veya elle)

☐ Telefonu göster
☐ “Yol tarifi” linkini göster

[Kaydet]  [Önizle]
```

**Uyarı metni:** “Açık olunca adı, ilçesi ve menü linkiniz Sofra Keşfet’te listelenir. İstediğiniz an kapatabilirsiniz.”

---

### D) Kayıt ekranı (`/kayit`) — erken veri

```text
Kafe adı → slug (mevcut)
+ İl / İlçe (zorunlu değil ama önerilir)
☐ Sofra Keşfet’te görünsün (isteğe bağlı)
```

---

## 3) Veritabanı alanları

### Isletme (mevcut + ek)

| Alan | Tip | Not |
|------|-----|-----|
| `id` | uuid | |
| `ad` | string | |
| `slug` | string unique | URL |
| `kesfetAcik` | boolean | varsayılan `false` |
| `kesfetBaslik` | string? | boşsa `ad` |
| `kesfetAciklama` | string? | max ~160 karakter |
| `telefonGoster` | boolean | |
| `telefon` | string? | |
| `logoUrl` | string? | |
| `kapakUrl` | string? | |
| `il` | string? | |
| `ilce` | string? | |
| `mahalle` | string? | |
| `acikAdres` | string? | |
| `postaKodu` | string? | |
| `lat` | decimal? | harita |
| `lng` | decimal? | |
| `kategoriler` | string[] / ilişki | kahve, pizza… |
| `calismaSaatleri` | json? | Faz 2.1 — “şimdi açık” |
| `kesfetSirasi` | int? | sponsor / öne çıkan (sonra) |

### KesfetKategori (sabit sözlük)

| id | ad |
|----|-----|
| kahve | Kahve |
| kahvalti | Kahvaltı |
| pizza | Pizza |
| burger | Burger |
| kebap | Kebap / ızgara |
| tatli | Pastane / tatlı |
| bar | Bar |
| vegan | Vegan / sağlıklı |
| deniz | Balık / deniz |
| diger | Diğer |

### Index önerisi

```text
(kesfetAcik, il, ilce)
(slug) unique
(lat, lng) — harita bounding box (sonra)
```

---

## 4) API taslağı

| Metod | Yol | Açıklama |
|-------|-----|----------|
| GET | `/api/kesfet?il=&ilce=&q=&kategori=` | Public liste (`kesfetAcik=true`) |
| GET | `/api/kesfet/[slug]` | Mini profil |
| PATCH | `/api/panel/kesfet` | İşletme kendi vitrin ayarı |

Public cevapda **asla:** adisyon, stok, garson, ödeme, müşteri verisi.

Sadece: ad, slug, il/ilçe, kategoriler, logo, açıklama, menü URL, opsiyonel telefon/konum.

---

## 5) Kurallar

1. **Opt-in:** `kesfetAcik` false ise listede yok  
2. **Marketplace değil:** Keşfet’ten sepet/checkout yok (MVP/Faz2)  
3. **Menü linki:** her zaman `/m/{slug}`  
4. **KVKK:** sadece işletmenin yayınladığı kart bilgisi  
5. **Boş şehir:** keşfeti tüm TR açma; önce 1–2 ilçe dolunca duyur  

---

## 6) Fazlar

| Faz | İş |
|-----|-----|
| **MVP (hafif)** | Kayıtta il/ilçe + `kesfetAcik` kutusu; DB alanı |
| **Faz 2a** | `/kesfet` liste + filtre; panel vitrin ayarı |
| **Faz 2b** | Harita pinleri |
| **Faz 2c** | Çalışma saati / şimdi açık |
| **Faz 3** | Referans (“arkadaşını getir”), öne çıkan kart |

---

## 7) Başarı ölçütleri

- Opt-in oranı (% kaç işletme açtı)
- Keşfet → menü tıklama
- Keşfet’ten gelen yeni abonelik (UTM / “nereden duydun”)

---

## 8) Yapılmayacaklar (bilerek)

- Çoklu restorandan tek sepet
- Getir tarzı komisyonlu sipariş
- Zorunlu herkesin listelenmesi
- Müşteri yorum puanı (ilk sürümde — moderasyon yükü)
