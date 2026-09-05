# Sofra (QR menü + adisyon)

Türkçe QR menü, garson / mutfak istasyonu, stok, rapor ve SSE canlı güncelleme.  
**Bu paket C bloğu içermez** (ÖKC, e-fatura, Getir/YS, native, offline, kiosk).

Monorepo kökü: bu dizin (`sofra/`).

## Hızlı demo

```bash
cd sofra
pnpm install
cp .env.ornek uygulamalar/web/.env   # yoksa
cd uygulamalar/web
pnpm exec prisma db push
pnpm db:seed
cd ../..
pnpm --filter @sofra/web build
pnpm --filter @sofra/web start
```

Tarayıcı: `http://localhost:3000`

### Demo hesaplar (seed)

| Rol | Giriş | Şifre |
|-----|--------|--------|
| Yönetici | `demo@sofra.app` | `demo1234` |
| Garson | `garson@demo.sofra.app` | `demo1234` |
| Mutfak | `mutfak@demo.sofra.app` | `demo1234` |

Tek tık: `/api/auth/demo/yonetici` · `/api/auth/demo/garson` · `/api/auth/demo/mutfak`

Müşteri menü: `/m/demo`

### Checklist (A+B)

- [ ] Yönetici panel: `/api/auth/demo/yonetici` → `/panel`
- [ ] Kurulum sihirbazı: `/panel/kurulum`
- [ ] Menü / masalar / personel
- [ ] Stok: `/panel/stok` · Rapor: `/panel/rapor`
- [ ] Garson: `/g` · Mutfak KDS: `/k`
- [ ] SSE: `GET /api/m/demo/canli` (EventStream)

## Geliştirme

```bash
pnpm install
pnpm --filter @sofra/web dev
```

## Paketler

- `uygulamalar/web` — Next.js 16 + Prisma (SQLite)
- `paketler/tema` — şablon / katalog JSON
- `belgeler/` — ürün dokümanları (Türkçe)
- `belgeler/UCRETLENDIRME.md` — deneme / tek şube sınırları

## Ortam

`.env.ornek` → `uygulamalar/web/.env`. **`.env` commit edilmez.**

## Dışarı açma (tünel)

```bash
# örnek: cloudflared / trycloudflare
npx --yes cloudflared tunnel --url http://localhost:3000
```

Canlı demo URL’sini yalnızca tünel ayaktayken paylaşın.

## Marka

Çalışma adı: **Sofra** — `belgeler/MARKA.md`
