# Postgres geçişi

Geliştirme varsayılanı **SQLite** (`DATABASE_URL=file:./dev.db`, şema `prisma/schema.prisma`).

## Yerel Postgres

```bash
# repo kökü
docker compose up -d postgres

# flat-qrmonu kökünde (veya monorepo'da uygulamalar/web)
export DATABASE_URL="postgresql://sofra:sofra@localhost:5432/sofra?schema=public"
npm run db:postgres:push
DATABASE_URL="postgresql://sofra:sofra@localhost:5432/sofra?schema=public" npm run db:seed:all
```

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `pnpm db:push` | SQLite şema senkronu (dev) |
| `pnpm db:postgres:push` | Postgres şema senkronu (`schema.postgres.prisma`) |
| `pnpm db:seed:ship` | SQLite seed + `prisma/seed.db` (Vercel bootstrap) |

`DATABASE_URL` `postgresql://` ile başlıyorsa uygulama `/tmp` seed kopyalama adımını atlar (`src/lib/prisma.ts`).

## Üretim

1. Managed Postgres URL’ini `DATABASE_URL` olarak verin.
2. Deploy öncesi `pnpm db:postgres:push` (veya ileride `migrate deploy`).
3. İlk kurulumda seed: `pnpm db:seed` (aynı `DATABASE_URL` ile).

SQLite `seed.db` yalnızca serverless SQLite bootstrap için paketlenir; Postgres ortamında kullanılmaz.
