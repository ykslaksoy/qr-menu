# Sıradaki işler (Türkçe)

## Tamamlanan
- [x] Çalışma adı: **Sofra** (`belgeler/MARKA.md`)
- [x] Fiyat taslağı kilitlendi (`config/fiyatlar.json`)
- [x] Doğrulama cümlesi yazıldı
- [x] Monorepo iskeleti (`uygulamalar/web`, `paketler/tema`)
- [x] Ana sayfa, fiyatlar, şablon seçici, demo menü
- [x] Referans kuralları (menü QR, yıllık %15, 3 ay)
- [x] **Panel MVP (6 madde):**
  - [x] Menü CRUD (`/panel/menu`)
  - [x] Özelleştir font/renk/çerçeve/zemin (`/panel/tasarim`)
  - [x] Masa + QR PNG indir (`/panel/masalar`)
  - [x] Sipariş → adisyon + garson (`/m/[slug]?siparis=1`, `/g`)
  - [x] Basit stok düşüm + tükendi (`/panel/stok`)
  - [x] Abonelik Iyzico/PayTR simülasyonu + referans indirimi (`/panel/abonelik`)
- [x] **Son sprint (kod):**
  - [x] SQLite + Prisma + oturum (`/api/auth`, `/giris`)
  - [x] Public menü + sipariş API (`/api/m/[slug]`)
  - [x] Mutfak ekranı (`/k`)
  - [x] PDF menü içe aktarma (`/panel/menu/ice-aktar`)
  - [x] Masa kartı baskı PDF (`/panel/baski`, masalar sayfası)
  - [x] Ödeme API iskeleti (`/api/panel/odeme` — anahtar yoksa simülasyon)
  - [x] Panel oturum koruması + demo seed (`demo@sofra.app` / `demo1234`)
- [x] **Plan kilidi** — tüm özellikler plana göre kilitli (`belgeler/PLAN_KILITLERI.md`)
- [x] **Adet altı ücretsiz** — ayda 50 siparişe kadar Menü+Adisyon hediye (`belgeler/ADET_ALTI_UCRETSIZ.md`)
- [x] **Platform admin** — `/admin` tüm işletmeler, impersonation, cron heartbeat, işletme ekleme
- [x] **Ürün görseli** — hazır Sofra görselleri + kendi fotoğraf yükleme (`/panel/menu`)
- [x] **Hazır menü** — kafe/restoran/döner… tipi + 8 / 8+8 / 3×5 boyut (`/panel/menu/hazir`)
- [x] `pnpm build` geçti

## Sizin yapmanız gereken (saha)
1. Alan adı ayırt: `sofra.app` / `sofra.menu` / `sofra.com.tr`
2. 10 işletmeye WhatsApp doğrulaması (`belgeler/MARKA.md` tablosu)
3. İsim beğenilmezse `MARKA.md` + arayüz metinlerini değiştirin

## Sonraki sprint (kod)
1. Postgres’e geçiş (docker-compose hazır)
2. Canlı Iyzico / PayTR API anahtarları (`.env.ornek`)
3. AI destekli menü içe aktarma (PDF parser iyileştirme)
4. Çoklu işletme / ekip rolleri
5. Gerçek zamanlı sipariş (WebSocket veya SSE)

Plan kilidi matrisi: `belgeler/PLAN_KILITLERI.md`  
Adet altı ücretsiz: `belgeler/ADET_ALTI_UCRETSIZ.md` (50 sipariş/ay)

## Sonraya (Faz 2+) — baskı ve kargo
Ayrıntı: `belgeler/BASKI_KARGO.md`

## Çalıştırma
```bash
cd sofra
pnpm install
cd uygulamalar/web && pnpm db:push && pnpm db:seed
cd ../.. && pnpm dev
```

**Demo giriş:** demo@sofra.app / demo1234 → `/panel` → `/m/demo?masa=1`  
**Admin giriş:** sofra.app/giris → admin@sofra.app / admin1234 → `/admin` → işletme ekle veya "Panele gir"

Akış: `/kayit` veya `/giris` → `/panel` → menü/QR/abonelik → `/m/slug?masa=1` sipariş → `/k` mutfak → `/g` garson
