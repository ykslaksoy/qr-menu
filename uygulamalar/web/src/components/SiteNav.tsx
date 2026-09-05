import Link from "next/link";

const nav = [
  { href: "/fiyatlandirma", label: "Fiyatlar" },
  { href: "/tasarim", label: "Şablonlar" },
  { href: "/m/demo?masa=1&siparis=1", label: "Demo menü" },
  { href: "/giris", label: "Giriş" },
];

export function SiteNav() {
  return (
    <header className="border-b border-line/80 bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-[family-name:var(--font-baslik)] text-2xl font-semibold tracking-tight text-brand-dark">
          Sofra
        </Link>
        <nav className="flex items-center gap-5 text-sm text-foreground/80">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-brand transition-colors">
              {item.label}
            </Link>
          ))}
          <Link
            href="/kayit"
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
          >
            Başla
          </Link>
        </nav>
      </div>
    </header>
  );
}
