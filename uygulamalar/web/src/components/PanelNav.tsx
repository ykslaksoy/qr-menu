"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useIsletme } from "@/lib/useIsletme";
import { ozellikAcikMi, efektifPlanId, type OzellikId } from "@/lib/plan-kilit";

const yoneticiLinkler: {
  href: string;
  label: string;
  tam?: boolean;
  ozellik?: OzellikId;
}[] = [
  { href: "/panel", label: "Özet", tam: true },
  { href: "/panel/kurulum", label: "Kurulum" },
  { href: "/panel/menu", label: "Menü" },
  { href: "/panel/veri-girisi", label: "Veri girişi" },
  { href: "/panel/dokumanlar", label: "Dökümanlar" },
  { href: "/panel/ayarlar", label: "Ayarlar" },
  { href: "/panel/masalar", label: "Masalar / QR" },
  { href: "/panel/stok", label: "Stok", ozellik: "stok" },
  { href: "/panel/rapor", label: "Raporlar", ozellik: "analitik" },
  { href: "/panel/personel", label: "Personel" },
  { href: "/panel/abonelik", label: "Abonelik" },
  { href: "/panel/sofra-farki", label: "Sofra farkı" },
];

export function PanelNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isletme, oturumlu, platformAdmin, modEtiket, modSecenekleri } = useIsletme();
  const planId = isletme ? efektifPlanId(isletme) : "ucretsiz";
  const modDegisebilir = modSecenekleri.length > 1;

  async function cikis() {
    await fetch("/api/auth", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cikis" }),
    });
    router.push("/giris");
  }

  return (
    <header className="border-b border-line bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/panel" className="font-[family-name:var(--font-baslik)] text-xl font-semibold text-brand-dark">
            Sofra
          </Link>
          {isletme ? (
            <span className="hidden items-center gap-2 text-sm text-muted sm:inline-flex">
              {isletme.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={isletme.logoUrl}
                  alt=""
                  className="h-6 w-6 rounded object-contain"
                />
              ) : null}
              {isletme.kafeAdi}
            </span>
          ) : (
            <span className="hidden text-sm text-muted sm:inline">Şube yönetici</span>
          )}
          {modEtiket ? (
            <span className="rounded-full bg-line/50 px-2 py-0.5 text-xs text-muted">{modEtiket}</span>
          ) : null}
        </div>
        <nav className="flex flex-wrap gap-1 text-sm">
          {yoneticiLinkler.map((l) => {
            const aktif = l.tam
              ? pathname === l.href
              : pathname === l.href || pathname.startsWith(l.href + "/");
            const kilitli = l.ozellik ? !ozellikAcikMi(planId, l.ozellik) : false;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3 py-1.5 ${
                  aktif ? "bg-brand text-white" : "text-foreground/80 hover:bg-line/60"
                } ${kilitli ? "opacity-70" : ""}`}
                title={kilitli ? "Plan yükseltme gerekli" : undefined}
              >
                {kilitli ? "🔒 " : ""}
                {l.label}
              </Link>
            );
          })}
          {modDegisebilir ? (
            <Link
              href="/mod"
              className="rounded-full border border-line px-3 py-1.5 hover:border-brand/40"
            >
              Mod değiştir
            </Link>
          ) : null}
          {platformAdmin ? (
            <Link
              href="/admin"
              className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1.5 text-violet-900 hover:border-violet-400"
            >
              Admin
            </Link>
          ) : null}
          {isletme ? (
            <Link
              href={`/m/${isletme.slug}?masa=1&siparis=1`}
              className="rounded-full border border-line px-3 py-1.5 hover:border-brand/40"
            >
              Müşteri menüsü
            </Link>
          ) : null}
          {oturumlu ? (
            <button
              type="button"
              onClick={cikis}
              className="rounded-full border border-line px-3 py-1.5 hover:border-brand/40"
            >
              Çıkış
            </button>
          ) : (
            <Link href="/giris" className="rounded-full border border-line px-3 py-1.5 hover:border-brand/40">
              Giriş
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
