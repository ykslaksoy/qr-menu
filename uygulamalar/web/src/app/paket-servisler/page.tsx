import { paketFirmalariniGetir, paketServisler } from "@sofra/tema";
import { SiteNav } from "@/components/SiteNav";

export default function PaketServislerPage() {
  const firmalar = paketFirmalariniGetir();
  const anlasilanlar = firmalar.filter((f) => f.anlasildi);
  const adaylar = firmalar.filter((f) => !f.anlasildi);

  return (
    <div className="sofra-mesh min-h-full">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-[family-name:var(--font-baslik)] text-3xl font-semibold md:text-4xl">
          {paketServisler.baslik}
        </h1>
        <p className="mt-2 text-muted">{paketServisler.aciklama}</p>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand">
            Anlaşılanlar
          </h2>
          <ul className="mt-3 space-y-2">
            {anlasilanlar.map((f) => (
              <li
                key={f.id}
                className="flex items-start gap-3 rounded-2xl border border-brand/30 bg-card p-4"
              >
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white"
                  aria-label="Anlaşıldı"
                >
                  ✓
                </span>
                <div>
                  <p className="font-semibold">{f.ad}</p>
                  {f.not ? (
                    <p className="mt-0.5 text-sm text-muted">{f.not}</p>
                  ) : null}
                </div>
              </li>
            ))}
            {anlasilanlar.length === 0 ? (
              <li className="text-sm text-muted">Henüz işaretli anlaşma yok.</li>
            ) : null}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Aday / anlaşılacaklar
          </h2>
          <ul className="mt-3 space-y-2">
            {adaylar.map((f) => (
              <li
                key={f.id}
                className="flex items-start gap-3 rounded-2xl border border-line bg-card/70 p-4 opacity-90"
              >
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-sm text-muted"
                  aria-label="Anlaşılmadı"
                >
                  ○
                </span>
                <div>
                  <p className="font-semibold">{f.ad}</p>
                  {f.not ? (
                    <p className="mt-0.5 text-sm text-muted">{f.not}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-8 text-xs text-muted">
          Liste: <code className="font-mono">config/paket-servisler.json</code> —
          <code className="font-mono">anlasildi: true</code> olanlar üste ve tikli
          gelir. Gerçek API entegrasyonu sonra bağlanır.
        </p>
      </main>
    </div>
  );
}
