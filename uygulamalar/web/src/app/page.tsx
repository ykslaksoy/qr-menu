import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";

const anaButonlar = [
  {
    href: "/api/auth/demo/yonetici",
    etiket: "Şifresiz demo giriş",
    birincil: true,
  },
  {
    href: "/m/demo?masa=1&siparis=1",
    etiket: "Demo menü",
    birincil: false,
  },
  {
    href: "/giris",
    etiket: "Tüm roller",
    birincil: false,
  },
] as const;

const hizliKartlar = [
  {
    baslik: "🎤 Sesli garson",
    aciklama: "Konuş, sistem menüyle eşleştirsin; stok yoksa alternatif önersin",
    href: "/giris",
  },
  {
    baslik: "5 tarz · 25 şablon",
    aciklama: "12 işletme tipi, 245 ürün havuzu — tik ile menü kur",
    href: "/tasarim",
  },
  {
    baslik: "50 sipariş/ay ücretsiz",
    aciklama: "Garson + mutfak açık; aşınca uyarı, sipariş durmaz",
    href: "/fiyatlandirma",
  },
] as const;

export default function HomePage() {
  return (
    <div className="sofra-mesh flex min-h-full flex-col">
      <SiteNav />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-16 md:py-24">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-brand">
          QR menü · sesli adisyon · komisyon yok
        </p>
        <h1 className="max-w-3xl font-[family-name:var(--font-baslik)] text-4xl leading-tight font-semibold text-foreground md:text-6xl">
          Sofra
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted md:text-xl">
          Müşteri QR okutur veya garson <strong className="font-medium text-foreground">konuşarak</strong>{" "}
          sipariş alır — hepsi aynı dijital adisyona düşer. PDF menü, masa QR, canlı fiş. Komisyon
          yok; ayda 699 TL&apos;den.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {anaButonlar.map((b) => (
            <Link
              key={b.href}
              href={b.href}
              className={
                b.birincil
                  ? "rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark transition-colors"
                  : "rounded-full border border-line bg-card px-6 py-3 text-sm font-semibold hover:border-brand/40 transition-colors"
              }
            >
              {b.etiket}
            </Link>
          ))}
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-3 text-sm text-muted">
          {hizliKartlar.map((k) => (
            <li key={k.href}>
              <Link
                href={k.href}
                className="block rounded-2xl border border-line bg-card/70 p-4 transition hover:border-brand/40 hover:bg-card"
              >
                <strong className="block text-foreground">{k.baslik}</strong>
                {k.aciklama}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
