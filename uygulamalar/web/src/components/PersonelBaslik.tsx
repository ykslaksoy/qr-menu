"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIsletme } from "@/lib/useIsletme";

export function PersonelBaslik({
  rol,
  kafeAdi,
}: {
  rol: "garson" | "mutfak";
  kafeAdi: string;
}) {
  const router = useRouter();
  const { modEtiket } = useIsletme();

  async function cikis() {
    await fetch("/api/auth", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cikis" }),
    });
    router.push("/giris");
  }

  const baslik = rol === "garson" ? "Garson / dijital adisyon" : "Mutfak";

  return (
    <header
      className={
        rol === "mutfak"
          ? "border-b border-stone-700 px-4 py-4"
          : "border-b border-line bg-card px-4 py-3"
      }
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div>
          <p
            className={
              rol === "mutfak"
                ? "text-xs uppercase tracking-widest text-stone-400"
                : "text-xs uppercase tracking-wide text-muted"
            }
          >
            {modEtiket ?? baslik}
          </p>
          <h1
            className={
              rol === "mutfak"
                ? "text-2xl font-bold"
                : "font-[family-name:var(--font-baslik)] text-xl font-semibold"
            }
          >
            {kafeAdi}
          </h1>
        </div>
        <div className="flex gap-2 text-sm">
          <Link
            href="/mod"
            className={
              rol === "mutfak"
                ? "rounded-full border border-stone-600 px-3 py-1.5"
                : "rounded-full border border-line px-3 py-1.5"
            }
          >
            Mod
          </Link>
          <button
            type="button"
            onClick={cikis}
            className={
              rol === "mutfak"
                ? "rounded-full border border-stone-600 px-3 py-1.5"
                : "rounded-full border border-line px-3 py-1.5"
            }
          >
            Çıkış
          </button>
        </div>
      </div>
    </header>
  );
}
