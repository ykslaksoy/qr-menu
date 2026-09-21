import { Suspense } from "react";
import { SiteNav } from "@/components/SiteNav";
import { KayitForm } from "./KayitForm";

export default function KayitPage() {
  return (
    <div className="sofra-mesh min-h-full">
      <SiteNav />
      <main className="mx-auto max-w-lg px-4 py-12">
        <h1 className="font-[family-name:var(--font-baslik)] text-3xl font-semibold">
          İşletmeni oluştur
        </h1>
        <p className="mt-2 text-muted">
          Kafe veya restoran adını yazın; menü adresiniz (slug) otomatik oluşur. Boşluk ve
          Türkçe karakterler temizlenir.
        </p>
        <Suspense fallback={<p className="mt-8 text-sm text-muted">Form yükleniyor…</p>}>
          <KayitForm />
        </Suspense>
      </main>
    </div>
  );
}
