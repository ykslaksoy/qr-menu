import Link from "next/link";
import { SofraFarkiIcerik } from "@/components/SofraFarkiIcerik";

export default function AdminSofraFarkiPage() {
  return (
    <>
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <Link href="/admin" className="font-[family-name:var(--font-baslik)] text-xl font-semibold text-brand-dark">
              Sofra
            </Link>
            <p className="text-sm text-muted">Platform yönetimi · Sofra farkı</p>
          </div>
          <Link href="/admin" className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-brand/40">
            ← İşletmeler
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-12">
        <SofraFarkiIcerik />
      </main>
    </>
  );
}
