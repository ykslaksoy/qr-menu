import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  sofraDbHazir: boolean | undefined;
};

function vercelMi() {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
}

/** Serverless'ta kalıcı disk yok; seed'i /tmp'ye kopyala. */
function vercelSqliteHazirla() {
  if (!vercelMi() || globalForPrisma.sofraDbHazir) return;

  const hedef = "/tmp/sofra.db";

  if (!existsSync(hedef)) {
    const adaylar = [
      path.join(process.cwd(), "prisma", "seed.db"),
      path.join(process.cwd(), "seed.db"),
    ];
    const kaynak = adaylar.find((p) => existsSync(p));
    if (kaynak) {
      mkdirSync(path.dirname(hedef), { recursive: true });
      copyFileSync(kaynak, hedef);
    }
  }

  process.env.DATABASE_URL = `file:${hedef}`;
  globalForPrisma.sofraDbHazir = true;
}

vercelSqliteHazirla();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  });

if (process.env.NODE_ENV !== "production" || vercelMi()) {
  globalForPrisma.prisma = prisma;
}
