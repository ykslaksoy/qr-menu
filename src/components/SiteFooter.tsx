import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line/80 bg-card/60">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted">
        <p>© {new Date().getFullYear()} Sofra</p>
        <nav className="flex flex-wrap items-center gap-4">
          <Link href="/kullanim-sartlari" className="transition-colors hover:text-brand">
            Kullanım Şartları
          </Link>
          <Link href="/terms-of-use" className="transition-colors hover:text-brand">
            Terms of Use
          </Link>
        </nav>
      </div>
    </footer>
  );
}
