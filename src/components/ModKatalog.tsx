import {
  MOD_ACIKLAMA,
  MOD_ANA_YOL,
  MOD_ETIKET,
  MOD_OZELLIK_ETIKET,
  MOD_OZELLIKLER,
  MOD_SAYFALAR,
  MUSTERI_OZELLIKLER,
  type SofraMod,
} from "@/lib/mod";

const MOD_SIRASI: SofraMod[] = ["platform", "zincir", "yonetici", "garson", "mutfak"];

export function ModKatalog() {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-[family-name:var(--font-baslik)] text-xl font-semibold">Personel modları</h2>
        <p className="mt-1 text-sm text-muted">
          Her mod yalnızca kendi sayfalarını ve API yetkilerini görür. Çapraz erişim middleware ile
          engellenir.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {MOD_SIRASI.map((mod) => (
            <article key={mod} className="rounded-2xl border border-line bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{MOD_ETIKET[mod]}</h3>
                  <p className="mt-1 text-sm text-muted">{MOD_ACIKLAMA[mod]}</p>
                </div>
                <code className="shrink-0 rounded bg-line/50 px-2 py-0.5 text-xs">{MOD_ANA_YOL[mod]}</code>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Sayfalar</p>
                <ul className="mt-1 space-y-0.5 text-xs font-mono text-muted">
                  {MOD_SAYFALAR[mod].map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Özellikler</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {MOD_OZELLIKLER[mod].map((o) => (
                    <li key={o} className="flex gap-2">
                      <span className="text-brand">·</span>
                      {MOD_OZELLIK_ETIKET[o]}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-line bg-card/50 p-5">
        <h3 className="font-semibold">Mağaza müşteri (oturum yok)</h3>
        <p className="mt-1 text-sm text-muted">
          QR menü — <code className="rounded bg-line/50 px-1">/m/[slug]</code> · Herkese açık, giriş
          gerekmez.
        </p>
        <ul className="mt-3 space-y-1 text-sm">
          {MUSTERI_OZELLIKLER.map((o) => (
            <li key={o} className="flex gap-2">
              <span className="text-brand">·</span>
              {o}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          Müşteri yalnızca menü görür ve sepetten sipariş gönderir; personel ekranlarına erişemez.
        </p>
      </section>
    </div>
  );
}
