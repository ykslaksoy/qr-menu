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
  const cwd = process.cwd();
  const adaylar = [
    path.join(cwd, "prisma", "seed.db"),
    path.join(cwd, "seed.db"),
    path.join(cwd, ".next", "server", "prisma", "seed.db"),
    "/var/task/prisma/seed.db",
    "/var/task/seed.db",
  ];

  if (!existsSync(hedef)) {
    const kaynak = adaylar.find((p) => existsSync(p));
    if (!kaynak) {
      throw new Error(
        `Sofra seed.db bulunamadı (cwd=${cwd}). Aranan: ${adaylar.join(", ")}`,
      );
    }
    mkdirSync(path.dirname(hedef), { recursive: true });
    copyFileSync(kaynak, hedef);
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
