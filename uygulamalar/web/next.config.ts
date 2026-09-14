import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@sofra/tema"],
  outputFileTracingIncludes: {
    "/**": [
      "./prisma/seed.db",
      "./prisma/schema.prisma",
      "./node_modules/.prisma/**/*",
      "./node_modules/@prisma/client/**/*",
    ],
  },
  async redirects() {
    return [
      { source: "/demo", destination: "/m/demo?masa=1&siparis=1", permanent: false },
      { source: "/basla", destination: "/kayit", permanent: false },
      { source: "/fiyat", destination: "/fiyatlandirma", permanent: false },
      { source: "/karsilastir", destination: "/panel/sofra-farki", permanent: false },
      { source: "/karsilastirma", destination: "/panel/sofra-farki", permanent: false },
      { source: "/garson", destination: "/g", permanent: false },
      { source: "/mutfak", destination: "/k", permanent: false },
      { source: "/adisyon", destination: "/g", permanent: false },
      { source: "/menu/demo", destination: "/m/demo?masa=1&siparis=1", permanent: false },
      { source: "/panel/tasarim", destination: "/panel/ayarlar", permanent: false },
    ];
  },
};

export default nextConfig;
