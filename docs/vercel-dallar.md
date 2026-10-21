# Vercel dalları (QrMenü)

| Ortam | Git dalı | Vercel proje | Üretim URL |
|-------|----------|--------------|------------|
| **Canlı menü (qrmonu)** | `flat-qrmonu` | `qrmonu` | https://qrmonu.vercel.app |
| Monorepo geliştirme | `main` | Aynı proje kökü `uygulamalar/web` ile bağlanabilir; şu an üretim **flat-qrmonu** kullanıyor | — |

## Derleme notları

- Vercel proje ayarında **Node.js 24.x** seçin (20.x kesintiye uğradı).
- `flat-qrmonu` kökünde `package.json` içinde `"engines": { "node": "24.x" }` tanımlıdır.
- `main` monorepo kökünde `vercel.json` → `buildCommand`: `pnpm --filter @sofra/web build`, `outputDirectory`: `uygulamalar/web/.next`.

## Ortam değişkenleri (üretim)

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `DATABASE_URL` | Evet | SQLite bootstrap: `file:./prisma/seed.db` veya kalıcı Postgres URL |
| `IYZICO_*` / `PAYTR_*` | Hayır | Anahtarlar yoksa ödeme simülasyonu |

Detay: [Postgres ortamı](./postgres-ortam.md).
