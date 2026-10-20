"use client";

import Link from "next/link";
import type { MenuGirisZincir } from "@/lib/zincir-menu";

type Props = {
  giris: MenuGirisZincir;
  masaQuery?: string;
};

export function MenuSubeSecimi({ giris, masaQuery }: Props) {
  const qs = masaQuery ? `?masa=${encodeURIComponent(masaQuery)}` : "";

  return (
    <div className="sofra-mesh flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-sm">
        <h1 className="text-center font-[family-name:var(--font-baslik)] text-2xl font-semibold">
          {giris.markaAd}
        </h1>
        <p className="mt-2 text-center text-sm text-muted">Hangi şubedesiniz?</p>
        <ul className="mt-8 space-y-2">
          {giris.subeler.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/m/${s.slug}${qs}`}
                className="flex items-center gap-3 rounded-xl border border-line bg-background/60 px-4 py-3 transition hover:border-brand/50 hover:bg-brand/5"
              >
                {s.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.logoUrl} alt="" className="h-10 w-10 rounded-lg object-contain" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-line/50 text-sm font-semibold">
                    {s.kafeAdi.charAt(0)}
                  </span>
                )}
                <span className="font-medium">{s.kafeAdi}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
